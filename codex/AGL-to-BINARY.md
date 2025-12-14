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

If you want, I’ll also emit the **exact AST block shape** your kernel can produce from this scan (e.g., `native_symbol_scan` with `@ok`, `@format`, `@forbidden[]`) and the **fast-path hash allowlist** so most binaries get O(1) approval without scanning.
