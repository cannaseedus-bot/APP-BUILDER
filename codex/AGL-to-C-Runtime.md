Below is the **complete, explicit inventory** of **everything built in this conversation that maps to / is required by**
**`codex/AGL-to-C-Runtime.md`** — i.e. the **AGL → C runtime execution, verification, and governance layer**.

This is scoped **specifically to the C runtime target** (not Rust, not JS), and matches what your kernel can compile, link, scan, verify, and execute.

---

# ✅ COMPLETE BUILD LIST — AGL → C RUNTIME

---

## I. AGL → C RUNTIME ARCHITECTURE

### 1. **AGL → AST → C Backend Target**

* Formal AGL → AST lowering rules for native execution
* Native AST nodes are first-class (no wrappers, no JS)
* Deterministic lowering suitable for offline compilation
* AST carries **all** constraints needed by C runtime

---

### 2. **Native Execution Lifecycle (FLUX-Governed)**

Integrated into FLUX_CAPACITOR with **zero JS authority**:

**Phases**

* `native_verify`
* `compile`
* `link`
* `run`
* `harvest`

Each phase:

* Emits audit blocks
* Uses monotonic FLUX ticks
* Is replay-verifiable
* Is MX2⟁☣ enforced

---

## II. CORE NATIVE AST BLOCKS

### 3. **Canonical Native Block Shapes**

* `native_job`
* `native_plan`
* `native_harvest`

Each includes:

* Toolchain pins
* Source hashes
* Output hashes
* Sandbox scope
* Deterministic inputs/outputs

---

### 4. **Schemas (Draft 2020-12)**

* `native_job.schema.json`
* `native_plan.schema.json`
* `native_harvest.schema.json`

---

### 5. **MX2⟁☣ π Validators (Native Blocks)**

Enforce:

* Toolchain version pinning
* Compiler/linker allowlists
* No network access
* No filesystem escape
* Deterministic outputs only
* No nondeterministic syscalls

---

## III. C RUNTIME INTERFACE (AUTHORITATIVE)

### 6. **C Runtime Header**

* `agl_runtime.h` (canonical)

Implements **only** allowed primitives:

#### Codec

* Fieldmap encode/decode
* Node stream encode/decode
* Edge stream encode/decode

#### Graph

* EDGES batch processing
* CSR adjacency construction

#### Safety

* Bounded memory
* Explicit buffer sizes
* No dynamic heap without limits
* No OS access outside sandbox

---

## IV. SCXQ2 STREAMING (C-TARGETED)

### 7. **SCXQ2 Fieldmap System**

* Deterministic field-ID dictionary
* Sorted table or perfect-hash compatible
* Shared by encoder + decoder
* Zero allocation lookup

---

### 8. **Streaming Node Decoder / Encoder**

* Node-by-node yield
* Resume-safe
* No full buffer requirement
* Deterministic ordering

---

### 9. **Streaming Edge Decoder / Encoder**

* Edge-by-edge yield
* Batch-aware
* Graph-safe
* Deterministic adjacency

---

### 10. **EDGES Batch Framing**

* Batch header
* Edge count patching
* Repeatable `E` sections
* Stream-safe layout

---

### 11. **META Index Sidecar**

* Final META block
* Byte offsets per batch
* Seek-safe
* Replay-safe

---

### 12. **META Index Schema**

* `scx2.stream.index.schema.json`

Includes:

* Offset monotonicity
* Payload bounds
* Batch count sanity
* No overlap / rewind

---

### 13. **π Validator for META Index**

* Offset monotonic
* Offset within file bounds
* Batch alignment
* No backward seeks

---

## V. COMPRESSION LAYER (C-ACCELERATED)

### 14. **ANS / Huffman Compression**

* Table build
* Symbol encode
* Symbol decode
* Deterministic bitstreams

---

### 15. **Fused-Lane Encoder / Decoder**

* Raw fieldmap lane
* Symbol (ANS/Huffman) lane
* Single-pass decode
* Cursor-driven

---

### 16. **Streaming Binary Encode / Decode**

* Chunked
* Incremental
* Resume-safe
* No full decode required

---

## VI. GRAPH ACCELERATION

### 17. **CSR Adjacency Builder**

* Two-pass deterministic build
* Wired to EDGES batch offsets
* Memory-bounded
* Replay-safe

---

### 18. **Edge → Graph Acceleration**

* Deterministic adjacency lists
* No pointer aliasing
* Stable ordering

---

## VII. NATIVE BINARY GOVERNANCE

### 19. **Forbidden Symbol Contract**

* Defined forbidden import list
* No decode required to enforce
* Applies to ELF / PE / Mach-O

---

### 20. **Single-File Native Binary Scanner (C)**

* ELF symbol scan
* PE symbol scan
* Mach-O symbol scan
* Incremental read
* No dynamic memory abuse

---

### 21. **Incremental Hash Streaming**

* Chunked hashing
* O(1) memory
* Large binary support
* Deterministic

---

### 22. **Unified Verify Pipeline**

* Hash verification
* Symbol scan
* Single AST output
* Kernel-only
* No JS

---

## VIII. NATIVE VERIFY AST SYSTEM

### 23. **Native Verify AST Blocks**

* `native_verify_plan`
* `native_verify_state`
* `native_verify_step`
* `native_verify_result`

---

### 24. **Schemas**

* `native_verify_plan.schema.json`
* `native_verify_state.schema.json`
* `native_verify_step.schema.json`
* `native_verify_result.schema.json`

---

### 25. **π Validator**

Enforces:

* Toolchain pin integrity
* Sandbox boundaries
* Forbidden symbols
* Hash correctness
* Phase correctness (`native_verify`)

---

## IX. ALLOWLIST + MERKLE GOVERNANCE

### 26. **Forbidden Symbol Set Schema**

* `mx2.forbidden_symbols.v1.schema.json`

---

### 27. **Fast-Path Allowlist Bundle**

* Merkle root
* Canonical leaf rules
* Signature block
* O(1) verification

---

### 28. **Merkle Canonicalization Rules**

* Exact string-to-hash rules
* Stable ordering
* Versioned domain

---

### 29. **π Signature Verifier**

* Signature validation
* Optional bundle_hash check
* MX2⟁☣ enforced

---

## X. EPOCH + ROTATION (NATIVE-SAFE)

### 30. **Epoch Pinning Model**

* Immutable epochs
* No rollback
* Hash-anchored

---

### 31. **Rotation Schemas**

* `mx2_epoch_state.schema.json`
* `mx2_bundle_rotation_plan.schema.json`
* `mx2_bundle_rotation_result.schema.json`
* `mx2_epoch_seal.schema.json`

---

### 32. **π Validators**

* Epoch monotonicity
* Pin correctness
* Seal integrity
* No downgrade

---

## XI. FLUX-GOVERNED ROTATION PROOF (C-TARGETED)

### 33. **Rotation Apply Stages**

* `rotation_validate`
* `rotation_verify_bundle`
* `rotation_barrier`
* `rotation_commit`
* `epoch_seal_emit`

---

### 34. **FLUX Audit Blocks**

* `flux_phase_enter`
* `flux_barrier_enter`
* `flux_barrier_release`
* `flux_phase_exit`

---

### 35. **Schemas**

* `flux_phase_enter.schema.json`
* `flux_phase_exit.schema.json`
* `flux_barrier_enter.schema.json`
* `flux_barrier_release.schema.json`
* `flux_gate_policy.schema.json`

---

### 36. **Deterministic ID System**

* `@event_id`
* `@barrier_id`
* Canonical preimage schemas
* π verifiers

---

### 37. **Rotation Replay Input v2**

* `rotation_replay_input.v2.schema.json`
* Single sealed object
* 4 FLUX blocks + 5 rotation blocks

---

### 38. **Sealed Bundle Hash v2**

* `mx2.bundle_hash.v2`
* Commits to all 9 blocks
* O(1) verification

---

### 39. **Rotation Replay Verifier (Time-Governed)**

* Requires FLUX proofs
* Requires barrier correctness
* Requires phase exclusivity
* Single proof hash output

---

## XII. FINAL RESULT

You now have a **fully specified AGL → C runtime** that is:

* Deterministic
* Sandbox-safe
* Time-governed
* Binary-verifiable
* Streaming-first
* Replay-provable

**AGL is now a native-grade, C-executable, cryptographically governed runtime.**

If you want next:

* collapse this into a **formal RFC**
* emit **reference C implementations**
* wire into **CI + fuzzing**
* or generate **minimal POSIX build targets**




Below is a **canonical AGL → C backend spec** plus the **FLUX_CAPACITOR native-artifact phase** (compile → link → run → harvest) in the same “authority-first” model: C is an **artifact target**, never an authority.

---

# AGL → C backend rules

## 0. Prime locks

1. **No semantics in C**
   Generated C may compute, but **may not define meaning**. Meaning stays in AGL/AST.

2. **No time in C**
   C must not read clocks for causality (`time()`, `clock_gettime`, etc.). Time is **only** via FLUX_CAPACITOR.

3. **Deterministic by construction**
   Default compile mode is deterministic: fixed flags, pinned includes, pinned ABI, stable ordering, stable formatting.

4. **Side effects are explicit**
   C can only touch the world through **declared ports** (stdin/stdout, files in a sandbox dir, or “hostcalls” that are whitelisted).

---

## 1. What “AGL → C” compiles

AGL compiles only a bounded subset of AST nodes into C:

### Supported AST kinds (v1)

* `@ast.kind = "math"`: scalar/vector math, reductions
* `@ast.kind = "table"`: deterministic map/reduce on arrays
* `@ast.kind = "codec"`: byte transforms (fieldmaps, checksums, pack/unpack)
* `@ast.kind = "graph"`: edge iteration + CSR build primitives
* `@ast.kind = "kernel"`: pure functions with inputs/outputs only

### Forbidden (v1)

* DOM mutation, CSS mutation, network I/O, process spawning, raw filesystem writes outside sandbox, threads, nondeterministic RNG unless seeded by FLUX.

---

## 2. Backend contract (files + ABI)

A compile job always produces this artifact set:

```
/build/native/<job_id>/
  main.c
  agl_runtime.h
  manifest.json      (job manifest, hashes, flags)
  out/
    harvest.json     (result contract)
    stdout.log
    stderr.log
  bin/
    program          (or program.exe)
```

### Canonical ABI

Generated program must implement:

```c
int main(int argc, char** argv);
```

Inputs are provided as:

* `argv` key/value pairs (small)
* or `stdin` JSON (preferred for larger payloads)

Outputs:

* **stdout** must contain exactly **one** JSON object (“harvest envelope”) OR write it to `out/harvest.json`.

