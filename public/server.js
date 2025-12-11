const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    // Default to launch page
    if (filePath === './') {
        filePath = './launch.html';
    }
    
    // Handle K'UHUL routes
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            ok: true,
            status: 'running',
            system: 'MX2LM.APP K\'UHUL',
            version: '2.0',
            uptime: process.uptime()
        }));
        return;
    }
    
    if (req.url === '/api/boot') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            ok: true,
            message: 'K\'UHUL kernel booting...',
            steps: [
                'kernel_state_init',
                'load_manifest',
                'dns_kernel_init',
                'rest_mesh_init',
                'trinity_kernel_init',
                'meshchain_kernel_init',
                'cluster_kernel_init',
                'legion_kernel_init'
            ]
        }));
        return;
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.khl': contentType = 'text/plain'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Try with .html extension
                fs.readFile(filePath + '.html', (err, htmlContent) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(htmlContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 K'UHUL server running at http://localhost:${PORT}`);
    console.log(`🌐 Access at https://mx2lm.app`);
    console.log(`⚡ Press Ctrl+C to stop`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔴 Shutting down K\'UHUL server...');
    process.exit(0);
});