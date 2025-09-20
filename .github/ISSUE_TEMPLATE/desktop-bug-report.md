---
name: 🖥️ Desktop Bug Report
about: Report a bug in the desktop application (Electron)
title: "[DESKTOP-BUG] "
labels: ["bug", "desktop", "electron", "needs-triage"]
assignees: ["lordpluha"]
---

## 🐛 Desktop Bug Description
<!-- Provide a clear and concise description of what the bug is -->


## 💻 System Information
<!-- Please complete the following information -->

### Operating System
- **OS**: [Windows, macOS, Linux]
- **Version**: [Windows 11 22H2, macOS 14.1, Ubuntu 22.04]
- **Architecture**: [x64, ARM64, x86]

### Hardware
- **Processor**: [Intel i7, AMD Ryzen 5, Apple M2]
- **RAM**: [8GB, 16GB, 32GB]
- **Storage**: [SSD, HDD] - [Available space]
- **Graphics**: [Integrated, Dedicated GPU name]

### Application Information
- **App Version**: [e.g. 1.2.3]
- **Electron Version**: [e.g. 25.8.0]
- **Installation Method**: [Installer, Portable, Package Manager]
- **Installation Location**: [Program Files, Applications, Custom]

## 🔍 Steps to Reproduce
<!-- Steps to reproduce the behavior -->
1. Launch the desktop app
2. Navigate to '[Menu/Section]'
3. Click on '[Button/Element]'
4. Use keyboard shortcut '[Ctrl+Key]'
5. See error

## 🎯 Expected Behavior
<!-- A clear and concise description of what you expected to happen -->


## 🖥️ Actual Behavior
<!-- A clear and concise description of what actually happened -->


## 📷 Screenshots/Screen Recording
<!-- If applicable, add screenshots or screen recordings -->


## 🎮 Desktop-Specific Issues
<!-- Issues specific to desktop applications -->

### Window Management
- [ ] Window won't open/close
- [ ] Minimize/maximize issues
- [ ] Multi-monitor problems
- [ ] Window positioning issues
- [ ] Fullscreen mode problems

### System Integration
- [ ] Menu bar issues (macOS)
- [ ] System tray problems
- [ ] Taskbar integration (Windows)
- [ ] File associations broken
- [ ] URL protocol handling

### Performance Issues
- [ ] High CPU usage
- [ ] Excessive memory consumption
- [ ] GPU acceleration problems
- [ ] Slow startup time
- [ ] App becomes unresponsive

### Native Features
- [ ] Keyboard shortcuts not working
- [ ] Media keys integration
- [ ] Notification issues
- [ ] Auto-updater problems
- [ ] Crash reporting failed

## 🔧 Technical Details

### Process Information
- **Main Process PID**: [if known]
- **Renderer Process Count**: [if known]
- **Memory Usage**: [Task Manager/Activity Monitor]
- **CPU Usage**: [Percentage]

### Error Messages
```
Error details from the application
Stack traces if available
```

### Console Output
```javascript
// Developer tools console output
console.error("Error message");
```

### System Logs
<!-- Windows Event Viewer, macOS Console, Linux logs -->
```
System log entries related to the application
```

## 🌍 Environment Context

### Network
- **Connection**: [Ethernet, WiFi, VPN]
- **Firewall**: [Windows Defender, Third-party]
- **Antivirus**: [Windows Defender, Norton, etc.]
- **Proxy Settings**: [Yes/No]

### Other Software
- **Conflicting Applications**: [List any apps that might conflict]
- **Recent Software Installs**: [What was installed recently]
- **System Updates**: [Recent OS or driver updates]

## 🚨 Crash Information
<!-- If the application crashes -->

### Crash Details
- **Crash Type**: [Complete freeze, Hard crash, Silent exit]
- **Crash Frequency**: [Always, Often, Rarely]
- **Crash Reporter**: [Did crash reporter appear?]

### Windows Crash Dump
```
Exception code: 0xc0000005
Fault offset: 0x00000000
```

### macOS Crash Report
```
Process: Spotify Clone [PID]
Path: /Applications/Spotify Clone.app
Exception Type: EXC_BAD_ACCESS
```

### Linux Core Dump
```
Segmentation fault (core dumped)
```

## 🔄 Application State
<!-- State of the application when bug occurred -->

### User Session
- **Logged In**: [Yes/No]
- **Active Features**: [Music playing, Downloads active]
- **Open Windows**: [Number and types of windows]
- **Time Since Launch**: [How long was app running]

### Data State
- **Local Storage Size**: [MB/GB]
- **Cache Size**: [MB/GB]
- **Downloaded Music**: [Amount]
- **Recent Activity**: [What user was doing]

## 📊 Severity Assessment
- [ ] 🚨 Critical - App unusable/crashes
- [ ] 🔴 High - Major feature broken
- [ ] 🟡 Medium - Minor functionality affected
- [ ] 🟢 Low - Cosmetic/minor issue

## 🔄 Reproducibility
- [ ] Always reproducible
- [ ] Intermittent issue
- [ ] Specific conditions required
- [ ] Cannot reproduce consistently

### Reproduction Notes
- **Specific steps required**: [Any specific sequence]
- **Time-dependent**: [Happens after X minutes]
- **State-dependent**: [Requires specific app state]

## 🛠️ Troubleshooting Attempted
<!-- What troubleshooting steps were already tried -->
- [ ] Restart application
- [ ] Restart computer
- [ ] Run as administrator (Windows)
- [ ] Clear application data
- [ ] Reinstall application
- [ ] Update graphics drivers
- [ ] Disable antivirus temporarily
- [ ] Run in compatibility mode

## 💡 Workarounds
<!-- Any temporary workarounds found -->
- [ ] Use web version instead
- [ ] Specific keyboard shortcut works
- [ ] Safe mode/minimal features
- [ ] Older version works

**Workaround Description:**
<!-- Describe the workaround -->


## 🔍 Developer Tools
<!-- Information from Electron developer tools -->

### DevTools Console
```javascript
// Any relevant console output
```

### Network Tab
- **Failed Requests**: [Any network failures]
- **API Errors**: [API-related issues]

### Performance Tab
- **Memory Leaks**: [Growing memory usage]
- **CPU Profiling**: [Performance bottlenecks]

## 📁 File System
<!-- File system related information -->

### Application Files
- **Config Location**: [Path to config files]
- **Log Files**: [Path to log files]
- **Cache Location**: [Path to cache]
- **Corrupted Files**: [Any corrupted app files]

### Permissions
- **File Access**: [Can app read/write files?]
- **Directory Permissions**: [Folder access issues]

## 📝 Additional Context
<!-- Any other context about the problem -->

### Environment Variables
```bash
# Relevant environment variables
ELECTRON_ENABLE_LOGGING=1
```

### Command Line Arguments
```bash
# How the app was launched
./spotify-clone --debug --verbose
```

### Related Issues
- **Similar Desktop Issues**: #123, #456
- **Cross-Platform Issues**: #789