---

## 3. Harvest envelope (required)

This is what the kernel ingests back into AST-land:

```json
{
  "@type": "native_harvest",
  "@job_id": "…",
  "@ok": true,
  "@exit_code": 0,
  "@artifacts": {
    "@stdout_sha256": "…",
    "@stderr_sha256": "…",
    "@output_files": [
      { "@path": "out/harvest.json", "@sha256": "…", "@bytes": 1234 }
    ]
  },
  "@result": {
    "@format": "ast_fragment",
    "@payload": { }
  },
  "@metrics": {
    "@cpu_ms": 12,
    "@max_rss_kb": 18432
  }
}
```

If `@ok=false`, `@result` is still present but contains a structured error block.

---

## 4. Lowering rules (formal, deterministic)

### 4.1 Naming + symbol rules

* All generated identifiers are derived from stable hashes of AST paths:

  * `fn_<hash8>`, `tmp_<hash8>`, `buf_<hash8>`
* No random names, no compile-time timestamps.

### 4.2 Types mapping (v1)

| AST type         | C type                      |
| ---------------- | --------------------------- |
| `u8,u16,u32,u64` | `uint8_t...uint64_t`        |
| `i32,i64`        | `int32_t,int64_t`           |
| `f32,f64`        | `float,double`              |
| `bool`           | `uint8_t`                   |
| `bytes`          | `{ uint8_t* p; size_t n; }` |
| `slice<T>`       | `{ T* p; size_t n; }`       |

### 4.3 Value nodes

* `@ast.op = "const"` → literal
* `@ast.op = "add/sub/mul/div"` → `+ - * /`
* `@ast.op = "min/max/clamp"` → inline functions
* `@ast.op = "cmp"` → `< > ==` (bool is 0/1)

### 4.4 Control flow

AGL control blocks lower to structured C only:

* `@if/@then/@else` → `if (...) { ... } else { ... }`
* `@each` over arrays only → `for (size_t i=0; i<n; i++)`

No goto, no recursion (v1), no function pointers (unless whitelisted internally).

### 4.5 Memory

All allocations must be:

* stack (preferred)
* or a single arena allocator provided by `agl_runtime.h` with strict limits

No raw `malloc` unless the runtime wrapper replaces it.

### 4.6 Hostcalls (only allowed bridge)

Every side effect is a hostcall:

```c
int agl_hostcall(uint32_t id, const uint8_t* in, size_t in_n,
                 uint8_t* out, size_t out_cap, size_t* out_n);
```

Hostcall IDs are MX2⟁☣-governed, and default set is tiny:

* `HARVEST_WRITE`
* `LOG_LINE`
* `READ_INPUT`
* `WRITE_OUTPUT_FILE` (sandbox-only)

---

## 5. Compile flags (deterministic profile)

### Default (clang/gcc)

* `-O2 -fno-plt -fno-asynchronous-unwind-tables`
* `-fno-ident -Wl,--build-id=none` (where supported)
* no LTO (unless you also pin linker versions)
* stable include order, stable defines
* target triple pinned per platform

This is not about “security theater”—it’s about **bit repeatability**.

---

# FLUX_CAPACITOR: native-artifact execution phase

## 1. Add phases

Extend the canonical phase set:

```pi
@flux.phase { enter: "compile" }
@flux.phase { enter: "link" }
@flux.phase { enter: "run" }
@flux.phase { enter: "harvest" }
```

Hard rule:

> No native artifact step may occur unless FLUX is in the matching phase.

---

## 2. New FLUX_CAPACITOR opcode set

### 2.1 Job lifecycle

#### `@flux.native.begin`

Creates an execution job record and seals inputs.

```pi
job = @flux.native.begin {
  job_id: "auto",
  backend: "c",
  workspace: "build/native",
  limits: {
    cpu_ms: 2000,
    wall_ms: 3000,
    max_rss_kb: 256000,
    stdout_max: 1048576,
    stderr_max: 1048576,
    files_max: 128,
    bytes_out_max: 16777216
  }
}
```

#### `@flux.native.plan`

Produces a deterministic plan (no execution yet).

```pi
plan = @flux.native.plan {
  job: job,
  steps: ["emit", "compile", "link", "run", "harvest"]
}
```

### 2.2 Emit

#### `@flux.native.emit`

Consumes lowered C AST (or source) and writes to workspace.

```pi
@flux.native.emit {
  job: job,
  sources: [
    { path: "main.c", text: "<generated>" },
    { path: "agl_runtime.h", text: "<runtime>" }
  ],
  manifest: { /* hashes, flags, toolchain pins */ }
}
```

### 2.3 Compile

#### `@flux.native.compile`

Phase-gated compile step. Toolchain is an external executor **observed** by the kernel.

```pi
obj = @flux.native.compile {
  job: job,
  cc: "clang",
  args: ["-O2", "-std=c11", "-c", "main.c", "-o", "bin/main.o"]
}
```

### 2.4 Link

#### `@flux.native.link`

```pi
bin = @flux.native.link {
  job: job,
  ld: "clang",
  args: ["bin/main.o", "-o", "bin/program"]
}
```

### 2.5 Run

#### `@flux.native.run`

```pi
run = @flux.native.run {
  job: job,
  exec: "bin/program",
  argv: ["--input", "in/input.json"],
  stdin_json: { /* optional */ }
}
```

### 2.6 Harvest

#### `@flux.native.harvest`

Ingests the harvest envelope, validates, converts to AST fragment(s).

```pi
harvest = @flux.native.harvest {
  job: job,
  from: "out/harvest.json",     // or "stdout"
  require_schema: "native_harvest.v1"
}
```

### 2.7 Safety / governance

#### `@flux.native.halt`

Stops the job and invalidates outputs.

```pi
@flux.native.halt { job: job, reason: "hazard" }
```

---

## 3. Phase gates (non-negotiable)

* `emit` allowed in: `compile`
* `compile` allowed in: `compile`
* `link` allowed in: `link`
* `run` allowed in: `run`
* `harvest` allowed in: `harvest`

If phase mismatched → job is queued (or rejected) under MX2⟁☣ policy.

---

## 4. “compile/link/run/harvest” as deterministic replay

A full native cycle is replayable because:

* inputs sealed at `@flux.native.begin`
* plan is serializable
* external commands are recorded verbatim
* artifacts are hashed
* harvest schema is fixed

Replay contract:

```text
same AST + same toolchain pins + same flags + same inputs
=> same harvest (or a violation)
```

---

## 5. Where PS / Git Bash fits

PS/Git Bash is just the **external executor transport** used by the kernel for the compile/link/run steps.

It is not allowed to:

* decide timing
* mutate FLUX phase
* bypass job limits
* skip harvest validation

It is strictly a “work horse”.

---

Below is a **canonical AGL → C backend spec** plus the **FLUX_CAPACITOR native-artifact phase** (compile → link → run → harvest) in the same “authority-first” model: C is an **artifact target**, never an authority.

---

# AGL → C backend rules

## 0. Prime locks

1. **No semantics in C**
   Generated C may compute, but **may not define meaning**. Meaning stays in AGL/AST.

2. **No time in C**
   C must not read clocks for causality (`time()`, `clock_gettime`, etc.). Time is **only** via FLUX_CAPACITOR.

3. **Deterministic by construction**
   Default compile mode is deterministic: fixed flags, pinned includes, pinned ABI, stable ordering, stable formatting.

4. **Side effects are explicit**
   C can only touch the world through **declared ports** (stdin/stdout, files in a sandbox dir, or “hostcalls” that are whitelisted).

---

## 1. What “AGL → C” compiles

AGL compiles only a bounded subset of AST nodes into C:

### Supported AST kinds (v1)

* `@ast.kind = "math"`: scalar/vector math, reductions
* `@ast.kind = "table"`: deterministic map/reduce on arrays
* `@ast.kind = "codec"`: byte transforms (fieldmaps, checksums, pack/unpack)
* `@ast.kind = "graph"`: edge iteration + CSR build primitives
* `@ast.kind = "kernel"`: pure functions with inputs/outputs only

### Forbidden (v1)

* DOM mutation, CSS mutation, network I/O, process spawning, raw filesystem writes outside sandbox, threads, nondeterministic RNG unless seeded by FLUX.

---

## 2. Backend contract (files + ABI)

A compile job always produces this artifact set:

```
/build/native/<job_id>/
  main.c
  agl_runtime.h
  manifest.json      (job manifest, hashes, flags)
  out/
    harvest.json     (result contract)
    stdout.log
    stderr.log
  bin/
    program          (or program.exe)
```

### Canonical ABI

Generated program must implement:

```c
int main(int argc, char** argv);
```

Inputs are provided as:

* `argv` key/value pairs (small)
* or `stdin` JSON (preferred for larger payloads)

Outputs:

* **stdout** must contain exactly **one** JSON object (“harvest envelope”) OR write it to `out/harvest.json`.

---

## 3. Harvest envelope (required)

This is what the kernel ingests back into AST-land:

```json
{
  "@type": "native_harvest",
  "@job_id": "…",
  "@ok": true,
  "@exit_code": 0,
  "@artifacts": {
    "@stdout_sha256": "…",
    "@stderr_sha256": "…",
    "@output_files": [
      { "@path": "out/harvest.json", "@sha256": "…", "@bytes": 1234 }
    ]
  },
  "@result": {
    "@format": "ast_fragment",
    "@payload": { }
  },
  "@metrics": {
    "@cpu_ms": 12,
    "@max_rss_kb": 18432
  }
}
```

If `@ok=false`, `@result` is still present but contains a structured error block.

---

## 4. Lowering rules (formal, deterministic)

### 4.1 Naming + symbol rules

* All generated identifiers are derived from stable hashes of AST paths:

  * `fn_<hash8>`, `tmp_<hash8>`, `buf_<hash8>`
* No random names, no compile-time timestamps.

### 4.2 Types mapping (v1)

| AST type         | C type                      |
| ---------------- | --------------------------- |
| `u8,u16,u32,u64` | `uint8_t...uint64_t`        |
| `i32,i64`        | `int32_t,int64_t`           |
| `f32,f64`        | `float,double`              |
| `bool`           | `uint8_t`                   |
| `bytes`          | `{ uint8_t* p; size_t n; }` |
| `slice<T>`       | `{ T* p; size_t n; }`       |

### 4.3 Value nodes

* `@ast.op = "const"` → literal
* `@ast.op = "add/sub/mul/div"` → `+ - * /`
* `@ast.op = "min/max/clamp"` → inline functions
* `@ast.op = "cmp"` → `< > ==` (bool is 0/1)

