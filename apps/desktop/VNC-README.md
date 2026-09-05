# Desktop App with VNC

This setup allows running a Tauri desktop application in a Docker container with GUI access via VNC.

## 🚀 Quick Start

### Launch

```bash
cd apps/desktop
docker compose -f docker-compose.vnc.yml up --build
```

Wait for the container to build and start (first time ~5-10 minutes).

### Accessing the application

After startup, the following are available:

1. **noVNC (browser)** - recommended
   ```
   http://localhost:6080/vnc.html
   ```
   - Open in your browser
   - Click "Connect"
   - Enter password: `bitrate`

2. **VNC client** (RealVNC, TigerVNC, Remmina, etc.)
   ```
   vnc://localhost:5900
   ```
   - Password: `bitrate`

3. **Vite dev server** (UI only without Tauri)
   ```
   http://localhost:1420
   ```

## 📋 Usage

After connecting via noVNC/VNC you will see:
- Desktop with Fluxbox window manager
- The Tauri application will start automatically
- Hot reload works when files change

## 🔧 Configuration

### Change screen resolution

In `docker-compose.vnc.yml`:
```yaml
environment:
  - RESOLUTION=1280x720x24  # or another resolution
```

### Change VNC password

In `Dockerfile.vnc` change the line:
```bash
x11vnc ... -passwd bitrate ...
# to
x11vnc ... -passwd YOUR_PASSWORD ...
```

## 🛠️ Commands

```bash
# Start
docker compose -f docker-compose.vnc.yml up --build

# Start in background
docker compose -f docker-compose.vnc.yml up -d --build

# Logs
docker compose -f docker-compose.vnc.yml logs -f

# Stop
docker compose -f docker-compose.vnc.yml down

# Rebuild
docker compose -f docker-compose.vnc.yml build --no-cache
```

## ⚠️ Limitations

- **Performance**: Runs slower than native execution
- **GPU**: No hardware acceleration
- **Size**: Image ~3-4 GB due to all dependencies
- **First build**: Takes 5-10 minutes

## 🎯 Recommendations

**For development, native execution is preferred:**

```bash
cd apps/desktop
pnpm dev
```

**VNC is useful for:**
- CI/CD GUI testing
- Application demonstrations
- Development on a remote server
- When no local GUI environment is available

## 🐛 Troubleshooting

### Black screen in VNC
- Wait ~30 seconds after connecting
- Check logs: `docker compose logs -f`

### Application won't start
```bash
# Enter the container
docker compose -f docker-compose.vnc.yml exec desktop-vnc bash

# Check processes
ps aux | grep -E "Xvfb|x11vnc|tauri"

# Start manually
cd /app/apps/desktop
pnpm tauri dev
```

### No VNC connection
```bash
# Check that ports are open
docker compose -f docker-compose.vnc.yml ps

# Check firewall
sudo ufw allow 5900/tcp
sudo ufw allow 6080/tcp
```

## 📚 Resources

- [Tauri Documentation](https://tauri.app/)
- [noVNC](https://novnc.com/)
- [x11vnc](https://github.com/LibVNC/x11vnc)
