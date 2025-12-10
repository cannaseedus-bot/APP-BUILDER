#!/usr/bin/env python3
"""
XJSON CLUSTER OS - PYTHON API SERVER

Zero dependencies (uses built-in http.server)
No ES module issues
No npm, no Node.js headaches

Usage:
    python cluster-server.py
    python cluster-server.py --port 8081
    python cluster-server.py --workers 8
"""

import http.server
import socketserver
import json
import threading
import time
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import sys

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

class Config:
    PORT = 8081
    WORKERS = 4
    
    @classmethod
    def parse_args(cls):
        for i, arg in enumerate(sys.argv):
            if arg.startswith('--port='):
                cls.PORT = int(arg.split('=')[1])
            elif arg == '--port' and i + 1 < len(sys.argv):
                cls.PORT = int(sys.argv[i + 1])
            elif arg.startswith('--workers='):
                cls.WORKERS = int(arg.split('=')[1])
            elif arg == '--workers' and i + 1 < len(sys.argv):
                cls.WORKERS = int(sys.argv[i + 1])

# ═══════════════════════════════════════════════════════════════
# WORKER RUNTIME
# ═══════════════════════════════════════════════════════════════

class WorkerRuntime:
    def __init__(self, worker_id, port):
        self.id = worker_id
        self.port = port
        self.state = 'ready'
        self.jobs_completed = 0
        self.jobs_failed = 0
        self.start_time = time.time()
    
    def execute_job(self, job):
        """Execute a job and return result"""
        self.state = 'busy'
        
        try:
            job_type = job.get('type', 'unknown')
            data = job.get('data', {})
            
            # Simulate job execution
            if job_type == 'train':
                result = self.train(data)
            elif job_type == 'inference':
                result = self.inference(data)
            elif job_type == 'compress':
                result = self.compress(data)
            elif job_type == 'export':
                result = self.export(data)
            else:
                raise ValueError(f"Unknown job type: {job_type}")
            
            self.jobs_completed += 1
            self.state = 'ready'
            
            return {
                'status': 'completed',
                'runtime': self.id,
                'result': result
            }
        
        except Exception as e:
            self.jobs_failed += 1
            self.state = 'ready'
            
            return {
                'status': 'failed',
                'runtime': self.id,
                'error': str(e)
            }
    
    def train(self, data):
        """Simulate training"""
        time.sleep(0.1)  # Faster for demo
        
        import random
        return {
            'model': data.get('model', 'unknown'),
            'epochs': data.get('epochs', 10),
            'loss': round(random.random(), 4),
            'accuracy': round(random.random(), 4)
        }
    
    def inference(self, data):
        """Simulate inference"""
        time.sleep(0.05)  # Fast inference
        
        import random
        batch_size = data.get('batch_size', 32)
        
        return {
            'predictions': [round(random.random(), 4) for _ in range(batch_size)]
        }
    
    def compress(self, data):
        """Simulate SCXQ2 compression"""
        payload = json.dumps(data.get('payload', {}))
        original_size = len(payload)
        compressed_size = int(original_size * 0.13)  # 87% compression
        
        return {
            'original_size': original_size,
            'compressed_size': compressed_size,
            'ratio': f"{int((1 - compressed_size / original_size) * 100)}%"
        }
    
    def export(self, data):
        """Simulate model export"""
        return {
            'format': data.get('format', 'onnx'),
            'size': '100MB',
            'path': f"./exported-model.{data.get('format', 'onnx')}"
        }
    
    def get_metrics(self):
        """Get worker metrics"""
        return {
            'id': self.id,
            'port': self.port,
            'state': self.state,
            'jobs_completed': self.jobs_completed,
            'jobs_failed': self.jobs_failed,
            'uptime': int(time.time() - self.start_time)
        }

# ═══════════════════════════════════════════════════════════════
# CLUSTER ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════