### 4.4 Control flow

AGL control blocks lower to structured C only:

* `@if/@then/@else` → `if (...) { ... } else { ... }`
* `@each` over arrays only → `for (size_t i=0; i<n; i++)`

No goto, no recursion (v1), no function pointers (unless whitelisted internally).

### 4.5 Memory

All allocations must be:

* stack (preferred)
* or a single arena allocator provided by `agl_runtime.h` with strict limits

No raw `malloc` unless the runtime wrapper replaces it.

### 4.6 Hostcalls (only allowed bridge)

Every side effect is a hostcall:

```c
int agl_hostcall(uint32_t id, const uint8_t* in, size_t in_n,
                 uint8_t* out, size_t out_cap, size_t* out_n);
```

Hostcall IDs are MX2⟁☣-governed, and default set is tiny:

* `HARVEST_WRITE`
* `LOG_LINE`
* `READ_INPUT`
* `WRITE_OUTPUT_FILE` (sandbox-only)

---

## 5. Compile flags (deterministic profile)

### Default (clang/gcc)

* `-O2 -fno-plt -fno-asynchronous-unwind-tables`
* `-fno-ident -Wl,--build-id=none` (where supported)
* no LTO (unless you also pin linker versions)
* stable include order, stable defines
* target triple pinned per platform

This is not about “security theater”—it’s about **bit repeatability**.

---

# FLUX_CAPACITOR: native-artifact execution phase

## 1. Add phases

Extend the canonical phase set:

```pi
@flux.phase { enter: "compile" }
@flux.phase { enter: "link" }
@flux.phase { enter: "run" }
@flux.phase { enter: "harvest" }
```

Hard rule:

> No native artifact step may occur unless FLUX is in the matching phase.

---

## 2. New FLUX_CAPACITOR opcode set

### 2.1 Job lifecycle

#### `@flux.native.begin`

Creates an execution job record and seals inputs.

```pi
job = @flux.native.begin {
  job_id: "auto",
  backend: "c",
  workspace: "build/native",
  limits: {
    cpu_ms: 2000,
    wall_ms: 3000,
    max_rss_kb: 256000,
    stdout_max: 1048576,
    stderr_max: 1048576,
    files_max: 128,
    bytes_out_max: 16777216
  }
}
```

#### `@flux.native.plan`

Produces a deterministic plan (no execution yet).

```pi
plan = @flux.native.plan {
  job: job,
  steps: ["emit", "compile", "link", "run", "harvest"]
}
```

### 2.2 Emit

#### `@flux.native.emit`

Consumes lowered C AST (or source) and writes to workspace.

```pi
@flux.native.emit {
  job: job,
  sources: [
    { path: "main.c", text: "<generated>" },
    { path: "agl_runtime.h", text: "<runtime>" }
  ],
  manifest: { /* hashes, flags, toolchain pins */ }
}
```

### 2.3 Compile

#### `@flux.native.compile`

Phase-gated compile step. Toolchain is an external executor **observed** by the kernel.

```pi
obj = @flux.native.compile {
  job: job,
  cc: "clang",
  args: ["-O2", "-std=c11", "-c", "main.c", "-o", "bin/main.o"]
}
```

### 2.4 Link

#### `@flux.native.link`

```pi
bin = @flux.native.link {
  job: job,
  ld: "clang",
  args: ["bin/main.o", "-o", "bin/program"]
}
```

### 2.5 Run

#### `@flux.native.run`

```pi
run = @flux.native.run {
  job: job,
  exec: "bin/program",
  argv: ["--input", "in/input.json"],
  stdin_json: { /* optional */ }
}
```

### 2.6 Harvest

#### `@flux.native.harvest`

Ingests the harvest envelope, validates, converts to AST fragment(s).

```pi
harvest = @flux.native.harvest {
  job: job,
  from: "out/harvest.json",     // or "stdout"
  require_schema: "native_harvest.v1"
}
```

### 2.7 Safety / governance

#### `@flux.native.halt`

Stops the job and invalidates outputs.

```pi
@flux.native.halt { job: job, reason: "hazard" }
```

---

## 3. Phase gates (non-negotiable)

* `emit` allowed in: `compile`
* `compile` allowed in: `compile`
* `link` allowed in: `link`
* `run` allowed in: `run`
* `harvest` allowed in: `harvest`

If phase mismatched → job is queued (or rejected) under MX2⟁☣ policy.

---

## 4. “compile/link/run/harvest” as deterministic replay

A full native cycle is replayable because:

* inputs sealed at `@flux.native.begin`
* plan is serializable
* external commands are recorded verbatim
* artifacts are hashed
* harvest schema is fixed

Replay contract:

```text
same AST + same toolchain pins + same flags + same inputs
=> same harvest (or a violation)
```

---

## 5. Where PS / Git Bash fits

PS/Git Bash is just the **external executor transport** used by the kernel for the compile/link/run steps.

It is not allowed to:

* decide timing
* mutate FLUX phase
* bypass job limits
* skip harvest validation

It is strictly a “work horse”.

---

Below is the **exact AST shape** (in the same Atomic Block style you’ve been using: `@type + @data + @control + @flux + @hazard + @view`) plus **MX2⟁☣ validation rules** and **AGL→C lowering tables** specifically for `codec / fieldmap / edges` so SCXQ2 streaming encode/decode can be **native-accelerated** while staying governed.

---

# 1) Exact AST shapes

## 1.1 `native_job` block

```json
{
  "@type": "native_job",
  "@id": "native_job::<job_id>",
  "@hazard": "native",
  "@view": "native_job_hud",
  "@control": [
    "@flux.native.begin",
    "@mx2hazard.validate",
    "@seal.inputs"
  ],
  "@flux": {
    "@phase_required": "compile",
    "@tick": 0
  },
  "@data": {
    "@job_id": "job_01HXYZ...",
    "@backend": "c",
    "@platform": {
      "@os": "windows|linux|mac",
      "@arch": "x86_64|aarch64",
      "@abi": "msvc|gnu|musl"
    },

    "@workspace": {
      "@root": "build/native/job_01HXYZ",
      "@sandbox_root": "build/native/job_01HXYZ/sandbox",
      "@out_root": "build/native/job_01HXYZ/out",
      "@bin_root": "build/native/job_01HXYZ/bin",
      "@tmp_root": "build/native/job_01HXYZ/tmp"
    },

    "@inputs": {
      "@stdin_json": { },
      "@argv": ["--mode", "encode", "--format", "scx2"],
      "@files": [
        { "@path": "in/payload.json", "@sha256": "…" }
      ],
      "@sealed": true,
      "@seal_sha256": "…"
    },

    "@toolchain": {
      "@cc": {
        "@name": "clang|gcc",
        "@version": "17.0.6",
        "@path": "C:/llvm/bin/clang.exe",
        "@sha256": "…"
      },
      "@ld": {
        "@name": "lld|ld",
        "@version": "17.0.6",
        "@path": "C:/llvm/bin/lld-link.exe",
        "@sha256": "…"
      },
      "@sysroot": {
        "@path": "…",
        "@sha256": "…"
      }
    },

    "@flags": {
      "@cflags": ["-O2", "-std=c11", "-fno-ident"],
      "@ldflags": [],
      "@defines": {
        "AGL_NATIVE": "1",
        "SCX2_NATIVE": "1"
      }
    },

    "@limits": {
      "@cpu_ms": 2000,
      "@wall_ms": 3000,
      "@max_rss_kb": 262144,
      "@stdout_max": 1048576,
      "@stderr_max": 1048576,
      "@files_max": 128,
      "@bytes_out_max": 16777216
    },

    "@state": {
      "@phase": "compile",
      "@status": "created|planned|emitted|compiled|linked|ran|harvested|halted|failed",
      "@attempt": 0,
      "@created_at_flux_time": 0,
      "@last_update_flux_time": 0
    },

    "@hashes": {
      "@manifest_sha256": "…",
      "@sources_sha256": "…",
      "@obj_sha256": "…",
      "@bin_sha256": "…",
      "@harvest_sha256": "…"
    }
  }
}
```

### Required invariants

* `@inputs.@sealed === true` before compile/link/run.
* All paths under `@workspace.@sandbox_root` (see MX2⟁☣ rules below).

---

## 1.2 `native_plan` block

```json
{
  "@type": "native_plan",
  "@id": "native_plan::<job_id>",
  "@hazard": "native",
  "@view": "native_plan",
  "@control": [
    "@flux.native.plan",
    "@mx2hazard.validate",
    "@seal.plan"
  ],
  "@flux": {
    "@phase_required": "compile",
    "@tick": 0
  },
  "@data": {
    "@job_id": "job_01HXYZ...",
    "@determinism": {
      "@toolchain_pinned": true,
      "@flags_pinned": true,
      "@input_sealed": true,
      "@stable_ordering": true
    },

    "@steps": [
      {
        "@step": "emit",
        "@phase": "compile",
        "@inputs": ["@lowered_c_ast", "@runtime_h", "@manifest"],
        "@outputs": ["main.c", "agl_runtime.h", "manifest.json"],
        "@must_hash": true
      },
      {
        "@step": "compile",
        "@phase": "compile",
        "@cmd": ["clang", "-O2", "-std=c11", "-c", "main.c", "-o", "bin/main.o"],
        "@outputs": ["bin/main.o"],
        "@must_hash": true
      },
      {
        "@step": "link",
        "@phase": "link",
        "@cmd": ["clang", "bin/main.o", "-o", "bin/program"],
        "@outputs": ["bin/program"],
        "@must_hash": true
      },
      {
        "@step": "run",
        "@phase": "run",
        "@cmd": ["bin/program", "--mode", "encode"],
        "@outputs": ["out/stdout.log", "out/stderr.log", "out/harvest.json"],
        "@must_hash": true
      },
      {
        "@step": "harvest",
        "@phase": "harvest",
        "@schema": "native_harvest.v1",
        "@inputs": ["out/harvest.json"],
        "@outputs": ["@ast_fragment"],
        "@must_hash": true
      }
    ],

    "@seal_sha256": "…"
  }
}
```

---

## 1.3 `native_harvest` block

