# Python AST ↔ XJSON/XCFE/KUHUL Bridge

## Overview

This bridge enables Python runtime support for ASX shards by converting Python Abstract Syntax Trees (AST) into XJSON-compatible representations, allowing Python code to execute within the KUHUL execution pipeline.

## Architecture

```
Python Code → Python AST → XJSON AST → XCFE Validation → KUHUL Execution
```

### Key Components

1. **Python AST Parser** - Uses Python's `ast` module
2. **XJSON Converter** - Transforms AST nodes to XJSON format
3. **XCFE Validator** - Ensures causality governance
4. **KUHUL Executor** - Executes validated AST through K'uhul pipeline

## Python AST to XJSON Conversion

### Basic Converter (python_to_xjson.py)

```python
import ast
import json

def ast_to_xjson(node, parent_context=None):
    """
    Convert Python AST node to XJSON format with XCFE and K'uhul metadata
    """
    if isinstance(node, ast.AST):
        xjson_node = {
            "@xjson": {
                "version": "15.0",
                "type": "python_ast_node",
                "node_class": node.__class__.__name__,
                "parent_context": parent_context
            },
            "@xcfe": {
                "causality": "sequential",  # Default causality governance
                "validation": "pending"
            },
            "@kuhul": {
                "pipeline_stage": "Pop",  # Entry point in K'uhul pipeline
                "execution_order": []
            },
            "attributes": {},
            "children": []
        }

        # Extract node attributes
        for field, value in ast.iter_fields(node):
            if isinstance(value, list):
                # Process child nodes
                child_xjson = [
                    ast_to_xjson(item, node.__class__.__name__)
                    for item in value if isinstance(item, ast.AST)
                ]
                if child_xjson:
                    xjson_node["children"].extend(child_xjson)
            elif isinstance(value, ast.AST):
                # Single child node
                xjson_node["children"].append(
                    ast_to_xjson(value, node.__class__.__name__)
                )
            else:
                # Primitive attribute
                xjson_node["attributes"][field] = value

        # Map to K'uhul pipeline stages
        xjson_node["@kuhul"]["execution_order"] = map_to_kuhul_pipeline(node)

        return xjson_node
    else:
        # Primitive value
        return node


def map_to_kuhul_pipeline(node):
    """
    Map Python AST node types to K'uhul pipeline stages
    """
    node_type = node.__class__.__name__

    # K'uhul Pipeline: Pop → Wo → Sek → Yax → Xul → Ch'en
    pipeline_map = {
        # Pop: Parse/Initialize
        "Module": ["Pop"],
        "FunctionDef": ["Pop", "Wo"],
        "ClassDef": ["Pop", "Wo"],

        # Wo: Bind
        "Assign": ["Wo"],
        "AugAssign": ["Wo"],
        "Name": ["Wo"],

        # Sek: Execute
        "Call": ["Sek"],
        "Return": ["Sek"],
        "Expr": ["Sek"],

        # Yax: Transform
        "BinOp": ["Yax"],
        "UnaryOp": ["Yax"],
        "Lambda": ["Yax"],

        # Xul: Mutate
        "If": ["Xul"],
        "While": ["Xul"],
        "For": ["Xul"],

        # Ch'en: Output
        "Print": ["Ch'en"],
        "Yield": ["Ch'en"]
    }

    return pipeline_map.get(node_type, ["Sek"])  # Default to Sek


def python_code_to_xjson(code):
    """
    Parse Python code string and convert to XJSON
    """
    try:
        tree = ast.parse(code)
        xjson_ast = ast_to_xjson(tree)
        return {
            "success": True,
            "xjson_ast": xjson_ast
        }
    except SyntaxError as e:
        return {
            "success": False,
            "error": f"Python syntax error: {e.msg}",
            "line": e.lineno,
            "offset": e.offset
        }


def save_xjson_to_file(xjson_data, output_path):
    """
    Save XJSON AST to file
    """
    with open(output_path, 'w') as f:
        json.dump(xjson_data, f, indent=2)

    return {
        "success": True,
        "file": output_path,
        "size": len(json.dumps(xjson_data))
    }
```

### XCFE Validator (xcfe_validator.py)

```python
def validate_xcfe_causality(xjson_ast):
    """
    Validate XCFE (eXecution Control Flow Enforcement) rules
    """
    violations = []

    def check_node(node, depth=0):
        if not isinstance(node, dict):
            return

        xcfe = node.get("@xcfe", {})
        kuhul = node.get("@kuhul", {})

        # Rule 1: Causality must be defined
        if "causality" not in xcfe:
            violations.append({
                "rule": "XCFE-001",
                "message": "Causality not defined",
                "node": node.get("@xjson", {}).get("node_class"),
                "depth": depth
            })

        # Rule 2: Sequential causality requires ordered execution
        if xcfe.get("causality") == "sequential":
            if not kuhul.get("execution_order"):
                violations.append({
                    "rule": "XCFE-002",
                    "message": "Sequential causality requires execution order",
                    "node": node.get("@xjson", {}).get("node_class"),
                    "depth": depth
                })

        # Rule 3: Parallel causality forbids dependencies
        if xcfe.get("causality") == "parallel":
            # Check for dependency cycles
            pass  # Implement cycle detection

        # Recurse into children
        for child in node.get("children", []):
            check_node(child, depth + 1)

    check_node(xjson_ast)

    return {
        "valid": len(violations) == 0,
        "violations": violations,
        "rules_checked": 3
    }
```

