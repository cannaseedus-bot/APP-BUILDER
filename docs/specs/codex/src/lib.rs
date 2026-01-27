\
use hashbrown::HashMap;
use serde::{Deserialize, Serialize};
use thiserror::Error;

pub const MAGIC: &[u8; 4] = b"SCX2";
pub const VERSION: u8 = 1;

pub const TAG_NODES: u8 = 2;
pub const TAG_EDGES: u8 = 3;
pub const TAG_META: u8 = 4;
pub const TAG_END: u8 = 255;

// Flags (stream header)
pub const FLAG_HAS_ANS: u64 = 1 << 0;
pub const FLAG_HAS_INDEX_META: u64 = 1 << 2;

pub const VT_BOOL: u8 = 0x01;
pub const VT_U64: u8 = 0x02;
pub const VT_F32: u8 = 0x03;
pub const VT_F64: u8 = 0x04;
pub const VT_STRING: u8 = 0x05;
pub const VT_DICTVAL: u8 = 0x06;
pub const VT_DOMAIN: u8 = 0x07;

#[derive(Debug, Error)]
pub enum Scx2Err {
    #[error("EOF")]
    Eof,
    #[error("varint too long")]
    VarintTooLong,
    #[error("invalid magic")]
    BadMagic,
    #[error("unsupported version {0}")]
    BadVersion(u8),
    #[error("bad section tag {0}")]
    BadTag(u8),
    #[error("payload out of bounds")]
    Bounds,
    #[error("invalid value type {0:#x}")]
    InvalidValueType(u8),
    #[error("ANS flag required for this decoder")]
    AnsRequired,
    #[error("META missing but required")]
    MetaMissing,
    #[error("META JSON invalid: {0}")]
    MetaJson(String),
    #[error("META schema_id unsupported in this ref impl")]
    MetaSchemaUnsupported,
    #[error("ANS table build error: {0}")]
    AnsTable(String),
}

pub type Result<T> = core::result::Result<T, Scx2Err>;

/// Bounded cursor over bytes.
/// Swap this for file/HTTP range reads; keep the same API for stream-safety.
#[derive(Clone)]
pub struct Cursor<'a> {
    buf: &'a [u8],
    pos: usize,
    end: usize,
}
impl<'a> Cursor<'a> {
    pub fn new(buf: &'a [u8]) -> Self { Self { buf, pos: 0, end: buf.len() } }
    pub fn with_bounds(buf: &'a [u8], start: usize, len: usize) -> Result<Self> {
        let end = start.checked_add(len).ok_or(Scx2Err::Bounds)?;
        if end > buf.len() { return Err(Scx2Err::Bounds); }
        Ok(Self { buf, pos: start, end })
    }
    pub fn position(&self) -> u64 { self.pos as u64 }
    pub fn remaining(&self) -> usize { self.end.saturating_sub(self.pos) }
    pub fn read_u8(&mut self) -> Result<u8> {
        if self.pos >= self.end { return Err(Scx2Err::Eof); }
        let b = self.buf[self.pos];
        self.pos += 1;
        Ok(b)
    }
    pub fn read_exact(&mut self, n: usize) -> Result<&'a [u8]> {
        if self.pos.checked_add(n).unwrap_or(usize::MAX) > self.end { return Err(Scx2Err::Eof); }
        let s = &self.buf[self.pos..self.pos + n];
        self.pos += n;
        Ok(s)
    }
    pub fn skip(&mut self, n: usize) -> Result<()> {
        if self.pos.checked_add(n).unwrap_or(usize::MAX) > self.end { return Err(Scx2Err::Eof); }
        self.pos += n;
        Ok(())
    }
}

/// Unsigned LEB128 varint u64
pub fn read_varint_u64(cur: &mut Cursor<'_>) -> Result<u64> {
    let mut val: u64 = 0;
    let mut shift: u32 = 0;
    for _ in 0..10 {
        let b = cur.read_u8()?;
        val |= ((b & 0x7F) as u64) << shift;
        if (b & 0x80) == 0 { return Ok(val); }
        shift += 7;
    }
    Err(Scx2Err::VarintTooLong)
}
pub fn write_varint_u64(out: &mut Vec<u8>, mut n: u64) {
    loop {
        let byte = (n & 0x7F) as u8;
        n >>= 7;
        if n == 0 { out.push(byte); break; }
        out.push(byte | 0x80);
    }
}
pub fn read_u32_le(cur: &mut Cursor<'_>) -> Result<u32> {
    let b = cur.read_exact(4)?;
    Ok(u32::from_le_bytes([b[0], b[1], b[2], b[3]]))
}
pub fn write_u32_le(out: &mut Vec<u8>, v: u32) { out.extend_from_slice(&v.to_le_bytes()); }
pub fn read_f32_le(cur: &mut Cursor<'_>) -> Result<f32> {
    let b = cur.read_exact(4)?;
    Ok(f32::from_le_bytes([b[0], b[1], b[2], b[3]]))
}
pub fn write_f32_le(out: &mut Vec<u8>, v: f32) { out.extend_from_slice(&v.to_le_bytes()); }