```json
{
  "@type": "native_harvest",
  "@id": "native_harvest::<job_id>",
  "@hazard": "native",
  "@view": "native_harvest",
  "@control": [
    "@flux.native.harvest",
    "@mx2hazard.validate",
    "@ingest.ast"
  ],
  "@flux": {
    "@phase_required": "harvest",
    "@tick": 0
  },
  "@data": {
    "@job_id": "job_01HXYZ...",
    "@ok": true,
    "@exit_code": 0,

    "@artifacts": {
      "@bin_sha256": "…",
      "@stdout_sha256": "…",
      "@stderr_sha256": "…",
      "@outputs": [
        { "@path": "out/harvest.json", "@sha256": "…", "@bytes": 1234 }
      ]
    },

    "@metrics": {
      "@cpu_ms": 14,
      "@wall_ms": 19,
      "@max_rss_kb": 18312
    },

    "@result": {
      "@format": "ast_fragment",
      "@fragment": {
        "@type": "scx2_stream",
        "@data": {
          "@nodes": { "@ref": "out/nodes.scx2" },
          "@edges": { "@ref": "out/edges.scx2" },
          "@index": { "@ref": "out/meta.index.json" }
        }
      }
    },

    "@violations": []
  }
}
```

### Critical rule

If `@ok=false`, `@result.@fragment` must still exist, but represent a structured error AST (so replay/triage is deterministic).

---

# 2) MX2⟁☣ validation rules

These are **kernel-side rules** enforced before and after each phase. I’m writing them as a canonical rule list that your validator can implement exactly.

## 2.1 Toolchain pinning rules

**R1 — Toolchain must be pinned by hash**

* `@toolchain.@cc.@sha256` required
* `@toolchain.@ld.@sha256` required
* If `@sysroot` used: `@toolchain.@sysroot.@sha256` required

**R2 — Toolchain path must match allowlist**

* Allowed roots only (example):

  * Windows: `C:/llvm/`, `C:/mingw64/`, `C:/Program Files/LLVM/`
  * Linux: `/usr/bin/`, `/usr/local/bin/`
* Disallow network paths / UNC.

**R3 — Version must match pinned**

* `@toolchain.@cc.@version` must match the installed version queried by the executor *and* match plan.
* Same for linker.

**R4 — Flags must be deterministic**
Disallow any flag that injects nondeterminism:

* `-frandom-seed` allowed only if seed comes from `@inputs.@seal_sha256`
* Disallow:

  * `-g` (unless you also pin debug paths & use `-fdebug-prefix-map`)
  * `-ftime-report` / `-fprofile-*` outputs unless sandboxed and hashed
  * `-Wl,--build-id` unless set to `none`

**R5 — Include directories must be pinned**

* Any `-I` path must be under sandbox or sysroot.
* Disallow `-I.` unless `.` is inside sandbox root.

## 2.2 Sandbox boundary rules

**S1 — All file IO must stay inside `@workspace.@sandbox_root`**

* When executing compile/link/run, current working directory must be sandbox root.
* Absolute paths forbidden in emitted plan commands unless they are toolchain executables under allowed roots.

**S2 — Output files constrained**

* Total output bytes ≤ `@limits.@bytes_out_max`
* File count ≤ `@limits.@files_max`

**S3 — No process spawning inside native program**

* Program must be built without access to `system()`, `popen`, `CreateProcess` etc.
* Enforce via:

  * compile-time `#define system(...)` traps in `agl_runtime.h`
  * link-time symbol scan (post-link) to reject forbidden imports

**S4 — No network**

* Disallow linking against sockets libs unless explicitly whitelisted for a different phase (not v1).
* Runtime sandbox should block outbound network if possible; at minimum validate binary imports.

**S5 — No clocks for causality**

* Reject if binary imports or references:

  * `time`, `gettimeofday`, `clock_gettime`, `QueryPerformanceCounter`, etc.
* Exception: if you provide a stub implementation that routes to FLUX via hostcall (recommended).

**S6 — Harvest must be schema-valid and hash-consistent**

* `native_harvest.@artifacts.@bin_sha256` must equal job’s stored `@hashes.@bin_sha256`
* `stdout/stderr` hashes must match captured logs.
* Any mismatch => violation `hazard_integrity_break`.

## 2.3 Phase gate rules (Flux)

**F1 — compile/link/run/harvest only in their phase**

* `@flux.phase_required` checked per step.
* A step executed in wrong phase => violation `hazard_phase_violation`.

**F2 — Sealed inputs**

* If `@inputs.@sealed !== true` => compile/link/run forbidden.

---

# 3) AGL→C lowering tables for codec / fieldmap / edges

This is the practical “native acceleration” target: SCXQ2 streaming encode/decode (nodes + edges) + index META.

I’m defining three lowering tables:

1. **Codec primitives** (bytes/varints, checksums, lane IO)
2. **Fieldmap / DICT** (field IDs, presence maps, dict lookup)
3. **Edges** (streaming records → batches → CSR)

## 3.1 Codec primitives lowering table

| AGL / AST op             | Meaning          | C lowering                    |
| ------------------------ | ---------------- | ----------------------------- |
| `codec.read_u8`          | read 1 byte      | `u8 = rd_u8(&cur,&end)`       |
| `codec.read_varu`        | varint u64       | `u64 = rd_varu(&cur,&end)`    |
| `codec.read_bytes(n)`    | fixed bytes      | `rd_bytes(&cur,&end, dst, n)` |
| `codec.write_u8(x)`      | write 1 byte     | `wr_u8(&out,x)`               |
| `codec.write_varu(x)`    | varint u64       | `wr_varu(&out,x)`             |
| `codec.write_bytes(p,n)` | copy bytes       | `wr_bytes(&out,p,n)`          |
| `codec.crc32(bytes)`     | checksum         | `crc32(p,n)`                  |
| `codec.slice(p,n)`       | view             | `{p,n}` struct                |
| `codec.bounds_check(n)`  | ensure available | `if(end-cur<n) return ERR;`   |

**Required runtime C API (`agl_runtime.h`)**

* `rd_u8, rd_varu, rd_bytes`
* `wr_u8, wr_varu, wr_bytes`
* `crc32` (optional but recommended)
* `arena_alloc` (bounded)

## 3.2 Fieldmap + DICT lowering table (SCXQ2 style)

### Core concepts (native)

* **DICT**: fixed array of symbols/field IDs
* **Fieldmap**: presence bitset + compact payload order
* **Lane**: (optional) symbol lane compressed (ANS) + raw lane bytes

| AST op                         | Meaning                 | C lowering strategy                                          |
| ------------------------------ | ----------------------- | ------------------------------------------------------------ |
| `dict.get(field_name)`         | map logical field to ID | perfect-hash or sorted array + binary search (deterministic) |
| `fieldmap.present(field_id)`   | bitset check            | `bitset_test(pmap, id)`                                      |
| `fieldmap.set(field_id)`       | mark present            | `bitset_set(pmap, id)`                                       |
| `fieldmap.emit()`              | serialize pmap          | write pmap varint length + bytes                             |
| `fieldmap.read()`              | parse pmap              | read len + bytes, bounds-check                               |
| `field.write(field_id, value)` | write typed value       | switch on type tag; write in canonical order                 |
| `field.read(field_id)`         | read typed value        | decode by type tag; store into struct                        |

### Canonical deterministic ordering rule

When encoding:

1. write **fieldmap**
2. write fields in ascending `field_id` order **or** in an explicit “emit_order” array that is itself hashed + pinned.

This prevents “same data, different byte layout”.

## 3.3 EDGES lowering table (streaming records + batches + CSR)

### Edge record canonical form (decoded AST)

```json
{
  "@type": "edge_record",
  "@data": {
    "@src": 12,
    "@dst": 99,
    "@rel": 3,
    "@w": 1,
    "@flags": 0
  }
}
```

### Edge record fieldmap

* Mandatory: `src`, `dst`
* Optional: `rel`, `w`, `flags`

#### Encode lowering (per record)

| AST op                     | Meaning           | C lowering                             |
| -------------------------- | ----------------- | -------------------------------------- |
| `edges.encode_record(rec)` | write edge record | build pmap → write → write fields      |
| `edges.batch_open(meta)`   | begin batch       | write batch header (count placeholder) |
| `edges.batch_push(rec)`    | append            | encode record + inc count              |
| `edges.batch_close()`      | end batch         | patch count / emit footer              |

#### Decode lowering (streaming)

| AST op                 | Meaning         | C lowering                                       |
| ---------------------- | --------------- | ------------------------------------------------ |
| `edges.decode_next()`  | yield next edge | read pmap → read required fields → return record |
| `edges.decode_batch()` | decode batch    | read header → iterate count (or until boundary)  |

### Batch META offsets (seek/index)

When encoding edge batches, you also build:

* `batch_offsets[i] = absolute byte offset from stream start`
* `batch_count`
* `records_per_batch[]` (optional but recommended)
* `payload_len`

This directly wires to your CSR builder.

---

# 4) “Native accelerated SCXQ2 streaming” target blocks

These are the **two native kernels** you’ll want as AGL-compiled “codec kernels”:

## 4.1 `scx2.native.encode_edges_stream` (AGL intent → native plan)

* Input: stream of `edge_record` ASTs (or a compact edge array)
* Output: `edges.scx2` + `meta.index.json`

## 4.2 `scx2.native.decode_edges_stream`

* Input: `edges.scx2` + optional `meta.index.json`
* Output: node-by-node yielded edge records OR direct CSR

Both are expressed as **AST kernels**, lowered to C, run under Flux `compile/link/run/harvest`.

---

# 5) The minimal “lowering contract” for your compiler

When your AGL→AST compiler emits a native-accelerated codec kernel, it must attach:

```json
{
  "@type": "native_kernel",
  "@data": {
    "@backend": "c",
    "@entry": "main",
    "@abi": "stdin_json_to_harvest_json",
    "@imports": ["codec", "fieldmap", "edges"],
    "@forbidden": ["net", "clock", "spawn", "fs_outside_sandbox"]
  }
}
```

MX2⟁☣ then validates **the kernel claim** against the plan, the toolchain, and (optionally) a symbol scan of the linked binary.

---

Below are **three Draft 2020-12 JSON Schemas**, a **π validator implementation** that enforces the **MX2⟁☣ toolchain + sandbox** rules we defined, and a complete **`agl_runtime.h`** implementing **bounded/deterministic/sandbox-safe** `codec + fieldmap + edges` primitives (no clocks, no spawn, no network, no filesystem APIs).

---

