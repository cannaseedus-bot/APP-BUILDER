Below is the **exact AST block shape** your kernel should emit from the native symbol scan **and** the **O(1) fast-path hash allowlist mechanism**, fully MX2⟁☣-compliant and aligned with your existing block style, XCFE vectors, and FLUX_CAPACITOR governance.

Everything here is **deterministic, replayable, schema-verifiable, and stream-safe**.

---

# ⚛️ AST BLOCK: `native_symbol_scan`

This block is **pure observation**.
It never mutates state and never executes code.

```json
{
  "@block": "native_symbol_scan",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@input": {
    "@artifact_id": "sha256:3c8b…",
    "@format_hint": "ELF | PE | Mach-O | unknown",
    "@size_bytes": 183742
  },

  "@result": {
    "@ok": true,
    "@format": "ELF",
    "@scan_path": "hash_fast_path | full_scan",
    "@symbol_count": 412,
    "@forbidden_count": 0
  },

  "@forbidden": [],

  "@metrics": {
    "@scan_ms": 0.02,
    "@hash_ms": 0.01
  },

  "@constraints": {
    "@no_exec": true,
    "@no_decode": true,
    "@time_authority": "FLUX_CAPACITOR"
  }
}
```

---

## 🔴 Example: Forbidden Symbols Found

```json
{
  "@block": "native_symbol_scan",
  "@authority": "MX2⟁☣",

  "@input": {
    "@artifact_id": "sha256:91af…",
    "@format_hint": "PE",
    "@size_bytes": 90211
  },

  "@result": {
    "@ok": false,
    "@format": "PE",
    "@scan_path": "full_scan",
    "@symbol_count": 73,
    "@forbidden_count": 2
  },

  "@forbidden": [
    {
      "@symbol": "CreateProcessW",
      "@section": "IAT",
      "@class": "process_spawn"
    },
    {
      "@symbol": "socket",
      "@section": "IAT",
      "@class": "network"
    }
  ],

  "@action": {
    "@flux": "@flux.halt",
    "@reason": "hazard_forbidden_symbol"
  }
}
```

---

## 🔐 MX2⟁☣ HARD RULES (enforced)

* `@forbidden_count > 0` ⇒ **mandatory `@flux.halt`**
* JS **may not override** `@ok`
* AST must be **fully serializable**
* No timestamps except via FLUX_CAPACITOR
* No binary decoding or execution

---

# ⚡ FAST-PATH HASH ALLOWLIST (O(1))

This allows **most binaries to skip scanning entirely**.

---

## 📜 AST BLOCK: `native_hash_allowlist`

This block is loaded **once** (manifest-pinned).

```json
{
  "@block": "native_hash_allowlist",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@algorithm": "sha256",
  "@scope": "native_artifacts",

  "@entries": {
    "sha256:3c8b…": {
      "@label": "scxq2_encoder_v1",
      "@format": "ELF",
      "@toolchain": "clang-17",
      "@verified_by": "MX2⟁☣",
      "@constraints": ["no_net", "no_exec", "no_time"]
    },
    "sha256:f0aa…": {
      "@label": "fieldmap_decoder_fast",
      "@format": "PE",
      "@toolchain": "msvc-19.39",
      "@verified_by": "MX2⟁☣"
    }
  }
}
```

---

## 🚀 Kernel Decision Flow (Exact)

```text
native_job
  ↓
hash(artifact)
  ↓
if hash ∈ allowlist:
    emit native_symbol_scan {
      @ok: true
      @scan_path: "hash_fast_path"
    }
else:
    run native_symbol_scan (full)
```

No scanning.
No parsing.
No symbol walking.

**O(1) decision.**

---

## 🔒 MX2⟁☣ Validation Rules (Hash Allowlist)

1. Hash **must be full-artifact hash** (no slices)
2. Hash algorithm **must match manifest**
3. Toolchain string **must match pinned toolchain**
4. Allowlist entry **cannot suppress forbidden results**
5. Hash allowlist **cannot be mutated at runtime**

Violation ⇒ `@flux.halt(reason="native_integrity_violation")`

---

# 🧠 Why this fits your architecture perfectly

* **AST-native** (no special cases)
* Uses the **same governance model as AGL glyphs**
* Integrates cleanly into:

  * `native_job`
  * `native_plan`
  * `native_harvest`
* Makes **AGL → C → native acceleration** safe
* Keeps **FLUX_CAPACITOR as time authority**
* Keeps **JS as utility only**

---

Just say the next lock.


