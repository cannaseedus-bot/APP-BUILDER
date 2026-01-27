# 📦 XJSON ML RUNTIME - INSTALLATION & DEPLOYMENT GUIDE

## **Complete Setup Guide for All Platforms**

---

## 🚀 QUICK INSTALL

### **NPX (Zero Install)**
```bash
npx @xjson/ml-runtime
```

No installation required! NPX downloads and runs automatically.

### **Global Install (Recommended)**
```bash
npm install -g @xjson/ml-runtime
```

Then run from anywhere:
```bash
xjson-ml
# or
xml
```

### **Local Install**
```bash
npm install @xjson/ml-runtime
```

Then run with npx:
```bash
npx xjson-ml
```

---

## 💻 PLATFORM-SPECIFIC INSTALLATION

### **Windows (PowerShell)**

```powershell
# Install Node.js (if not installed)
winget install OpenJS.NodeJS

# Install XJSON ML Runtime
npm install -g @xjson/ml-runtime

# Run
xjson-ml start
```

### **Windows (Git Bash)**

```bash
# Install via npm
npm install -g @xjson/ml-runtime

# Create aliases in ~/.bashrc
echo 'alias xml="xjson-ml"' >> ~/.bashrc
echo 'alias xmltrain="xjson-ml train"' >> ~/.bashrc
source ~/.bashrc

# Run with short alias
xml
```

### **macOS**

```bash
# Install Node.js (if not installed)
brew install node

# Install XJSON ML Runtime
npm install -g @xjson/ml-runtime

# Run
xjson-ml start

# Optional: Add to PATH
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.zshrc
source ~/.zshrc
```

### **Linux (Ubuntu/Debian)**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install XJSON ML Runtime
sudo npm install -g @xjson/ml-runtime

# Run
xjson-ml start
```

### **Linux (Fedora/RHEL)**

```bash
# Install Node.js
sudo dnf install nodejs

# Install XJSON ML Runtime
sudo npm install -g @xjson/ml-runtime

# Run
xjson-ml start
```

---

## 🐳 DOCKER DEPLOYMENT

### **Quick Start with Docker**

```bash
# Pull image (when available)
docker pull xjson/ml-runtime:latest

# Run container
docker run -p 8080:8080 xjson/ml-runtime:latest
```

### **Build from Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install XJSON ML Runtime
RUN npm install -g @xjson/ml-runtime

# Expose ports
EXPOSE 8080 8081 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/ping || exit 1

# Start runtime
CMD ["xjson-ml", "start", "--no-gpu-check"]
```

Build and run:

```bash
# Build
docker build -t xjson-ml:latest .

# Run
docker run -d \
  --name xjson-ml \
  -p 8080:8080 \
  -p 8081:8081 \
  -p 8082:8082 \
  xjson-ml:latest

# Check logs
docker logs -f xjson-ml

# Stop
docker stop xjson-ml
```

### **Docker Compose**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  xjson-ml:
    image: xjson/ml-runtime:latest
    container_name: xjson-ml-runtime
    ports:
      - "8080:8080"
      - "8081:8081"
      - "8082:8082"
    environment:
      - NODE_ENV=production
      - PORT=8080
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8080/api/ping"]
      interval: 30s
      timeout: 3s
      retries: 3
```

```bash
# Start
docker-compose up -d

# Stop
docker-compose down
```

---

## ☁️ CLOUD DEPLOYMENT

### **AWS EC2**

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install XJSON ML Runtime
sudo npm install -g @xjson/ml-runtime

# Start with PM2
sudo npm install -g pm2
pm2 start xjson-ml -- start
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
sudo ufw allow 8082/tcp
```

### **Google Cloud Platform**

```bash
# Create VM instance
gcloud compute instances create xjson-ml \
  --image-family ubuntu-2004-lts \
  --image-project ubuntu-os-cloud \
  --machine-type n1-standard-2 \
  --tags http-server,https-server

# SSH into instance
gcloud compute ssh xjson-ml

# Install Node.js and XJSON ML Runtime
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g @xjson/ml-runtime

# Start runtime
xjson-ml start

# Create firewall rule
gcloud compute firewall-rules create xjson-ml \
  --allow tcp:8080,tcp:8081,tcp:8082 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

### **Azure**

```bash
# Create VM
az vm create \
  --resource-group myResourceGroup \
  --name xjson-ml \
  --image UbuntuLTS \
  --admin-username azureuser \
  --generate-ssh-keys

# SSH into VM
ssh azureuser@your-vm-ip

# Install Node.js and XJSON ML Runtime
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g @xjson/ml-runtime

# Open ports
az vm open-port --port 8080 --resource-group myResourceGroup --name xjson-ml
az vm open-port --port 8081 --resource-group myResourceGroup --name xjson-ml
az vm open-port --port 8082 --resource-group myResourceGroup --name xjson-ml