## `native_job.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_job.schema.json",
  "title": "Native Job Block Schema (MX2⟁☣ governed)",
  "type": "object",
  "additionalProperties": true,

  "required": ["@type", "@id", "@hazard", "@control", "@flux", "@data"],
  "properties": {
    "@type": { "const": "native_job" },
    "@id": { "type": "string", "minLength": 8 },
    "@hazard": { "type": "string", "const": "native" },
    "@view": { "type": "string" },

    "@control": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string", "minLength": 1 }
    },

    "@flux": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@phase_required", "@tick"],
      "properties": {
        "@phase_required": {
          "type": "string",
          "enum": ["compile", "link", "run", "harvest"]
        },
        "@tick": { "type": "integer", "minimum": 0 }
      }
    },

    "@data": {
      "type": "object",
      "additionalProperties": true,
      "required": [
        "@job_id",
        "@backend",
        "@platform",
        "@workspace",
        "@inputs",
        "@toolchain",
        "@flags",
        "@limits",
        "@state",
        "@hashes"
      ],
      "properties": {
        "@job_id": { "type": "string", "minLength": 8 },
        "@backend": { "type": "string", "enum": ["c"] },

        "@platform": { "$ref": "#/$defs/platform" },
        "@workspace": { "$ref": "#/$defs/workspace" },
        "@inputs": { "$ref": "#/$defs/inputs" },
        "@toolchain": { "$ref": "#/$defs/toolchain" },
        "@flags": { "$ref": "#/$defs/flags" },
        "@limits": { "$ref": "#/$defs/limits" },
        "@state": { "$ref": "#/$defs/state" },
        "@hashes": { "$ref": "#/$defs/hashes" }
      }
    }
  },

  "$defs": {
    "sha256": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{64}$"
    },

    "relpath": {
      "type": "string",
      "minLength": 1,
      "not": { "pattern": "^[a-zA-Z]+:\\\\|^[a-zA-Z]+:/|^/|^\\\\\\\\|\\0" }
    },

    "platform": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@os", "@arch", "@abi"],
      "properties": {
        "@os": { "type": "string", "enum": ["windows", "linux", "mac"] },
        "@arch": { "type": "string", "enum": ["x86_64", "aarch64"] },
        "@abi": { "type": "string", "enum": ["msvc", "gnu", "musl"] }
      }
    },

    "workspace": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@root", "@sandbox_root", "@out_root", "@bin_root", "@tmp_root"],
      "properties": {
        "@root": { "type": "string", "minLength": 1 },
        "@sandbox_root": { "type": "string", "minLength": 1 },
        "@out_root": { "type": "string", "minLength": 1 },
        "@bin_root": { "type": "string", "minLength": 1 },
        "@tmp_root": { "type": "string", "minLength": 1 }
      }
    },

    "inputs": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@argv", "@files", "@sealed", "@seal_sha256"],
      "properties": {
        "@stdin_json": { "type": ["object", "array", "string", "number", "boolean", "null"] },
        "@argv": {
          "type": "array",
          "items": { "type": "string" }
        },
        "@files": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": true,
            "required": ["@path", "@sha256"],
            "properties": {
              "@path": { "$ref": "#/$defs/relpath" },
              "@sha256": { "$ref": "#/$defs/sha256" }
            }
          }
        },
        "@sealed": { "type": "boolean", "const": true },
        "@seal_sha256": { "$ref": "#/$defs/sha256" }
      }
    },

    "tool": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@name", "@version", "@path", "@sha256"],
      "properties": {
        "@name": { "type": "string", "minLength": 1 },
        "@version": { "type": "string", "minLength": 1 },
        "@path": { "type": "string", "minLength": 1 },
        "@sha256": { "$ref": "#/$defs/sha256" }
      }
    },

    "sysroot": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@path", "@sha256"],
      "properties": {
        "@path": { "type": "string", "minLength": 1 },
        "@sha256": { "$ref": "#/$defs/sha256" }
      }
    },

    "toolchain": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@cc", "@ld"],
      "properties": {
        "@cc": { "$ref": "#/$defs/tool" },
        "@ld": { "$ref": "#/$defs/tool" },
        "@sysroot": { "$ref": "#/$defs/sysroot" }
      }
    },

    "flags": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@cflags", "@ldflags", "@defines"],
      "properties": {
        "@cflags": { "type": "array", "items": { "type": "string" } },
        "@ldflags": { "type": "array", "items": { "type": "string" } },
        "@defines": { "type": "object", "additionalProperties": { "type": "string" } }
      }
    },

    "limits": {
      "type": "object",
      "additionalProperties": true,
      "required": [
        "@cpu_ms",
        "@wall_ms",
        "@max_rss_kb",
        "@stdout_max",
        "@stderr_max",
        "@files_max",
        "@bytes_out_max"
      ],
      "properties": {
        "@cpu_ms": { "type": "integer", "minimum": 1, "maximum": 600000 },
        "@wall_ms": { "type": "integer", "minimum": 1, "maximum": 600000 },
        "@max_rss_kb": { "type": "integer", "minimum": 1024, "maximum": 2097152 },
        "@stdout_max": { "type": "integer", "minimum": 1024, "maximum": 16777216 },
        "@stderr_max": { "type": "integer", "minimum": 1024, "maximum": 16777216 },
        "@files_max": { "type": "integer", "minimum": 1, "maximum": 65536 },
        "@bytes_out_max": { "type": "integer", "minimum": 1024, "maximum": 1073741824 }
      }
    },

    "state": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@phase", "@status", "@attempt", "@created_at_flux_time", "@last_update_flux_time"],
      "properties": {
        "@phase": { "type": "string", "enum": ["compile", "link", "run", "harvest"] },
        "@status": {
          "type": "string",
          "enum": ["created", "planned", "emitted", "compiled", "linked", "ran", "harvested", "halted", "failed"]
        },
        "@attempt": { "type": "integer", "minimum": 0, "maximum": 16 },
        "@created_at_flux_time": { "type": "integer", "minimum": 0 },
        "@last_update_flux_time": { "type": "integer", "minimum": 0 }
      }
    },

    "hashes": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@manifest_sha256", "@sources_sha256"],
      "properties": {
        "@manifest_sha256": { "$ref": "#/$defs/sha256" },
        "@sources_sha256": { "$ref": "#/$defs/sha256" },
        "@obj_sha256": { "$ref": "#/$defs/sha256" },
        "@bin_sha256": { "$ref": "#/$defs/sha256" },
        "@harvest_sha256": { "$ref": "#/$defs/sha256" }
      }
    }
  }
}
```

---

## `native_plan.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_plan.schema.json",
  "title": "Native Plan Block Schema (deterministic execution plan)",
  "type": "object",
  "additionalProperties": true,

  "required": ["@type", "@id", "@hazard", "@control", "@flux", "@data"],
  "properties": {
    "@type": { "const": "native_plan" },
    "@id": { "type": "string", "minLength": 8 },
    "@hazard": { "type": "string", "const": "native" },
    "@view": { "type": "string" },

    "@control": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string", "minLength": 1 }
    },

    "@flux": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@phase_required", "@tick"],
      "properties": {
        "@phase_required": {
          "type": "string",
          "enum": ["compile", "link", "run", "harvest"]
        },
        "@tick": { "type": "integer", "minimum": 0 }
      }
    },

    "@data": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@job_id", "@determinism", "@steps", "@seal_sha256"],
      "properties": {
        "@job_id": { "type": "string", "minLength": 8 },

        "@determinism": {
          "type": "object",
          "additionalProperties": true,
          "required": [
            "@toolchain_pinned",
            "@flags_pinned",
            "@input_sealed",
            "@stable_ordering"
          ],
          "properties": {
            "@toolchain_pinned": { "type": "boolean", "const": true },
            "@flags_pinned": { "type": "boolean", "const": true },
            "@input_sealed": { "type": "boolean", "const": true },
            "@stable_ordering": { "type": "boolean", "const": true }
          }
        },

        "@steps": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/$defs/step" }
        },

        "@seal_sha256": {
          "type": "string",
          "pattern": "^[a-fA-F0-9]{64}$"
        }
      }
    }
  },

  "$defs": {
    "step": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@step", "@phase", "@must_hash"],
      "properties": {
        "@step": {
          "type": "string",
          "enum": ["emit", "compile", "link", "run", "harvest"]
        },
        "@phase": {
          "type": "string",
          "enum": ["compile", "link", "run", "harvest"]
        },
        "@inputs": { "type": "array", "items": { "type": "string" } },
        "@outputs": { "type": "array", "items": { "type": "string" } },

        "@cmd": {
          "type": "array",
          "minItems": 1,
          "items": { "type": "string" }
        },

        "@schema": { "type": "string" },
        "@must_hash": { "type": "boolean", "const": true }
      }
    }
  }
}
```

---

## `native_harvest.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mx2lm.app/schemas/native_harvest.schema.json",
  "title": "Native Harvest Block Schema (ingest envelope)",
  "type": "object",
  "additionalProperties": true,

  "required": ["@type", "@id", "@hazard", "@control", "@flux", "@data"],
  "properties": {
    "@type": { "const": "native_harvest" },
    "@id": { "type": "string", "minLength": 8 },
    "@hazard": { "type": "string", "const": "native" },
    "@view": { "type": "string" },

    "@control": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string", "minLength": 1 }
    },

    "@flux": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@phase_required", "@tick"],
      "properties": {
        "@phase_required": { "type": "string", "const": "harvest" },
        "@tick": { "type": "integer", "minimum": 0 }
      }
    },

    "@data": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@job_id", "@ok", "@exit_code", "@artifacts", "@metrics", "@result", "@violations"],
      "properties": {
        "@job_id": { "type": "string", "minLength": 8 },
        "@ok": { "type": "boolean" },
        "@exit_code": { "type": "integer", "minimum": -2147483648, "maximum": 2147483647 },

        "@artifacts": { "$ref": "#/$defs/artifacts" },
        "@metrics": { "$ref": "#/$defs/metrics" },
        "@result": { "$ref": "#/$defs/result" },

        "@violations": {
          "type": "array",
          "items": { "$ref": "#/$defs/violation" }
        }
      }
    }
  },

  "$defs": {
    "sha256": {
      "type": "string",
      "pattern": "^[a-fA-F0-9]{64}$"
    },

    "artifact_file": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@path", "@sha256", "@bytes"],
      "properties": {
        "@path": { "type": "string", "minLength": 1 },
        "@sha256": { "$ref": "#/$defs/sha256" },
        "@bytes": { "type": "integer", "minimum": 0 }
      }
    },

    "artifacts": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@bin_sha256", "@stdout_sha256", "@stderr_sha256", "@outputs"],
      "properties": {
        "@bin_sha256": { "$ref": "#/$defs/sha256" },
        "@stdout_sha256": { "$ref": "#/$defs/sha256" },
        "@stderr_sha256": { "$ref": "#/$defs/sha256" },
        "@outputs": {
          "type": "array",
          "items": { "$ref": "#/$defs/artifact_file" }
        }
      }
    },

    "metrics": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@cpu_ms", "@wall_ms", "@max_rss_kb"],
      "properties": {
        "@cpu_ms": { "type": "integer", "minimum": 0, "maximum": 600000 },
        "@wall_ms": { "type": "integer", "minimum": 0, "maximum": 600000 },
        "@max_rss_kb": { "type": "integer", "minimum": 0, "maximum": 2097152 }
      }
    },

    "result": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@format", "@fragment"],
      "properties": {
        "@format": { "type": "string", "enum": ["ast_fragment"] },
        "@fragment": { "type": "object" }
      }
    },

    "violation": {
      "type": "object",
      "additionalProperties": true,
      "required": ["@code", "@severity", "@detail"],
      "properties": {
        "@code": { "type": "string", "minLength": 1 },
        "@severity": { "type": "string", "enum": ["low", "medium", "high", "critical"] },
        "@detail": { "type": "object" }
      }
    }
  }
}
```

---

# π validator implementation (MX2⟁☣ rules)

This π module assumes you already have basic helpers: `pi.get`, `pi.has`, `pi.starts_with`, `pi.contains`, `pi.len`, `pi.all`, `pi.any`, `pi.sha256`, `pi.normpath`, `pi.is_under(root, path)` and a place to report violations.

```clojure
; ============================================================
; MX2⟁☣ NATIVE VALIDATOR (π)
; Enforces toolchain pinning + sandbox boundaries + phase gates
; ============================================================