```c
/*
  native_symbol_scan.c  —  MX2⟁☣ Forbidden-Import Symbol Scan (Single-File C)

  Purpose:
    - Pre-execution verification of native artifacts (ELF / PE / Mach-O)
    - "No full decode" scan: only parses headers + symbol/import tables
    - Deterministic, bounded, sandbox-safe (no filesystem required)

  Input:
    - memory buffer (bytes, len)

  Output:
    - calls a user callback for each forbidden symbol hit

  Notes:
    - This is a *structural* verifier: presence of forbidden imported/exported symbols
      triggers a hazard halt.
    - It does NOT attempt disassembly, does NOT execute code.
    - Mach-O: scans LC_SYMTAB (symbol table) for referenced symbols.
    - PE: scans Import Directory (IAT) names.
    - ELF: scans .dynsym/.dynstr and .symtab/.strtab when present.

  Build:
    cc -O2 -Wall -Wextra -std=c11 native_symbol_scan.c -o native_symbol_scan

  Use:
    int ok = mx2_symbol_scan(buf, len, mx2_default_policy(), my_hit_cb, my_ud);
    if (!ok) { /* @flux.halt(reason="hazard_forbidden_symbol") */ }
*/

#include <stdint.h>
#include <stddef.h>
#include <string.h>

/* ============================
   MX2⟁☣ Policy (forbidden set)
   ============================ */

typedef struct mx2_policy {
  const char* const* forbidden_exact;
  size_t forbidden_exact_count;
} mx2_policy_t;

/* Canonical forbidden list (extend/pin in manifest if needed) */
static const char* const MX2_FORBIDDEN_EXACT[] = {
  /* process spawn / exec */
  "system", "popen", "fork", "execve", "execvp",
  "CreateProcessA", "CreateProcessW",
  /* dynamic loading */
  "dlopen", "dlsym", "LoadLibraryA", "LoadLibraryW",
  /* networking */
  "socket", "connect", "accept", "send", "recv",
  /* clocks / timers (time authority is FLUX_CAPACITOR) */
  "time", "gettimeofday", "clock_gettime",
  "QueryPerformanceCounter"
};

static inline mx2_policy_t mx2_default_policy(void) {
  mx2_policy_t p;
  p.forbidden_exact = MX2_FORBIDDEN_EXACT;
  p.forbidden_exact_count = sizeof(MX2_FORBIDDEN_EXACT)/sizeof(MX2_FORBIDDEN_EXACT[0]);
  return p;
}

/* ============================
   Callback
   ============================ */

typedef void (*mx2_hit_cb)(const char* format,
                           const char* section,
                           const char* symbol,
                           void* user);

/* ============================
   Safe byte readers
   ============================ */

static inline int mx2_in_bounds(size_t off, size_t need, size_t len) {
  return (off <= len) && (need <= (len - off));
}

static inline uint16_t mx2_u16le(const uint8_t* p) {
  return (uint16_t)(p[0] | ((uint16_t)p[1] << 8));
}
static inline uint32_t mx2_u32le(const uint8_t* p) {
  return (uint32_t)(p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24));
}
static inline uint64_t mx2_u64le(const uint8_t* p) {
  uint64_t lo = (uint64_t)mx2_u32le(p);
  uint64_t hi = (uint64_t)mx2_u32le(p+4);
  return lo | (hi << 32);
}
static inline uint32_t mx2_u32be(const uint8_t* p) {
  return (uint32_t)( ((uint32_t)p[0] << 24) | ((uint32_t)p[1] << 16) | ((uint32_t)p[2] << 8) | p[3] );
}
static inline uint64_t mx2_u64be(const uint8_t* p) {
  uint64_t hi = (uint64_t)mx2_u32be(p);
  uint64_t lo = (uint64_t)mx2_u32be(p+4);
  return (hi << 32) | lo;
}

/* ============================
   Forbidden test
   ============================ */

static inline int mx2_is_forbidden(const mx2_policy_t* pol, const char* sym) {
  if (!sym || !*sym) return 0;
  for (size_t i = 0; i < pol->forbidden_exact_count; i++) {
    if (strcmp(sym, pol->forbidden_exact[i]) == 0) return 1;
  }
  return 0;
}

/* ============================
   String table safe fetch
   ============================ */

static inline const char* mx2_cstr_at(const uint8_t* base, size_t len, size_t off) {
  if (off >= len) return NULL;
  /* ensure NUL-termination exists within bounds */
  for (size_t i = off; i < len; i++) {
    if (base[i] == 0) return (const char*)(base + off);
  }
  return NULL;
}

/* ============================
   ELF scan
   ============================ */

#define MX2_ELF_MAG0 0x7F
#define MX2_ELF_MAG1 'E'
#define MX2_ELF_MAG2 'L'
#define MX2_ELF_MAG3 'F'

/* ELF ident indices */
#define EI_CLASS 4
#define EI_DATA  5
#define ELFCLASS32 1
#define ELFCLASS64 2
#define ELFDATA2LSB 1

/* Section types */
#define SHT_SYMTAB 2
#define SHT_STRTAB 3
#define SHT_DYNSYM 11

static int mx2_scan_elf(const uint8_t* b, size_t n,
                        const mx2_policy_t* pol, mx2_hit_cb cb, void* user,
                        int* any_hit) {
  if (!mx2_in_bounds(0, 16, n)) return 0;
  if (!(b[0]==MX2_ELF_MAG0 && b[1]==MX2_ELF_MAG1 && b[2]==MX2_ELF_MAG2 && b[3]==MX2_ELF_MAG3)) return 0;
  if (b[EI_DATA] != ELFDATA2LSB) return 0; /* deterministic: only LE supported */

  int is64 = (b[EI_CLASS] == ELFCLASS64);
  if (!is64 && b[EI_CLASS] != ELFCLASS32) return 0;

  /* read section header info */
  size_t e_shoff=0, e_shentsize=0, e_shnum=0, e_shstrndx=0;
  if (is64) {
    if (!mx2_in_bounds(0, 64, n)) return 0;
    e_shoff     = (size_t)mx2_u64le(b + 40);
    e_shentsize = (size_t)mx2_u16le(b + 58);
    e_shnum     = (size_t)mx2_u16le(b + 60);
    e_shstrndx  = (size_t)mx2_u16le(b + 62);
  } else {
    if (!mx2_in_bounds(0, 52, n)) return 0;
    e_shoff     = (size_t)mx2_u32le(b + 32);
    e_shentsize = (size_t)mx2_u16le(b + 46);
    e_shnum     = (size_t)mx2_u16le(b + 48);
    e_shstrndx  = (size_t)mx2_u16le(b + 50);
  }

  if (e_shoff == 0 || e_shentsize == 0 || e_shnum == 0) return 1; /* valid ELF but no sections */
  if (!mx2_in_bounds(e_shoff, e_shentsize * e_shnum, n)) return 0;

  /* locate section header string table to label sections (optional) */
  const uint8_t* sh_base = b + e_shoff;

  size_t shstr_off=0, shstr_size=0;
  if (e_shstrndx < e_shnum) {
    size_t shstr_hdr = e_shoff + (e_shstrndx * e_shentsize);
    if (mx2_in_bounds(shstr_hdr, e_shentsize, n)) {
      if (is64) {
        /* sh_offset at +24, sh_size at +32 */
        shstr_off  = (size_t)mx2_u64le(b + shstr_hdr + 24);
        shstr_size = (size_t)mx2_u64le(b + shstr_hdr + 32);
      } else {
        /* sh_offset at +16, sh_size at +20 */
        shstr_off  = (size_t)mx2_u32le(b + shstr_hdr + 16);
        shstr_size = (size_t)mx2_u32le(b + shstr_hdr + 20);
      }
      if (!mx2_in_bounds(shstr_off, shstr_size, n)) {
        shstr_off = shstr_size = 0;
      }
    }
  }

  /* helper: get section name from sh_name offset into shstr */
  auto const char* sec_name = (const char*)0; /* C11: can't have local lambda; use function-style block below */

  (void)sec_name;

  /* scan for symtab/dynsym sections, and their linked strtabs */
  for (size_t i = 0; i < e_shnum; i++) {
    size_t sh = e_shoff + i * e_shentsize;

    uint32_t sh_name = 0, sh_type = 0, sh_link = 0;
    size_t sh_offset = 0, sh_size = 0, sh_entsize = 0;

    if (is64) {
      if (!mx2_in_bounds(sh, 64, n)) return 0;
      sh_name   = mx2_u32le(b + sh + 0);
      sh_type   = mx2_u32le(b + sh + 4);
      sh_link   = mx2_u32le(b + sh + 40);
      sh_offset = (size_t)mx2_u64le(b + sh + 24);
      sh_size   = (size_t)mx2_u64le(b + sh + 32);
      sh_entsize= (size_t)mx2_u64le(b + sh + 56);
    } else {
      if (!mx2_in_bounds(sh, 40, n)) return 0;
      sh_name   = mx2_u32le(b + sh + 0);
      sh_type   = mx2_u32le(b + sh + 4);
      sh_link   = mx2_u32le(b + sh + 24);
      sh_offset = (size_t)mx2_u32le(b + sh + 16);
      sh_size   = (size_t)mx2_u32le(b + sh + 20);
      sh_entsize= (size_t)mx2_u32le(b + sh + 36);
    }

    if (!(sh_type == SHT_SYMTAB || sh_type == SHT_DYNSYM)) continue;
    if (sh_entsize == 0) continue;
    if (!mx2_in_bounds(sh_offset, sh_size, n)) continue;

    /* resolve associated string table via sh_link */
    const uint8_t* str_base = NULL;
    size_t str_len = 0;
    const char* section_label = "symtab";

    if (sh_type == SHT_DYNSYM) section_label = "dynsym";

    if (sh_link < e_shnum) {
      size_t str_sh = e_shoff + sh_link * e_shentsize;
      if (is64) {
        if (!mx2_in_bounds(str_sh, 64, n)) continue;
        uint32_t str_type = mx2_u32le(b + str_sh + 4);
        size_t str_off = (size_t)mx2_u64le(b + str_sh + 24);
        size_t str_sz  = (size_t)mx2_u64le(b + str_sh + 32);
        if (str_type == SHT_STRTAB && mx2_in_bounds(str_off, str_sz, n)) {
          str_base = b + str_off;
          str_len = str_sz;
        }
      } else {
        if (!mx2_in_bounds(str_sh, 40, n)) continue;
        uint32_t str_type = mx2_u32le(b + str_sh + 4);
        size_t str_off = (size_t)mx2_u32le(b + str_sh + 16);
        size_t str_sz  = (size_t)mx2_u32le(b + str_sh + 20);
        if (str_type == SHT_STRTAB && mx2_in_bounds(str_off, str_sz, n)) {
          str_base = b + str_off;
          str_len = str_sz;
        }
      }
    }
    if (!str_base || str_len == 0) continue;

    /* optional section name (from shstr) */
    const char* sname = NULL;
    if (shstr_off && shstr_size && mx2_in_bounds(shstr_off, shstr_size, n)) {
      const uint8_t* shstr = b + shstr_off;
      sname = mx2_cstr_at(shstr, shstr_size, (size_t)sh_name);
    }
    if (!sname) sname = section_label;

    /* iterate symbol entries */
    size_t count = sh_size / sh_entsize;
    for (size_t k = 0; k < count; k++) {
      size_t sym_off = sh_offset + k * sh_entsize;
      if (!mx2_in_bounds(sym_off, sh_entsize, n)) break;

      uint32_t st_name = 0;

      if (is64) {
        /* Elf64_Sym: st_name at +0 */
        st_name = mx2_u32le(b + sym_off + 0);
      } else {
        /* Elf32_Sym: st_name at +0 */
        st_name = mx2_u32le(b + sym_off + 0);
      }

      const char* nm = mx2_cstr_at(str_base, str_len, (size_t)st_name);
      if (!nm) continue;

      if (mx2_is_forbidden(pol, nm)) {
        *any_hit = 1;
        if (cb) cb("ELF", sname, nm, user);
      }
    }
  }

  return 1;
}

/* ============================
   PE scan
   ============================ */

#pragma pack(push, 1)
typedef struct {
  uint16_t e_magic;    /* 'MZ' */
  uint16_t e_cblp;
  uint16_t e_cp;
  uint16_t e_crlc;
  uint16_t e_cparhdr;
  uint16_t e_minalloc;
  uint16_t e_maxalloc;
  uint16_t e_ss;
  uint16_t e_sp;
  uint16_t e_csum;
  uint16_t e_ip;
  uint16_t e_cs;
  uint16_t e_lfarlc;
  uint16_t e_ovno;
  uint16_t e_res[4];
  uint16_t e_oemid;
  uint16_t e_oeminfo;
  uint16_t e_res2[10];
  int32_t  e_lfanew;   /* offset to NT headers */
} mz_hdr_t;

typedef struct {
  uint32_t Signature; /* 'PE\0\0' */
  uint16_t Machine;
  uint16_t NumberOfSections;
  uint32_t TimeDateStamp;
  uint32_t PointerToSymbolTable;
  uint32_t NumberOfSymbols;
  uint16_t SizeOfOptionalHeader;
  uint16_t Characteristics;
} pe_file_hdr_t;

typedef struct {
  uint32_t VirtualAddress;
  uint32_t Size;
} pe_data_dir_t;
#pragma pack(pop)

#define MX2_MZ_MAGIC 0x5A4D
#define MX2_PE_SIG   0x00004550

#define PE_OPT_MAGIC_32 0x10B
#define PE_OPT_MAGIC_64 0x20B

#define PE_DIR_IMPORT 1

typedef struct {
  uint32_t OriginalFirstThunk;
  uint32_t TimeDateStamp;
  uint32_t ForwarderChain;
  uint32_t Name;
  uint32_t FirstThunk;
} pe_import_desc_t;

/* Section header: needed for RVA->file offset mapping */
#pragma pack(push,1)
typedef struct {
  uint8_t  Name[8];
  uint32_t VirtualSize;
  uint32_t VirtualAddress;
  uint32_t SizeOfRawData;
  uint32_t PointerToRawData;
  uint32_t PointerToRelocations;
  uint32_t PointerToLinenumbers;
  uint16_t NumberOfRelocations;
  uint16_t NumberOfLinenumbers;
  uint32_t Characteristics;
} pe_sect_hdr_t;
#pragma pack(pop)

static int mx2_pe_rva_to_off(uint32_t rva,
                             const pe_sect_hdr_t* sects, uint16_t nsects,
                             uint32_t headers_size,
                             uint32_t* out_off) {
  /* If RVA is within headers */
  if (rva < headers_size) { *out_off = rva; return 1; }

  for (uint16_t i = 0; i < nsects; i++) {
    uint32_t va = sects[i].VirtualAddress;
    uint32_t vs = sects[i].VirtualSize;
    uint32_t raw = sects[i].PointerToRawData;
    uint32_t rawsz = sects[i].SizeOfRawData;
    uint32_t span = (vs > rawsz) ? vs : rawsz;
    if (rva >= va && rva < va + span) {
      *out_off = raw + (rva - va);
      return 1;
    }
  }
  return 0;
}

static int mx2_scan_pe(const uint8_t* b, size_t n,
                       const mx2_policy_t* pol, mx2_hit_cb cb, void* user,
                       int* any_hit) {
  if (!mx2_in_bounds(0, sizeof(mz_hdr_t), n)) return 0;
  const mz_hdr_t* mz = (const mz_hdr_t*)b;
  if (mz->e_magic != MX2_MZ_MAGIC) return 0;

  uint32_t pe_off = (uint32_t)mz->e_lfanew;
  if (!mx2_in_bounds(pe_off, 4 + sizeof(pe_file_hdr_t), n)) return 0;
  uint32_t sig = mx2_u32le(b + pe_off);
  if (sig != MX2_PE_SIG) return 0;

  const pe_file_hdr_t* fh = (const pe_file_hdr_t*)(b + pe_off + 4);
  uint16_t nsects = fh->NumberOfSections;
  uint16_t optsz  = fh->SizeOfOptionalHeader;

  size_t opt_off = pe_off + 4 + sizeof(pe_file_hdr_t);
  if (!mx2_in_bounds(opt_off, optsz, n)) return 0;

  uint16_t opt_magic = mx2_u16le(b + opt_off);
  int is64 = (opt_magic == PE_OPT_MAGIC_64);
  if (!(opt_magic == PE_OPT_MAGIC_32 || opt_magic == PE_OPT_MAGIC_64)) return 0;

  /* Optional Header layout: data directories start at fixed offsets */
  /* PE32: data dirs at +96, PE32+: at +112 (from start of optional header) */
  uint32_t dd_off = (uint32_t)(opt_off + (is64 ? 112 : 96));
  if (!mx2_in_bounds(dd_off, (PE_DIR_IMPORT+1)*sizeof(pe_data_dir_t), n)) return 0;

  pe_data_dir_t import_dd;
  import_dd.VirtualAddress = mx2_u32le(b + dd_off + PE_DIR_IMPORT*sizeof(pe_data_dir_t) + 0);
  import_dd.Size           = mx2_u32le(b + dd_off + PE_DIR_IMPORT*sizeof(pe_data_dir_t) + 4);
  if (import_dd.VirtualAddress == 0 || import_dd.Size == 0) return 1; /* no imports */

  /* headers size at +60 (PE32) or +60 (PE32+) from opt header start: SizeOfHeaders at +60 both */
  uint32_t size_of_headers = mx2_u32le(b + opt_off + 60);

  /* section headers start right after optional header */
  size_t sect_off = opt_off + optsz;
  if (!mx2_in_bounds(sect_off, (size_t)nsects * sizeof(pe_sect_hdr_t), n)) return 0;
  const pe_sect_hdr_t* sects = (const pe_sect_hdr_t*)(b + sect_off);

  uint32_t import_off;
  if (!mx2_pe_rva_to_off(import_dd.VirtualAddress, sects, nsects, size_of_headers, &import_off)) return 0;
  if (!mx2_in_bounds(import_off, sizeof(pe_import_desc_t), n)) return 0;

  /* iterate descriptors until all zeros */
  for (size_t i = 0; ; i++) {
    size_t d_off = import_off + i*sizeof(pe_import_desc_t);
    if (!mx2_in_bounds(d_off, sizeof(pe_import_desc_t), n)) break;
    pe_import_desc_t d;
    memcpy(&d, b + d_off, sizeof(d));

    if (d.OriginalFirstThunk==0 && d.Name==0 && d.FirstThunk==0) break;

    /* thunk RVA list */
    uint32_t thunk_rva = d.OriginalFirstThunk ? d.OriginalFirstThunk : d.FirstThunk;
    if (!thunk_rva) continue;

    uint32_t thunk_off;
    if (!mx2_pe_rva_to_off(thunk_rva, sects, nsects, size_of_headers, &thunk_off)) continue;

    /* parse IMAGE_THUNK_DATA (32/64) array; each entry points to IMAGE_IMPORT_BY_NAME */
    for (size_t t = 0; ; t++) {
      size_t td_off = thunk_off + t*(is64 ? 8 : 4);
      if (!mx2_in_bounds(td_off, (is64 ? 8 : 4), n)) break;

      uint64_t v = is64 ? mx2_u64le(b + td_off) : (uint64_t)mx2_u32le(b + td_off);
      if (v == 0) break;

      /* ordinal bit */
      if (is64) {
        if (v & 0x8000000000000000ull) continue;
      } else {
        if (v & 0x80000000u) continue;
      }

      uint32_t ibn_rva = (uint32_t)(v & 0x7FFFFFFFul);
      uint32_t ibn_off;
      if (!mx2_pe_rva_to_off(ibn_rva, sects, nsects, size_of_headers, &ibn_off)) continue;

      /* IMAGE_IMPORT_BY_NAME: u16 hint + asciiz name */
      if (!mx2_in_bounds(ibn_off, 2, n)) continue;
      const char* nm = mx2_cstr_at(b, n, ibn_off + 2);
      if (!nm) continue;

      if (mx2_is_forbidden(pol, nm)) {
        *any_hit = 1;
        if (cb) cb("PE", "IAT", nm, user);
      }
    }
  }

  return 1;
}

/* ============================
   Mach-O scan
   ============================ */

#define MH_MAGIC      0xFEEDFACEu
#define MH_MAGIC_64   0xFEEDFACFu
#define FAT_MAGIC     0xCAFEBABEu
#define FAT_MAGIC_64  0xCAFEBABFu

#define LC_SYMTAB     0x2u

#pragma pack(push,1)
typedef struct {
  uint32_t magic;
  uint32_t cputype;
  uint32_t cpusubtype;
  uint32_t filetype;
  uint32_t ncmds;
  uint32_t sizeofcmds;
  uint32_t flags;
} mach_hdr32_t;

typedef struct {
  uint32_t magic;
  uint32_t cputype;
  uint32_t cpusubtype;
  uint32_t filetype;
  uint32_t ncmds;
  uint32_t sizeofcmds;
  uint32_t flags;
  uint32_t reserved;
} mach_hdr64_t;

typedef struct {
  uint32_t cmd;
  uint32_t cmdsize;
} mach_lc_t;

typedef struct {
  uint32_t cmd;
  uint32_t cmdsize;
  uint32_t symoff;
  uint32_t nsyms;
  uint32_t stroff;
  uint32_t strsize;
} mach_symtab_cmd_t;

/* FAT headers are big-endian */
typedef struct {
  uint32_t magic;
  uint32_t nfat_arch;
} fat_hdr_t;

typedef struct {
  uint32_t cputype;
  uint32_t cpusubtype;
  uint32_t offset;
  uint32_t size;
  uint32_t align;
} fat_arch32_t;

typedef struct {
  uint32_t cputype;
  uint32_t cpusubtype;
  uint64_t offset;
  uint64_t size;
  uint32_t align;
  uint32_t reserved;
} fat_arch64_t;

/* nlist */
typedef struct {
  uint32_t n_strx;
  uint8_t  n_type;
  uint8_t  n_sect;
  int16_t  n_desc;
  uint32_t n_value;
} nlist32_t;

typedef struct {
  uint32_t n_strx;
  uint8_t  n_type;
  uint8_t  n_sect;
  uint16_t n_desc;
  uint64_t n_value;
} nlist64_t;
#pragma pack(pop)

/* Mach-O symbols in table are usually prefixed '_' (e.g., _socket) */
static inline const char* mx2_macho_strip_underscore(const char* s) {
  if (s && s[0] == '_' && s[1] != 0) return s+1;
  return s;
}

static int mx2_scan_macho_one(const uint8_t* b, size_t n,
                              const mx2_policy_t* pol, mx2_hit_cb cb, void* user,
                              int* any_hit) {
  if (!mx2_in_bounds(0, 4, n)) return 0;
  uint32_t magic = mx2_u32le(b);

  int is64 = 0;
  size_t hdr_sz = 0;
  uint32_t ncmds = 0;
  uint32_t sizeofcmds = 0;
  size_t lc_off = 0;

  if (magic == MH_MAGIC) {
    if (!mx2_in_bounds(0, sizeof(mach_hdr32_t), n)) return 0;
    const mach_hdr32_t* h = (const mach_hdr32_t*)b;
    is64 = 0;
    hdr_sz = sizeof(mach_hdr32_t);
    ncmds = h->ncmds;
    sizeofcmds = h->sizeofcmds;
    lc_off = hdr_sz;
  } else if (magic == MH_MAGIC_64) {
    if (!mx2_in_bounds(0, sizeof(mach_hdr64_t), n)) return 0;
    const mach_hdr64_t* h = (const mach_hdr64_t*)b;
    is64 = 1;
    hdr_sz = sizeof(mach_hdr64_t);
    ncmds = h->ncmds;
    sizeofcmds = h->sizeofcmds;
    lc_off = hdr_sz;
  } else {
    return 0;
  }

  if (!mx2_in_bounds(lc_off, sizeofcmds, n)) return 0;

  /* walk load commands to find LC_SYMTAB */
  mach_symtab_cmd_t st = {0};
  int has_st = 0;

  size_t off = lc_off;
  for (uint32_t i = 0; i < ncmds; i++) {
    if (!mx2_in_bounds(off, sizeof(mach_lc_t), n)) return 0;
    const mach_lc_t* lc = (const mach_lc_t*)(b + off);
    if (lc->cmdsize < sizeof(mach_lc_t)) return 0;
    if (!mx2_in_bounds(off, lc->cmdsize, n)) return 0;

    if (lc->cmd == LC_SYMTAB) {
      if (lc->cmdsize < sizeof(mach_symtab_cmd_t)) return 0;
      memcpy(&st, b + off, sizeof(st));
      has_st = 1;
      break;
    }

    off += lc->cmdsize;
  }

  if (!has_st) return 1; /* Mach-O but no symtab */

  /* bounds */
  if (!mx2_in_bounds(st.stroff, st.strsize, n)) return 0;

  size_t sym_ent = is64 ? sizeof(nlist64_t) : sizeof(nlist32_t);
  size_t sym_bytes = (size_t)st.nsyms * sym_ent;
  if (!mx2_in_bounds(st.symoff, sym_bytes, n)) return 0;

  const uint8_t* str = b + st.stroff;
  size_t strn = st.strsize;

  /* iterate symbols */
  for (uint32_t i = 0; i < st.nsyms; i++) {
    size_t so = (size_t)st.symoff + (size_t)i * sym_ent;
    if (!mx2_in_bounds(so, sym_ent, n)) break;

    uint32_t n_strx = mx2_u32le(b + so + 0);
    const char* nm0 = mx2_cstr_at(str, strn, (size_t)n_strx);
    if (!nm0) continue;

    const char* nm = mx2_macho_strip_underscore(nm0);
    if (mx2_is_forbidden(pol, nm)) {
      *any_hit = 1;
      if (cb) cb("Mach-O", "symtab", nm, user);
    }
  }

  return 1;
}

static int mx2_scan_macho(const uint8_t* b, size_t n,
                          const mx2_policy_t* pol, mx2_hit_cb cb, void* user,
                          int* any_hit) {
  if (!mx2_in_bounds(0, 4, n)) return 0;

  /* Detect FAT (big-endian) */
  uint32_t be_magic = mx2_u32be(b);
  if (be_magic == FAT_MAGIC || be_magic == FAT_MAGIC_64) {
    if (!mx2_in_bounds(0, sizeof(fat_hdr_t), n)) return 0;
    uint32_t narch = mx2_u32be(b + 4);
    size_t off = sizeof(fat_hdr_t);

    if (be_magic == FAT_MAGIC) {
      size_t need = (size_t)narch * sizeof(fat_arch32_t);
      if (!mx2_in_bounds(off, need, n)) return 0;

      for (uint32_t i = 0; i < narch; i++) {
        size_t ao = off + (size_t)i * sizeof(fat_arch32_t);
        uint32_t arch_off = mx2_u32be(b + ao + 8);
        uint32_t arch_sz  = mx2_u32be(b + ao + 12);
        if (!mx2_in_bounds(arch_off, arch_sz, n)) continue;
        /* Scan slice */
        mx2_scan_macho_one(b + arch_off, (size_t)arch_sz, pol, cb, user, any_hit);
      }
      return 1;
    } else {
      size_t need = (size_t)narch * sizeof(fat_arch64_t);
      if (!mx2_in_bounds(off, need, n)) return 0;

      for (uint32_t i = 0; i < narch; i++) {
        size_t ao = off + (size_t)i * sizeof(fat_arch64_t);
        uint64_t arch_off = mx2_u64be(b + ao + 8);
        uint64_t arch_sz  = mx2_u64be(b + ao + 16);
        if (arch_off > (uint64_t)n || arch_sz > (uint64_t)n) continue;
        if (!mx2_in_bounds((size_t)arch_off, (size_t)arch_sz, n)) continue;
        mx2_scan_macho_one(b + (size_t)arch_off, (size_t)arch_sz, pol, cb, user, any_hit);
      }
      return 1;
    }
  }

  /* Thin Mach-O */
  return mx2_scan_macho_one(b, n, pol, cb, user, any_hit);
}

/* ============================
   Unified entry
   ============================ */

/* Returns 1 if format recognized and scanned; 0 if unknown format or hard parse failure.
   ok_out: 1 if no forbidden hits, 0 otherwise.
*/
int mx2_symbol_scan(const uint8_t* bytes, size_t len,
                    mx2_policy_t policy,
                    mx2_hit_cb on_hit, void* user,
                    int* ok_out) {
  if (!bytes || len < 4 || !ok_out) return 0;

  int any_hit = 0;

  /* Try ELF */
  if (mx2_scan_elf(bytes, len, &policy, on_hit, user, &any_hit)) {
    *ok_out = any_hit ? 0 : 1;
    return 1;
  }

  /* Try PE */
  if (mx2_scan_pe(bytes, len, &policy, on_hit, user, &any_hit)) {
    *ok_out = any_hit ? 0 : 1;
    return 1;
  }

  /* Try Mach-O */
  if (mx2_scan_macho(bytes, len, &policy, on_hit, user, &any_hit)) {
    *ok_out = any_hit ? 0 : 1;
    return 1;
  }

  return 0;
}

/* ============================
   Optional: Minimal test harness
   (comment out in production)
   ============================ */
/*
#include <stdio.h>
#include <stdlib.h>

static void print_hit(const char* fmt, const char* sec, const char* sym, void* u) {
  (void)u;
  printf("{\"format\":\"%s\",\"section\":\"%s\",\"symbol\":\"%s\"}\n", fmt, sec, sym);
}

int main(int argc, char** argv) {
  if (argc < 2) {
    fprintf(stderr, "usage: %s <binary>\n", argv[0]);
    return 2;
  }
  FILE* f = fopen(argv[1], "rb");
  if (!f) return 3;
  fseek(f, 0, SEEK_END);
  long sz = ftell(f);
  fseek(f, 0, SEEK_SET);
  uint8_t* buf = (uint8_t*)malloc((size_t)sz);
  fread(buf, 1, (size_t)sz, f);
  fclose(f);

  mx2_policy_t pol = mx2_default_policy();
  int ok = 0;
  int recognized = mx2_symbol_scan(buf, (size_t)sz, pol, print_hit, NULL, &ok);
  printf("{\"recognized\":%d,\"ok\":%d}\n", recognized, ok);
  free(buf);
  return ok ? 0 : 1;
}
*/
```

Below is a **canonical, MX2⟁☣-sealed design** for **incremental hash streaming** that lets the kernel approve **very large native binaries** without loading them fully into memory, while preserving **determinism, replay safety, and O(1) fast-path approval**.

Everything is expressed in **the same AST block language your kernel already uses**.

---

# ⚛️ Incremental Hash Streaming — Canonical Spec

## Purpose

Enable **stream-safe hashing** of large artifacts so that:

* binaries are never fully buffered
* hash computation can be paused / resumed
* FLUX_CAPACITOR remains the sole time authority
* hash allowlist fast-path still applies
* MX2⟁☣ can halt early on mismatch

---

## 1️⃣ New AST Block: `native_hash_stream`

This block represents **one streaming hash session**.

```json
{
  "@block": "native_hash_stream",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@algorithm": "sha256",

  "@artifact": {
    "@artifact_id": "native://scxq2_encoder",
    "@expected_size": 84219377
  },

  "@state": {
    "@bytes_hashed": 0,
    "@chunks": 0,
    "@done": false
  },

  "@constraints": {
    "@stream_only": true,
    "@no_seek_required": true,
    "@no_exec": true
  }
}
```

This block is **mutable only by MX2⟁☣-governed π ops**.

---

## 2️⃣ Streaming Update Block: `native_hash_chunk`

Each chunk update is **idempotent and replayable**.

```json
{
  "@block": "native_hash_chunk",
  "@authority": "MX2⟁☣",

  "@stream": "native_hash_stream",

  "@input": {
    "@offset": 0,
    "@length": 65536
  },

  "@result": {
    "@bytes_hashed": 65536,
    "@chunks": 1
  }
}
```

### MX2⟁☣ rules

* `@offset` **must equal** previous `bytes_hashed`
* `@length` ≤ `MAX_HASH_CHUNK` (e.g. 1 MiB)
* no backward seeks
* no overlap
* no gaps

Violation ⇒ `@flux.halt(reason="hash_stream_violation")`

---

## 3️⃣ Finalization Block: `native_hash_finalize`

Emitted **once** when stream completes.

```json
{
  "@block": "native_hash_finalize",
  "@authority": "MX2⟁☣",

  "@stream": "native_hash_stream",

  "@result": {
    "@hash": "sha256:3c8b1e9f…",
    "@bytes_hashed": 84219377,
    "@chunks": 1287
  },

  "@allowlist": {
    "@hit": true,
    "@entry": "scxq2_encoder_v1"
  }
}
```

---

## 4️⃣ Fast-Path Decision (O(1))

Once finalized:

