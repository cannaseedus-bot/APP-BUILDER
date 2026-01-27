\
# SCX2-RFC.md — SCXQ2 Streaming Container v1 (Fused-Lane + META Index)

**Status:** Canonical Reference (v1)  
**Authority:** MX2⟁☣  
**Scope:** Byte-level stream format for SCXQ2 fieldmap packets with optional ANS symbol compression and a seek/index META block.

---

## 1. Terms

- **Fieldmap**: deterministic field order contract for a record type (node/glyph/flux/edge).
- **Symbol lane**: sequence of small tokens (IDs, keys, type tags, enums) that compress well.
- **Raw lane**: bytes that must remain verbatim (floats, string bytes, blobs).
- **ANS**: rANS (Range Asymmetric Numeral Systems) compression over the symbol lane.
- **META**: final block containing seek offsets and batch descriptors.

---

## 2. Normative Conventions

- Integers are **unsigned**.
- Varint encoding is **ULEB128** for `u64`.
- Floats are **IEEE-754 LE**.
- Strings are UTF-8: `LEN(varint) + BYTES[len]`.
- “MUST / MUST NOT / SHALL / MAY” are normative.

---

## 3. High-Level Diagram

```
+-------------------- SCX2 STREAM ---------------------+
| HEADER |  SECTION*  |  META (optional) |  END (0xFF) |
+------------------------------------------------------+

SECTION = TAG(u8) + PAYLOAD_LEN(varint) + PAYLOAD_BYTES
```

---

## 4. Stream Header

### 4.1 Layout (bytes)

```
MAGIC[4]        = "SCX2"  (53 43 58 32)
VERSION[u8]     = 01
FLAGS[varint]   = bitfield
TABLES_LEN[varint]
TABLES_BYTES[TABLES_LEN]
```

### 4.2 FLAGS (bitfield)

- bit0: `HAS_ANS` (1 = symbol lane compressed with ANS)
- bit2: `HAS_INDEX_META` (1 = META block present)
- all other bits reserved (MUST be 0)

---

## 5. Sections

### 5.1 Section Envelope

```
TAG[u8]              ; 0x02 NODES, 0x03 EDGES, 0x04 META, 0xFF END
PAYLOAD_LEN[varint]
PAYLOAD_BYTES[PAYLOAD_LEN]
```

### 5.2 Tag Values

| TAG | Meaning |
|-----|---------|
| 0x02 | NODES |
| 0x03 | EDGES |
| 0x04 | META |
| 0xFF | END |

A decoder MUST stop at END. Trailing bytes after END are a violation.

---

## 6. Fused-Lane Payload (NODES/EDGES)

### 6.1 Payload Layout

```
COUNT[varint]
SYM_LEN[varint]
RAW_LEN[varint]
ANS_STATE[u32le]      ; present iff HAS_ANS
SYM_BYTES[SYM_LEN]
RAW_BYTES[RAW_LEN]
```

### 6.2 Parsing Rules

- `COUNT` is the number of records in the batch.
- `SYM_BYTES` is the ANS-coded symbol stream (or raw symbols if HAS_ANS=0).
- `RAW_BYTES` is a linear byte lane consumed by the fieldmap parser whenever raw material is required.

---

## 7. EDGES Fieldmap (Canonical v1)

### 7.1 AST Shape (conceptual)

```json
{
  "@type": "edge",
  "id": 912,
  "from": 12,
  "to": 44,
  "kind": 0,
  "weight": 0.73,
  "flags": 3
}
```

### 7.2 Fieldmap Order (deterministic)

For each edge record, the fused-lane contract in this reference implementation is:

**Symbols (u16):**
1) `id_low16`
2) `from_low16`
3) `to_low16`
4) `kind_u8`
5) `flags_low16`
6) `flags_high16`

**Raw bytes:**
- `weight_f32_le` (4 bytes)

> NOTE: Production SCXQ2 typically uses varint IDs and symbol-channel typing; this RFC allows that, but the reference crate pins a minimal deterministic contract to demonstrate fused lanes.

---

## 8. META Block (Seek/Index Sidecar)

META MUST be the last non-END section if `HAS_INDEX_META=1`.

### 8.1 META Payload Layout (v1 reference)

```
SCHEMA_ID[string]     ; literal string
INDEX_JSON_LEN[varint]
INDEX_JSON_BYTES[INDEX_JSON_LEN]
```

### 8.2 META JSON (reference structure)

```json
{
  "schema_id": "scx2.stream.index.schema.json",
  "batches": [
    {
      "kind": "E",
      "tag": 3,
      "start_offset": 1234,
      "payload_len": 567,
      "header_len": 3,
      "count": 42
    }
  ]
}
```

### 8.3 Seek Semantics

For each batch:
- `start_offset` points to the **TAG byte**.
- `header_len` is the number of bytes from TAG through the end of `PAYLOAD_LEN(varint)`.
- The payload begins at `start_offset + header_len`.

---

## 9. Deterministic CSR Adjacency Build (2-pass)

Using META offsets, build adjacency without scanning the whole stream.

### Pass 1 (degree counts)
For each EDGES batch:
1) seek to payload
2) decode edges
3) `deg_out[from]++`

### Pass 2 (fill arrays)
1) prefix sum into `row_ptr`
2) allocate `col_to`, plus aligned payload arrays
3) seek + decode edges again
4) write into `col_to[row_ptr[from] + cursor[from]]`

CSR invariants:
- `row_ptr` is monotonic
- `row_ptr[n] == edge_count`

---

## 10. Byte Dump Example

Example stream (conceptual):

```
53 43 58 32          ; "SCX2"
01                   ; version
05                   ; flags varint (HAS_ANS + HAS_INDEX_META)
00                   ; tables_len=0
03 <len> <payload>   ; EDGES section #1
03 <len> <payload>   ; EDGES section #2
04 <len> <meta>      ; META
FF                   ; END
```

In the reference crate, you can generate a real stream and dump hex via:

```bash
cargo test -- --nocapture
```

(Extend tests to print `hex::encode(stream)` if desired.)

---

## 11. Golden Invariants

A conforming encoder/decoder MUST satisfy:

1) `encode(decode(payload)) == payload` for each batch payload  
2) META offsets MUST correctly locate each batch payload  
3) CSR built via META MUST match decoded edges exactly

---

## 12. Reference Implementation

This RFC is paired with the reference crate:

- `src/lib.rs`: fused-lane encoder/decoder, rANS tables, META parser, CSR builder
- `tests/golden.rs`: round-trip + CSR invariants