pub fn read_string(cur: &mut Cursor<'_>) -> Result<String> {
    let len = read_varint_u64(cur)? as usize;
    let b = cur.read_exact(len)?;
    core::str::from_utf8(b).map(|s| s.to_string()).map_err(|_| Scx2Err::MetaJson("utf8".into()))
}
pub fn write_string(out: &mut Vec<u8>, s: &str) {
    write_varint_u64(out, s.as_bytes().len() as u64);
    out.extend_from_slice(s.as_bytes());
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(tag = "t", content = "v")]
pub enum Value {
    Bool(bool),
    U64(u64),
    F32(u32), // store bits
    Str(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeAst {
    pub id: u64,
    pub from: u64,
    pub to: u64,
    pub kind: u8,      // 0..3
    pub weight_bits: u32,
    pub flags: u32,
}

/// ---------- rANS (Range Asymmetric Numeral Systems) ----------
/// This is a compact reference rANS suitable for symbol streams (u16 symbols).
/// It is deterministic and stream-safe.
pub mod rans {
    use super::{Result, Scx2Err};

    pub const SCALE_BITS: u32 = 12; // total freq = 4096
    pub const TOTFREQ: u32 = 1 << SCALE_BITS;
    pub const RANS_L: u32 = 1 << 23; // normalization lower bound

    #[derive(Clone, Debug)]
    pub struct EncSym {
        pub sym: u16,
        pub freq: u32,
        pub cum: u32,
    }

    #[derive(Clone, Debug)]
    pub struct DecEntry {
        pub sym: u16,
        pub freq: u32,
        pub cum: u32,
    }

    #[derive(Clone, Debug)]
    pub struct Tables {
        pub enc: Vec<EncSym>,          // by symbol id
        pub dec: Vec<DecEntry>,        // by state & mask
        pub mask: u32,
    }

    /// Build rANS tables from raw frequencies (nonzero). Frequencies are normalized to TOTFREQ.
    /// Returns (tables, freq_by_sym) where freq_by_sym is TOTFREQ-normalized.
    pub fn build_tables(freqs: &[(u16, u32)]) -> Result<Tables> {
        if freqs.is_empty() { return Err(Scx2Err::AnsTable("empty freqs".into())); }

        // 1) sum and normalize to TOTFREQ with largest-remainder method
        let sum: u64 = freqs.iter().map(|(_, f)| *f as u64).sum();
        if sum == 0 { return Err(Scx2Err::AnsTable("zero sum".into())); }

        let mut norm: Vec<(u16, u32, u64)> = freqs.iter().map(|(s, f)| {
            let scaled = (*f as u64) * (TOTFREQ as u64);
            let q = (scaled / sum) as u32;
            let r = scaled % sum;
            (*s, q.max(1), r) // enforce >=1 for present symbols
        }).collect();

        // Adjust total to TOTFREQ exactly
        let mut total: i64 = norm.iter().map(|(_, q, _)| *q as i64).sum();
        // If over, decrement the smallest remainders first (but keep >=1)
        if total > TOTFREQ as i64 {
            norm.sort_by_key(|&(_, q, r)| (r, q)); // small remainder first
            let mut i = 0usize;
            while total > TOTFREQ as i64 {
                if norm[i].1 > 1 {
                    norm[i].1 -= 1;
                    total -= 1;
                }
                i = (i + 1) % norm.len();
            }
        } else if total < TOTFREQ as i64 {
            // If under, increment largest remainders first
            norm.sort_by_key(|&(_, _, r)| core::cmp::Reverse(r));
            let mut i = 0usize;
            while total < TOTFREQ as i64 {
                norm[i].1 += 1;
                total += 1;
                i = (i + 1) % norm.len();
            }
        }

        // 2) assign cumulative ranges
        norm.sort_by_key(|(s, _, _)| *s);
        let max_sym = norm.iter().map(|(s, _, _)| *s as usize).max().unwrap_or(0);
        let mut enc = vec![EncSym{ sym:0, freq:0, cum:0 }; max_sym + 1];

        let mut cum: u32 = 0;
        for (s, f, _) in norm.iter() {
            enc[*s as usize] = EncSym { sym:*s, freq:*f, cum };
            cum = cum.checked_add(*f).ok_or_else(|| Scx2Err::AnsTable("cum overflow".into()))?;
        }
        if cum != TOTFREQ { return Err(Scx2Err::AnsTable("normalization failed".into())); }

        // 3) dec table by cumulative slot (mask = TOTFREQ-1)
        let mask = TOTFREQ - 1;
        let mut dec = vec![DecEntry{ sym:0, freq:0, cum:0 }; TOTFREQ as usize];
        for e in enc.iter().filter(|e| e.freq > 0) {
            for x in e.cum..(e.cum + e.freq) {
                dec[x as usize] = DecEntry { sym: e.sym, freq: e.freq, cum: e.cum };
            }
        }

        Ok(Tables { enc, dec, mask })
    }

    /// Encode symbols (in forward order) into bytes (little-endian).
    /// Returns (final_state, bytes) where bytes are the renormalization output.
    pub fn encode(t: &Tables, symbols: &[u16]) -> Result<(u32, Vec<u8>)> {
        let mut state: u32 = RANS_L;
        let mut out: Vec<u8> = Vec::with_capacity(symbols.len().saturating_mul(2));

        // rANS encodes in reverse for a streaming bitstream; we do reverse but preserve determinism.
        for &sym in symbols.iter().rev() {
            let e = t.enc.get(sym as usize).ok_or_else(|| Scx2Err::AnsTable(format!("sym {} OOB", sym)))?;
            if e.freq == 0 { return Err(Scx2Err::AnsTable(format!("sym {} freq=0", sym))); }

            // renormalize: while state >= freq * RANS_L, flush 16 bits
            let x_max = ((RANS_L >> SCALE_BITS) * e.freq) << 16;
            while state >= x_max {
                out.push((state & 0xFF) as u8);
                out.push(((state >> 8) & 0xFF) as u8);
                state >>= 16;
            }

            // core transform
            let q = state / e.freq;
            let r = state % e.freq;
            state = (q << SCALE_BITS) + r + e.cum;
        }

        Ok((state, out))
    }

    /// Decoder over a symbol stream; consumes renorm bytes as needed.
    pub struct Decoder<'a> {
        pub state: u32,
        pub bytes: &'a [u8],
        pub idx: usize,
        pub tables: Tables,
    }

    impl<'a> Decoder<'a> {
        pub fn new(state: u32, bytes: &'a [u8], tables: Tables) -> Self {
            Self { state, bytes, idx: 0, tables }
        }
        #[inline]
        fn refill16(&mut self) -> Result<()> {
            if self.idx + 2 > self.bytes.len() { return Err(Scx2Err::Eof); }
            let lo = self.bytes[self.idx] as u32;
            let hi = self.bytes[self.idx + 1] as u32;
            self.idx += 2;
            self.state = (self.state << 16) | (hi << 8) | lo;
            Ok(())
        }
        pub fn decode_symbol(&mut self) -> Result<u16> {
            // lower SCALE_BITS choose symbol
            let m = (self.state & self.tables.mask) as usize;
            let d = &self.tables.dec[m];
            let sym = d.sym;

            // advance state
            self.state = d.freq * (self.state >> SCALE_BITS) + (self.state & self.tables.mask) - d.cum;

            // renormalize up
            while self.state < RANS_L {
                self.refill16()?;
            }
            Ok(sym)
        }
    }
}

/// ---------- Fused lanes (ANS symbol lane + raw lane) ----------
/// Section payload layout (canonical):
///   COUNT:varint
///   SYM_LEN:varint
///   RAW_LEN:varint
///   ANS_STATE:u32le (present iff FLAG_HAS_ANS)
///   SYM_BYTES[SYM_LEN]
///   RAW_BYTES[RAW_LEN]
#[derive(Clone)]
pub struct FusedSectionWriter {
    symbols: Vec<u16>,
    raw: Vec<u8>,
}
impl FusedSectionWriter {
    pub fn new() -> Self { Self { symbols: vec![], raw: vec![] } }
    pub fn emit_sym(&mut self, s: u16) { self.symbols.push(s); }
    pub fn emit_raw(&mut self, bytes: &[u8]) { self.raw.extend_from_slice(bytes); }
    pub fn emit_varint_as_sym(&mut self, mut n: u64) {
        // For fused lane we keep varint tokens symbolized via VT_U64 channel elsewhere.
        // Here we just emit "varint bytes" to raw if you want; but canonical fusion uses symbols for small ints.
        // This helper is intentionally omitted from core contract.
        while n >= 0x80 {
            self.emit_raw(&[((n as u8) & 0x7F) | 0x80]);
            n >>= 7;
        }
        self.emit_raw(&[n as u8]);
    }
}

/// Reader for fused section: symbol decoder + raw cursor.
/// The fieldmap parser pulls from this API.
pub struct FusedSectionReader<'a> {
    pub count: u64,
    pub sym: rans::Decoder<'a>,
    pub raw: Cursor<'a>,
}