# Start runtime
xjson-ml start
```

### **DigitalOcean**

```bash
# Create droplet (Ubuntu 20.04)
doctl compute droplet create xjson-ml \
  --image ubuntu-20-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1

# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install XJSON ML Runtime
npm install -g @xjson/ml-runtime

# Start runtime
xjson-ml start
```

---

## 🔧 PRODUCTION SETUP

### **Nginx Reverse Proxy**

Create `/etc/nginx/sites-available/xjson-ml`:

```nginx
upstream xjson_ml {
    server localhost:8080;
}

upstream xjson_api {
    server localhost:8081;
}

upstream xjson_ws {
    server localhost:8082;
}

server {
    listen 80;
    server_name ml.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ml.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ml.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ml.yourdomain.com/privkey.pem;

    # Main application
    location / {
        proxy_pass http://xjson_ml;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://xjson_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /ws {
        proxy_pass http://xjson_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/xjson-ml /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d ml.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### **PM2 Process Manager**

```bash
# Install PM2
npm install -g pm2

# Start XJSON ML Runtime
pm2 start xjson-ml -- start --port 8080

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Monitor
pm2 monit

# Logs
pm2 logs xjson-ml

# Restart
pm2 restart xjson-ml

# Stop
pm2 stop xjson-ml
```

### **Systemd Service**

Create `/etc/systemd/system/xjson-ml.service`:

```ini
[Unit]
Description=XJSON ML Runtime
Documentation=https://github.com/xjson/ml-runtime
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/xjson-ml
ExecStart=/usr/bin/xjson-ml start --port 8080
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=xjson-ml
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable xjson-ml
sudo systemctl start xjson-ml
sudo systemctl status xjson-ml

# View logs
sudo journalctl -u xjson-ml -f
```

---

## 🌍 KUBERNETES DEPLOYMENT

### **Kubernetes Manifest**

Create `k8s-deployment.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: xjson-ml

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: xjson-ml-runtime
  namespace: xjson-ml
spec:
  replicas: 3
  selector:
    matchLabels:
      app: xjson-ml
  template:
    metadata:
      labels:
        app: xjson-ml
    spec:
      containers:
      - name: xjson-ml
        image: xjson/ml-runtime:latest
        ports:
        - containerPort: 8080
        - containerPort: 8081
        - containerPort: 8082
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /api/ping
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ping
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: xjson-ml-service
  namespace: xjson-ml
spec:
  type: LoadBalancer
  selector:
    app: xjson-ml
  ports:
  - name: http
    protocol: TCP
    port: 80
    targetPort: 8080
  - name: api
    protocol: TCP
    port: 8081
    targetPort: 8081
  - name: websocket
    protocol: TCP
    port: 8082
    targetPort: 8082
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get pods -n xjson-ml
kubectl get services -n xjson-ml

# Get external IP
kubectl get service xjson-ml-service -n xjson-ml

# View logs
kubectl logs -f deployment/xjson-ml-runtime -n xjson-ml
```

---

## 🔐 SECURITY BEST PRACTICES

### **1. Environment Variables**

Never commit sensitive data:

```bash
# Create .env file
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "API_KEY=$(openssl rand -hex 32)" >> .env

# Load in runtime
export $(cat .env | xargs)
xjson-ml start
```

### **2. Firewall Configuration**

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 8080/tcp  # Block direct access
```

### **3. Rate Limiting**

Use Nginx rate limiting:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://xjson_api;
}
```

### **4. Regular Updates**

```bash
# Update XJSON ML Runtime
npm update -g @xjson/ml-runtime

# Update system packages
sudo apt-get update && sudo apt-get upgrade
```

---

## 📊 MONITORING

### **Prometheus + Grafana**

Coming soon: Built-in Prometheus metrics endpoint.

### **Logs**

```bash
# View real-time logs
pm2 logs xjson-ml

# View systemd logs
sudo journalctl -u xjson-ml -f

# View Docker logs
docker logs -f xjson-ml
```

---

## 🆘 TROUBLESHOOTING

### **Installation Fails**

```bash
# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# Try installation again
npm install -g @xjson/ml-runtime
```

### **Port Conflicts**

```bash
# Check what's using port
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>

# Or use different port
xjson-ml start --port 3000
```

### **Permission Denied**

```bash
# Fix npm permissions (Linux/macOS)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall
npm install -g @xjson/ml-runtime
```

---

## ✅ VERIFICATION

After installation, verify everything works:

```bash
# Check installation
xjson-ml --version

# Check GPU support
xjson-ml gpu

# Start runtime
xjson-ml start

# Check status
xjson-ml status
```

Expected output:
```
✓ XJSON ML Runtime 1.0.0
✓ WebGPU: Supported
✓ Server: Running on http://localhost:8080
✓ Status: Ready
```

---

**Ready to train AI models with a single command!** 🚀

```bash
xjson-ml start
```
