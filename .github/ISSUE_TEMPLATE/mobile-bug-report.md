---
name: 📱 Mobile Bug Report
about: Report a bug in the Expo mobile app (iOS/Android)
title: "[MOBILE] "
labels: ["bug", "mobile", "needs-triage"]
assignees: []
---

## 🐛 Bug Description
<!-- Clear description of the bug -->


## 📱 Device & Environment
- **Platform**: [iOS | Android]
- **Device**: [iPhone 15 Pro | Pixel 8 | Samsung Galaxy S24]
- **OS Version**: [iOS 17.2 | Android 14]
- **App Version**: From `app.json` version field
- **Expo SDK**: `52.x.x`
- **Install Method**: [Expo Go | Development Build | Production Build]

## 🔍 Steps to Reproduce
1. Open app via `npx expo start`
2. Navigate to [Screen]
3. Tap [Element]
4. Observe error

## 🎯 Expected Behavior
<!-- A clear and concise description of what you expected to happen -->


## 📱 Actual Behavior
<!-- A clear and concise description of what actually happened -->


## 📷 Screenshots/Screen Recording
<!-- If applicable, add screenshots or screen recordings -->


## 🌍 Environment Context

### Network Conditions
- **Connection Type**: [WiFi, 4G, 5G, Offline]
- **Network Speed**: [Fast, Slow, Intermittent]
- **VPN**: [Yes/No]

### App State
- **Fresh Install**: [Yes/No]
- **Recently Updated**: [Yes/No]
- **Background App Refresh**: [Enabled/Disabled]
- **Low Power Mode**: [Enabled/Disabled] (iOS)
- **Battery Saver**: [Enabled/Disabled] (Android)

### Permissions
- [ ] Camera access
- [ ] Microphone access
- [ ] Storage access
- [ ] Location access
- [ ] Notifications
- [ ] Background app refresh

## 🔄 App Behavior
<!-- Specific mobile app behavior issues -->

### Performance Issues
- [ ] App crashes
- [ ] App becomes unresponsive (ANR)
- [ ] Slow response times
- [ ] Memory warnings
- [ ] Battery drain
- [ ] Overheating

### UI/Navigation Issues
- [ ] Touch targets too small
- [ ] Gestures not working
- [ ] Navigation bar issues
- [ ] Status bar problems
- [ ] Keyboard issues
- [ ] Orientation problems

### Audio/Media Issues
- [ ] Music playback stops
- [ ] Audio quality problems
- [ ] Volume control issues
- [ ] Headphone detection
- [ ] Bluetooth audio problems

## 📊 Crash Information
<!-- If the app crashes -->

### Crash Details
- **Crash Frequency**: [Always, Often, Sometimes, Rarely]
- **Crash Location**: [Which screen/action triggers crash]
- **Crash Type**: [Immediate, After delay, Background crash]

### iOS Crash Log (if available)
```
Exception Type: EXC_CRASH
Exception Subtype: [details]
Crashed Thread: [thread number]
```

### Android Crash Log (if available)
```
FATAL EXCEPTION: main
Process: com.lordpluha.bitratemobile
java.lang.RuntimeException: [details]
```

## 🚨 Severity Assessment
- [ ] 🚨 Critical - App unusable/crashes
- [ ] 🔴 High - Major feature broken
- [ ] 🟡 Medium - Minor feature affected
- [ ] 🟢 Low - Cosmetic issue

## 📈 User Impact
- **Affected Screens**: [List affected screens]
- **User Workflow Blocked**: [Yes/No]
- **Data Loss**: [Yes/No]

## 🔄 Reproducibility
- [ ] Always happens
- [ ] Happens frequently
- [ ] Happens occasionally
- [ ] Hard to reproduce
- [ ] Happened once

### Reproduction Conditions
- **Specific time of day**: [Morning, Evening, etc.]
- **Specific user actions**: [Login, Play music, etc.]
- **Device state**: [Low battery, Background apps, etc.]

## 🧪 Testing Information

### Device Testing
- [ ] Tested on multiple devices
- [ ] Tested on different OS versions
- [ ] Tested with/without network
- [ ] Tested in different orientations

### Other App Versions
- **Works in previous version**: [Yes/No - which version?]
- **Works in web version**: [Yes/No]
- **Works on other platform**: [iOS/Android]

## 💡 Potential Causes
<!-- If you have ideas about what might be causing this -->
- [ ] Recent app update
- [ ] OS update
- [ ] Server-side changes
- [ ] Network connectivity
- [ ] Device storage issues
- [ ] Memory pressure

## 🔄 Workarounds
<!-- Any temporary workarounds found -->
- [ ] Force close and restart app
- [ ] Restart device
- [ ] Reinstall app
- [ ] Clear app cache (Android)
- [ ] Offload and reinstall (iOS)
- [ ] Switch network connection

**Workaround Description:**
<!-- Describe the workaround if available -->


## 📱 Accessibility Impact
<!-- If this affects accessibility features -->
- [ ] VoiceOver issues (iOS)
- [ ] TalkBack issues (Android)
- [ ] Voice Control problems
- [ ] Switch Control problems
- [ ] Large text support
- [ ] High contrast mode

## 🔍 Additional Logs
<!-- Any additional logging information -->

### App Logs
```
[timestamp] INFO: App started
[timestamp] ERROR: Error message
```

### Device Console (if available)
```
Device console logs
```

## 📝 Additional Context
<!-- Any other context about the problem -->

### Recent Changes
- **App recently updated**: [Date]
- **OS recently updated**: [Date]
- **New device**: [Yes/No]

### Related Issues
- **Similar issues reported**: #123, #456
- **Possibly related to**: [Feature/Component]