#[derive(Clone)]
pub struct AnsCodec {
    pub tables: rans::Tables,
}
impl AnsCodec {
    pub fn from_freqs(freqs: &[(u16, u32)]) -> Result<Self> {
        Ok(Self { tables: rans::build_tables(freqs)? })
    }
    pub fn encode_symbols(&self, symbols: &[u16]) -> Result<(u32, Vec<u8>)> {
        rans::encode(&self.tables, symbols)
    }
    pub fn decoder<'a>(&self, state: u32, bytes: &'a [u8]) -> rans::Decoder<'a> {
        rans::Decoder::new(state, bytes, self.tables.clone())
    }
}

/// Build a fused EDGES section payload.
/// `edges` are encoded using the EDGE fieldmap with symbols for ids/keys/vt/kind/flags.
/// Floats go to raw lane as f32 bytes.
pub fn build_edges_payload_fused(edges: &[EdgeAst], ans: &AnsCodec) -> Result<Vec<u8>> {
    let mut w = FusedSectionWriter::new();

    // Canonical edge symbol grammar per edge (no varints in this ref fusion; use direct symbols):
    // [id][from][to][kind][flags_u32_as_2_syms][weight_f32_raw]
    // NOTE: In your production kernel, you can symbol-channel varints; this ref chooses direct u16 symbols.
    for e in edges {
        w.emit_sym((e.id & 0xFFFF) as u16);
        w.emit_sym((e.from & 0xFFFF) as u16);
        w.emit_sym((e.to & 0xFFFF) as u16);
        w.emit_sym(e.kind as u16);

        // flags as two u16 symbols
        w.emit_sym((e.flags & 0xFFFF) as u16);
        w.emit_sym(((e.flags >> 16) & 0xFFFF) as u16);

        // weight in raw lane
        w.emit_raw(&e.weight_bits.to_le_bytes());
    }

    let (state, sym_bytes) = ans.encode_symbols(&w.symbols)?;

    let mut payload = Vec::new();
    write_varint_u64(&mut payload, edges.len() as u64);
    write_varint_u64(&mut payload, sym_bytes.len() as u64);
    write_varint_u64(&mut payload, w.raw.len() as u64);
    write_u32_le(&mut payload, state);
    payload.extend_from_slice(&sym_bytes);
    payload.extend_from_slice(&w.raw);
    Ok(payload)
}

