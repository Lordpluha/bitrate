---
name: 🖥️ Desktop Bug Report
about: Report a bug in the Tauri desktop app
title: "[DESKTOP] "
labels: ["bug", "desktop", "needs-triage"]
assignees: []
---

## 🐛 Bug Description
<!-- Clear description of the bug -->


## 💻 System Information
- **OS**: [Windows 11 | macOS 14 | Ubuntu 22.04]
- **Architecture**: [x64 | ARM64]
- **App Version**: From `src-tauri/tauri.conf.json`
- **Tauri Version**: Check `src-tauri/Cargo.toml`
- **Build Type**: [Development | Production]

## 🔍 Steps to Reproduce
1. Run `pnpm --filter @bitrate/desktop run tauri dev`
2. Navigate to [Menu/Section]
3. Click [Element]
4. Observe error

## ✅ Expected Behavior


## ❌ Actual Behavior


## 📷 Screenshots
<!-- Attach screenshots -->

## 🔧 Console Output
```bash
# From terminal running tauri dev
[INFO] ...
[ERROR] ...
```

### Rust Backend Logs (if applicable)
```rust
// From src-tauri/src/main.rs or other Rust files
```

## 📊 Issue Type
- [ ] Window management
- [ ] System integration (menu bar, tray)
- [ ] Performance (CPU/Memory)
- [ ] Tauri IPC (frontend-backend communication)
- [ ] File system access
- [ ] Native features
- [ ] UI rendering

## 📈 Severity
- [ ] 🚨 **Critical** - App crashes/unusable
- [ ] 🔴 **High** - Major feature broken
- [ ] 🟡 **Medium** - Partial functionality
- [ ] 🟢 **Low** - Minor visual issue

## 🔄 Workaround
<!-- Temporary solution if available -->


## 📝 Additional Context
<!-- Logs, related issues, system info -->