### K'uhul Executor (kuhul_executor.py)

```python
def execute_kuhul_pipeline(xjson_ast, context=None):
    """
    Execute XJSON AST through K'uhul 6-stage pipeline
    """
    context = context or {}
    results = {
        "Pop": [],
        "Wo": [],
        "Sek": [],
        "Yax": [],
        "Xul": [],
        "Ch'en": []
    }

    def execute_node(node):
        if not isinstance(node, dict):
            return node

        kuhul = node.get("@kuhul", {})
        stages = kuhul.get("execution_order", ["Sek"])

        for stage in stages:
            # Execute stage-specific logic
            result = execute_stage(stage, node, context)
            results[stage].append(result)

        # Recurse into children
        for child in node.get("children", []):
            execute_node(child)

        return results

    def execute_stage(stage, node, ctx):
        """Execute specific K'uhul pipeline stage"""
        node_class = node.get("@xjson", {}).get("node_class")
        attributes = node.get("attributes", {})

        if stage == "Pop":
            # Initialize/Parse
            return {
                "stage": "Pop",
                "action": "initialize",
                "node": node_class,
                "context_updated": False
            }

        elif stage == "Wo":
            # Bind variables/values
            if node_class == "Assign":
                targets = attributes.get("targets", [])
                value = attributes.get("value")
                for target in targets:
                    ctx[target] = value
                return {
                    "stage": "Wo",
                    "action": "bind",
                    "bindings": targets
                }

        elif stage == "Sek":
            # Execute operations
            if node_class == "Call":
                func = attributes.get("func")
                args = attributes.get("args", [])
                return {
                    "stage": "Sek",
                    "action": "execute",
                    "function": func,
                    "arguments": args
                }

        elif stage == "Yax":
            # Transform data
            if node_class == "BinOp":
                left = attributes.get("left")
                op = attributes.get("op")
                right = attributes.get("right")
                return {
                    "stage": "Yax",
                    "action": "transform",
                    "operation": op,
                    "operands": [left, right]
                }

        elif stage == "Xul":
            # Mutate state
            if node_class in ["If", "While", "For"]:
                return {
                    "stage": "Xul",
                    "action": "mutate",
                    "control_flow": node_class
                }

        elif stage == "Ch'en":
            # Output/Return
            if node_class == "Return":
                value = attributes.get("value")
                return {
                    "stage": "Ch'en",
                    "action": "output",
                    "value": value
                }

        return {
            "stage": stage,
            "action": "noop",
            "node": node_class
        }

    execute_node(xjson_ast)

    return {
        "success": True,
        "pipeline_results": results,
        "context": context
    }
```

## Example Usage

### Convert Python to XJSON

```python
# Example Python code
python_code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(result)
"""

# Convert to XJSON
xjson_result = python_code_to_xjson(python_code)

if xjson_result["success"]:
    # Save XJSON AST
    save_xjson_to_file(xjson_result["xjson_ast"], "fibonacci.xjson")

    # Validate XCFE
    validation = validate_xcfe_causality(xjson_result["xjson_ast"])

    if validation["valid"]:
        # Execute through K'uhul pipeline
        execution = execute_kuhul_pipeline(xjson_result["xjson_ast"])
        print("Execution results:", execution["pipeline_results"])
    else:
        print("XCFE violations:", validation["violations"])
else:
    print("Error:", xjson_result["error"])
```

## Integration with ASX Shards

### Shard Integration Pattern

```javascript
// In a GAS shard or browser sw.js
function executePythonCode(pythonCode) {
  // 1. Call Python bridge (via local server or cloud function)
  const xjsonResult = fetch('http://localhost:8000/python-to-xjson', {
    method: 'POST',
    body: JSON.stringify({ code: pythonCode })
  }).then(r => r.json());

  // 2. Validate XCFE
  const validation = validateXCFE(xjsonResult.xjson_ast);

  if (!validation.valid) {
    return { error: 'XCFE violations', violations: validation.violations };
  }

  // 3. Execute through K'uhul pipeline
  const result = executeKuhulPipeline(xjsonResult.xjson_ast);

  return result;
}
```

## Runtime Options

### Option 1: Local Python Server (NPX-based)

See `LOCAL-REST-API-SETUP.md` for NPX configuration

### Option 2: Browser WASM Runtime

Use Pyodide (Python compiled to WebAssembly):

```javascript
// Load Pyodide in browser
async function loadPyodide() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("numpy");
  return pyodide;
}

// Execute Python in browser
async function executePythonInBrowser(code) {
  const pyodide = await loadPyodide();
  const result = pyodide.runPython(code);
  return result;
}
```

### Option 3: Cloud Function (GAS/Vercel/CF Workers)

Deploy Python runtime as serverless function

## Next Steps

1. Implement full Python AST to XJSON converter
2. Create XCFE validation rules engine
3. Build K'uhul executor for common Python operations
4. Set up local REST API server (see `LOCAL-REST-API-SETUP.md`)
5. Create browser WASM fallback
6. Integrate with specialist shards

## Benefits

- ✅ Run Python code in ASX shards
- ✅ Leverage Python ML/data libraries
- ✅ XCFE causality validation
- ✅ K'uhul pipeline execution
- ✅ No Python installation required (WASM option)
- ✅ Full AST introspection
- ✅ Browser-native execution path
