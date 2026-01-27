# 🚀 QUICK FIX - ES Module Error

## Problem

```
SyntaxError: Cannot use import statement outside a module
```

## Solution

You need the `package.json` file in the same directory as `run-sw.js`.

### **Option 1: Copy package.json** (Recommended)

```bash
# Copy package.json from the outputs folder
cp /mnt/user-data/outputs/xjson-ml-npx/package.json .

# Now run
node run-sw.js
```

### **Option 2: Create Minimal package.json**

Create a file called `package.json` with this content:

```json
{
  "type": "module"
}
```

That's it! Just one line.

```bash
# Create the file
echo '{"type":"module"}' > package.json

# Now run
node run-sw.js
```

### **Option 3: Use .mjs Extension**

```bash
# Rename to .mjs
mv run-sw.js run-sw.mjs
mv cluster-os.js cluster-os.mjs

# Run with .mjs
node run-sw.mjs
node cluster-os.mjs
```

---

## ✅ After Fix

You should see:

```
🚀 XJSON SW.JS STANDALONE RUNNER

🌐 Initializing XJSON Cluster OS with 1 workers...

[Runtime 0] Initializing on port 8080...
[Runtime 0] ✓ Ready

✓ Cluster ready with 1 workers

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🌐 XJSON CLUSTER OS - MULTI-RUNTIME SYSTEM                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

  Worker 0: Port 8080 [ready]

  API Endpoints:
    POST /api/run        - Execute sw.js job
    POST /api/cluster    - Distribute job across cluster
    GET  /api/status     - Cluster status
    GET  /api/metrics    - Worker metrics

✓ Server running on http://localhost:8080
```

---

## 🎯 Full Setup (One-Time)

```bash
# Create directory
mkdir xjson-cluster
cd xjson-cluster

# Create package.json
cat > package.json << 'EOF'
{
  "type": "module",
  "name": "xjson-cluster-os",
  "version": "1.0.0",
  "scripts": {
    "sw": "node run-sw.js",
    "cluster": "node run-sw.js --cluster --workers 8",
    "hive": "node cluster-os.js --hive --workers 16"
  }
}
EOF

# Copy the JS files here
# (run-sw.js, cluster-os.js, xjson.sh)

# Make launcher executable
chmod +x xjson.sh

# Run!
node run-sw.js
```

---

## 🚀 Now You Can Use

### **Single Worker**

```bash
node run-sw.js
```

### **Cluster Mode**

```bash
node run-sw.js --cluster --workers 8
```

### **With Launcher**

```bash
./xjson.sh cluster 16
```

---

**That's it! The error is fixed.** 🎉
