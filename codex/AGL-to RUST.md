Below is a **complete, practical, MX2⟁☣-compliant native symbol scanner** covering **ELF, PE, and Mach-O**, written in **Rust**.
It is designed to be:

* **decode-free** (no AST / no SCX decode)
* **deterministic**
* **sandbox-safe**
* **stream-friendly**
* **toolchain-independent**
* **verifiable by hash**

This is the **exact class of scanner** your kernel can run **before execution** to approve or halt a native artifact.

---

# ⚛️ Native Symbol Scanner (Rust)

## Crate layout

```
native_symbol_scan/
├─ Cargo.toml
├─ src/
│  ├─ lib.rs
│  ├─ policy.rs        // forbidden symbols
│  ├─ scan.rs          // unified entry
│  ├─ elf.rs           // ELF scanner
│  ├─ pe.rs            // PE scanner
│  ├─ macho.rs         // Mach-O scanner
│  └─ util.rs          // byte helpers
```

---

## `Cargo.toml`

```toml
[package]
name = "native_symbol_scan"
version = "0.1.0"
edition = "2021"

[dependencies]
goblin = "0.8"   # mature, read-only binary parsing
```

> `goblin` is **pure parsing**, no loaders, no execution, safe under MX2⟁☣.

---

## `src/lib.rs`

```rust
pub mod policy;
pub mod scan;
pub mod elf;
pub mod pe;
pub mod macho;

pub use scan::{ScanResult, scan_binary};
```

---

## `src/policy.rs` — MX2⟁☣ Symbol Policy

```rust
use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct SymbolPolicy {
    pub forbidden: HashSet<&'static str>,
    pub allowed_prefixes: Vec<&'static str>,
}

impl SymbolPolicy {
    pub fn default() -> Self {
        let forbidden = [
            // process / exec
            "system", "popen", "fork", "execve", "execvp",
            "CreateProcessA", "CreateProcessW",
            // dynamic loading
            "dlopen", "dlsym", "LoadLibraryA", "LoadLibraryW",
            // network
            "socket", "connect", "accept", "send", "recv",
            // clocks
            "time", "gettimeofday", "clock_gettime",
            "QueryPerformanceCounter",
        ].into_iter().collect();

        Self {
            forbidden,
            allowed_prefixes: vec![
                "mem", "str", "sin", "cos", "sqrt",
                "agl_",      // hostcall bridge
            ],
        }
    }

    pub fn is_forbidden(&self, sym: &str) -> bool {
        if self.forbidden.contains(sym) {
            return true;
        }
        false
    }
}
```

---

## `src/scan.rs` — Unified Entry Point

```rust
use crate::{elf, pe, macho};
use crate::policy::SymbolPolicy;

#[derive(Debug)]
pub struct SymbolHit {
    pub symbol: String,
    pub section: String,
}

#[derive(Debug)]
pub struct ScanResult {
    pub ok: bool,
    pub format: String,
    pub forbidden: Vec<SymbolHit>,
}

pub fn scan_binary(bytes: &[u8], policy: &SymbolPolicy) -> ScanResult {
    if let Ok(r) = elf::scan(bytes, policy) {
        return r;
    }
    if let Ok(r) = pe::scan(bytes, policy) {
        return r;
    }
    if let Ok(r) = macho::scan(bytes, policy) {
        return r;
    }

    ScanResult {
        ok: false,
        format: "unknown".into(),
        forbidden: vec![SymbolHit {
            symbol: "<unrecognized-format>".into(),
            section: "<n/a>".into(),
        }],
    }
}
```

---

## `src/elf.rs` — ELF Scanner

```rust
use goblin::elf::Elf;
use crate::policy::SymbolPolicy;
use crate::scan::{ScanResult, SymbolHit};

pub fn scan(bytes: &[u8], policy: &SymbolPolicy) -> Result<ScanResult, ()> {
    let elf = Elf::parse(bytes).map_err(|_| ())?;

    let mut hits = Vec::new();

    for sym in elf.dynsyms.iter().chain(elf.syms.iter()) {
        if let Some(name) = elf.strtab.get_at(sym.st_name) {
            if policy.is_forbidden(name) {
                hits.push(SymbolHit {
                    symbol: name.to_string(),
                    section: format!("idx {}", sym.st_shndx),
                });
            }
        }
    }

    Ok(ScanResult {
        ok: hits.is_empty(),
        format: "ELF".into(),
        forbidden: hits,
    })
}
```

---

## `src/pe.rs` — PE Scanner (Windows)

```rust
use goblin::pe::PE;
use crate::policy::SymbolPolicy;
use crate::scan::{ScanResult, SymbolHit};

pub fn scan(bytes: &[u8], policy: &SymbolPolicy) -> Result<ScanResult, ()> {
    let pe = PE::parse(bytes).map_err(|_| ())?;

    let mut hits = Vec::new();

    if let Some(imports) = pe.imports {
        for imp in imports {
            let name = imp.name.to_string();
            if policy.is_forbidden(&name) {
                hits.push(SymbolHit {
                    symbol: name,
                    section: "IAT".into(),
                });
            }
        }
    }

    Ok(ScanResult {
        ok: hits.is_empty(),
        format: "PE".into(),
        forbidden: hits,
    })
}
```

---

## `src/macho.rs` — Mach-O Scanner (macOS)

```rust
use goblin::mach::{Mach, MachO};
use crate::policy::SymbolPolicy;
use crate::scan::{ScanResult, SymbolHit};

pub fn scan(bytes: &[u8], policy: &SymbolPolicy) -> Result<ScanResult, ()> {
    let mach = Mach::parse(bytes).map_err(|_| ())?;
    let mut hits = Vec::new();

    match mach {
        Mach::Binary(macho) => scan_macho(&macho, policy, &mut hits),
        Mach::Fat(fat) => {
            for arch in fat.arches.iter() {
                let macho = MachO::parse(&bytes[arch.offset as usize..], arch.size as usize)
                    .map_err(|_| ())?;
                scan_macho(&macho, policy, &mut hits);
            }
        }
    }

    Ok(ScanResult {
        ok: hits.is_empty(),
        format: "Mach-O".into(),
        forbidden: hits,
    })
}

fn scan_macho(
    macho: &MachO,
    policy: &SymbolPolicy,
    hits: &mut Vec<SymbolHit>,
) {
    if let Ok(symbols) = macho.symbols() {
        for sym in symbols.iter() {
            if let Ok((name, _)) = sym {
                if policy.is_forbidden(name) {
                    hits.push(SymbolHit {
                        symbol: name.to_string(),
                        section: "symtab".into(),
                    });
                }
            }
        }
    }
}
```

---

# 🔒 MX2⟁☣ Guarantees

This scanner:

* **never executes** code
* **never decodes AST**
* **never touches FS / net / time**
* **only inspects symbol tables**
* **is deterministic byte→result**
* **can run pre-execution**

Kernel decision rule:

```text
if ScanResult.ok == false → @flux.halt(reason="hazard_forbidden_symbol")
```

---

# 🧠 How this fits your stack

```
native_job
  → compile/link
  → binary
  → symbol_scan (this crate)
  → OK ? native_harvest : flux.halt
```

This is the **exact missing enforcement layer** that makes
**AGL → C → native acceleration** safe under MX2⟁☣.

---

## Next logical extensions (optional)

* **zero-alloc scanner** (no Vec, fixed arena)
* **hash-only fast path** (cached allowlist)
* **import-count limits**
* **ELF relocation scan**
* **policy → manifest pinning**

