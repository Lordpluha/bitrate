---
name: 📱 Mobile Feature Request
about: Suggest a new feature for the Expo mobile app
title: "[MOBILE] "
labels: ["feature", "mobile"]
assignees: []
---

## 📝 Feature Description
<!-- Clear description of the proposed feature -->


## 🎯 Problem & Motivation
<!-- Why is this needed? User story format helpful -->


## 💡 Proposed Solution

### Screens/Navigation
- [ ] New screen: `app/[screen].tsx`
- [ ] Update navigation in `app/_layout.tsx`

### Components
```typescript
// Example component
interface FeatureProps {
  // Props
}

export function Feature({ }: FeatureProps) {
  // Implementation
}
```

## 🔧 Technical Implementation

### Expo/React Native
- [ ] Expo SDK features needed (e.g., expo-camera, expo-av)
- [ ] Native modules required
- [ ] Platform-specific code: `Platform.OS === 'ios'`

### UI
- [ ] React Native components
- [ ] Styling (StyleSheet | NativeWind)
- [ ] Animations (Reanimated)
- [ ] Gestures (react-native-gesture-handler)

### API Integration
- [ ] Endpoints: `/api/v1/...`
- [ ] Data fetching (React Query | SWR)
- [ ] Offline support

### Permissions
- [ ] Camera
- [ ] Audio
- [ ] Notifications
- [ ] Location

## ✅ Acceptance Criteria
- [ ] Works on iOS and Android
- [ ] Smooth animations (60fps)
- [ ] Loading & error states
- [ ] Tested on physical devices
- [ ] Follows platform guidelines

## 🧪 Testing
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Test with `npx expo start`
- [ ] Component tests

## ♿ Accessibility
- [ ] VoiceOver (iOS) / TalkBack (Android)
- [ ] Touch target size (min 44pt)

## 📚 Documentation
- [ ] Update README
- [ ] JSDoc comments

## 🔗 References
<!-- Screenshots, mockups, related issues -->

## 📖 Documentation
<!-- What documentation needs to be created/updated? -->
- [ ] Component documentation
- [ ] Setup instructions
- [ ] User guide updates

## 🔗 Additional Information
<!-- Any additional context, screenshots, mockups, or examples -->