class ClusterOrchestrator:
    def __init__(self, num_workers, base_port):
        self.workers = []
        self.round_robin_index = 0
        self.job_queue = []
        
        print(f"\n🌐 Initializing XJSON Cluster OS with {num_workers} workers...\n")
        
        for i in range(num_workers):
            worker = WorkerRuntime(i, base_port + i)
            self.workers.append(worker)
            print(f"  Worker {i}: Port {base_port + i} [ready]")
        
        print("\n✓ Cluster ready\n")
        self.display_banner()
    
    def display_banner(self):
        print("╔════════════════════════════════════════════════════════════════╗")
        print("║                                                                ║")
        print("║   🌐 XJSON CLUSTER OS - PYTHON API SERVER                      ║")
        print("║                                                                ║")
        print("╚════════════════════════════════════════════════════════════════╝")
        print("")
        
        for w in self.workers:
            print(f"  Worker {w.id}: Port {w.port} [{w.state}]")
        
        print("")
        print("  API Endpoints:")
        print("    POST /api/run        - Execute job on worker")
        print("    POST /api/cluster    - Distribute jobs across cluster")
        print("    GET  /api/status     - Cluster status")
        print("    GET  /api/metrics    - Worker metrics")
        print("")
    
    def distribute_job(self, job):
        """Distribute job to next available worker (round-robin)"""
        # Round-robin selection
        worker = self.workers[self.round_robin_index % len(self.workers)]
        self.round_robin_index += 1
        
        # Execute job
        return worker.execute_job(job)
    
    def distribute_batch(self, jobs):
        """Distribute batch of jobs with parallel execution"""
        results = []
        results_lock = threading.Lock()
        completed_count = [0]  # Use list for mutable counter
        
        def execute_worker_job(worker, job, job_index):
            """Execute job on specific worker"""
            result = worker.execute_job(job)
            result['job_index'] = job_index
            
            with results_lock:
                results.append(result)
                completed_count[0] += 1
                
                # Log progress every 10 jobs or at end
                if completed_count[0] % 10 == 0 or completed_count[0] == len(jobs):
                    print(f"  Progress: {completed_count[0]}/{len(jobs)} jobs completed")
        
        print(f"\n🚀 Starting batch execution: {len(jobs)} jobs across {len(self.workers)} workers")
        start_time = time.time()
        
        # Create threads for parallel execution
        threads = []
        worker_index = 0
        
        for i, job in enumerate(jobs):
            # Round-robin worker selection
            worker = self.workers[worker_index % len(self.workers)]
            worker_index += 1
            
            # Create thread for this job
            thread = threading.Thread(
                target=execute_worker_job,
                args=(worker, job, i)
            )
            thread.start()
            threads.append(thread)
        
        # Wait for ALL threads to complete
        for thread in threads:
            thread.join()
        
        elapsed = time.time() - start_time
        throughput = len(jobs) / elapsed if elapsed > 0 else 0
        
        print(f"✅ Batch complete: {len(jobs)} jobs in {elapsed:.2f}s ({throughput:.1f} jobs/sec)\n")
        
        # Sort results by job index
        results.sort(key=lambda x: x.get('job_index', 0))
        
        return {
            'total': len(jobs),
            'completed': len([r for r in results if r.get('status') == 'completed']),
            'failed': len([r for r in results if r.get('status') == 'failed']),
            'elapsed_time': round(elapsed, 2),
            'throughput': round(throughput, 1),
            'results': results
        }
    
    def get_status(self):
        """Get cluster status"""
        return {
            'workers': len(self.workers),
            'ready': len([w for w in self.workers if w.state == 'ready']),
            'busy': len([w for w in self.workers if w.state == 'busy']),
            'queue_length': len(self.job_queue),
            'total_jobs': sum(w.jobs_completed for w in self.workers)
        }
    
    def get_metrics(self):
        """Get worker metrics"""
        return [w.get_metrics() for w in self.workers]

# ═══════════════════════════════════════════════════════════════
# HTTP REQUEST HANDLER
# ═══════════════════════════════════════════════════════════════