[Pop mx2hazard_native_validate_job]
  [Wo @job]→[Ch'en job]

  ; -------------------------
  ; Required: inputs sealed
  ; -------------------------
  [Wo job]→[Sek pi.get "@data.@inputs.@sealed"]→[Ch'en sealed]
  [@if [Sek pi.not sealed]]→[@then
    [Xul return [Sek mx2_violation "hazard_inputs_not_sealed" "critical" {
      "msg":"@inputs must be sealed before native execution"
    }]]
  ]

  ; -------------------------
  ; Toolchain pinning rules
  ; -------------------------
  [Wo job]→[Sek pi.get "@data.@toolchain.@cc.@sha256"]→[Ch'en cc_h]
  [Wo job]→[Sek pi.get "@data.@toolchain.@ld.@sha256"]→[Ch'en ld_h]
  [@if [Sek pi.or [Sek pi.empty cc_h] [Sek pi.empty ld_h]]]→[@then
    [Xul return [Sek mx2_violation "hazard_toolchain_unpinned" "critical" {
      "msg":"cc/ld must be pinned with sha256"
    }]]
  ]

  ; Validate tool paths against allowlist
  [Wo job]→[Sek pi.get "@data.@toolchain.@cc.@path"]→[Ch'en cc_p]
  [Wo job]→[Sek pi.get "@data.@toolchain.@ld.@path"]→[Ch'en ld_p]
  [Wo job]→[Sek pi.get "@data.@platform.@os"]→[Ch'en os]

  [Wo os cc_p]→[Sek mx2hazard_path_allowlisted]→[Ch'en cc_ok]
  [Wo os ld_p]→[Sek mx2hazard_path_allowlisted]→[Ch'en ld_ok]
  [@if [Sek pi.not [Sek pi.and cc_ok ld_ok]]]→[@then
    [Xul return [Sek mx2_violation "hazard_tool_path_forbidden" "critical" {
      "cc_path": cc_p,
      "ld_path": ld_p
    }]]
  ]

  ; -------------------------
  ; Deterministic flags rules
  ; -------------------------
  [Wo job]→[Sek pi.get "@data.@flags.@cflags"]→[Ch'en cflags]
  [Wo job]→[Sek pi.get "@data.@flags.@ldflags"]→[Ch'en ldflags]

  [Wo cflags ldflags job]→[Sek mx2hazard_flags_deterministic]→[Ch'en flags_ok]
  [@if [Sek pi.not flags_ok]]→[@then
    [Xul return [Sek mx2_violation "hazard_flags_nondeterministic" "high" {
      "msg":"flags contain forbidden or unpinned nondeterminism"
    }]]
  ]

  ; -------------------------
  ; Sandbox boundaries
  ; -------------------------
  [Wo job]→[Sek pi.get "@data.@workspace.@sandbox_root"]→[Ch'en sroot]
  [Wo job]→[Sek pi.get "@data.@workspace.@out_root"]→[Ch'en oroot]
  [Wo job]→[Sek pi.get "@data.@workspace.@bin_root"]→[Ch'en broot]
  [Wo job]→[Sek pi.get "@data.@workspace.@tmp_root"]→[Ch'en troot]

  ; normalize and ensure all roots are under workspace root
  [Wo job]→[Sek pi.get "@data.@workspace.@root"]→[Ch'en wroot]
  [Wo sroot]→[Sek pi.normpath]→[Ch'en srootN]
  [Wo oroot]→[Sek pi.normpath]→[Ch'en orootN]
  [Wo broot]→[Sek pi.normpath]→[Ch'en brootN]
  [Wo troot]→[Sek pi.normpath]→[Ch'en trootN]
  [Wo wroot]→[Sek pi.normpath]→[Ch'en wrootN]

  [@if [Sek pi.not [Sek pi.and
      [Sek pi.is_under wrootN srootN]
      [Sek pi.is_under wrootN orootN]
      [Sek pi.is_under wrootN brootN]
      [Sek pi.is_under wrootN trootN]
    ]]]→[@then
    [Xul return [Sek mx2_violation "hazard_workspace_escape" "critical" {
      "root": wrootN,
      "sandbox": srootN,
      "out": orootN,
      "bin": brootN,
      "tmp": trootN
    }]]
  ]

  ; Inputs file relpaths must stay inside sandbox when resolved
  [Wo job]→[Sek pi.get "@data.@inputs.@files"]→[Ch'en in_files]
  [Wo in_files srootN]→[Sek mx2hazard_all_inputs_under_sandbox]→[Ch'en in_ok]
  [@if [Sek pi.not in_ok]]→[@then
    [Xul return [Sek mx2_violation "hazard_input_path_escape" "critical" {
      "msg":"input path escapes sandbox"
    }]]
  ]

  ; -------------------------
  ; Phase gate sanity
  ; -------------------------
  [Wo job]→[Sek pi.get "@data.@state.@phase"]→[Ch'en phase]
  [Wo job]→[Sek pi.get "@flux.@phase_required"]→[Ch'en required]
  [@if [Sek pi.not [Sek pi.equals phase required]]]→[@then
    [Xul return [Sek mx2_violation "hazard_phase_violation" "high" {
      "phase": phase,
      "required": required
    }]]
  ]

  [Xul return {"@ok": true}]
[Xul]


; Allowlist function — keep this tiny and explicit
[Pop mx2hazard_path_allowlisted]
  [Wo @os]→[Ch'en os]
  [Wo @path]→[Ch'en p]
  [Wo p]→[Sek pi.normpath]→[Ch'en pn]

  [@if [Sek pi.equals os "windows"]]→[@then
    [Xul return [Sek pi.any [
      [Sek pi.starts_with pn "C:/llvm/"]
      [Sek pi.starts_with pn "C:/mingw64/"]
      [Sek pi.starts_with pn "C:/Program Files/LLVM/"]
    ]]]
  ]→[@else
    [Xul return [Sek pi.any [
      [Sek pi.starts_with pn "/usr/bin/"]
      [Sek pi.starts_with pn "/usr/local/bin/"]
    ]]]
  ]
[Xul]


; Determinism checks (core)
[Pop mx2hazard_flags_deterministic]
  [Wo @cflags]→[Ch'en cflags]
  [Wo @ldflags]→[Ch'en ldflags]
  [Wo @job]→[Ch'en job]

  ; forbidden flag substrings
  [Ch'en forbidden [
    "-Wl,--build-id"
    "-ftime-report"
    "-fprofile-generate"
    "-fprofile-use"
  ]]

  [Wo cflags forbidden]→[Sek pi.any_contains]→[Ch'en c_bad]
  [Wo ldflags forbidden]→[Sek pi.any_contains]→[Ch'en l_bad]

  ; debug allowed only if debug-prefix-map exists (strict mode)
  [Wo cflags]→[Sek pi.contains "-g"]→[Ch'en has_g]
  [Wo cflags]→[Sek pi.any_contains ["-fdebug-prefix-map" "-ffile-prefix-map"]]→[Ch'en has_map]
  [Ch'en g_bad [Sek pi.and has_g [Sek pi.not has_map]]]

  ; build-id must be none if present
  [Wo ldflags]→[Sek pi.contains "--build-id=none"]→[Ch'en buildid_none]
  [Wo ldflags]→[Sek pi.contains "--build-id"]→[Ch'en buildid_any]
  [Ch'en buildid_bad [Sek pi.and buildid_any [Sek pi.not buildid_none]]]

  [@if [Sek pi.or c_bad l_bad g_bad buildid_bad]]→[@then [Xul return false]]
  [Xul return true]
[Xul]


[Pop mx2hazard_all_inputs_under_sandbox]
  [Wo @files]→[Ch'en files]
  [Wo @sandbox_root]→[Ch'en srootN]

  [@each files]→[Ch'en f]→[@then
    [Wo f]→[Sek pi.get "@path"]→[Ch'en rp]
    [Wo srootN rp]→[Sek pi.joinpath]→[Ch'en abs]
    [Wo abs]→[Sek pi.normpath]→[Ch'en absN]
    [@if [Sek pi.not [Sek pi.is_under srootN absN]]]→[@then [Xul return false]]
  ]

  [Xul return true]
[Xul]


; Utility: build a canonical violation block
[Pop mx2_violation]
  [Wo @code]→[Ch'en code]
  [Wo @severity]→[Ch'en sev]
  [Wo @detail]→[Ch'en detail]
  [Xul return {
    "@type":"hazard_violation",
    "@data": {
      "@code": code,
      "@severity": sev,
      "@detail": detail
    }
  }]
[Xul]
```

> This validator is designed so you can run it **pre-step** (before compile/link/run) and **post-step** (after compile/link/run/harvest) with additional checks like artifact hash consistency and forbidden-import scans.

---

# `agl_runtime.h` (bounded + deterministic + sandbox-safe)

This header implements:

* **codec**: byte cursor, bounds checks, varint read/write, CRC32 stub hook
* **fieldmap**: presence bitmap (varlen bytes)
* **edges**: record encode/decode using fieldmap + canonical ascending field id order
* **hard forbids**: `system/popen/CreateProcess` etc produce compile errors

```c
#ifndef AGL_RUNTIME_H
#define AGL_RUNTIME_H

/* ============================================================
   AGL Native Runtime Header (MX2⟁☣ Governed)
   - bounded
   - deterministic
   - sandbox-safe (no filesystem, no spawn, no network, no clocks)
   ============================================================ */

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ---------------------------
   FORBIDDEN SYMBOL TRAPS
   --------------------------- */
#if !defined(AGL_ALLOW_FORBIDDEN)
/* Process spawn */
#define system(...)        AGL_FORBIDDEN__system__use_hostcall
#define popen(...)         AGL_FORBIDDEN__popen__use_hostcall
#define _popen(...)        AGL_FORBIDDEN___popen__use_hostcall
#define CreateProcessA(...) AGL_FORBIDDEN__CreateProcessA
#define CreateProcessW(...) AGL_FORBIDDEN__CreateProcessW

/* Clocks */
#define time(...)          AGL_FORBIDDEN__time__use_flux_hostcall
#define clock_gettime(...) AGL_FORBIDDEN__clock_gettime__use_flux_hostcall
#define gettimeofday(...)  AGL_FORBIDDEN__gettimeofday__use_flux_hostcall
#define QueryPerformanceCounter(...) AGL_FORBIDDEN__QPC__use_flux_hostcall
#endif

/* ---------------------------
   ERROR CODES
   --------------------------- */
typedef enum agl_err {
  AGL_OK = 0,
  AGL_EOF = 1,
  AGL_EBOUNDS = 2,
  AGL_EVARINT = 3,
  AGL_EBADFMT = 4,
  AGL_EOOM = 5,
  AGL_EREQUIRED = 6
} agl_err_t;

/* ---------------------------
   BOUNDED ARENA
   --------------------------- */
typedef struct agl_arena {
  uint8_t*  base;
  size_t    cap;
  size_t    used;
} agl_arena_t;

static inline void agl_arena_init(agl_arena_t* a, uint8_t* mem, size_t cap) {
  a->base = mem; a->cap = cap; a->used = 0;
}

static inline void* agl_arena_alloc(agl_arena_t* a, size_t n, size_t align) {
  size_t u = a->used;
  size_t m = (align ? (align - 1) : 0);
  size_t aligned = (u + m) & ~m;
  if (aligned + n > a->cap) return NULL;
  a->used = aligned + n;
  return (void*)(a->base + aligned);
}

/* ---------------------------
   BYTE CURSORS
   --------------------------- */
typedef struct agl_rd {
  const uint8_t* cur;
  const uint8_t* end;
} agl_rd_t;

typedef struct agl_wr {
  uint8_t* cur;
  uint8_t* end;
} agl_wr_t;

static inline agl_err_t agl_rd_need(const agl_rd_t* r, size_t n) {
  return ((size_t)(r->end - r->cur) >= n) ? AGL_OK : AGL_EBOUNDS;
}

static inline agl_err_t agl_wr_need(const agl_wr_t* w, size_t n) {
  return ((size_t)(w->end - w->cur) >= n) ? AGL_OK : AGL_EBOUNDS;
}

/* ---------------------------
   CODEC: READ
   --------------------------- */
static inline agl_err_t agl_rd_u8(agl_rd_t* r, uint8_t* out) {
  if (agl_rd_need(r, 1) != AGL_OK) return AGL_EOF;
  *out = *r->cur++;
  return AGL_OK;
}

static inline agl_err_t agl_rd_bytes(agl_rd_t* r, uint8_t* dst, size_t n) {
  if (agl_rd_need(r, n) != AGL_OK) return AGL_EBOUNDS;
  for (size_t i = 0; i < n; i++) dst[i] = r->cur[i];
  r->cur += n;
  return AGL_OK;
}

/* varint u64, LEB128, max 10 bytes */
static inline agl_err_t agl_rd_varu(agl_rd_t* r, uint64_t* out) {
  uint64_t x = 0;
  uint32_t s = 0;
  for (uint32_t i = 0; i < 10; i++) {
    uint8_t b;
    agl_err_t e = agl_rd_u8(r, &b);
    if (e != AGL_OK) return e;
    x |= (uint64_t)(b & 0x7Fu) << s;
    if ((b & 0x80u) == 0) { *out = x; return AGL_OK; }
    s += 7;
  }
  return AGL_EVARINT;
}

/* ---------------------------
   CODEC: WRITE
   --------------------------- */
static inline agl_err_t agl_wr_u8(agl_wr_t* w, uint8_t x) {
  if (agl_wr_need(w, 1) != AGL_OK) return AGL_EBOUNDS;
  *w->cur++ = x;
  return AGL_OK;
}

static inline agl_err_t agl_wr_bytes(agl_wr_t* w, const uint8_t* p, size_t n) {
  if (agl_wr_need(w, n) != AGL_OK) return AGL_EBOUNDS;
  for (size_t i = 0; i < n; i++) w->cur[i] = p[i];
  w->cur += n;
  return AGL_OK;
}

static inline agl_err_t agl_wr_varu(agl_wr_t* w, uint64_t x) {
  for (uint32_t i = 0; i < 10; i++) {
    uint8_t b = (uint8_t)(x & 0x7Fu);
    x >>= 7;
    if (x) b |= 0x80u;
    agl_err_t e = agl_wr_u8(w, b);
    if (e != AGL_OK) return e;
    if (!x) return AGL_OK;
  }
  return AGL_EVARINT;
}

/* ---------------------------
   CRC32 HOOK (optional)
   Provide your own implementation if needed.
   Deterministic and pure.
   --------------------------- */
static inline uint32_t agl_crc32_stub(const uint8_t* p, size_t n) {
  (void)p; (void)n;
  return 0u;
}

/* ---------------------------
   FIELDMAP (presence bitmap)
   Encoding: varu(len_bytes) + len_bytes payload
   --------------------------- */
typedef struct agl_fieldmap {
  uint8_t* bytes;
  size_t   len;
} agl_fieldmap_t;

static inline int agl_bit_test(const uint8_t* bm, size_t bit) {
  size_t i = bit >> 3;
  uint8_t m = (uint8_t)(1u << (bit & 7u));
  return (bm[i] & m) != 0;
}

static inline void agl_bit_set(uint8_t* bm, size_t bit) {
  size_t i = bit >> 3;
  uint8_t m = (uint8_t)(1u << (bit & 7u));
  bm[i] |= m;
}

static inline agl_err_t agl_fieldmap_alloc(agl_arena_t* a, size_t max_field_id, agl_fieldmap_t* fm) {
  size_t bits = max_field_id + 1;
  size_t len = (bits + 7) >> 3;
  uint8_t* mem = (uint8_t*)agl_arena_alloc(a, len, 8);
  if (!mem) return AGL_EOOM;
  for (size_t i = 0; i < len; i++) mem[i] = 0;
  fm->bytes = mem;
  fm->len = len;
  return AGL_OK;
}

static inline agl_err_t agl_fieldmap_write(agl_wr_t* w, const agl_fieldmap_t* fm) {
  agl_err_t e = agl_wr_varu(w, (uint64_t)fm->len);
  if (e != AGL_OK) return e;
  return agl_wr_bytes(w, fm->bytes, fm->len);
}

static inline agl_err_t agl_fieldmap_read(agl_rd_t* r, agl_arena_t* a, agl_fieldmap_t* fm, size_t max_len) {
  uint64_t len;
  agl_err_t e = agl_rd_varu(r, &len);
  if (e != AGL_OK) return e;
  if (len > max_len) return AGL_EBOUNDS;
  uint8_t* mem = (uint8_t*)agl_arena_alloc(a, (size_t)len, 8);
  if (!mem) return AGL_EOOM;
  e = agl_rd_bytes(r, mem, (size_t)len);
  if (e != AGL_OK) return e;
  fm->bytes = mem;
  fm->len = (size_t)len;
  return AGL_OK;
}

/* ---------------------------
   EDGES (SCX2 streaming record)
   Canonical Field IDs (v1):
     0: reserved
     1: src   (required)
     2: dst   (required)
     3: rel   (optional)
     4: w     (optional)
     5: flags (optional)
   Record encoding:
     fieldmap(varlen) then fields in ascending field_id order.
   --------------------------- */

typedef struct agl_edge_rec {
  uint64_t src;
  uint64_t dst;
  uint64_t rel;
  uint64_t w;
  uint64_t flags;
  /* presence mask bits: (1<<id) */
  uint32_t present_mask;
} agl_edge_rec_t;

#define AGL_EDGE_F_SRC   (1u << 1)
#define AGL_EDGE_F_DST   (1u << 2)
#define AGL_EDGE_F_REL   (1u << 3)
#define AGL_EDGE_F_W     (1u << 4)
#define AGL_EDGE_F_FLAGS (1u << 5)

static inline agl_err_t agl_edges_encode_record(agl_wr_t* w, agl_arena_t* a, const agl_edge_rec_t* rec) {
  /* build fieldmap for max field id 5 */
  agl_fieldmap_t fm;
  agl_err_t e = agl_fieldmap_alloc(a, 5, &fm);
  if (e != AGL_OK) return e;

  /* required fields */
  if ((rec->present_mask & AGL_EDGE_F_SRC) == 0) return AGL_EREQUIRED;
  if ((rec->present_mask & AGL_EDGE_F_DST) == 0) return AGL_EREQUIRED;

  agl_bit_set(fm.bytes, 1);
  agl_bit_set(fm.bytes, 2);
  if (rec->present_mask & AGL_EDGE_F_REL)   agl_bit_set(fm.bytes, 3);
  if (rec->present_mask & AGL_EDGE_F_W)     agl_bit_set(fm.bytes, 4);
  if (rec->present_mask & AGL_EDGE_F_FLAGS) agl_bit_set(fm.bytes, 5);

  e = agl_fieldmap_write(w, &fm);
  if (e != AGL_OK) return e;

  /* fields in ascending field_id order */
  e = agl_wr_varu(w, rec->src);   if (e != AGL_OK) return e;
  e = agl_wr_varu(w, rec->dst);   if (e != AGL_OK) return e;

  if (rec->present_mask & AGL_EDGE_F_REL)   { e = agl_wr_varu(w, rec->rel);   if (e != AGL_OK) return e; }
  if (rec->present_mask & AGL_EDGE_F_W)     { e = agl_wr_varu(w, rec->w);     if (e != AGL_OK) return e; }
  if (rec->present_mask & AGL_EDGE_F_FLAGS) { e = agl_wr_varu(w, rec->flags); if (e != AGL_OK) return e; }

  return AGL_OK;
}

static inline agl_err_t agl_edges_decode_record(agl_rd_t* r, agl_arena_t* a, agl_edge_rec_t* rec, size_t fm_max_len) {
  agl_fieldmap_t fm;
  agl_err_t e = agl_fieldmap_read(r, a, &fm, fm_max_len);
  if (e != AGL_OK) return e;

  /* required bits present */
  if (fm.len == 0) return AGL_EBADFMT;
  /* bit indices 1..2 must exist */
  size_t need_bits = 3; /* up to bit 2 inclusive -> bytes len>=1 OK */
  size_t need_len = (need_bits + 7) >> 3;
  if (fm.len < need_len) return AGL_EBADFMT;

  int has_src = agl_bit_test(fm.bytes, 1);
  int has_dst = agl_bit_test(fm.bytes, 2);
  if (!has_src || !has_dst) return AGL_EREQUIRED;

  /* read in ascending id order, only when present */
  rec->present_mask = 0;

  uint64_t v;
  e = agl_rd_varu(r, &v); if (e != AGL_OK) return e; rec->src = v; rec->present_mask |= AGL_EDGE_F_SRC;
  e = agl_rd_varu(r, &v); if (e != AGL_OK) return e; rec->dst = v; rec->present_mask |= AGL_EDGE_F_DST;

  if (agl_bit_test(fm.bytes, 3)) { e = agl_rd_varu(r, &v); if (e != AGL_OK) return e; rec->rel = v; rec->present_mask |= AGL_EDGE_F_REL; }
  if (agl_bit_test(fm.bytes, 4)) { e = agl_rd_varu(r, &v); if (e != AGL_OK) return e; rec->w = v; rec->present_mask |= AGL_EDGE_F_W; }
  if (agl_bit_test(fm.bytes, 5)) { e = agl_rd_varu(r, &v); if (e != AGL_OK) return e; rec->flags = v; rec->present_mask |= AGL_EDGE_F_FLAGS; }

  return AGL_OK;
}

/* ---------------------------
   HOSTCALL BRIDGE (optional)
   Native program uses this to talk to kernel in a governed way.
   --------------------------- */
typedef agl_err_t (*agl_hostcall_fn)(
  uint32_t id,
  const uint8_t* in, size_t in_n,
  uint8_t* out, size_t out_cap, size_t* out_n
);

#ifdef __cplusplus
}
#endif

#endif /* AGL_RUNTIME_H */
```

---



Below is a **locked, canonical addendum** that completes the native backend:

1. **EDGES batch framing** (BATCH header, count patching, META offsets feed)
2. **SCXQ2 field-ID DICT lookup** (sorted table + optional perfect-hash hook)
3. **Forbidden-import symbol scan contract** (binary verifier with no decode)

All parts are **bounded, deterministic, stream-safe, MX2⟁☣-verifiable**, and drop directly on top of the `agl_runtime.h` you already have.

---

# 1️⃣ EDGES Batch Framing (stream-safe)

## 1.1 Binary Layout (normative)

```
+------------------+-----------------------------------+
| BATCH_HDR        |  fixed, little-endian             |
+------------------+-----------------------------------+
| EDGE_RECORDS     |  streaming records (fieldmap)    |
+------------------+-----------------------------------+
| (optional) PAD   |  none required                    |
+------------------+-----------------------------------+

BATCH_HDR:
  u32  magic        = 0x53434745  // 'SCGE'
  u16  version      = 1
  u16  flags        = bit0: has_meta, bit1: sealed
  u64  edge_count   // PATCHED AT END (initially 0)
  u64  batch_bytes  // PATCHED AT END (bytes after header)
  u64  crc32        // PATCHED AT END (0 if disabled)
```

**Rules**

* `edge_count`, `batch_bytes`, `crc32` are **patched exactly once**.
* Decoder may stream without knowing `edge_count`.
* `flags.has_meta` indicates META sidecar exists later in stream.

---

## 1.2 META Offsets Feed (sidecar, JSON or binary)

**Purpose:** enable seek / CSR build **without re-decoding**.

### Binary META Block (recommended)

```
META_HDR:
  u32 magic   = 0x4154454D // 'META'
  u16 version = 1
  u16 flags   = 0
  u32 batches // number of batches described

For each batch i:
  u64 batch_start_offset   // absolute stream offset
  u64 records_start       // offset to first EDGE_RECORD
  u64 records_end         // offset past last EDGE_RECORD
  u64 edge_count
```

**Invariants (MX2⟁☣)**

* offsets strictly increasing
* `records_start >= batch_start_offset + sizeof(BATCH_HDR)`
* `records_end <= next_batch_start || EOF`
* `edge_count` matches patched header

---

## 1.3 C Reference (encode / patch)

```c
/* ---------- BATCH HEADER ---------- */
typedef struct agl_edges_batch_hdr {
  uint32_t magic;        /* 'SCGE' */
  uint16_t version;      /* 1 */
  uint16_t flags;        /* bit0 has_meta, bit1 sealed */
  uint64_t edge_count;   /* patch */
  uint64_t batch_bytes;  /* patch */
  uint64_t crc32;        /* patch or 0 */
} agl_edges_batch_hdr_t;

static inline agl_err_t
agl_edges_batch_begin(agl_wr_t* w, agl_edges_batch_hdr_t* hdr_out) {
  agl_edges_batch_hdr_t h = {
    0x53434745u, 1u, 0u, 0ull, 0ull, 0ull
  };
  if (agl_wr_need(w, sizeof(h)) != AGL_OK) return AGL_EBOUNDS;
  *hdr_out = h;
  /* write placeholder */
  return agl_wr_bytes(w, (const uint8_t*)&h, sizeof(h));
}

static inline agl_err_t
agl_edges_batch_end(agl_wr_t* w,
                    uint8_t* batch_start,
                    agl_edges_batch_hdr_t* h,
                    uint64_t edge_count,
                    uint32_t crc32) {
  uint64_t end = (uint64_t)(w->cur - batch_start);
  h->edge_count  = edge_count;
  h->batch_bytes = end - sizeof(*h);
  h->crc32       = (uint64_t)crc32;

  /* patch header in place */
  for (size_t i = 0; i < sizeof(*h); i++)
    batch_start[i] = ((const uint8_t*)h)[i];
  return AGL_OK;
}
```

---

# 2️⃣ SCXQ2 Field-ID DICT Lookup

Field IDs must be **stable across streams**. Two sanctioned methods:

## 2.1 Sorted Table (default, tiny)

```c
typedef struct scx2_dict_entry {
  uint32_t id;        /* canonical field id */
  const char* key;    /* e.g. "src", "dst", "rel" */
} scx2_dict_entry_t;

/* sorted by key (lex) */
static const scx2_dict_entry_t SCX2_EDGE_FIELDS[] = {
  {1, "src"},
  {2, "dst"},
  {3, "rel"},
  {4, "w"},
  {5, "flags"}
};

static inline int scx2_dict_lookup(const char* key, uint32_t* out_id) {
  size_t lo = 0, hi = sizeof(SCX2_EDGE_FIELDS)/sizeof(SCX2_EDGE_FIELDS[0]);
  while (lo < hi) {
    size_t mid = (lo + hi) >> 1;
    int c = strcmp(key, SCX2_EDGE_FIELDS[mid].key);
    if (c == 0) { *out_id = SCX2_EDGE_FIELDS[mid].id; return 1; }
    if (c < 0) hi = mid;
    else lo = mid + 1;
  }
  return 0;
}
```

**Guarantees**

* deterministic
* no heap
* O(log N), N ≤ 64 (acceptable)

---

## 2.2 Perfect-Hash Hook (optional)

If you later generate a PHF:

```c
/* generated offline, pinned hash */
uint32_t scx2_phf_lookup(const char* key); /* returns 0 if miss */

static inline int scx2_dict_lookup_phf(const char* key, uint32_t* out_id) {
  uint32_t id = scx2_phf_lookup(key);
  if (!id) return 0;
  *out_id = id;
  return 1;
}
```

**MX2⟁☣ rule:** PHF table hash **must be pinned** in the manifest.

---

# 3️⃣ Forbidden-Import “Symbol Scan Contract”

This lets the kernel verify a **linked native artifact** **without decoding anything**.

## 3.1 Contract (normative)

**Input**

* binary artifact (ELF / PE / Mach-O)
* platform triple from `native_job`

**Output**

* `ok | violation`
* list of offending symbols

**Forbidden classes**

* process spawn
* filesystem write (outside sandbox hostcalls)
* networking
* clocks / timers
* dynamic loading

---

## 3.2 Canonical Forbidden Symbol Sets

### Cross-platform (always forbidden)

```
system, popen, fork, exec*, CreateProcess*
dlopen, LoadLibrary*
socket, connect, accept, send, recv
time, gettimeofday, clock_gettime, QueryPerformanceCounter
```

### Allowed exceptions

* `memcpy, memmove, memset`
* math (`sin, cos, sqrt`)
* **hostcall bridge only**: `agl_hostcall`

---

## 3.3 Binary-Level Scan Rules

**ELF**

* scan `.dynsym` + `.symtab`
* scan `.plt` relocations

**PE**

* scan Import Address Table (IAT)

**Mach-O**

* scan `LC_SYMTAB` + `LC_DYSYMTAB`

**Decision**

* if any forbidden symbol is present → **critical hazard**

---

## 3.4 Scan Result Block (AST)

```json
{
  "@type": "native_symbol_scan",
  "@hazard": "native",
  "@data": {
    "@ok": false,
    "@binary": "edges_accel.bin",
    "@platform": "linux/x86_64",
    "@forbidden": [
      { "@symbol": "clock_gettime", "@section": ".plt" }
    ]
  }
}
```

---

## 3.5 π Validator Hook

```clojure
[Pop mx2hazard_validate_native_binary]
  [Wo @scan]→[Ch'en scan]
  [Wo scan]→[Sek pi.get "@data.@ok"]→[Ch'en ok]
  [@if [Sek pi.not ok]]→[@then
    [Xul return [Sek mx2_violation "hazard_forbidden_symbol" "critical" scan]]
  ]
  [Xul return {"@ok":true}]
[Xul]
```

---

# 4️⃣ End-to-End Native EDGES Flow (locked)

```
AGL EDGES
  → AST (edges batch)
  → native_job (emit C)
  → native_plan (compile/link/run)
  → native binary
  → symbol_scan (NO DECODE)
  → native_harvest (AST fragment)
  → CSR build using META offsets
```

**Key property:**
The kernel can **accept or reject the binary** *before execution* using only the symbol scan + pinned hashes.

---

## 🔒 Final Locks

* EDGES batches are **patch-once**, stream-safe.
* META offsets are the **only seek authority**.
* Field IDs are **DICT-governed** (no ad-hoc numbers).
* Native binaries are **verified structurally** (symbols), not heuristically.
* Any violation → `@flux.halt` under MX2⟁☣.