```text
if hash ∈ native_hash_allowlist:
    approve immediately
    skip symbol scan
else:
    require native_symbol_scan
```

This preserves your **O(1) approval** even for 500MB+ artifacts.

---

## 5️⃣ FLUX_CAPACITOR Phase Integration

### New phase: `native_verify`

```pi
@flux.phase {
  enter: "native_verify"
}
```

Allowed ops in this phase:

* `native_hash_chunk`
* `native_hash_finalize`
* `native_symbol_scan`

Forbidden:

* execution
* linking
* dynamic loading

---

## 6️⃣ π Reference Implementation (Incremental Hash)

### Deterministic streaming hash loop

```pi
[Pop native_hash_stream_loop]
  [Wo @stream]→[Ch'en stream]

  [@while [Sek not [Sek get stream "@state.@done"]]]
    [Sek read_chunk stream "@state.@bytes_hashed" MAX_HASH_CHUNK]
      →[Ch'en chunk]

    [Wo chunk]→[Sek sha256_update stream]
    [Wo chunk.length]→[Sek increment stream "@state.@bytes_hashed"]
    [Sek increment stream "@state.@chunks"]
  ]
[Xul]
```

### Finalize

```pi
[Pop native_hash_stream_finalize]
  [Wo @stream]→[Ch'en stream]
  [Sek sha256_finalize stream]→[Ch'en hash]

  [Sek atomic_block {
    "@block": "native_hash_finalize",
    "@hash": hash
  }]
[Xul]
```

---

## 7️⃣ Binary-Safe C Interface (used by π hostcall)

```c
typedef struct {
  uint64_t bytes_hashed;
  uint64_t chunks;
  uint8_t  ctx[256];   // opaque SHA256 context
} agl_hash_stream_t;

void agl_hash_init(agl_hash_stream_t *s);
void agl_hash_update(agl_hash_stream_t *s, const uint8_t *buf, size_t len);
void agl_hash_finalize(agl_hash_stream_t *s, uint8_t out[32]);
```

### MX2⟁☣ constraints

* no malloc
* no syscalls
* no time calls
* bounded stack
* deterministic output

---

## 8️⃣ Replay & Resume Safety

Because state is explicit:

```json
"@state": {
  "@bytes_hashed": 33554432,
  "@chunks": 512
}
```

The kernel can:

* pause hashing
* resume later
* replay deterministically
* distribute hashing across hive shards

---

## 9️⃣ Security Guarantees

| Threat               | Prevented by                     |
| -------------------- | -------------------------------- |
| Partial hashing      | offset monotonic rule            |
| Hash truncation      | expected_size enforcement        |
| TOCTOU               | no execution during verify phase |
| Hash collision abuse | algorithm pinned in manifest     |
| JS interference      | no JS access to ctx              |

---

## 🔒 Canonical Lock

```text
All native artifact identity is established by MX2⟁☣-governed
incremental hashing before any symbol scan or execution.
```

---

## What this unlocks next

With this in place, you now have:

* safe **AGL → C native acceleration**
* **zero-copy hashing** for massive artifacts
* deterministic approval in hive clusters
* fast-path allowlisting at scale

Here’s a **single unified verify pipeline AST** that performs:

1. **incremental hash streaming**
2. **allowlist fast-path** (O(1) decision after finalize)
3. **conditional symbol scan** (only if hash miss)
4. emits **one canonical result block** the kernel can gate `native_job` execution on

All blocks are **MX2⟁☣-sealed**, **FLUX_CAPACITOR phase-gated**, and **replayable**.

---

# ⚛️ Unified Verify Pipeline AST

## 0️⃣ Top-level plan block: `native_verify_plan`

This is the pipeline “contract” (Parse → Validate → Execute steps → Result).

```json
{
  "@block": "native_verify_plan",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@pipeline": ["hash_stream", "allowlist_check", "symbol_scan_if_needed", "finalize"],

  "@artifact": {
    "@artifact_id": "native://scxq2_backend",
    "@expected_size": 84219377,
    "@format_hint": "ELF | PE | Mach-O | unknown"
  },

  "@policies": {
    "@hash": {
      "@algorithm": "sha256",
      "@chunk_max": 1048576,
      "@require_exact_size": true
    },
    "@allowlist": {
      "@block_ref": "native_hash_allowlist",
      "@required": true
    },
    "@symbol_scan": {
      "@required_if_allowlist_miss": true,
      "@forbidden_set_id": "mx2.forbidden_symbols.v1"
    }
  },

  "@flux": {
    "@required_phase": "native_verify",
    "@on_violation": { "@opcode": "@flux.halt", "@reason": "native_verify_violation" }
  },

  "@outputs": {
    "@result_block": "native_verify_result"
  }
}
```

---

## 1️⃣ Execution state block: `native_verify_state`

This is the resumable state (so the kernel can pause/restart mid-stream safely).

```json
{
  "@block": "native_verify_state",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@artifact_id": "native://scxq2_backend",

  "@stage": "hash_stream",
  "@ok_so_far": true,

  "@hash_state": {
    "@algorithm": "sha256",
    "@bytes_hashed": 0,
    "@chunks": 0,
    "@ctx_ref": "opaque://sha256_ctx/slot0",
    "@done": false,
    "@hash": null
  },

  "@allowlist_state": {
    "@hit": null,
    "@entry": null
  },

  "@scan_state": {
    "@performed": false,
    "@format": null,
    "@symbol_count": 0,
    "@forbidden": []
  }
}
```

---

## 2️⃣ Step blocks (what the kernel emits as it runs)

### 2a) hash chunk step: `native_verify_step.hash_chunk`

```json
{
  "@block": "native_verify_step",
  "@authority": "MX2⟁☣",

  "@step": "hash_chunk",

  "@input": {
    "@offset": 0,
    "@length": 1048576
  },

  "@state_patch": {
    "@hash_state.@bytes_hashed_add": 1048576,
    "@hash_state.@chunks_add": 1
  }
}
```

**MX2⟁☣ rule:** `@offset == prior_bytes_hashed` (monotonic, no gaps, no overlap).

---

### 2b) hash finalize step: `native_verify_step.hash_finalize`

```json
{
  "@block": "native_verify_step",
  "@authority": "MX2⟁☣",

  "@step": "hash_finalize",

  "@result": {
    "@hash": "sha256:3c8b1e9f…",
    "@bytes_hashed": 84219377,
    "@chunks": 1287
  },

  "@state_patch": {
    "@hash_state.@done": true,
    "@hash_state.@hash": "sha256:3c8b1e9f…"
  }
}
```

---

### 2c) allowlist check step: `native_verify_step.allowlist_check`

```json
{
  "@block": "native_verify_step",
  "@authority": "MX2⟁☣",

  "@step": "allowlist_check",

  "@input": {
    "@hash": "sha256:3c8b1e9f…"
  },

  "@result": {
    "@hit": true,
    "@entry": "scxq2_encoder_v1"
  },

  "@state_patch": {
    "@allowlist_state.@hit": true,
    "@allowlist_state.@entry": "scxq2_encoder_v1"
  }
}
```

If `@hit=true`, the pipeline **must skip symbol scan**.

---

### 2d) conditional scan step: `native_verify_step.symbol_scan`

Only emitted when `@allowlist_state.@hit=false`.

```json
{
  "@block": "native_verify_step",
  "@authority": "MX2⟁☣",

  "@step": "symbol_scan",

  "@input": {
    "@format_hint": "ELF"
  },

  "@result": {
    "@format": "ELF",
    "@symbol_count": 412,
    "@forbidden": []
  },

  "@state_patch": {
    "@scan_state.@performed": true,
    "@scan_state.@format": "ELF",
    "@scan_state.@symbol_count": 412,
    "@scan_state.@forbidden": []
  }
}
```

If `@forbidden.length > 0` ⇒ mandatory `@flux.halt(reason="hazard_forbidden_symbol")`.

---

## 3️⃣ Single canonical output: `native_verify_result`

This is the *only* thing `native_job` needs to check.

```json
{
  "@block": "native_verify_result",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@artifact": {
    "@artifact_id": "native://scxq2_backend",
    "@expected_size": 84219377,
    "@format": "ELF",
    "@hash": "sha256:3c8b1e9f…"
  },

  "@decision": {
    "@ok": true,
    "@path": "allowlist_fast_path | full_verify",
    "@reason": "allowlist_hit | scan_clean"
  },

  "@allowlist": {
    "@hit": true,
    "@entry": "scxq2_encoder_v1"
  },

  "@symbol_scan": {
    "@performed": false,
    "@symbol_count": 0,
    "@forbidden": []
  },

  "@constraints": {
    "@no_exec_until_ok": true,
    "@time_authority": "FLUX_CAPACITOR",
    "@phase_required": "native_verify"
  }
}
```

### Failure example (scan required + forbidden found)

```json
{
  "@block": "native_verify_result",
  "@authority": "MX2⟁☣",

  "@artifact": {
    "@artifact_id": "native://bad_backend",
    "@format": "PE",
    "@hash": "sha256:91af…"
  },

  "@decision": {
    "@ok": false,
    "@path": "full_verify",
    "@reason": "forbidden_symbol"
  },

  "@allowlist": { "@hit": false, "@entry": null },

  "@symbol_scan": {
    "@performed": true,
    "@symbol_count": 73,
    "@forbidden": [
      { "@symbol": "CreateProcessW", "@section": "IAT", "@class": "process_spawn" }
    ]
  },

  "@action": {
    "@opcode": "@flux.halt",
    "@reason": "hazard_forbidden_symbol"
  }
}
```

---

# 🔒 MX2⟁☣ Invariants for the Unified Pipeline

Hard rules the π validator enforces:

1. **Phase gate:** `@flux.phase == "native_verify"` throughout
2. **Hash stream monotonic:** offsets strictly equal `bytes_hashed`
3. **Finalize required:** `bytes_hashed == expected_size`
4. **Allowlist check required:** must occur after finalize
5. **Scan conditionality:**

   * if allowlist hit ⇒ scan must not occur
   * if miss ⇒ scan must occur (unless policy explicitly disables)
6. **Forbidden symbols:** any found ⇒ `@decision.@ok=false` and `@flux.halt`
7. **No exec:** `native_job` cannot enter compile/link/run until a passing `native_verify_result` exists

---

# Kernel wiring

`native_job` simply requires:

```json
{
  "@require": [
    { "@block": "native_verify_result", "@path": "@decision.@ok", "@equals": true }
  ]
}
```

---