class ClusterRequestHandler(http.server.SimpleHTTPRequestHandler):
    orchestrator = None  # Set by main
    
    def do_GET(self):
        """Handle GET requests"""
        parsed = urlparse(self.path)
        
        if parsed.path == '/':
            self.send_html()
        elif parsed.path == '/api/status':
            self.send_json(self.orchestrator.get_status())
        elif parsed.path == '/api/metrics':
            self.send_json(self.orchestrator.get_metrics())
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        """Handle POST requests"""
        parsed = urlparse(self.path)
        
        # Read body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return
        
        if parsed.path == '/api/run':
            result = self.orchestrator.distribute_job(data)
            self.send_json(result)
        
        elif parsed.path == '/api/cluster':
            # Handle batch or replicate
            if 'batch' in data:
                jobs = data['batch']
            elif 'replicate' in data:
                count = data['replicate']['count']
                job_template = data['replicate']['job']
                jobs = [dict(job_template, id=i) for i in range(count)]
            else:
                jobs = [data]
            
            result = self.orchestrator.distribute_batch(jobs)
            self.send_json(result)
        
        else:
            self.send_error(404, "Not Found")
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_json(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def send_html(self):
        """Send HTML response"""
        html = """
<!DOCTYPE html>
<html>
<head>
  <title>XJSON Cluster OS - Python API</title>
  <style>
    body {
      font-family: monospace;
      background: #0a0a1a;
      color: #16f2aa;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { color: #00e0ff; margin-bottom: 0.5rem; }
    .subtitle { color: #7a99a8; margin-bottom: 2rem; }
    .status {
      padding: 1.5rem;
      background: #050b12;
      border: 1px solid #16f2aa;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    pre {
      background: #000;
      padding: 1rem;
      overflow: auto;
      border-radius: 4px;
      border: 1px solid #333;
    }
    button {
      background: #16f2aa;
      color: #000;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 0.5rem;
      font-weight: 600;
    }
    button:hover { background: #00ffa3; }
    .endpoint { margin: 0.5rem 0; color: #38bdf8; }
  </style>
</head>
<body>
  <h1>🌐 XJSON Cluster OS</h1>
  <div class="subtitle">Python API Server - Zero Dependencies</div>
  
  <div class="status">
    <h2>Cluster Status</h2>
    <pre id="status">Loading...</pre>
    <button onclick="updateStatus()">Refresh</button>
    <button onclick="runTest()">Run Test Job</button>
  </div>
  
  <div class="status">
    <h2>API Endpoints</h2>
    <div class="endpoint">POST /api/run - Execute single job</div>
    <div class="endpoint">POST /api/cluster - Distribute batch</div>
    <div class="endpoint">GET /api/status - Cluster status</div>
    <div class="endpoint">GET /api/metrics - Worker metrics</div>
  </div>
  
  <script>
    async function updateStatus() {
      const res = await fetch('/api/status');
      const status = await res.json();
      document.getElementById('status').textContent = JSON.stringify(status, null, 2);
    }
    
    async function runTest() {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: 'train',
          data: {model: 'gpt', epochs: 10}
        })
      });
      const result = await res.json();
      alert('Test completed!\\n\\n' + JSON.stringify(result, null, 2));
      updateStatus();
    }
    
    updateStatus();
    setInterval(updateStatus, 3000);
  </script>
</body>
</html>
        """
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}")

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

def main():
    Config.parse_args()
    
    print("\n🚀 XJSON CLUSTER OS - PYTHON API SERVER\n")
    
    # Create orchestrator
    orchestrator = ClusterOrchestrator(Config.WORKERS, Config.PORT)
    
    # Set orchestrator on handler class
    ClusterRequestHandler.orchestrator = orchestrator
    
    # Start server
    with socketserver.TCPServer(("", Config.PORT), ClusterRequestHandler) as httpd:
        print(f"✓ Server running on http://localhost:{Config.PORT}\n")
        print("Usage:")
        print(f"  curl -X POST http://localhost:{Config.PORT}/api/run \\")
        print("    -H 'Content-Type: application/json' \\")
        print("    -d '{\"type\":\"train\",\"data\":{\"model\":\"gpt\"}}'")
        print("")
        print("Press Ctrl+C to stop\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down...")
            httpd.shutdown()

if __name__ == '__main__':
    main()