/// Decode fused EDGES payload into edges (streaming by count).
pub fn read_edges_payload_fused<'a>(payload: &'a [u8], ans: &AnsCodec) -> Result<Vec<EdgeAst>> {
    let mut cur = Cursor::new(payload);
    let count = read_varint_u64(&mut cur)?;
    let sym_len = read_varint_u64(&mut cur)? as usize;
    let raw_len = read_varint_u64(&mut cur)? as usize;
    let state = read_u32_le(&mut cur)?;

    let sym_bytes = cur.read_exact(sym_len)?;
    let raw_bytes = cur.read_exact(raw_len)?;
    let mut sym = ans.decoder(state, sym_bytes);
    let mut raw = Cursor::new(raw_bytes);

    let mut edges = Vec::with_capacity(count as usize);
    for _ in 0..count {
        let id = sym.decode_symbol()? as u64;
        let from = sym.decode_symbol()? as u64;
        let to = sym.decode_symbol()? as u64;
        let kind = sym.decode_symbol()? as u8;

        let f_lo = sym.decode_symbol()? as u32;
        let f_hi = sym.decode_symbol()? as u32;
        let flags = f_lo | (f_hi << 16);

        let w = read_u32_le(&mut raw)?;
        edges.push(EdgeAst { id, from, to, kind, weight_bits: w, flags });
    }
    Ok(edges)
}

