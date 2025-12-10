"""
XJSON Python Engine v3.0
Executes XJSON jobs with K'UHUL pipeline support
"""

import json
import subprocess
import os
from pathlib import Path
from typing import Any, Dict, List


class XJSONEngine:
    """
    XJSON execution engine with support for:
    - K'UHUL 6-stage pipeline (SECURITY → POP → WO → SEK → XUL → CH'EN)
    - XCFE control flow enforcement
    - Context variable resolution
    - Template interpolation
    - File operations
    - Process execution
    """

    def __init__(self, ctx: Dict[str, Any] = None, base_dir: str = "."):
        self.ctx = ctx or {"input": {}, "ctx": {}, "output": {}}
        self.base_dir = Path(base_dir)

    # ========== HELPERS ==========

    def _resolve(self, value: Any) -> Any:
        """Resolve $-prefixed variables from context"""
        if isinstance(value, str) and value.startswith("$"):
            path = value[1:].split(".")
            cur = self.ctx
            for p in path:
                if isinstance(cur, dict) and p in cur:
                    cur = cur[p]
                else:
                    return None
            return cur
        return value

    def _format(self, value: Any) -> Any:
        """Format strings with context variable interpolation"""
        if isinstance(value, str) and "$" in value:
            # Replace common patterns
            result = value
            if "$input." in value:
                for key, val in self.ctx.get("input", {}).items():
                    result = result.replace(f"$input.{key}", str(val))
            if "$ctx." in value:
                for key, val in self.ctx.get("ctx", {}).items():
                    result = result.replace(f"$ctx.{key}", str(val))
            return result
        return value

    def _set_context(self, path: str, value: Any):
        """Set value in context at dotted path"""
        parts = path.split(".")
        cur = self.ctx
        for p in parts[:-1]:
            if p not in cur:
                cur[p] = {}
            cur = cur[p]
        cur[parts[-1]] = value

    # ========== OPCODES ==========

    def op_log(self, block: Dict):
        """Log message to console"""
        msg = self._format(block.get("@log", ""))
        print(f"[XJSON LOG] {msg}")
        return msg

    def op_py_exec(self, spec: Dict):
        """Execute Python code"""
        code = self._format(spec.get("code", ""))
        capture = spec.get("capture")
        try:
            result = eval(code, {"ctx": self.ctx, "Path": Path, "json": json})
            if capture:
                self._set_context(capture, result)
            return result
        except Exception as e:
            print(f"[XJSON ERROR] Python exec failed: {e}")
            return None

    def op_py_jar(self, spec: Dict):
        """Execute JAR file with Java"""
        jar = self._format(spec.get("jar", ""))
        args = [self._format(a) for a in spec.get("args", [])]
        cmd = ["java", "-jar", jar] + args

        try:
            proc = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
            )
            out, err = proc.communicate()

            capture = spec.get("capture")
            if capture:
                self._set_context(capture, {"stdout": out, "stderr": err, "code": proc.returncode})

            return out, err
        except Exception as e:
            print(f"[XJSON ERROR] JAR execution failed: {e}")
            return None, str(e)

    def op_py_file_write(self, spec: Dict):
        """Write data to file"""
        path = self._format(spec.get("path", ""))
        data = self._resolve(spec.get("data"))
        pretty = spec.get("pretty", False)

        full_path = self.base_dir / path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        with open(full_path, "w", encoding="utf-8") as f:
            if isinstance(data, (dict, list)):
                json.dump(data, f, indent=2 if pretty else None)
            else:
                f.write(str(data))

        print(f"[XJSON] File written: {full_path}")
        return str(full_path)

    def op_py_file_read(self, spec: Dict):
        """Read file contents"""
        path = self._format(spec.get("path", ""))
        capture = spec.get("capture")

        full_path = self.base_dir / path
        if not full_path.exists():
            print(f"[XJSON ERROR] File not found: {full_path}")
            return None

        with open(full_path, "r", encoding="utf-8") as f:
            data = f.read()

        if capture:
            self._set_context(capture, data)

        return data

    def op_mkdir(self, spec: Dict):
        """Create directory"""
        path = self._format(spec.get("path", ""))
        full_path = self.base_dir / path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"[XJSON] Directory created: {full_path}")
        return str(full_path)

    def op_template(self, spec: Dict):
        """Generate file from template"""
        template = self._format(spec.get("template", ""))
        output = self._format(spec.get("output", ""))
        data = self._resolve(spec.get("data")) or self.ctx.get("input", {})

        # Simple template substitution
        result = template
        for key, value in data.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))

        # Write to file
        full_path = self.base_dir / output
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(result)

        print(f"[XJSON] Template generated: {full_path}")
        return str(full_path)

    # ========== EVALUATOR ==========

    def run_block(self, block: Dict):
        """Execute a single XJSON block"""
        if "@log" in block:
            self.op_log(block)
        elif "@py.exec" in block:
            self.op_py_exec(block["@py.exec"])
        elif "@py.jar" in block:
            self.op_py_jar(block["@py.jar"])
        elif "@py.file.write" in block:
            self.op_py_file_write(block["@py.file.write"])
        elif "@py.file.read" in block:
            self.op_py_file_read(block["@py.file.read"])
        elif "@mkdir" in block:
            self.op_mkdir(block["@mkdir"])
        elif "@template" in block:
            self.op_template(block["@template"])

    def run_if_block(self, xj: Dict):
        """Execute @if conditional block"""
        root = xj.get("@if")
        if not root:
            print("[XJSON ERROR] No @if block found")
            return self.ctx

        cond = root.get("cond", {})
        left = self._resolve(cond.get("left"))
        right = self._resolve(cond.get("right"))
        op = cond.get("op", "==")

        # Evaluate condition
        result = False
        if op == "!=":
            result = left != right
        elif op == "==":
            result = left == right
        elif op == ">":
            result = float(left) > float(right)
        elif op == "<":
            result = float(left) < float(right)
        elif op == ">=":
            result = float(left) >= float(right)
        elif op == "<=":
            result = float(left) <= float(right)
        elif op == "in":
            result = left in right
        elif op == "contains":
            result = right in left

        # Execute appropriate blocks
        blocks = root.get("@then", []) if result else root.get("@else", [])
        for b in blocks:
            self.run_block(b)

        return self.ctx

    def run_sequence(self, xj: Dict):
        """Execute @sequence of blocks"""
        blocks = xj.get("@sequence", [])
        for block in blocks:
            self.run_block(block)
        return self.ctx

    def run(self, xj: Dict):
        """Execute XJSON job"""
        if "@if" in xj:
            return self.run_if_block(xj)
        elif "@sequence" in xj:
            return self.run_sequence(xj)
        else:
            self.run_block(xj)
            return self.ctx


def run_xjson_job(path: str, input_data: Dict, base_dir: str = "."):
    """Load and execute XJSON job file"""
    with open(path, "r", encoding="utf-8") as f:
        xj = json.load(f)

    engine = XJSONEngine(ctx={"input": input_data, "ctx": {}, "output": {}}, base_dir=base_dir)
    result_ctx = engine.run(xj)

    return result_ctx