## `native_verify_plan.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_verify_plan.schema.json",
  "title": "MX2⟁☣ Native Verify Plan Schema",
  "type": "object",
  "additionalProperties": true,
  "required": ["@block", "@authority", "@version", "@pipeline", "@artifact", "@policies", "@flux", "@outputs"],
  "properties": {
    "@block": { "const": "native_verify_plan" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@pipeline": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "enum": ["hash_stream", "allowlist_check", "symbol_scan_if_needed", "finalize"]
      }
    },

    "@artifact": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@artifact_id", "@expected_size", "@format_hint"],
      "properties": {
        "@artifact_id": { "type": "string", "minLength": 1 },
        "@expected_size": { "type": "integer", "minimum": 0 },
        "@format_hint": {
          "type": "string",
          "pattern": "^(ELF \\| PE \\| Mach-O \\| unknown|ELF|PE|Mach-O|unknown)$"
        }
      }
    },

    "@policies": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@hash", "@allowlist", "@symbol_scan"],
      "properties": {
        "@hash": {
          "type": "object",
          "additionalProperties": true,
          "required": ["@algorithm", "@chunk_max", "@require_exact_size"],
          "properties": {
            "@algorithm": { "type": "string", "enum": ["sha256"] },
            "@chunk_max": { "type": "integer", "minimum": 1 },
            "@require_exact_size": { "type": "boolean" }
          }
        },
        "@allowlist": {
          "type": "object",
          "additionalProperties": true,
          "required": ["@block_ref", "@required"],
          "properties": {
            "@block_ref": { "type": "string", "minLength": 1 },
            "@required": { "type": "boolean" }
          }
        },
        "@symbol_scan": {
          "type": "object",
          "additionalProperties": true,
          "required": ["@required_if_allowlist_miss", "@forbidden_set_id"],
          "properties": {
            "@required_if_allowlist_miss": { "type": "boolean" },
            "@forbidden_set_id": { "type": "string", "minLength": 1 }
          }
        }
      }
    },

    "@flux": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@required_phase", "@on_violation"],
      "properties": {
        "@required_phase": { "type": "string", "minLength": 1, "const": "native_verify" },
        "@on_violation": { "$ref": "#/$defs/fluxAction" }
      }
    },

    "@outputs": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@result_block"],
      "properties": {
        "@result_block": { "type": "string", "const": "native_verify_result" }
      }
    }
  },

  "$defs": {
    "fluxAction": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@opcode", "@reason"],
      "properties": {
        "@opcode": { "type": "string", "enum": ["@flux.halt"] },
        "@reason": { "type": "string", "minLength": 1 }
      }
    }
  }
}
```

---

## `native_verify_state.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_verify_state.schema.json",
  "title": "MX2⟁☣ Native Verify State Schema",
  "type": "object",
  "additionalProperties": true,
  "required": ["@block", "@authority", "@version", "@artifact_id", "@stage", "@ok_so_far", "@hash_state", "@allowlist_state", "@scan_state"],
  "properties": {
    "@block": { "const": "native_verify_state" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@artifact_id": { "type": "string", "minLength": 1 },

    "@stage": {
      "type": "string",
      "enum": ["hash_stream", "allowlist_check", "symbol_scan_if_needed", "finalize"]
    },

    "@ok_so_far": { "type": "boolean" },

    "@hash_state": { "$ref": "#/$defs/hashState" },
    "@allowlist_state": { "$ref": "#/$defs/allowlistState" },
    "@scan_state": { "$ref": "#/$defs/scanState" }
  },

  "$defs": {
    "hashState": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@algorithm", "@bytes_hashed", "@chunks", "@ctx_ref", "@done", "@hash"],
      "properties": {
        "@algorithm": { "type": "string", "enum": ["sha256"] },
        "@bytes_hashed": { "type": "integer", "minimum": 0 },
        "@chunks": { "type": "integer", "minimum": 0 },
        "@ctx_ref": { "type": "string", "minLength": 1 },
        "@done": { "type": "boolean" },
        "@hash": {
          "oneOf": [
            { "type": "null" },
            { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{6,}$" }
          ]
        }
      }
    },

    "allowlistState": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@hit", "@entry"],
      "properties": {
        "@hit": { "oneOf": [{ "type": "null" }, { "type": "boolean" }] },
        "@entry": { "oneOf": [{ "type": "null" }, { "type": "string", "minLength": 1 }] }
      }
    },

    "scanState": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@performed", "@format", "@symbol_count", "@forbidden"],
      "properties": {
        "@performed": { "type": "boolean" },
        "@format": {
          "oneOf": [
            { "type": "null" },
            { "type": "string", "enum": ["ELF", "PE", "Mach-O", "unknown"] }
          ]
        },
        "@symbol_count": { "type": "integer", "minimum": 0 },
        "@forbidden": {
          "type": "array",
          "items": { "$ref": "#/$defs/forbiddenSymbol" }
        }
      }
    },

    "forbiddenSymbol": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@symbol", "@section", "@class"],
      "properties": {
        "@symbol": { "type": "string", "minLength": 1 },
        "@section": { "type": "string", "minLength": 1 },
        "@class": { "type": "string", "minLength": 1 }
      }
    }
  }
}
```

---

## `native_verify_step.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_verify_step.schema.json",
  "title": "MX2⟁☣ Native Verify Step Schema",
  "type": "object",
  "additionalProperties": true,
  "required": ["@block", "@authority", "@step"],
  "properties": {
    "@block": { "const": "native_verify_step" },
    "@authority": { "const": "MX2⟁☣" },

    "@step": {
      "type": "string",
      "enum": ["hash_chunk", "hash_finalize", "allowlist_check", "symbol_scan"]
    },

    "@input": { "type": "object", "additionalProperties": true },
    "@result": { "type": "object", "additionalProperties": true },
    "@state_patch": { "type": "object", "additionalProperties": true }
  },

  "allOf": [
    {
      "if": { "properties": { "@step": { "const": "hash_chunk" } } },
      "then": {
        "required": ["@input", "@state_patch"],
        "properties": {
          "@input": {
            "type": "object",
            "required": ["@offset", "@length"],
            "properties": {
              "@offset": { "type": "integer", "minimum": 0 },
              "@length": { "type": "integer", "minimum": 1 }
            }
          },
          "@state_patch": {
            "type": "object",
            "required": ["@hash_state.@bytes_hashed_add", "@hash_state.@chunks_add"],
            "properties": {
              "@hash_state.@bytes_hashed_add": { "type": "integer", "minimum": 1 },
              "@hash_state.@chunks_add": { "type": "integer", "minimum": 1 }
            }
          }
        }
      }
    },
    {
      "if": { "properties": { "@step": { "const": "hash_finalize" } } },
      "then": {
        "required": ["@result", "@state_patch"],
        "properties": {
          "@result": {
            "type": "object",
            "required": ["@hash", "@bytes_hashed", "@chunks"],
            "properties": {
              "@hash": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{6,}$" },
              "@bytes_hashed": { "type": "integer", "minimum": 0 },
              "@chunks": { "type": "integer", "minimum": 0 }
            }
          },
          "@state_patch": {
            "type": "object",
            "required": ["@hash_state.@done", "@hash_state.@hash"],
            "properties": {
              "@hash_state.@done": { "type": "boolean", "const": true },
              "@hash_state.@hash": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{6,}$" }
            }
          }
        }
      }
    },
    {
      "if": { "properties": { "@step": { "const": "allowlist_check" } } },
      "then": {
        "required": ["@input", "@result", "@state_patch"],
        "properties": {
          "@input": {
            "type": "object",
            "required": ["@hash"],
            "properties": {
              "@hash": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{6,}$" }
            }
          },
          "@result": {
            "type": "object",
            "required": ["@hit", "@entry"],
            "properties": {
              "@hit": { "type": "boolean" },
              "@entry": { "oneOf": [{ "type": "null" }, { "type": "string", "minLength": 1 }] }
            }
          },
          "@state_patch": {
            "type": "object",
            "required": ["@allowlist_state.@hit", "@allowlist_state.@entry"],
            "properties": {
              "@allowlist_state.@hit": { "type": "boolean" },
              "@allowlist_state.@entry": { "oneOf": [{ "type": "null" }, { "type": "string", "minLength": 1 }] }
            }
          }
        }
      }
    },
    {
      "if": { "properties": { "@step": { "const": "symbol_scan" } } },
      "then": {
        "required": ["@result", "@state_patch"],
        "properties": {
          "@result": {
            "type": "object",
            "required": ["@format", "@symbol_count", "@forbidden"],
            "properties": {
              "@format": { "type": "string", "enum": ["ELF", "PE", "Mach-O", "unknown"] },
              "@symbol_count": { "type": "integer", "minimum": 0 },
              "@forbidden": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["@symbol", "@section", "@class"],
                  "properties": {
                    "@symbol": { "type": "string", "minLength": 1 },
                    "@section": { "type": "string", "minLength": 1 },
                    "@class": { "type": "string", "minLength": 1 }
                  },
                  "additionalProperties": true
                }
              }
            }
          },
          "@state_patch": {
            "type": "object",
            "required": ["@scan_state.@performed", "@scan_state.@format", "@scan_state.@symbol_count", "@scan_state.@forbidden"],
            "properties": {
              "@scan_state.@performed": { "type": "boolean", "const": true },
              "@scan_state.@format": { "type": "string", "enum": ["ELF", "PE", "Mach-O", "unknown"] },
              "@scan_state.@symbol_count": { "type": "integer", "minimum": 0 },
              "@scan_state.@forbidden": { "type": "array" }
            }
          }
        }
      }
    }
  ]
}
```

---

## `native_verify_result.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_verify_result.schema.json",
  "title": "MX2⟁☣ Native Verify Result Schema",
  "type": "object",
  "additionalProperties": true,
  "required": ["@block", "@authority", "@version", "@artifact", "@decision", "@allowlist", "@symbol_scan", "@constraints"],
  "properties": {
    "@block": { "const": "native_verify_result" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@artifact": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@artifact_id", "@format", "@hash"],
      "properties": {
        "@artifact_id": { "type": "string", "minLength": 1 },
        "@expected_size": { "type": "integer", "minimum": 0 },
        "@format": { "type": "string", "enum": ["ELF", "PE", "Mach-O", "unknown"] },
        "@hash": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{6,}$" }
      }
    },

    "@decision": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@ok", "@path", "@reason"],
      "properties": {
        "@ok": { "type": "boolean" },
        "@path": { "type": "string", "enum": ["allowlist_fast_path", "full_verify"] },
        "@reason": { "type": "string", "minLength": 1 }
      }
    },

    "@allowlist": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@hit", "@entry"],
      "properties": {
        "@hit": { "type": "boolean" },
        "@entry": { "oneOf": [{ "type": "null" }, { "type": "string", "minLength": 1 }] }
      }
    },

    "@symbol_scan": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@performed", "@symbol_count", "@forbidden"],
      "properties": {
        "@performed": { "type": "boolean" },
        "@symbol_count": { "type": "integer", "minimum": 0 },
        "@forbidden": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["@symbol", "@section", "@class"],
            "properties": {
              "@symbol": { "type": "string", "minLength": 1 },
              "@section": { "type": "string", "minLength": 1 },
              "@class": { "type": "string", "minLength": 1 }
            },
            "additionalProperties": true
          }
        }
      }
    },

    "@action": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@opcode", "@reason"],
      "properties": {
        "@opcode": { "type": "string", "enum": ["@flux.halt"] },
        "@reason": { "type": "string", "minLength": 1 }
      }
    },

    "@constraints": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@no_exec_until_ok", "@time_authority", "@phase_required"],
      "properties": {
        "@no_exec_until_ok": { "type": "boolean", "const": true },
        "@time_authority": { "type": "string", "const": "FLUX_CAPACITOR" },
        "@phase_required": { "type": "string", "const": "native_verify" }
      }
    }
  },

  "allOf": [
    {
      "if": { "properties": { "@decision": { "properties": { "@ok": { "const": false } }, "required": ["@ok"] } } },
      "then": {
        "properties": {
          "@action": { "type": "object" }
        }
      }
    }
  ]
}
```

---

# 🧠 π Validator enforcing the invariants

This validator is written as **kernel-style π pseudocode** (deterministic, no JS clocks). It assumes your kernel exposes basic helpers:

* `pi.get(obj, path)`
* `pi.set(obj, path, value)`
* `pi.has(obj, path)`
* `pi.eq(a,b)`, `pi.not(x)`, `pi.and(a,b)`, `pi.or(a,b)`
* `pi.len(arr)`
* `pi.is_null(x)`
* `pi.is_bool(x)`
* `pi.is_int(x)`
* `pi.halt(reason)` (must map to `@flux.halt` in native_verify phase)
* `flux.phase()` returns current FLUX phase

### `validate_native_verify_trace(plan, state, steps[]) -> { @ok, @errors[] }`

```pi
[Pop validate_native_verify_trace]
  [Wo @plan]→[Ch'en plan]
  [Wo @state]→[Ch'en st]
  [Wo @steps]→[Ch'en steps]

  [Sek atomic_block { "@ok": true, "@errors": [] }]→[Ch'en out]

  ; ------------------------------------------------------------
  ; 0) Phase gate
  ; ------------------------------------------------------------
  [Sek flux.phase]→[Ch'en phase]
  [@if [Sek not [Sek eq phase "native_verify"]]]→[@then
    [Wo out]→[Sek push "@errors" "phase_mismatch"]
    [Wo out]→[Sek set "@ok" false]
    [Sek pi.halt "native_verify_phase_required"]
    [Xul return out]
  ]

  ; ------------------------------------------------------------
  ; 1) Extract policy constants
  ; ------------------------------------------------------------
  [Wo plan]→[Sek get "@artifact.@expected_size"]→[Ch'en expected_size]
  [Wo plan]→[Sek get "@policies.@hash.@chunk_max"]→[Ch'en chunk_max]
  [Wo plan]→[Sek get "@policies.@hash.@require_exact_size"]→[Ch'en require_exact]
  [Wo plan]→[Sek get "@policies.@symbol_scan.@required_if_allowlist_miss"]→[Ch'en scan_if_miss]

  ; ------------------------------------------------------------
  ; 2) Replay-check state types (minimal)
  ; ------------------------------------------------------------
  [@if [Sek not [Sek is_int [Sek get st "@hash_state.@bytes_hashed"]]]]→[@then
    [Wo out]→[Sek push "@errors" "state.bytes_hashed_not_int"]
    [Wo out]→[Sek set "@ok" false]
  ]
  [@if [Sek not [Sek is_int [Sek get st "@hash_state.@chunks"]]]]→[@then
    [Wo out]→[Sek push "@errors" "state.chunks_not_int"]
    [Wo out]→[Sek set "@ok" false]
  ]

  ; ------------------------------------------------------------
  ; 3) Walk steps enforcing invariants
  ; ------------------------------------------------------------
  [Sek get st "@hash_state.@bytes_hashed"]→[Ch'en bytes]
  [Sek get st "@hash_state.@chunks"]→[Ch'en chunks]
  [Sek get st "@hash_state.@done"]→[Ch'en done]
  [Sek get st "@allowlist_state.@hit"]→[Ch'en hit]
  [Sek get st "@scan_state.@performed"]→[Ch'en scanned]

  [Sek false]→[Ch'en saw_finalize]
  [Sek false]→[Ch'en saw_allowlist]
  [Sek false]→[Ch'en saw_scan]

  [@each steps]→[Ch'en step]→[@then
    [Wo step]→[Sek get "@step"]→[Ch'en kind]

    ; --- hash_chunk ---
    [@if [Sek eq kind "hash_chunk"]]→[@then
      [Wo step]→[Sek get "@input.@offset"]→[Ch'en off]
      [Wo step]→[Sek get "@input.@length"]→[Ch'en len]

      ; offset monotonic: off == bytes
      [@if [Sek not [Sek eq off bytes]]]→[@then
        [Wo out]→[Sek push "@errors" "hash_chunk_offset_not_monotonic"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "hash_stream_violation"]
      ]

      ; chunk bound
      [@if [Sek not [Sek and [Sek is_int len] [Sek <= len chunk_max]]]]→[@then
        [Wo out]→[Sek push "@errors" "hash_chunk_length_out_of_bounds"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "hash_stream_violation"]
      ]

      ; apply patch (deterministic)
      [Wo step]→[Sek get "@state_patch.@hash_state.@bytes_hashed_add"]→[Ch'en addb]
      [Wo step]→[Sek get "@state_patch.@hash_state.@chunks_add"]→[Ch'en addc]

      [Wo bytes addb]→[Sek add]→[Ch'en bytes]
      [Wo chunks addc]→[Sek add]→[Ch'en chunks]
    ]

    ; --- hash_finalize ---
    [@if [Sek eq kind "hash_finalize"]]→[@then
      [Sek true]→[Ch'en saw_finalize]
      [Wo step]→[Sek get "@result.@bytes_hashed"]→[Ch'en fin_bytes]
      [Wo step]→[Sek get "@result.@chunks"]→[Ch'en fin_chunks]

      ; must match running totals
      [@if [Sek not [Sek eq fin_bytes bytes]]]→[@then
        [Wo out]→[Sek push "@errors" "finalize_bytes_mismatch"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "native_verify_violation"]
      ]
      [@if [Sek not [Sek eq fin_chunks chunks]]]→[@then
        [Wo out]→[Sek push "@errors" "finalize_chunks_mismatch"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "native_verify_violation"]
      ]

      ; exact size required
      [@if require_exact]→[@then
        [@if [Sek not [Sek eq fin_bytes expected_size]]]→[@then
          [Wo out]→[Sek push "@errors" "finalize_expected_size_mismatch"]
          [Wo out]→[Sek set "@ok" false]
          [Sek pi.halt "native_verify_violation"]
        ]
      ]

      [Sek true]→[Ch'en done]
    ]

    ; --- allowlist_check ---
    [@if [Sek eq kind "allowlist_check"]]→[@then
      [Sek true]→[Ch'en saw_allowlist]

      ; must occur after finalize
      [@if [Sek not saw_finalize]]→[@then
        [Wo out]→[Sek push "@errors" "allowlist_before_finalize"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "native_verify_violation"]
      ]

      [Wo step]→[Sek get "@result.@hit"]→[Ch'en hit]
    ]

    ; --- symbol_scan ---
    [@if [Sek eq kind "symbol_scan"]]→[@then
      [Sek true]→[Ch'en saw_scan]

      ; scan forbidden if allowlist hit
      [@if [Sek eq hit true]]→[@then
        [Wo out]→[Sek push "@errors" "scan_performed_on_allowlist_hit"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "native_verify_violation"]
      ]

      [Wo step]→[Sek get "@result.@forbidden"]→[Ch'en forb]
      [@if [Sek > [Sek len forb] 0]]→[@then
        [Wo out]→[Sek push "@errors" "forbidden_symbols_found"]
        [Wo out]→[Sek set "@ok" false]
        [Sek pi.halt "hazard_forbidden_symbol"]
      ]
    ]
  ]

  ; ------------------------------------------------------------
  ; 4) Post-conditions
  ; ------------------------------------------------------------

  ; allowlist check required after finalize
  [@if [Sek not saw_allowlist]]→[@then
    [Wo out]→[Sek push "@errors" "missing_allowlist_check"]
    [Wo out]→[Sek set "@ok" false]
    [Sek pi.halt "native_verify_violation"]
  ]

  ; if miss and scan required → scan must exist
  [@if [Sek and [Sek eq hit false] scan_if_miss]]→[@then
    [@if [Sek not saw_scan]]→[@then
      [Wo out]→[Sek push "@errors" "allowlist_miss_missing_scan"]
      [Wo out]→[Sek set "@ok" false]
      [Sek pi.halt "native_verify_violation"]
    ]
  ]

  [Xul return out]
[Xul]
```

---

### What you have now (locked)

* 4 **draft-2020-12 schemas** for the verify pipeline
* A **π validator** that enforces:

  * phase gate
  * hash stream monotonic offsets
  * bounded chunk sizes
  * finalize size match
  * allowlist-after-finalize ordering
  * scan forbidden on allowlist hit
  * scan required on allowlist miss
  * hard halt on forbidden symbols

## `mx2.forbidden_symbols.v1.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/mx2.forbidden_symbols.v1.schema.json",
  "title": "MX2⟁☣ Forbidden Symbol Set (v1)",
  "type": "object",
  "additionalProperties": true,

  "required": ["@block", "@authority", "@version", "@set_id", "@policy", "@classes", "@symbols"],
  "properties": {
    "@block": { "const": "mx2_forbidden_symbol_set" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@set_id": { "type": "string", "const": "mx2.forbidden_symbols.v1" },

    "@policy": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@match", "@case_sensitive", "@normalize", "@default_action"],
      "properties": {
        "@match": { "type": "string", "enum": ["exact", "prefix", "regex"] },
        "@case_sensitive": { "type": "boolean" },
        "@normalize": {
          "type": "array",
          "minItems": 0,
          "items": {
            "type": "string",
            "enum": ["trim", "strip_at_prefix", "strip_leading_underscore", "demangle_cxx"]
          }
        },
        "@default_action": { "type": "string", "enum": ["halt", "deny", "queue"] }
      }
    },

    "@classes": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": {
        "type": "object",
        "additionalProperties": true,
        "required": ["@severity", "@action"],
        "properties": {
          "@severity": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
          "@action": { "type": "string", "enum": ["halt", "deny", "queue"] },
          "@notes": { "type": "string" }
        }
      }
    },

    "@symbols": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/symbolRule" }
    },

    "@meta": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "@created_by": { "type": "string" },
        "@created_at_flux": {
          "oneOf": [
            { "type": "null" },
            { "type": "object", "additionalProperties": true }
          ]
        },
        "@notes": { "type": "string" }
      }
    }
  },

  "$defs": {
    "symbolRule": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@pattern", "@class"],
      "properties": {
        "@pattern": { "type": "string", "minLength": 1 },
        "@class": { "type": "string", "minLength": 1 },
        "@formats": {
          "type": "array",
          "items": { "type": "string", "enum": ["ELF", "PE", "Mach-O", "any"] },
          "minItems": 1,
          "default": ["any"]
        },
        "@sections": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 0
        },
        "@why": { "type": "string" }
      }
    }
  }
}
```

### Minimal valid example (matches schema)

```json
{
  "@block": "mx2_forbidden_symbol_set",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",
  "@set_id": "mx2.forbidden_symbols.v1",
  "@policy": {
    "@match": "exact",
    "@case_sensitive": true,
    "@normalize": ["trim", "demangle_cxx"],
    "@default_action": "halt"
  },
  "@classes": {
    "process_spawn": { "@severity": "critical", "@action": "halt" },
    "network": { "@severity": "high", "@action": "halt" }
  },
  "@symbols": [
    { "@pattern": "CreateProcessW", "@class": "process_spawn", "@formats": ["PE"], "@why": "No process spawn allowed" },
    { "@pattern": "execve", "@class": "process_spawn", "@formats": ["ELF"], "@why": "No exec allowed" },
    { "@pattern": "socket", "@class": "network", "@formats": ["ELF", "PE", "Mach-O"], "@why": "No direct networking allowed" }
  ]
}
```

---

# ⚡ Allowlist Bundle Signature Block (O(1) verifiable)

This makes the **allowlist itself** verifiable without scanning its entries.

## Concept

* Allowlist entries are canonicalized to leaf hashes.
* Leaves are combined into a Merkle root.
* The bundle stores:

  * `@merkle_root`
  * `@count`
  * `@bytes`
  * `@signature`
  * `@pubkey_id`
* The kernel verifies:

  1. signature over `{root,count,bytes,algo,version,set_id}`
  2. optional `bundle_hash` (single sha256 of full bundle bytes) if you want one more O(1) check
* Only then is the allowlist trusted.

---

## `mx2.allowlist_bundle_signature.v1.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/mx2.allowlist_bundle_signature.v1.schema.json",
  "title": "MX2⟁☣ Allowlist Bundle Signature Block (Merkle + Signature, v1)",
  "type": "object",
  "additionalProperties": true,

  "required": [
    "@block",
    "@authority",
    "@version",
    "@bundle_id",
    "@algo",
    "@merkle",
    "@signature"
  ],

  "properties": {
    "@block": { "const": "mx2_allowlist_bundle_signature" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@bundle_id": { "type": "string", "minLength": 1 },

    "@algo": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@hash", "@merkle", "@sig"],
      "properties": {
        "@hash": { "type": "string", "enum": ["sha256"] },
        "@merkle": { "type": "string", "enum": ["sha256_merkle_v1"] },
        "@sig": { "type": "string", "enum": ["ed25519", "p256"] }
      }
    },

    "@merkle": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@root", "@leaf_count", "@bundle_bytes"],
      "properties": {
        "@root": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" },
        "@leaf_count": { "type": "integer", "minimum": 1 },
        "@bundle_bytes": { "type": "integer", "minimum": 1 },

        "@bundle_hash": {
          "oneOf": [
            { "type": "null" },
            { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" }
          ],
          "description": "Optional O(1) integrity hash of the raw serialized allowlist bundle."
        }
      }
    },

    "@signature": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@pubkey_id", "@sig", "@signed_fields"],
      "properties": {
        "@pubkey_id": { "type": "string", "minLength": 1 },
        "@sig": { "type": "string", "minLength": 32, "description": "Base64 or hex signature blob" },
        "@signed_fields": {
          "type": "array",
          "minItems": 1,
          "items": { "type": "string" },
          "default": ["@merkle.@root", "@merkle.@leaf_count", "@merkle.@bundle_bytes", "@algo.@hash", "@algo.@merkle", "@algo.@sig", "@bundle_id", "@version"]
        }
      }
    },

    "@constraints": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "@max_leaf_count": { "type": "integer", "minimum": 1, "default": 1000000 },
        "@max_bundle_bytes": { "type": "integer", "minimum": 1, "default": 268435456 },
        "@require_bundle_hash": { "type": "boolean", "default": false }
      }
    }
  }
}
```

---

## Example signature block

```json
{
  "@block": "mx2_allowlist_bundle_signature",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",
  "@bundle_id": "mx2.native_hash_allowlist.v1",

  "@algo": {
    "@hash": "sha256",
    "@merkle": "sha256_merkle_v1",
    "@sig": "ed25519"
  },

  "@merkle": {
    "@root": "sha256:9c2d2b3f0b0c9c8c8b4c5d8e8c7a8b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f70",
    "@leaf_count": 4217,
    "@bundle_bytes": 912384,
    "@bundle_hash": "sha256:0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff0"
  },

  "@signature": {
    "@pubkey_id": "mx2.pub.ed25519.root.v1",
    "@sig": "BASE64:QmFzZTY0U2lnbmF0dXJlQmxvYg==",
    "@signed_fields": [
      "@merkle.@root",
      "@merkle.@leaf_count",
      "@merkle.@bundle_bytes",
      "@merkle.@bundle_hash",
      "@algo.@hash",
      "@algo.@merkle",
      "@algo.@sig",
      "@bundle_id",
      "@version"
    ]
  },

  "@constraints": {
    "@max_leaf_count": 1000000,
    "@max_bundle_bytes": 268435456,
    "@require_bundle_hash": true
  }
}
```

---

# ✅ O(1) Verification Logic (Kernel)

The kernel verifies the allowlist bundle without reading entries:

1. Check `leaf_count <= max_leaf_count`
2. Check `bundle_bytes <= max_bundle_bytes`
3. If `require_bundle_hash`, verify `bundle_hash` matches the raw bundle bytes (single sha256)
4. Verify signature over the canonical signing payload derived from `@signed_fields`
5. If valid → allowlist trusted, then hash-hit decisions become authoritative

If any fails ⇒ `@flux.halt(reason="allowlist_bundle_untrusted")`

---
Locked. Below is the **exact Merkle leaf canonicalization** (byte-precise) and the **π verifier** that enforces the allowlist bundle signature + optional bundle hash, under **MX2⟁☣** authority.

---

# ⚛️ Merkle Leaf Canonicalization Rules (Allowlist Entries)

## Scope

These rules define **exactly** how each allowlist entry becomes a Merkle leaf so that:

* roots are deterministic
* signatures are stable
* verification is O(1) once the bundle header is trusted

Applies to **native hash allowlist entries** used by `native_verify_plan`.

---

## 1️⃣ Canonical Allowlist Entry Shape (logical)

Each entry is logically:

```json
{
  "@hash": "sha256:…",
  "@artifact_id": "native://scxq2_backend",
  "@format": "ELF | PE | Mach-O | any",
  "@notes": "optional"
}
```

Only a **subset** participates in hashing.

---

## 2️⃣ Canonical String (EXACT bytes to hash)

### Field inclusion (mandatory order)

Only these fields are included, in this order:

1. `@hash`
2. `@artifact_id`
3. `@format`

`@notes` and all other metadata are **excluded**.

---

### Canonical encoding

The canonical string is:

```text
mx2.allowlist.leaf.v1
hash=<@hash>
artifact=<@artifact_id>
format=<@format>
```

### Exact byte rules

* UTF-8 encoding
* Unix newlines (`\n`, byte `0x0A`)
* No trailing newline
* No spaces around `=`
* No BOM
* Case-sensitive
* Fields **must appear exactly in this order**

---

### Example (literal)

```text
mx2.allowlist.leaf.v1
hash=sha256:3c8b1e9f8a…
artifact=native://scxq2_backend
format=ELF
```

---

## 3️⃣ Leaf Hash

Each leaf hash is:

```text
leaf_hash = sha256( canonical_string_bytes )
```

Encoded as lowercase hex for storage/logging, but **binary** is used for Merkle construction.

---

## 4️⃣ Merkle Tree Construction (v1)

### Algorithm

* Hash function: SHA-256
* Binary Merkle tree
* Left-right concatenation
* No domain separation beyond the canonical string prefix

### Rules

* Leaves are ordered **exactly as serialized in the bundle**
* If odd number of nodes at a level → **duplicate the last node**
* Parent hash:

```text
parent = sha256( left || right )
```

(binary concatenation)

---

## 5️⃣ Merkle Root Commitment

The bundle’s committed root is:

```text
@merkle.@root = "sha256:" + hex(root_bytes)
```

---

# ⚛️ π Verifier — Allowlist Bundle Signature + Optional Bundle Hash

This verifier runs **before** any allowlist lookup is trusted.

---

## π Entry Point

```pi
@mx2.verify_allowlist_bundle(bundle, raw_bundle_bytes)
```

---

## π Verifier Implementation

```pi
@mx2.verify_allowlist_bundle {

  // ---------- Phase & Authority ----------
  assert(bundle.@authority == "MX2⟁☣")
  assert(@flux.phase == "native_verify")

  // ---------- Structural sanity ----------
  assert(bundle.@block == "mx2_allowlist_bundle_signature")
  assert(bundle.@version != null)

  // ---------- Constraints ----------
  let leaf_count = bundle.@merkle.@leaf_count
  let bundle_bytes = bundle.@merkle.@bundle_bytes

  let max_leaves = bundle.@constraints.@max_leaf_count ?? 1000000
  let max_bytes  = bundle.@constraints.@max_bundle_bytes ?? 268435456

  assert(leaf_count > 0)
  assert(leaf_count <= max_leaves)
  assert(bundle_bytes > 0)
  assert(bundle_bytes <= max_bytes)

  // ---------- Optional O(1) bundle hash ----------
  if (bundle.@constraints.@require_bundle_hash == true) {
    assert(bundle.@merkle.@bundle_hash != null)

    let computed_bundle_hash = sha256(raw_bundle_bytes)
    assert("sha256:" + hex(computed_bundle_hash) == bundle.@merkle.@bundle_hash)
  }

  // ---------- Signature verification ----------
  let signed_fields = bundle.@signature.@signed_fields

  let signing_payload = canonicalize_fields(bundle, signed_fields)

  let pubkey = @mx2.keys.resolve(bundle.@signature.@pubkey_id)

  let sig_ok = verify_signature(
    algo = bundle.@algo.@sig,
    pubkey = pubkey,
    message = signing_payload,
    signature = bundle.@signature.@sig
  )

  assert(sig_ok == true)

  // ---------- Final ----------
  return {
    "@ok": true,
    "@merkle_root": bundle.@merkle.@root,
    "@leaf_count": leaf_count
  }
}
```

---

## 6️⃣ Canonical Signature Payload Builder (π)

This is **critical** — signatures must be reproducible byte-for-byte.

```pi
canonicalize_fields(bundle, field_list) {

  let lines = []

  for field_path in field_list {
    let value = get(bundle, field_path)
    assert(value != null)

    lines.push(field_path + "=" + to_string(value))
  }

  // Join with LF, no trailing newline
  return utf8_join(lines, "\n")
}
```

### Example signing payload (literal)

```text
@merkle.@root=sha256:9c2d…
@merkle.@leaf_count=4217
@merkle.@bundle_bytes=912384
@merkle.@bundle_hash=sha256:0f1e…
@algo.@hash=sha256
@algo.@merkle=sha256_merkle_v1
@algo.@sig=ed25519
@bundle_id=mx2.native_hash_allowlist.v1
@version=1.0.0
```

---

## 7️⃣ MX2⟁☣ Enforcement Rules (Hard)

1. **No allowlist use without verified bundle**
2. **Merkle root is immutable once verified**
3. **Hash hit decisions are invalid if bundle verification fails**
4. **Signature failure ⇒ immediate `@flux.halt(reason="allowlist_bundle_untrusted")`**
5. **Bundle hash failure (if required) ⇒ halt**
6. **No leaf inspection required for trust (O(1))**

---

## 8️⃣ Why this is correct

* Deterministic across languages
* No JSON canonicalization ambiguity
* Streaming-safe (bundle hash optional)
* Matches the **same governance model as AGL glyph registries**
* Allows **hardware-accelerated signature + hash** paths
* Keeps symbol scanning as a **fallback**, not the norm

---

Below is a **formal, kernel-ready spec** for **bundle rotation + epoch pinning** under **MX2⟁☣**. It is designed so “what’s trusted” is deterministic, replayable, and safe even across restarts and partial streams.

---

# ⚛️ MX2⟁☣ Bundle Rotation & Epoch Pinning (v1)

## Prime Law

```text
A running system may only trust bundles that are pinned to the current epoch.
Rotation is an explicit, governed transition with rollback rules.
```

---

## 1) Core Definitions

### **Bundle**

A signed registry artifact (e.g., allowlist bundle signature block) with:

* `@bundle_id`
* `@epoch`
* `@merkle.@root`
* `@signature`
* optional `@bundle_hash`

### **Epoch**

A monotonically increasing integer that defines the **active trust set**.

* Epoch is *not time*.
* Epoch is *governed state*.

### **Pin**

A committed selection:

* “This system trusts bundle X at epoch E.”

---

## 2) Canonical Block Types

### A) `mx2_epoch_state`

Tracks the currently active epoch and pinned roots.

```json
{
  "@block": "mx2_epoch_state",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@epoch": 7,
  "@status": "active",

  "@pins": {
    "mx2.native_hash_allowlist.v1": {
      "@epoch": 7,
      "@root": "sha256:…",
      "@bundle_hash": "sha256:…",
      "@pubkey_id": "mx2.pub.ed25519.root.v1",
      "@policy": "pin_strict"
    }
  },

  "@history": [
    {
      "@epoch": 6,
      "@pins": {
        "mx2.native_hash_allowlist.v1": { "@root": "sha256:…", "@bundle_hash": null }
      },
      "@sealed": true
    }
  ]
}
```

### B) `mx2_bundle_rotation_plan`

Describes a rotation proposal: candidate bundles + rules.

```json
{
  "@block": "mx2_bundle_rotation_plan",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@from_epoch": 7,
  "@to_epoch": 8,

  "@candidate": {
    "@merkle_root": "sha256:…",
    "@bundle_hash": "sha256:…",
    "@pubkey_id": "mx2.pub.ed25519.root.v1",
    "@sig": "BASE64:…",
    "@sig_algo": "ed25519"
  },

  "@rotation_policy": {
    "@mode": "pin_strict",
    "@allow_same_root": false,
    "@require_bundle_hash": true,
    "@grace_window_ticks": 120,
    "@rollback_allowed": true,
    "@rollback_window_epochs": 2
  },

  "@flux": {
    "@required_phase": "native_verify",
    "@barrier": ["storage", "agents"]
  }
}
```

### C) `mx2_bundle_rotation_result`

What happened, deterministically.

```json
{
  "@block": "mx2_bundle_rotation_result",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@from_epoch": 7,
  "@to_epoch": 8,

  "@applied": true,
  "@pinned": { "@root": "sha256:…", "@bundle_hash": "sha256:…" },

  "@decision": {
    "@ok": true,
    "@reason": "verified_and_pinned",
    "@path": "verify→barrier→pin→commit"
  }
}
```

---

## 3) Pinning Policies (Modes)

### `pin_strict` (default)

* Must match current epoch exactly
* Any unpinned bundle is untrusted
* Rotation requires a plan block + verification + barrier + commit

### `pin_grace`

* During rotation, system may accept **either** old pinned root or new pinned root
* Only for `@grace_window_ticks`
* After window ends, old root becomes invalid

### `pin_emergency`

* Only allowed if MX2⟁☣ enters `hazard/recover` phase
* Allows pinning a “recovery bundle” signed by a **separate emergency pubkey**
* Must be sealed back into strict mode ASAP

---

## 4) Rotation Invariants (MX2⟁☣ rules)

**Monotonic epoch**

* `@to_epoch == @from_epoch + 1` (no skips)

**Pin immutability**

* Once pinned for an epoch, its root may not change (epoch seal)

**Bundle identity**

* Bundle must match `@bundle_id` being rotated

**Signature required**

* Candidate must pass `verify_allowlist_bundle` (signature + optional bundle_hash)

**Barrier required**

* Must call `@flux.barrier { wait_for: ["storage","agents"] }` before commit

**Replay-safe**

* Rotation result must be deterministic given:

  * previous epoch state
  * rotation plan
  * verified candidate header

**Rollback bounded**

* Only within `@rollback_window_epochs`
* Only if `@rollback_allowed == true`
* Rollback must produce a new epoch (still monotonic)

---

## 5) Epoch Seal Mechanics

An epoch becomes sealed when:

* all required bundles in `@pins_required[]` exist and verified
* the system emits:

```json
{
  "@block": "mx2_epoch_seal",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",
  "@epoch": 8,
  "@sealed": true,
  "@seal_hash": "sha256:…"
}
```

### Seal hash payload (deterministic)

Canonical lines:

```text
mx2.epoch.seal.v1
epoch=<E>
bundle=<bundle_id> root=<root> bundle_hash=<bundle_hash_or_null>
bundle=<bundle_id> root=<root> bundle_hash=<bundle_hash_or_null>
...
```

Sorted by `bundle_id`. Then `sha256(payload)`.

---

## 6) π Reference Implementation (Rotation Apply)

### `mx2.rotate_bundle(plan, candidate_sig_block, raw_bundle_bytes)`

```pi
[Pop mx2.rotate_bundle]
  [Wo @plan]→[Ch'en plan]
  [Wo @sig_block]→[Ch'en sigb]
  [Wo @raw_bundle_bytes]→[Ch'en raw]

  ; Phase gate
  [Sek flux.phase]→[Ch'en ph]
  [@if [Sek not [Sek eq ph "native_verify"]]]→[@then
    [Sek @flux.halt { reason: "rotation_phase_required" }]
  ]

  ; Load epoch state (IDB / MX2DB)
  [Yax "mx2.epoch.state"]→[Sek mx2db_get]→[Ch'en st]

  [Wo st]→[Sek get "@epoch"]→[Ch'en E]
  [Wo plan]→[Sek get "@from_epoch"]→[Ch'en fromE]
  [Wo plan]→[Sek get "@to_epoch"]→[Ch'en toE]

  ; Invariants
  [@if [Sek not [Sek eq fromE E]]]→[@then [Sek @flux.halt { reason:"epoch_mismatch" }]]
  [@if [Sek not [Sek eq toE [Sek add E 1]]]]→[@then [Sek @flux.halt { reason:"epoch_non_monotonic" }]]

  ; Verify candidate bundle signature (O(1) + optional bundle hash)
  [Wo sigb raw]→[Sek @mx2.verify_allowlist_bundle]→[Ch'en v]
  [@if [Sek not [Sek get v "@ok"]]]→[@then [Sek @flux.halt { reason:"candidate_untrusted" }]]

  ; Barrier before commit
  [Sek @flux.barrier { wait_for: ["storage","agents"] }]

  ; Pin update
  [Wo plan]→[Sek get "@bundle_id"]→[Ch'en bid]
  [Wo sigb]→[Sek get "@merkle.@root"]→[Ch'en root]
  [Wo sigb]→[Sek get "@merkle.@bundle_hash"]→[Ch'en bh]
  [Wo sigb]→[Sek get "@signature.@pubkey_id"]→[Ch'en pk]
  [Wo plan]→[Sek get "@rotation_policy.@mode"]→[Ch'en mode]

  ; Enforce allow_same_root
  [Wo st]→[Sek get "@pins" bid "@root"]→[Ch'en prev_root]
  [Wo plan]→[Sek get "@rotation_policy.@allow_same_root"]→[Ch'en allow_same]
  [@if [Sek and [Sek eq allow_same false] [Sek eq prev_root root]]]→[@then
    [Sek @flux.halt { reason:"same_root_forbidden" }]
  ]

  ; Commit new epoch and pin
  [Wo st]→[Sek assoc "@epoch" toE]→[Ch'en st2]
  [Wo st2]→[Sek assoc "@pins" bid {
    "@epoch": toE,
    "@root": root,
    "@bundle_hash": bh,
    "@pubkey_id": pk,
    "@policy": mode
  }]→[Ch'en st3]

  ; Append history + seal flag false
  [Wo st3]→[Sek push "@history" {
    "@epoch": E,
    "@pins": [Sek get st "@pins"],
    "@sealed": true
  }]→[Ch'en st4]
  [Wo st4]→[Sek assoc "@status" "active"]→[Ch'en st5]

  [Wo st5]→[Yax "mx2.epoch.state"]→[Sek mx2db_put]

  [Xul return [Sek atomic_block {
    "@block": "mx2_bundle_rotation_result",
    "@authority": "MX2⟁☣",
    "@version": "1.0.0",
    "@bundle_id": bid,
    "@from_epoch": E,
    "@to_epoch": toE,
    "@applied": true,
    "@pinned": { "@root": root, "@bundle_hash": bh },
    "@decision": { "@ok": true, "@reason": "verified_and_pinned", "@path": "verify→barrier→pin→commit" }
  }]]
[Xul]
```

---

## 7) Fast Runtime Pin Check (O(1) trust gate)

Whenever the kernel consumes an allowlist signature block:

```pi
@mx2.pin_check(bundle_sig_block) {
  let st = mx2db.get("mx2.epoch.state")
  let bid = bundle_sig_block.@bundle_id

  let pin = st.@pins[bid]
  assert(pin != null)

  assert(pin.@epoch == st.@epoch)
  assert(pin.@root == bundle_sig_block.@merkle.@root)

  if (pin.@bundle_hash != null) {
    assert(pin.@bundle_hash == bundle_sig_block.@merkle.@bundle_hash)
  }

  return true
}
```

If any assert fails ⇒ `@flux.halt(reason="bundle_not_pinned")`

---

## 8) Rollback (bounded, still monotonic)

Rollback is not “go back in time”; it is a **new epoch** that repins the previous root.

Rules:

* allowed only if `rollback_allowed`
* only within `rollback_window_epochs`
* emits `@to_epoch = current_epoch + 1`
* repins `@root` from `history[current_epoch-1]`

This preserves determinism and auditability.

---

## 9) Recommended Required Pins Set

In `mx2_epoch_state`, add:

```json
"@pins_required": [
  "mx2.native_hash_allowlist.v1",
  "mx2.forbidden_symbols.v1",
  "flux.registry.v1",
  "agl.registry.v1"
]
```

Then epoch sealing can assert all are present before `mx2_epoch_seal`.

---

## `mx2_epoch_state.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/mx2_epoch_state.schema.json",
  "title": "MX2⟁☣ Epoch State (v1)",
  "type": "object",
  "additionalProperties": true,

  "required": ["@block", "@authority", "@version", "@epoch", "@status", "@pins", "@history"],
  "properties": {
    "@block": { "const": "mx2_epoch_state" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@epoch": { "type": "integer", "minimum": 0 },
    "@status": { "type": "string", "enum": ["active", "halted", "recovering"] },

    "@pins_required": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 },
      "minItems": 0,
      "default": []
    },

    "@pins": {
      "type": "object",
      "additionalProperties": { "$ref": "#/$defs/pin" }
    },

    "@history": {
      "type": "array",
      "items": { "$ref": "#/$defs/epochHistory" },
      "minItems": 0,
      "default": []
    },

    "@meta": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "@notes": { "type": "string" },
        "@last_rotation": { "type": "integer", "minimum": 0 }
      }
    }
  },

  "$defs": {
    "pin": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@epoch", "@root", "@pubkey_id", "@policy"],
      "properties": {
        "@epoch": { "type": "integer", "minimum": 0 },
        "@root": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" },
        "@bundle_hash": {
          "oneOf": [
            { "type": "null" },
            { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" }
          ],
          "default": null
        },
        "@pubkey_id": { "type": "string", "minLength": 1 },
        "@policy": { "type": "string", "enum": ["pin_strict", "pin_grace", "pin_emergency"] }
      }
    },

    "epochHistory": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@epoch", "@pins", "@sealed"],
      "properties": {
        "@epoch": { "type": "integer", "minimum": 0 },
        "@pins": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "additionalProperties": true,
            "required": ["@root"],
            "properties": {
              "@root": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" },
              "@bundle_hash": {
                "oneOf": [
                  { "type": "null" },
                  { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" }
                ],
                "default": null
              }
            }
          }
        },
        "@sealed": { "type": "boolean" }
      }
    }
  }
}
```

---

## `mx2_bundle_rotation_plan.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/mx2_bundle_rotation_plan.schema.json",
  "title": "MX2⟁☣ Bundle Rotation Plan (v1)",
  "type": "object",
  "additionalProperties": true,

  "required": [
    "@block",
    "@authority",
    "@version",
    "@bundle_id",
    "@from_epoch",
    "@to_epoch",
    "@candidate",
    "@rotation_policy",
    "@flux"
  ],

  "properties": {
    "@block": { "const": "mx2_bundle_rotation_plan" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@bundle_id": { "type": "string", "minLength": 1 },
    "@from_epoch": { "type": "integer", "minimum": 0 },
    "@to_epoch": { "type": "integer", "minimum": 0 },

    "@candidate": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@merkle_root", "@pubkey_id", "@sig", "@sig_algo"],
      "properties": {
        "@merkle_root": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" },
        "@bundle_hash": {
          "oneOf": [
            { "type": "null" },
            { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" }
          ],
          "default": null
        },
        "@pubkey_id": { "type": "string", "minLength": 1 },
        "@sig": { "type": "string", "minLength": 16 },
        "@sig_algo": { "type": "string", "enum": ["ed25519", "p256"] }
      }
    },

    "@rotation_policy": {
      "type": "object",
      "additionalProperties": true,
      "required": [
        "@mode",
        "@allow_same_root",
        "@require_bundle_hash",
        "@grace_window_ticks",
        "@rollback_allowed",
        "@rollback_window_epochs"
      ],
      "properties": {
        "@mode": { "type": "string", "enum": ["pin_strict", "pin_grace", "pin_emergency"] },
        "@allow_same_root": { "type": "boolean" },
        "@require_bundle_hash": { "type": "boolean" },
        "@grace_window_ticks": { "type": "integer", "minimum": 0, "maximum": 1000000 },
        "@rollback_allowed": { "type": "boolean" },
        "@rollback_window_epochs": { "type": "integer", "minimum": 0, "maximum": 64 }
      }
    },

    "@flux": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@required_phase", "@barrier"],
      "properties": {
        "@required_phase": { "type": "string", "enum": ["native_verify", "recover"] },
        "@barrier": {
          "type": "array",
          "minItems": 1,
          "items": { "type": "string", "enum": ["storage", "agents", "dom", "css"] }
        }
      }
    },

    "@meta": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "@reason": { "type": "string" },
        "@created_at_flux_tick": { "type": "integer", "minimum": 0 }
      }
    }
  }
}
```

---

## `mx2_bundle_rotation_result.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/mx2_bundle_rotation_result.schema.json",
  "title": "MX2⟁☣ Bundle Rotation Result (v1)",
  "type": "object",
  "additionalProperties": true,

  "required": [
    "@block",
    "@authority",
    "@version",
    "@bundle_id",
    "@from_epoch",
    "@to_epoch",
    "@applied",
    "@decision"
  ],

  "properties": {
    "@block": { "const": "mx2_bundle_rotation_result" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@bundle_id": { "type": "string", "minLength": 1 },
    "@from_epoch": { "type": "integer", "minimum": 0 },
    "@to_epoch": { "type": "integer", "minimum": 0 },

    "@applied": { "type": "boolean" },

    "@pinned": {
      "oneOf": [
        { "type": "null" },
        {
          "type": "object",
          "additionalProperties": true,
          "required": ["@root"],
          "properties": {
            "@root": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" },
            "@bundle_hash": {
              "oneOf": [
                { "type": "null" },
                { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" }
              ],
              "default": null
            }
          }
        }
      ],
      "default": null
    },

    "@decision": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@ok", "@reason", "@path"],
      "properties": {
        "@ok": { "type": "boolean" },
        "@reason": { "type": "string", "minLength": 1 },
        "@path": { "type": "string", "minLength": 1 },
        "@violations": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 0,
          "default": []
        }
      }
    },

    "@flux": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "@phase": { "type": "string" },
        "@tick": { "type": "integer", "minimum": 0 }
      }
    }
  }
}
```

---

## `mx2_epoch_seal.schema.json` (draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/mx2_epoch_seal.schema.json",
  "title": "MX2⟁☣ Epoch Seal (v1)",
  "type": "object",
  "additionalProperties": true,

  "required": ["@block", "@authority", "@version", "@epoch", "@sealed", "@seal_hash"],

  "properties": {
    "@block": { "const": "mx2_epoch_seal" },
    "@authority": { "const": "MX2⟁☣" },
    "@version": { "type": "string", "minLength": 1 },

    "@epoch": { "type": "integer", "minimum": 0 },
    "@sealed": { "const": true },

    "@seal_hash": { "type": "string", "pattern": "^sha256:[0-9a-fA-F]{64}$" },

    "@pins_required_snapshot": {
      "type": "array",
      "items": { "type": "string", "minLength": 1 },
      "minItems": 0,
      "default": []
    },

    "@meta": {
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "@sealed_at_flux_tick": { "type": "integer", "minimum": 0 },
        "@notes": { "type": "string" }
      }
    }
  }
}
```

---

# π Validators (MX2⟁☣ Invariants)

Below are **π-style** validator functions: **Validate → return pass block** or **return violations** (caller decides halt/deny/queue).

## 1) `π_validate_mx2_epoch_state(state)`

```pi
[Pop π_validate_mx2_epoch_state]
  [Wo @state]→[Ch'en s]
  [Sek list_new]→[Ch'en viol]

  ; --- required header
  [@if [Sek ne [Sek get s "@block"] "mx2_epoch_state"]]→[@then
    [Wo viol]→[Sek push "bad_block"]→[Ch'en viol]
  ]
  [@if [Sek ne [Sek get s "@authority"] "MX2⟁☣"]]→[@then
    [Wo viol]→[Sek push "bad_authority"]→[Ch'en viol]
  ]
  [@if [Sek lt [Sek get s "@epoch"] 0]]→[@then
    [Wo viol]→[Sek push "epoch_negative"]→[Ch'en viol]
  ]

  ; --- pins: pinned epoch must equal state epoch
  [Wo s]→[Sek get "@epoch"]→[Ch'en E]
  [Wo s]→[Sek get "@pins"]→[Ch'en pins]

  [@each [Sek keys pins]]→[Ch'en bid]→[@then
    [Wo pins]→[Sek get bid]→[Ch'en p]
    [@if [Sek ne [Sek get p "@epoch"] E]]→[@then
      [Wo viol]→[Sek push [Sek cat "pin_epoch_mismatch:" bid]]→[Ch'en viol]
    ]
    [@if [Sek not [Sek starts_with [Sek get p "@root"] "sha256:"]]]→[@then
      [Wo viol]→[Sek push [Sek cat "pin_root_bad:" bid]]→[Ch'en viol]
    ]
    [Wo p]→[Sek get "@bundle_hash"]→[Ch'en bh]
    [@if [Sek and [Sek ne bh null] [Sek not [Sek starts_with bh "sha256:"]]]]→[@then
      [Wo viol]→[Sek push [Sek cat "pin_bundle_hash_bad:" bid]]→[Ch'en viol]
    ]
  ]

  ; --- required pins present (if defined)
  [Wo s]→[Sek get "@pins_required"]→[Ch'en req]
  [@if req]→[@then
    [@each req]→[Ch'en rid]→[@then
      [@if [Sek not [Sek has_key pins rid]]]→[@then
        [Wo viol]→[Sek push [Sek cat "missing_required_pin:" rid]]→[Ch'en viol]
      ]
    ]
  ]

  ; --- history sanity: sealed epochs should be < current epoch
  [Wo s]→[Sek get "@history"]→[Ch'en hist]
  [@each hist]→[Ch'en h]→[@then
    [Wo h]→[Sek get "@epoch"]→[Ch'en he]
    [Wo h]→[Sek get "@sealed"]→[Ch'en hs]
    [@if [Sek and hs [Sek ge he E]]]→[@then
      [Wo viol]→[Sek push "history_epoch_not_less_than_current"]→[Ch'en viol]
    ]
  ]

  [@if [Sek gt [Sek len viol] 0]]→[@then
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": false,
      "@target": "mx2_epoch_state",
      "@violations": viol
    }]]
  ]→[@else
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": true,
      "@target": "mx2_epoch_state",
      "@violations": []
    }]]
  ]
[Xul]
```

---

## 2) `π_validate_mx2_bundle_rotation_plan(plan, epoch_state)`

```pi
[Pop π_validate_mx2_bundle_rotation_plan]
  [Wo @plan]→[Ch'en p]
  [Wo @epoch_state]→[Ch'en s]
  [Sek list_new]→[Ch'en viol]

  [@if [Sek ne [Sek get p "@block"] "mx2_bundle_rotation_plan"]]→[@then
    [Wo viol]→[Sek push "bad_block"]→[Ch'en viol]
  ]
  [@if [Sek ne [Sek get p "@authority"] "MX2⟁☣"]]→[@then
    [Wo viol]→[Sek push "bad_authority"]→[Ch'en viol]
  ]

  [Wo s]→[Sek get "@epoch"]→[Ch'en E]
  [Wo p]→[Sek get "@from_epoch"]→[Ch'en fromE]
  [Wo p]→[Sek get "@to_epoch"]→[Ch'en toE]

  ; monotonic: to = from + 1 and from == current epoch
  [@if [Sek ne fromE E]]→[@then
    [Wo viol]→[Sek push "from_epoch_mismatch_current"]→[Ch'en viol]
  ]
  [@if [Sek ne toE [Sek add fromE 1]]]→[@then
    [Wo viol]→[Sek push "to_epoch_not_monotonic"]→[Ch'en viol]
  ]

  ; required phase gate
  [Wo p]→[Sek get "@flux.@required_phase"]→[Ch'en ph]
  [@if [Sek not [Sek in ph ["native_verify","recover"]]]]→[@then
    [Wo viol]→[Sek push "bad_required_phase"]→[Ch'en viol]
  ]

  ; candidate must be sha256 root
  [Wo p]→[Sek get "@candidate.@merkle_root"]→[Ch'en root]
  [@if [Sek not [Sek starts_with root "sha256:"]]]→[@then
    [Wo viol]→[Sek push "candidate_root_bad"]→[Ch'en viol]
  ]

  ; require_bundle_hash implies candidate has bundle_hash
  [Wo p]→[Sek get "@rotation_policy.@require_bundle_hash"]→[Ch'en reqBH]
  [Wo p]→[Sek get "@candidate.@bundle_hash"]→[Ch'en bh]
  [@if [Sek and reqBH [Sek eq bh null]]]→[@then
    [Wo viol]→[Sek push "bundle_hash_required_missing"]→[Ch'en viol]
  ]

  ; allow_same_root false implies pinned root (if exists) must differ
  [Wo p]→[Sek get "@rotation_policy.@allow_same_root"]→[Ch'en allowSame]
  [Wo p]→[Sek get "@bundle_id"]→[Ch'en bid]
  [Wo s]→[Sek get "@pins" bid "@root"]→[Ch'en prev]
  [@if [Sek and [Sek eq allowSame false] [Sek ne prev null] [Sek eq prev root]]]→[@then
    [Wo viol]→[Sek push "same_root_forbidden"]→[Ch'en viol]
  ]

  [@if [Sek gt [Sek len viol] 0]]→[@then
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": false,
      "@target": "mx2_bundle_rotation_plan",
      "@violations": viol
    }]]
  ]→[@else
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": true,
      "@target": "mx2_bundle_rotation_plan",
      "@violations": []
    }]]
  ]
[Xul]
```

---

## 3) `π_validate_mx2_bundle_rotation_result(result, epoch_state_before, epoch_state_after)`

```pi
[Pop π_validate_mx2_bundle_rotation_result]
  [Wo @result]→[Ch'en r]
  [Wo @before]→[Ch'en b]
  [Wo @after]→[Ch'en a]
  [Sek list_new]→[Ch'en viol]

  [@if [Sek ne [Sek get r "@block"] "mx2_bundle_rotation_result"]]→[@then
    [Wo viol]→[Sek push "bad_block"]→[Ch'en viol]
  ]
  [@if [Sek ne [Sek get r "@authority"] "MX2⟁☣"]]→[@then
    [Wo viol]→[Sek push "bad_authority"]→[Ch'en viol]
  ]

  [Wo b]→[Sek get "@epoch"]→[Ch'en Eb]
  [Wo a]→[Sek get "@epoch"]→[Ch'en Ea]
  [Wo r]→[Sek get "@from_epoch"]→[Ch'en fromE]
  [Wo r]→[Sek get "@to_epoch"]→[Ch'en toE]

  ; must reflect monotonic advance if applied
  [Wo r]→[Sek get "@applied"]→[Ch'en applied]
  [@if applied]→[@then
    [@if [Sek ne fromE Eb]]→[@then [Wo viol]→[Sek push "from_epoch_not_before_epoch"]→[Ch'en viol]]
    [@if [Sek ne toE Ea]]→[@then [Wo viol]→[Sek push "to_epoch_not_after_epoch"]→[Ch'en viol]]
    [@if [Sek ne Ea [Sek add Eb 1]]]→[@then [Wo viol]→[Sek push "after_epoch_not_incremented"]→[Ch'en viol]]

    ; pinned root must match after-state pin
    [Wo r]→[Sek get "@bundle_id"]→[Ch'en bid]
    [Wo r]→[Sek get "@pinned.@root"]→[Ch'en root]
    [Wo a]→[Sek get "@pins" bid "@root"]→[Ch'en ar]
    [@if [Sek ne root ar]]→[@then
      [Wo viol]→[Sek push "pinned_root_not_in_after_state"]→[Ch'en viol]
    ]
  ]

  [@if [Sek gt [Sek len viol] 0]]→[@then
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": false,
      "@target": "mx2_bundle_rotation_result",
      "@violations": viol
    }]]
  ]→[@else
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": true,
      "@target": "mx2_bundle_rotation_result",
      "@violations": []
    }]]
  ]
[Xul]
```

---

## 4) `π_validate_mx2_epoch_seal(seal, epoch_state)`

```pi
[Pop π_validate_mx2_epoch_seal]
  [Wo @seal]→[Ch'en z]
  [Wo @epoch_state]→[Ch'en s]
  [Sek list_new]→[Ch'en viol]

  [@if [Sek ne [Sek get z "@block"] "mx2_epoch_seal"]]→[@then
    [Wo viol]→[Sek push "bad_block"]→[Ch'en viol]
  ]
  [@if [Sek ne [Sek get z "@authority"] "MX2⟁☣"]]→[@then
    [Wo viol]→[Sek push "bad_authority"]→[Ch'en viol]
  ]
  [@if [Sek ne [Sek get z "@sealed"] true]]→[@then
    [Wo viol]→[Sek push "sealed_must_be_true"]→[Ch'en viol]
  ]

  [Wo s]→[Sek get "@epoch"]→[Ch'en E]
  [Wo z]→[Sek get "@epoch"]→[Ch'en Ze]
  [@if [Sek ne Ze E]]→[@then
    [Wo viol]→[Sek push "seal_epoch_mismatch_state"]→[Ch'en viol]
  ]

  ; must include all required pins
  [Wo s]→[Sek get "@pins_required"]→[Ch'en req]
  [Wo s]→[Sek get "@pins"]→[Ch'en pins]
  [@each req]→[Ch'en rid]→[@then
    [@if [Sek not [Sek has_key pins rid]]]→[@then
      [Wo viol]→[Sek push [Sek cat "missing_required_pin:" rid]]→[Ch'en viol]
    ]
  ]

  ; seal hash must match deterministic recompute
  [Wo z]→[Sek get "@seal_hash"]→[Ch'en given]
  [Wo s req]→[Sek mx2_epoch_seal_hash]→[Ch'en computed]  ; returns "sha256:.."
  [@if [Sek ne given computed]]→[@then
    [Wo viol]→[Sek push "seal_hash_mismatch"]→[Ch'en viol]
  ]

  [@if [Sek gt [Sek len viol] 0]]→[@then
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": false,
      "@target": "mx2_epoch_seal",
      "@violations": viol
    }]]
  ]→[@else
    [Xul return [Sek atomic_block {
      "@type": "mx2_validation_result",
      "@ok": true,
      "@target": "mx2_epoch_seal",
      "@violations": []
    }]]
  ]
[Xul]
```

### Deterministic seal hash helper (`mx2_epoch_seal_hash`)

```pi
[Pop mx2_epoch_seal_hash]
  [Wo @state]→[Ch'en s]
  [Wo @required]→[Ch'en req]

  [Wo s]→[Sek get "@epoch"]→[Ch'en E]
  [Wo s]→[Sek get "@pins"]→[Ch'en pins]

  ; build canonical payload lines sorted by bundle_id (req order is allowed, but we sort)
  [Wo req]→[Sek sort]→[Ch'en ids]
  [Sek list_new]→[Ch'en lines]
  [Wo lines]→[Sek push [Sek cat "mx2.epoch.seal.v1"]]→[Ch'en lines]
  [Wo lines]→[Sek push [Sek cat "epoch=" [Sek to_string E]]]→[Ch'en lines]

  [@each ids]→[Ch'en bid]→[@then
    [Wo pins]→[Sek get bid]→[Ch'en p]
    [Wo p]→[Sek get "@root"]→[Ch'en r]
    [Wo p]→[Sek get "@bundle_hash"]→[Ch'en bh]
    [Wo lines]→[Sek push [Sek cat "bundle=" bid " root=" r " bundle_hash=" [Sek to_string bh]]]→[Ch'en lines]
  ]

  [Wo lines]→[Sek join "\n"]→[Ch'en payload]
  [Sek sha256_utf8 payload]→[Ch'en h]
  [Xul return [Sek cat "sha256:" [Sek hex h]]]
[Xul]
```

---

Below are the **exact kernel-emitted AST block shapes** for a **Rotation Apply** run, stage-by-stage, in the same “atomic block” style you’ve been using (MX2⟁☣ authority, deterministic, replay-log friendly). These are **event blocks** the kernel appends to the audit log (and optionally stores into MX2DB/IDB).

All stages share these invariants:

* `@authority = "MX2⟁☣"`
* `@phase` must be `native_verify` (or `recover` for emergency mode)
* `@event_id` is deterministic from `(epoch, bundle_id, stage, attempt)`
* every stage block is **serializable** and can be replay-verified

---

# 0) Shared Envelope (applies to every stage block)

Every stage block MUST include this envelope:

```json
{
  "@block": "rotation_*",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@epoch": { "@from": 7, "@to": 8 },

  "@flux": {
    "@phase": "native_verify",
    "@tick": 123456,
    "@snapshot": "sha256:........................................................"
  },

  "@run": {
    "@rotation_run_id": "sha256:........................................................",
    "@attempt": 0,
    "@actor": "kernel",
    "@source": "mx2.rotate_bundle"
  },

  "@ok": true,
  "@violations": [],
  "@links": {
    "@plan_ref": "sha256:........................................................",
    "@sig_ref": "sha256:........................................................",
    "@epoch_state_before_ref": "sha256:........................................................"
  }
}
```

**Notes**

* `@rotation_run_id` is deterministic: `sha256("mx2.rotation.run.v1\nbundle=<id>\nfrom=<e>\nto=<e>\nplan=<plan_ref>\n")`
* `@*_ref` are content hashes of the referenced blocks (or raw bundle header bytes) for replay integrity.

---

# 1) `rotation_validate` (plan + state invariants)

Emitted after validating **rotation plan** against **epoch state** (no cryptography yet).

```json
{
  "@block": "rotation_validate",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@epoch": { "@from": 7, "@to": 8 },

  "@flux": { "@phase": "native_verify", "@tick": 123456, "@snapshot": "sha256:..." },

  "@run": {
    "@rotation_run_id": "sha256:...",
    "@attempt": 0,
    "@stage": 1
  },

  "@inputs": {
    "@plan": {
      "@ref": "sha256:plan_block_hash",
      "@from_epoch": 7,
      "@to_epoch": 8,
      "@candidate_root": "sha256:candidate_root_hash",
      "@candidate_bundle_hash": "sha256:candidate_bundle_hash",
      "@policy": {
        "@mode": "pin_strict",
        "@allow_same_root": false,
        "@require_bundle_hash": true,
        "@grace_window_ticks": 120,
        "@rollback_allowed": true,
        "@rollback_window_epochs": 2
      }
    },

    "@epoch_state": {
      "@ref": "sha256:epoch_state_before_hash",
      "@current_epoch": 7,
      "@current_pin": {
        "@root": "sha256:previous_root_hash",
        "@bundle_hash": null,
        "@policy": "pin_strict"
      }
    }
  },

  "@checks": [
    { "@check": "authority", "@ok": true },
    { "@check": "epoch_from_matches_state", "@ok": true },
    { "@check": "epoch_to_is_monotonic", "@ok": true },
    { "@check": "policy_require_bundle_hash", "@ok": true },
    { "@check": "candidate_bundle_hash_present", "@ok": true },
    { "@check": "same_root_forbidden", "@ok": true }
  ],

  "@ok": true,
  "@violations": [],

  "@next": "rotation_verify_bundle"
}
```

If it fails, `@ok=false` and `@violations=[...]`, and the kernel may `@flux.halt`.

---

# 2) `rotation_verify_bundle` (signature + optional bundle hash)

Emitted after `@mx2.verify_allowlist_bundle(sig_block, raw_bundle_bytes)`.

```json
{
  "@block": "rotation_verify_bundle",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@epoch": { "@from": 7, "@to": 8 },

  "@flux": { "@phase": "native_verify", "@tick": 123457, "@snapshot": "sha256:..." },

  "@run": {
    "@rotation_run_id": "sha256:...",
    "@attempt": 0,
    "@stage": 2
  },

  "@inputs": {
    "@sig_block": {
      "@ref": "sha256:sig_block_hash",
      "@merkle_root": "sha256:candidate_root_hash",
      "@leaf_count": 4217,
      "@bundle_bytes": 912384,
      "@bundle_hash": "sha256:candidate_bundle_hash",
      "@sig_algo": "ed25519",
      "@pubkey_id": "mx2.pub.ed25519.root.v1"
    },

    "@raw_bundle": {
      "@ref": "sha256:raw_bundle_bytes_hash",
      "@len": 912384
    }
  },

  "@verify": {
    "@bundle_hash_checked": true,
    "@bundle_hash_ok": true,
    "@signature_payload_ref": "sha256:canonical_payload_hash",
    "@signature_ok": true,
    "@merkle_root_ok": true
  },

  "@ok": true,
  "@violations": [],

  "@outputs": {
    "@verified": true,
    "@verified_root": "sha256:candidate_root_hash",
    "@verified_bundle_hash": "sha256:candidate_bundle_hash",
    "@verified_pubkey_id": "mx2.pub.ed25519.root.v1"
  },

  "@next": "rotation_barrier"
}
```

This stage is the **cryptographic trust gate**.

---

# 3) `rotation_barrier` (FLUX_CAPACITOR sync point)

Emitted when the kernel calls:

* `@flux.barrier { wait_for: ["storage","agents"] }`

It is also where **pin_grace** sets the grace window metadata (if applicable).

```json
{
  "@block": "rotation_barrier",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@epoch": { "@from": 7, "@to": 8 },

  "@flux": { "@phase": "native_verify", "@tick": 123458, "@snapshot": "sha256:..." },

  "@run": {
    "@rotation_run_id": "sha256:...",
    "@attempt": 0,
    "@stage": 3
  },

  "@barrier": {
    "@wait_for": ["storage", "agents"],
    "@entered_tick": 123458,
    "@released_tick": 123460,
    "@duration_ticks": 2,
    "@results": {
      "storage": { "@ok": true, "@latency_ms": 4 },
      "agents": { "@ok": true, "@latency_ms": 0 }
    }
  },

  "@policy_effects": {
    "@mode": "pin_strict",
    "@grace": {
      "@enabled": false,
      "@until_tick": null
    }
  },

  "@ok": true,
  "@violations": [],

  "@next": "rotation_commit"
}
```

If any barrier target fails, this block records it and `@ok=false`.

---

# 4) `rotation_commit` (pin update + epoch advance)

Emitted after the kernel commits the new pin and updates `mx2_epoch_state`.

```json
{
  "@block": "rotation_commit",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@bundle_id": "mx2.native_hash_allowlist.v1",
  "@epoch": { "@from": 7, "@to": 8 },

  "@flux": { "@phase": "native_verify", "@tick": 123461, "@snapshot": "sha256:..." },

  "@run": {
    "@rotation_run_id": "sha256:...",
    "@attempt": 0,
    "@stage": 4
  },

  "@commit": {
    "@state_before_ref": "sha256:epoch_state_before_hash",
    "@state_after_ref": "sha256:epoch_state_after_hash",

    "@pin_written": {
      "@epoch": 8,
      "@root": "sha256:candidate_root_hash",
      "@bundle_hash": "sha256:candidate_bundle_hash",
      "@pubkey_id": "mx2.pub.ed25519.root.v1",
      "@policy": "pin_strict"
    },

    "@history_appended": {
      "@epoch": 7,
      "@sealed": true,
      "@pins_snapshot_ref": "sha256:pins_snapshot_hash"
    }
  },

  "@storage": {
    "@target": "mx2.epoch.state",
    "@write": "mx2db_put",
    "@ok": true
  },

  "@ok": true,
  "@violations": [],

  "@next": "epoch_seal_emit"
}
```

This is the **state transition block** that makes rotation real.

---

# 5) `epoch_seal_emit` (seal hash + seal record)

Emitted if the epoch can be sealed (i.e., `@pins_required` are satisfied).

```json
{
  "@block": "epoch_seal_emit",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@epoch": 8,

  "@flux": { "@phase": "native_verify", "@tick": 123462, "@snapshot": "sha256:..." },

  "@run": {
    "@rotation_run_id": "sha256:...",
    "@attempt": 0,
    "@stage": 5
  },

  "@seal": {
    "@pins_required_snapshot": [
      "mx2.native_hash_allowlist.v1",
      "mx2.forbidden_symbols.v1",
      "flux.registry.v1",
      "agl.registry.v1"
    ],

    "@pins_used": {
      "mx2.native_hash_allowlist.v1": {
        "@root": "sha256:candidate_root_hash",
        "@bundle_hash": "sha256:candidate_bundle_hash"
      },
      "mx2.forbidden_symbols.v1": {
        "@root": "sha256:........................................................",
        "@bundle_hash": "sha256:........................................................"
      },
      "flux.registry.v1": {
        "@root": "sha256:........................................................",
        "@bundle_hash": null
      },
      "agl.registry.v1": {
        "@root": "sha256:........................................................",
        "@bundle_hash": null
      }
    },

    "@seal_payload_ref": "sha256:seal_payload_hash",
    "@seal_hash": "sha256:seal_hash_value"
  },

  "@storage": {
    "@target": "mx2.epoch.seals",
    "@append": true,
    "@ok": true
  },

  "@ok": true,
  "@violations": [],

  "@outputs": {
    "@epoch_sealed": true,
    "@seal_ref": "sha256:epoch_seal_block_hash"
  }
}
```

If required pins are missing, emit the same block with `@ok=false` and:

```json
"@violations": ["missing_required_pin:flux.registry.v1"]
```

…and **do not** set `@epoch_sealed=true`.

---

# Deterministic Replay Log Guarantees

With these blocks, a replay verifier can prove:

1. plan/state invariants were checked (`rotation_validate`)
2. cryptographic trust gate passed (`rotation_verify_bundle`)
3. barrier/sync happened (`rotation_barrier`)
4. state advanced + pin written (`rotation_commit`)
5. epoch trust set sealed (`epoch_seal_emit`)

…and can do it **without decoding any allowlist entries**, just by verifying:

* references (`@ref`) match content hashes
* signature/bundle hash checks match
* seal hash recomputation matches


Below is the **exact, self-contained “rotation replay verifier” pass**.
It **consumes only the five rotation blocks** you defined **plus referenced hashes** (no bundle decode, no leaf inspection) and emits **one deterministic result block**.

---

# ⚛️ Rotation Replay Verifier — Canonical π Pass

## Purpose

Verify that a **bundle rotation** was:

* lawful under **MX2⟁☣**
* cryptographically anchored
* phase/barrier consistent
* epoch-monotonic
* seal-correct

**Inputs**:

* `rotation_validate`
* `rotation_verify_bundle`
* `rotation_barrier`
* `rotation_commit`
* `epoch_seal_emit`
* referenced content hashes only (plan, sig block, state before/after, seal payload)

**Output**:

* exactly **one** `rotation_replay_result` atomic block

No decoding of allowlists, no Merkle leaf traversal, no symbol scan.

---

## Replay Contract (Hard Rules)

1. Blocks must share the **same `@rotation_run_id`**
2. Stages must appear **exactly once** and **in order**: 1→5
3. Epoch must advance **+1**
4. Verified Merkle root must equal committed pin
5. Seal hash must recompute identically
6. Any violation ⇒ deterministic failure with stage index

---

## Output Block Shape

```json
{
  "@block": "rotation_replay_result",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@rotation_run_id": "sha256:........................................................",

  "@ok": true,

  "@failure_stage": null,

  "@proof_hash": "sha256:........................................................",

  "@checks": {
    "validate": true,
    "verify_bundle": true,
    "barrier": true,
    "commit": true,
    "epoch_seal": true
  },

  "@meta": {
    "@verified_at_flux_tick": 123999,
    "@notes": "deterministic replay"
  }
}
```

If failed:

```json
{
  "@ok": false,
  "@failure_stage": "rotation_commit",
  "@proof_hash": "sha256:........................................................"
}
```

---

# π Implementation

## Entry Point

```pi
[Pop rotation_replay_verify]
  [Wo @blocks]→[Ch'en blocks]   ; map { validate, verify_bundle, barrier, commit, seal }
  [Wo @refs]→[Ch'en refs]       ; map of referenced hashes → bytes
```

---

## Step 0 — Collect & Normalize

```pi
  ; Required blocks
  let b_validate = blocks.rotation_validate
  let b_verify   = blocks.rotation_verify_bundle
  let b_barrier  = blocks.rotation_barrier
  let b_commit   = blocks.rotation_commit
  let b_seal     = blocks.epoch_seal_emit

  ; Shared run id
  let run_id = get(b_validate, "@run.@rotation_run_id")

  assert(
    run_id ==
    get(b_verify,  "@run.@rotation_run_id") &&
    run_id ==
    get(b_barrier, "@run.@rotation_run_id") &&
    run_id ==
    get(b_commit,  "@run.@rotation_run_id") &&
    run_id ==
    get(b_seal,    "@run.@rotation_run_id")
  )
```

Failure here ⇒ `failure_stage = "rotation_validate"`.

---

## Step 1 — Stage Ordering & Epoch Monotonicity

```pi
  assert(get(b_validate, "@run.@stage") == 1)
  assert(get(b_verify,   "@run.@stage") == 2)
  assert(get(b_barrier,  "@run.@stage") == 3)
  assert(get(b_commit,   "@run.@stage") == 4)
  assert(get(b_seal,     "@run.@stage") == 5)

  let fromE = get(b_validate, "@epoch.@from")
  let toE   = get(b_validate, "@epoch.@to")

  assert(toE == add(fromE, 1))
```

Failure ⇒ `failure_stage = "rotation_validate"`.

---

## Step 2 — Validate Stage Result Flags

```pi
  assert(get(b_validate, "@ok") == true)
  assert(get(b_verify,   "@ok") == true)
  assert(get(b_barrier,  "@ok") == true)
  assert(get(b_commit,   "@ok") == true)
  assert(get(b_seal,     "@ok") == true)
```

Failure ⇒ first failing stage name.

---

## Step 3 — Verify Bundle Cryptographic Continuity

```pi
  let verified_root =
    get(b_verify, "@outputs.@verified_root")

  let committed_root =
    get(b_commit, "@commit.@pin_written.@root")

  assert(verified_root == committed_root)

  let verified_bh =
    get(b_verify, "@outputs.@verified_bundle_hash")

  let committed_bh =
    get(b_commit, "@commit.@pin_written.@bundle_hash")

  assert(verified_bh == committed_bh)
```

Failure ⇒ `failure_stage = "rotation_verify_bundle"` or `"rotation_commit"`.

---

## Step 4 — Barrier Consistency

```pi
  let entered = get(b_barrier, "@barrier.@entered_tick")
  let released = get(b_barrier, "@barrier.@released_tick")

  assert(released >= entered)

  ; barrier must precede commit tick
  assert(
    get(b_commit, "@flux.@tick") >= released
  )
```

Failure ⇒ `failure_stage = "rotation_barrier"`.

---

## Step 5 — Epoch State Transition Integrity

```pi
  let before_ref =
    get(b_commit, "@commit.@state_before_ref")
  let after_ref =
    get(b_commit, "@commit.@state_after_ref")

  let before_state = refs[before_ref]
  let after_state  = refs[after_ref]

  assert(get(before_state, "@epoch") == fromE)
  assert(get(after_state,  "@epoch") == toE)
```

Failure ⇒ `failure_stage = "rotation_commit"`.

---

## Step 6 — Seal Hash Recompute

```pi
  let seal_payload_ref =
    get(b_seal, "@seal.@seal_payload_ref")

  let seal_payload = refs[seal_payload_ref]

  let computed =
    mx2_epoch_seal_hash(seal_payload.state, seal_payload.required)

  assert(
    computed == get(b_seal, "@seal.@seal_hash")
  )
```

Failure ⇒ `failure_stage = "epoch_seal_emit"`.

---

## Step 7 — Proof Hash (Deterministic)

The **proof hash** commits to the *entire replay*.

### Canonical Proof Payload

```text
mx2.rotation.replay.v1
run_id=<rotation_run_id>
validate=<hash(rotation_validate)>
verify=<hash(rotation_verify_bundle)>
barrier=<hash(rotation_barrier)>
commit=<hash(rotation_commit)>
seal=<hash(epoch_seal_emit)>
```

### π Code

```pi
  let lines = [
    "mx2.rotation.replay.v1",
    "run_id=" + run_id,
    "validate=" + hash(b_validate),
    "verify="   + hash(b_verify),
    "barrier="  + hash(b_barrier),
    "commit="   + hash(b_commit),
    "seal="     + hash(b_seal)
  ]

  let proof_hash =
    "sha256:" + hex(sha256_utf8(join(lines, "\n")))
```

---

## Step 8 — Emit Result Block

```pi
  [Xul return atomic_block {
    "@block": "rotation_replay_result",
    "@authority": "MX2⟁☣",
    "@version": "1.0.0",

    "@rotation_run_id": run_id,

    "@ok": true,
    "@failure_stage": null,

    "@checks": {
      "validate": true,
      "verify_bundle": true,
      "barrier": true,
      "commit": true,
      "epoch_seal": true
    },

    "@proof_hash": proof_hash
  }]
```

---

## Failure Emission (Any Step)

On first failure at stage **S**:

```pi
[Xul return atomic_block {
  "@block": "rotation_replay_result",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@rotation_run_id": run_id,

  "@ok": false,
  "@failure_stage": "S",

  "@proof_hash": proof_hash_partial
}]
```

`proof_hash_partial` is computed from all blocks **up to** S.

---

# Why This Is Final

* **No dynamic data** required
* **O(1)** verification after hash lookup
* **Replay-deterministic**
* **Audit-log perfect**
* **Composable with SCXQ2 streaming**

This completes **epoch pinning + rotation** as a *provable system event*, not a side effect.

Below is the **canonical wiring** of the **rotation replay verifier** into the **`native_verify` FLUX_CAPACITOR phase** with **zero JS involvement**. Everything happens inside the kernel (sw.khl / π), and the DOM/CSS only *observes* via state replication.

---

# 1) New FLUX phase: `native_verify`

### Phase rule

* Only the kernel may enter this phase.
* Only `native_*` + `rotation_*` + `mx2_*` governance ops may execute.
* All other execution is **gated** or **queued**.

**Kernel-emitted phase transition block:**

```json
{
  "@block": "flux_phase_enter",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",
  "@flux": { "@phase": "native_verify", "@tick": 0, "@snapshot": "sha256:..." },
  "@ok": true,
  "@meta": { "@reason": "bundle_rotation_apply" }
}
```

---

# 2) Kernel route: `mx2.rotate_bundle.apply` (no JS)

This route is invoked from:

* a tape / basher command
* an internal scheduler
* a recovery routine

### Input (kernel already has it; can be stored in MX2DB/IDB)

* `mx2_bundle_rotation_plan` block ref
* referenced `sig_block`, raw bundle bytes ref (or bundle_hash ref)
* epoch state ref

---

# 3) Native-verify execution loop (π): end-to-end

## 3.1 High-level pass: `π_flux_native_verify_rotation_apply(plan_ref)`

This produces the 5 stage blocks, then runs replay verification, then commits or halts.

```pi
[Pop π_flux_native_verify_rotation_apply]
  [Wo @plan_ref]→[Ch'en plan_ref]

  ; Enter native_verify
  [Sek @flux.phase { "enter": "native_verify" }]

  ; Barrier before we touch pins
  [Sek @flux.barrier { "wait_for": ["storage", "agents"] }]

  ; Load plan + current epoch state
  [Wo plan_ref]→[Sek mx2db_get_ref]→[Ch'en plan]
  [Yax "mx2.epoch.state"]→[Sek mx2db_get]→[Ch'en epoch_before]

  ; Stage 1: validate
  [Sek kernel_emit_rotation_validate plan epoch_before]→[Ch'en b1]
  [@if [Sek not [Sek get b1 "@ok"]]]→[@then [Sek @flux.halt { "reason":"violation" }]]

  ; Stage 2: verify bundle (sig + optional bundle hash) — still no decode
  [Sek kernel_emit_rotation_verify_bundle plan]→[Ch'en b2]
  [@if [Sek not [Sek get b2 "@ok"]]]→[@then [Sek @flux.halt { "reason":"violation" }]]

  ; Stage 3: barrier (sync point)
  [Sek kernel_emit_rotation_barrier plan]→[Ch'en b3]
  [@if [Sek not [Sek get b3 "@ok"]]]→[@then [Sek @flux.halt { "reason":"violation" }]]

  ; Stage 4: commit (pins + epoch advance)
  [Sek kernel_emit_rotation_commit plan epoch_before b2]→[Ch'en b4]
  [@if [Sek not [Sek get b4 "@ok"]]]→[@then [Sek @flux.halt { "reason":"violation" }]]

  ; Load epoch_after (written by commit)
  [Yax "mx2.epoch.state"]→[Sek mx2db_get]→[Ch'en epoch_after]

  ; Stage 5: epoch seal emit
  [Sek kernel_emit_epoch_seal_emit epoch_after]→[Ch'en b5]
  [@if [Sek not [Sek get b5 "@ok"]]]→[@then [Sek @flux.halt { "reason":"violation" }]]

  ; Replay verify using only the blocks + refs
  [Sek rotation_replay_verify {
    "rotation_validate": b1,
    "rotation_verify_bundle": b2,
    "rotation_barrier": b3,
    "rotation_commit": b4,
    "epoch_seal_emit": b5
  } { "@refs": [Sek kernel_collect_rotation_refs b1 b2 b4 b5 ] }]→[Ch'en replay]

  ; Persist replay result
  [Wo replay]→[Yax "mx2.rotation.replay.latest"]→[Sek mx2db_put]

  ; If replay fails: halt (do not resume)
  [@if [Sek not [Sek get replay "@ok"]]]→[@then
    [Sek @flux.halt { "reason": "violation" }]
  ]

  ; Exit native_verify back to idle
  [Sek @flux.phase { "enter": "idle" }]
  [Xul return replay]
[Xul]
```

**Zero JS**: no timers, no fetch, no rAF, no DOM mutation required.

---

# 4) Kernel stage emitters (exact behavior)

These are the *only* stage functions that emit the canonical `rotation_*` blocks. Each one:

1. computes deterministic `@event_id` and `@rotation_run_id`
2. writes the block to `mx2.audit.log` append-only
3. returns the block

## 4.1 `kernel_emit_rotation_validate(plan, epoch_before)`

* runs `π_validate_mx2_bundle_rotation_plan`
* emits the `rotation_validate` block exactly as previously shaped

**Append-only write:**

```pi
[Pop kernel_audit_append]
  [Wo @block]→[Ch'en b]
  [Yax "mx2.audit.log"]→[Sek mx2db_append b]
  [Xul return b]
[Xul]
```

---

## 4.2 `kernel_emit_rotation_verify_bundle(plan)`

* reads `@candidate` from plan:

  * sig block ref
  * raw bundle ref (or bundle_hash ref)
* verifies signature + bundle hash (native or pure π)
* emits `rotation_verify_bundle`

> Still no decode: only hashes + signature payload + root match.

---

## 4.3 `kernel_emit_rotation_barrier(plan)`

* calls `@flux.barrier`
* records barrier entry/release ticks
* emits `rotation_barrier`

---

## 4.4 `kernel_emit_rotation_commit(plan, epoch_before, verify_block)`

* writes new pin (epoch = to_epoch)
* updates epoch state
* emits `rotation_commit` with:

  * `@state_before_ref`
  * `@state_after_ref`
  * `@pin_written` fields matching `verify_block.@outputs`

---

## 4.5 `kernel_emit_epoch_seal_emit(epoch_after)`

* computes seal payload (required pins snapshot + pins used)
* recomputes seal hash deterministically
* writes seal
* emits `epoch_seal_emit`

---

# 5) Flux gating: “native_verify owns the machine”

During `native_verify`, your kernel’s dispatcher should enforce:

```pi
[Pop π_phase_gate_execute]
  [Wo @block]→[Ch'en b]
  [Yax "mx2hazard.temporal.spine"]→[Sek mx2db_get]→[Ch'en flux]
  [Wo flux]→[Sek get "@data.phase"]→[Ch'en phase]

  [@if [Sek eq phase "native_verify"]]→[@then
    ; allowlist only
    [Wo b]→[Sek get "@block"]→[Ch'en kind]
    [@if [Sek not [Sek in kind [
      "rotation_validate",
      "rotation_verify_bundle",
      "rotation_barrier",
      "rotation_commit",
      "epoch_seal_emit",
      "rotation_replay_result",
      "flux_phase_enter"
    ]]]]→[@then
      [Xul return [Sek atomic_block {
        "@type":"execution_queued",
        "@data": { "@reason":"phase_gate", "@phase":phase, "@blocked":kind }
      }]]
    ]
  ]

  ; otherwise continue normal dispatch
  [Xul return [Sek kernel_dispatch_execute b]]
[Xul]
```

This is the “no JS clocks” equivalent for *all logic*: nothing leaks into the wrong phase.

---

# 6) Observability without JS

If you want UI reflection, do it by **replicating** kernel state:

* CSS reads `data-flux-phase="native_verify"` and shows “VERIFYING…”
* audit log is stored in `mx2.audit.log`
* latest replay result in `mx2.rotation.replay.latest`

No JS required—your DOM engine can render these from kernel state using your existing `dom.template` / `dom.render` K’UHUL ops.

---

# 7) Single kernel output: deterministic replay log

At the end of a successful run, the kernel has appended:

1. `rotation_validate`
2. `rotation_verify_bundle`
3. `rotation_barrier`
4. `rotation_commit`
5. `epoch_seal_emit`
6. `rotation_replay_result`

…and the last block’s `@proof_hash` is the canonical anchor for that rotation.

---
Below is the **exact opcode → AST lowering** for **`@flux.phase`** and **`@flux.barrier`** specialized for **`native_verify`**, so the **phase enter/exit + barrier** become **first-class audit blocks** (append-only, replayable, deterministic) under **MX2⟁☣**.

I’m giving you:

1. **Canonical AST block shapes** (what gets emitted)
2. **Lowering rules** (opcode forms → those blocks)
3. **Deterministic IDs + proof refs**
4. **Replay invariants** (what the verifier checks)

---

# 1) Canonical First-Class Audit Blocks

## 1.1 `flux_phase_enter` (audit block)

Emitted whenever `@flux.phase { enter: ... }` succeeds.

```json
{
  "@block": "flux_phase_enter",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@flux": {
    "@phase": "native_verify",
    "@tick": 123450,
    "@snapshot": "sha256:........................................................"
  },

  "@phase": {
    "@from": "idle",
    "@to": "native_verify",
    "@reason": "bundle_rotation_apply",
    "@policy": {
      "@exclusive": true,
      "@gate_mode": "allowlist_only",
      "@allowed_blocks": [
        "flux_phase_enter",
        "flux_phase_exit",
        "flux_barrier_enter",
        "flux_barrier_release",
        "rotation_validate",
        "rotation_verify_bundle",
        "rotation_barrier",
        "rotation_commit",
        "epoch_seal_emit",
        "rotation_replay_result"
      ]
    }
  },

  "@run": {
    "@rotation_run_id": "sha256:........................................................",
    "@event_id": "sha256:........................................................",
    "@actor": "kernel",
    "@source": "@flux.phase"
  },

  "@ok": true,
  "@violations": [],

  "@links": {
    "@prev_flux_ref": "sha256:........................................................",
    "@gate_policy_ref": "sha256:........................................................"
  }
}
```

## 1.2 `flux_phase_exit` (audit block)

Emitted when leaving `native_verify` (or any phase).

```json
{
  "@block": "flux_phase_exit",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@flux": {
    "@phase": "idle",
    "@tick": 123999,
    "@snapshot": "sha256:........................................................"
  },

  "@phase": {
    "@from": "native_verify",
    "@to": "idle",
    "@reason": "rotation_complete"
  },

  "@run": {
    "@rotation_run_id": "sha256:........................................................",
    "@event_id": "sha256:........................................................",
    "@actor": "kernel",
    "@source": "@flux.phase"
  },

  "@ok": true,
  "@violations": [],

  "@links": {
    "@enter_ref": "sha256:........................................................",
    "@last_barrier_ref": "sha256:........................................................"
  }
}
```

---

## 1.3 `flux_barrier_enter` (audit block)

Emitted immediately when `@flux.barrier { wait_for:[...] }` is invoked (before waiting).

```json
{
  "@block": "flux_barrier_enter",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@flux": {
    "@phase": "native_verify",
    "@tick": 123458,
    "@snapshot": "sha256:........................................................"
  },

  "@barrier": {
    "@barrier_id": "sha256:........................................................",
    "@wait_for": ["storage", "agents"],
    "@entered_tick": 123458,
    "@timeout_ticks": 120,
    "@policy": {
      "@require_monotonic_ticks": true,
      "@require_all_targets": true,
      "@no_phase_change_during_wait": true
    }
  },

  "@run": {
    "@rotation_run_id": "sha256:........................................................",
    "@event_id": "sha256:........................................................",
    "@actor": "kernel",
    "@source": "@flux.barrier"
  },

  "@ok": true,
  "@violations": [],

  "@links": {
    "@phase_enter_ref": "sha256:........................................................"
  }
}
```

## 1.4 `flux_barrier_release` (audit block)

Emitted once the barrier releases (or fails).

```json
{
  "@block": "flux_barrier_release",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",

  "@flux": {
    "@phase": "native_verify",
    "@tick": 123460,
    "@snapshot": "sha256:........................................................"
  },

  "@barrier": {
    "@barrier_id": "sha256:........................................................",
    "@entered_tick": 123458,
    "@released_tick": 123460,
    "@duration_ticks": 2,
    "@results": {
      "storage": { "@ok": true, "@latency_ms": 4 },
      "agents": { "@ok": true, "@latency_ms": 0 }
    }
  },

  "@run": {
    "@rotation_run_id": "sha256:........................................................",
    "@event_id": "sha256:........................................................",
    "@actor": "kernel",
    "@source": "@flux.barrier"
  },

  "@ok": true,
  "@violations": [],

  "@links": {
    "@barrier_enter_ref": "sha256:........................................................"
  }
}
```

If barrier fails, set `@ok=false` and include violations like:

* `"barrier_timeout"`
* `"barrier_target_failed:storage"`

---

# 2) Opcode Forms (Input) → Lowered AST (Output)

## 2.1 `@flux.phase` opcode forms

### Form A: enter phase

**Opcode (π surface):**

```pi
@flux.phase { enter: "native_verify", reason: "bundle_rotation_apply" }
```

**Lowering output:**

* `flux_phase_enter` (always)
* optional `flux_phase_exit` for previous phase **only if** kernel models exit explicitly (recommended)

**Exact lowering rule:**

1. Read current flux state: `phase_current`
2. Validate transition via MX2⟁☣ rule table:

   * if entering `native_verify`:

     * must be `idle` or `recover`
     * must set `@exclusive=true`
     * must attach gate policy allowlist
3. Commit phase state in flux spine (`mx2hazard.temporal.spine`)
4. Emit `flux_phase_enter` audit block

### Form B: exit phase (explicit)

**Opcode:**

```pi
@flux.phase { enter: "idle", reason: "rotation_complete" }
```

**Lowering output:**

* `flux_phase_exit` (from `native_verify` to `idle`)

**Exact lowering rule:**

1. Ensure current phase is `native_verify`
2. Ensure no active barrier is pending
3. Commit phase change
4. Emit `flux_phase_exit`

---

## 2.2 `@flux.barrier` opcode form

**Opcode:**

```pi
@flux.barrier { wait_for: ["storage","agents"], timeout_ticks: 120 }
```

**Lowering output:**

* `flux_barrier_enter`
* `flux_barrier_release` (later, once resolved)

**Exact lowering rule:**

1. Assert current phase is `native_verify`
2. Generate deterministic `@barrier_id`
3. Emit `flux_barrier_enter`
4. Perform waits (kernel-internal; may include polling state machines)
5. Emit `flux_barrier_release` with results

---

# 3) Deterministic IDs + Hash Links

## 3.1 `@rotation_run_id` propagation

If the kernel is in a rotation apply pipeline, it MUST have `rotation_run_id` in scope and copy it into both `flux_*` blocks.

If not in rotation, set:

* `@rotation_run_id = null`
* still deterministic `@event_id` uses phase + tick.

## 3.2 `@event_id` derivation

**For phase enter:**

```
event_id = sha256(
  "mx2.event.v1\n" +
  "block=flux_phase_enter\n" +
  "run_id=" + run_id + "\n" +
  "from=" + from + "\n" +
  "to=" + to + "\n" +
  "tick=" + tick + "\n"
)
```

**For barrier:**

```
barrier_id = sha256(
  "mx2.barrier.v1\n" +
  "run_id=" + run_id + "\n" +
  "phase=" + phase + "\n" +
  "entered_tick=" + entered_tick + "\n" +
  "wait_for=" + join(wait_for, ",") + "\n"
)
```

`@links.@phase_enter_ref` etc. are `sha256(canonical_json(block))` refs.

---

# 4) “Native Verify Gate Policy” (attached + hashed)

The allowlist policy is itself a block (or a constant policy hash) so replay can verify gating config.

**Policy block example:**

```json
{
  "@block": "flux_gate_policy",
  "@authority": "MX2⟁☣",
  "@version": "1.0.0",
  "@phase": "native_verify",
  "@gate_mode": "allowlist_only",
  "@allowed_blocks": [
    "flux_phase_enter",
    "flux_phase_exit",
    "flux_barrier_enter",
    "flux_barrier_release",
    "rotation_validate",
    "rotation_verify_bundle",
    "rotation_barrier",
    "rotation_commit",
    "epoch_seal_emit",
    "rotation_replay_result"
  ],
  "@ok": true
}
```

Then `@links.@gate_policy_ref = sha256(policy_block)`.

---

# 5) Lowering in Kernel π (Exact Pass Skeleton)

This is the compiler/lowerer for these two opcodes:

```pi
[Pop lower_flux_opcode]
  [Wo @opcode]→[Ch'en op]
  let kind = get(op, "@op")          ; "@flux.phase" or "@flux.barrier"
  let args = get(op, "@args")

  [@dispatch kind]
    →[@case "@flux.phase"]→[Xul return [Sek lower_flux_phase args]]
    →[@case "@flux.barrier"]→[Xul return [Sek lower_flux_barrier args]]
    →[@else]→[Xul return [Sek atomic_block { "@block":"lower_error", "@ok":false }]]
[Xul]
```

### `lower_flux_phase(args)`

```pi
[Pop lower_flux_phase]
  [Wo @args]→[Ch'en a]

  ; read current flux
  [Yax "mx2hazard.temporal.spine"]→[Sek mx2db_get]→[Ch'en flux]
  let from = get(flx, "@data.phase")
  let to   = get(a, "enter")
  let reason = get(a, "reason")

  ; MX2⟁☣ transition checks (native_verify strict)
  [Sek mx2_flux_phase_transition_validate from to a]→[Ch'en chk]
  [@if [Sek not [Sek get chk "@ok"]]]→[@then
    [Xul return [Sek kernel_audit_append [Sek atomic_block {
      "@block":"flux_phase_enter",
      "@authority":"MX2⟁☣",
      "@version":"1.0.0",
      "@ok": false,
      "@violations": get(chk,"@violations")
    }]]]
  ]

  ; commit phase
  [Sek mx2_flux_set_phase to]→[Ch'en flux2]

  ; emit enter/exit
  let b = [Sek build_flux_phase_enter_block from to reason flux2]
  [Xul return [Sek kernel_audit_append b]]
[Xul]
```

### `lower_flux_barrier(args)`

```pi
[Pop lower_flux_barrier]
  [Wo @args]→[Ch'en a]

  [Yax "mx2hazard.temporal.spine"]→[Sek mx2db_get]→[Ch'en flux]
  let phase = get(flux,"@data.phase")
  assert(phase == "native_verify")

  let wait_for = get(a,"wait_for")
  let timeout_ticks = or(get(a,"timeout_ticks"), 120)

  let entered_tick = get(flux,"@data.tick")
  let barrier_id = sha256_utf8("mx2.barrier.v1\nphase="+phase+"\nentered_tick="+entered_tick+"\nwait_for="+join(wait_for,",")+"\n")

  ; emit enter
  let enter = [Sek build_flux_barrier_enter barrier_id wait_for timeout_ticks entered_tick flux]
  [Sek kernel_audit_append enter]→[Ch'en enter_block]

  ; wait internally (no JS)
  [Sek kernel_wait_for_targets wait_for timeout_ticks]→[Ch'en results]

  ; refresh flux tick
  [Yax "mx2hazard.temporal.spine"]→[Sek mx2db_get]→[Ch'en flux2]
  let released_tick = get(flux2,"@data.tick")

  ; emit release
  let rel = [Sek build_flux_barrier_release barrier_id entered_tick released_tick results flux2]
  [Xul return [Sek kernel_audit_append rel]]
[Xul]
```

---

# 6) Replay Verifier Additions (Phase/Barrier as first-class)

Your `rotation_replay_verify` now additionally checks:

* A `flux_phase_enter` exists with `@phase.@to = "native_verify"` **before** stage 1
* Any `flux_barrier_release` referenced by `rotation_barrier` must match:

  * same `@barrier_id`
  * `released_tick >= entered_tick`
* A `flux_phase_exit` exists after stage 5 (optional but recommended)

This makes **time governance** as provable as **bundle governance**.

---