/// ---------- META index (seek offsets per batch) ----------
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchIndex {
    pub kind: String,        // "E" or "N"
    pub tag: u8,             // 3 for EDGES
    pub start_offset: u64,   // offset to section TAG byte
    pub payload_len: u64,    // payload length
    pub header_len: u64,     // bytes from TAG through varint len
    pub count: u64,          // COUNT varint in payload
}

/// Minimal META JSON for this ref:
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamIndexMeta {
    pub schema_id: String,   // "scx2.stream.index.schema.json"
    pub batches: Vec<BatchIndex>,
}

/// Parse stream header, then locate and parse META block JSON.
/// This assumes META payload: schema_id(varint dictref OR string) + json_len + json_bytes
/// For reference, we only support literal string schema_id, not dictref.
pub fn read_meta_from_stream(buf: &[u8]) -> Result<StreamIndexMeta> {
    let mut cur = Cursor::new(buf);

    let magic = cur.read_exact(4)?;
    if magic != MAGIC { return Err(Scx2Err::BadMagic); }
    let ver = cur.read_u8()?;
    if ver != VERSION { return Err(Scx2Err::BadVersion(ver)); }

    let flags = read_varint_u64(&mut cur)?;
    let _tables_len = read_varint_u64(&mut cur)? as usize;
    // skip TABLES bytes in this ref
    // NOTE: your real kernel uses these tables; we only need META offsets here
    // but still must honor bounds.
    // tables_len may be 0.
    if _tables_len > 0 { cur.skip(_tables_len)?; }

    if (flags & FLAG_HAS_INDEX_META) == 0 { return Err(Scx2Err::MetaMissing); }

    // Walk sections to find TAG_META
    loop {
        let tag = cur.read_u8()?;
        if tag == TAG_END { break; }
        let payload_len = read_varint_u64(&mut cur)? as usize;
        let payload = cur.read_exact(payload_len)?;
        if tag == TAG_META {
            // META payload = schema_id_string + json_len + json_bytes
            // schema_id_string uses our normal string encoding (varint len + bytes)
            let mut p = Cursor::new(payload);
            let schema = read_string(&mut p)?;
            let json_len = read_varint_u64(&mut p)? as usize;
            let jb = p.read_exact(json_len)?;
            let meta: StreamIndexMeta = serde_json::from_slice(jb)
                .map_err(|e| Scx2Err::MetaJson(e.to_string()))?;
            if meta.schema_id != schema {
                return Err(Scx2Err::MetaJson("schema_id mismatch".into()));
            }
            return Ok(meta);
        }
    }
    Err(Scx2Err::MetaMissing)
}

/// ---------- CSR adjacency (2-pass deterministic, wired to EDGES batch meta offsets) ----------
#[derive(Debug, Clone)]
pub struct CsrGraph {
    pub node_count: usize,
    pub row_ptr: Vec<u32>,
    pub col_to: Vec<u32>,
    pub edge_id: Vec<u32>,
    pub kind: Vec<u8>,
    pub flags: Vec<u32>,
    pub weight_bits: Vec<u32>,
}

/// Given a stream buffer and parsed META, build CSR adjacency from EDGES batches.
/// Deterministic 2-pass:
///   Pass1: count deg_out (decode edges per batch via offsets)
///   Pass2: fill arrays using row_ptr and per-node write cursor
pub fn build_csr_from_edges_batches(buf: &[u8], meta: &StreamIndexMeta, ans: &AnsCodec, node_count: usize) -> Result<CsrGraph> {
    // Filter EDGES batches
    let edges_batches: Vec<&BatchIndex> = meta.batches.iter()
        .filter(|b| b.kind == "E" && b.tag == TAG_EDGES)
        .collect();

    if edges_batches.is_empty() {
        return Ok(CsrGraph {
            node_count,
            row_ptr: vec![0; node_count + 1],
            col_to: vec![],
            edge_id: vec![],
            kind: vec![],
            flags: vec![],
            weight_bits: vec![],
        });
    }

    // ---- PASS 1: degree counts ----
    let mut deg_out = vec![0u32; node_count];
    let mut total_edges: u32 = 0;

    for b in &edges_batches {
        let section_start = b.start_offset as usize;
        let payload_start = (b.start_offset + b.header_len) as usize;
        let payload_len = b.payload_len as usize;

        // Bounds
        if section_start >= buf.len() { return Err(Scx2Err::Bounds); }
        if payload_start + payload_len > buf.len() { return Err(Scx2Err::Bounds); }

        let payload = &buf[payload_start..payload_start + payload_len];
        let edges = read_edges_payload_fused(payload, ans)?;
        for e in edges {
            let from = e.from as usize;
            if from < node_count {
                deg_out[from] = deg_out[from].saturating_add(1);
                total_edges = total_edges.saturating_add(1);
            }
        }
    }

    // row_ptr prefix sums
    let mut row_ptr = vec![0u32; node_count + 1];
    let mut acc: u32 = 0;
    for i in 0..node_count {
        row_ptr[i] = acc;
        acc = acc.saturating_add(deg_out[i]);
    }
    row_ptr[node_count] = acc;

    // allocate arrays
    let m = total_edges as usize;
    let mut col_to = vec![0u32; m];
    let mut edge_id = vec![0u32; m];
    let mut kind = vec![0u8; m];
    let mut flags = vec![0u32; m];
    let mut weight_bits = vec![0u32; m];

    // per-node cursor
    let mut cursor = row_ptr[..node_count].to_vec(); // current write position for each node

    // ---- PASS 2: fill ----
    for b in &edges_batches {
        let payload_start = (b.start_offset + b.header_len) as usize;
        let payload_len = b.payload_len as usize;
        let payload = &buf[payload_start..payload_start + payload_len];
        let edges = read_edges_payload_fused(payload, ans)?;
        for e in edges {
            let from = e.from as usize;
            if from >= node_count { continue; }
            let idx = cursor[from] as usize;
            if idx >= m { return Err(Scx2Err::Bounds); }
            cursor[from] = cursor[from].saturating_add(1);

            col_to[idx] = e.to as u32;
            edge_id[idx] = e.id as u32;
            kind[idx] = e.kind;
            flags[idx] = e.flags;
            weight_bits[idx] = e.weight_bits;
        }
    }

    Ok(CsrGraph { node_count, row_ptr, col_to, edge_id, kind, flags, weight_bits })
}

/// ---------- Minimal stream builder for examples/tests ----------
pub fn build_stream_with_edges_and_meta(edges_batches: Vec<Vec<EdgeAst>>, ans: &AnsCodec) -> Result<Vec<u8>> {
    let mut out = Vec::new();
    out.extend_from_slice(MAGIC);
    out.push(VERSION);

    let flags = FLAG_HAS_ANS | FLAG_HAS_INDEX_META;
    write_varint_u64(&mut out, flags);

    // TABLES_LEN + TABLES_BYTES (empty in this reference)
    write_varint_u64(&mut out, 0);

    let mut batches: Vec<BatchIndex> = vec![];

    for edges in edges_batches {
        let start_offset = out.len() as u64;
        out.push(TAG_EDGES);
        // payload
        let payload = build_edges_payload_fused(&edges, ans)?;
        let mut header = Vec::new();
        write_varint_u64(&mut header, payload.len() as u64);
        let header_len = 1u64 + header.len() as u64;

        out.extend_from_slice(&header);
        out.extend_from_slice(&payload);

        batches.push(BatchIndex {
            kind: "E".into(),
            tag: TAG_EDGES,
            start_offset,
            payload_len: payload.len() as u64,
            header_len,
            count: edges.len() as u64,
        });
    }

    // META section (final)
    let meta_json = serde_json::to_vec(&StreamIndexMeta {
        schema_id: "scx2.stream.index.schema.json".into(),
        batches,
    }).map_err(|e| Scx2Err::MetaJson(e.to_string()))?;

    let mut meta_payload = Vec::new();
    write_string(&mut meta_payload, "scx2.stream.index.schema.json");
    write_varint_u64(&mut meta_payload, meta_json.len() as u64);
    meta_payload.extend_from_slice(&meta_json);

    out.push(TAG_META);
    write_varint_u64(&mut out, meta_payload.len() as u64);
    out.extend_from_slice(&meta_payload);

    out.push(TAG_END);
    Ok(out)
}
