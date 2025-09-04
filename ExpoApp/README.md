# iOS Device Usage Statistics App

A React Native Expo app that displays device usage statistics using iOS Screen Time data. This app demonstrates how to integrate with iOS FamilyControls and DeviceActivity frameworks to provide users with insights into their app usage patterns.

## 🚨 Platform Limitations & Requirements

### iOS Requirements
- **iOS 16.0+**: FamilyControls and DeviceActivity frameworks are only available on iOS 16 and later
- **Custom Dev Client**: Cannot run in Expo Go due to custom native modules
- **User Permission**: Requires explicit Screen Time permission from the user
- **Physical Device**: Simulator testing is limited; physical device recommended

### Data Access Limitations
- **Selected Apps Only**: Can only monitor apps/categories explicitly selected by the user
- **No Historical Data**: Cannot access existing Screen Time history; data collection starts from first authorization
- **Privacy First**: All data processing happens on-device; no external data transmission

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
cd ExpoApp
npm install
```

### 2. Configure EAS Build

Install EAS CLI if not already installed:
```bash
npm install -g eas-cli
```

Login to your Expo account:
```bash
eas login
```

### 3. Create Custom Development Client

```bash
# Build development client for iOS
eas build --profile development --platform ios

# Install on your iOS device when build completes
# Use QR code or download from EAS build page
```

### 4. Run the App

```bash
# Start development server
npm start

# Connect your custom dev client to the development server
# Scan QR code with your custom dev client
```

## 📱 Expo Go vs Custom Dev Client

| Feature | Expo Go | Custom Dev Client |
|---------|---------|------------------|
| App Launch | ✅ Works | ✅ Works |
| Mock Data Display | ✅ Available | ✅ Available |
| Real Usage Data | ❌ Not available | ✅ Available |
| Family Activity Picker | ❌ Not available | ✅ Available |
| Background Monitoring | ❌ Not available | ✅ Available |
| CSV Export | ✅ Mock data only | ✅ Real data |
| Authorization Flow | ❌ Simulated | ✅ Real permissions |

## 🏗 Architecture

### Native Layer (Swift)
- **DeviceUsageModule.swift**: Main native module bridging React Native to iOS APIs
- **DeviceUsageReportExtension.swift**: Background extension for data collection
- **Family Controls Integration**: Handles user authorization and app selection
- **Device Activity Monitoring**: Collects usage statistics in background

### Bridge Layer (TypeScript)
- **DeviceUsageBridge.ts**: Unified interface abstracting platform differences
- **Type Definitions**: Complete TypeScript interfaces for usage data
- **Error Handling**: Graceful fallbacks for unsupported scenarios
- **Event Emitters**: Real-time updates for authorization and data changes

### UI Layer (React Native)
- **UsageTableScreen.tsx**: Main interface with sortable table
- **DeviceUsageContext.tsx**: State management and data flow
- **Responsive Design**: Adapts to different screen sizes and accessibility needs

## 🎯 Features

### Data Display
- **Time-based Views**: Today, 7-day, and 30-day usage statistics
- **Sortable Columns**: Sort by app name, usage time, or percentage
- **Search & Filter**: Find specific apps or filter by minimum usage
- **Real-time Updates**: Automatic refresh as new data becomes available

### Export Capabilities
- **CSV Export**: Complete usage data export for external analysis
- **Filtered Exports**: Export only data matching current filters
- **Cross-platform Sharing**: Uses iOS native sharing capabilities

### Accessibility
- **VoiceOver Support**: Full screen reader compatibility
- **Dynamic Type**: Adapts to user's preferred text size
- **High Contrast**: Supports accessibility display modes

## 🔐 Privacy & Security

### Data Handling
- **Local Processing**: All data remains on device
- **No External Transmission**: No network requests for usage data
- **User Controlled**: Only selected apps are monitored
- **Transparent Permissions**: Clear explanation of data access needs

### App Store Compliance
- **Privacy Nutrition Labels**: Ready for App Store privacy requirements
- **Usage Descriptions**: User-friendly permission request strings
- **Data Minimization**: Only collects necessary usage statistics

## 🚀 Deployment

### Development Builds
```bash
# iOS development build
eas build --profile development --platform ios

# Preview build for internal testing
eas build --profile preview --platform ios
```

### Production Release
```bash
# Production build for App Store
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Manual Testing
See [TESTING.md](./TESTING.md) for comprehensive testing checklist including:
- Authorization flows
- Data collection verification
- UI interaction testing
- Accessibility validation
- Performance benchmarks

## 🔧 Configuration

### App Groups (Required)
The app uses App Groups for sharing data between the main app and the DeviceActivity extension:
- **App Group ID**: `group.com.yourcompany.deviceusage.shared`
- **Usage**: Inter-process communication for background data collection

### Entitlements
Required entitlements are automatically added by the config plugin:
- `com.apple.developer.family-controls`
- `com.apple.developer.deviceactivity`
- `com.apple.security.application-groups`

### Info.plist Entries
- `NSFamilyControlsUsageDescription`: Explains Screen Time access need
- `NSDeviceActivityUsageDescription`: Describes background monitoring
- `UIBackgroundModes`: Enables background processing

## 🐛 Troubleshooting

### Common Issues

#### "Module not found" errors
- Ensure you're using a custom dev client, not Expo Go
- Rebuild the development client after adding native modules
- Check that all dependencies are installed

#### "Permission denied" errors
- Verify Screen Time is enabled in iOS Settings
- Check that the user granted Family Controls permission
- Ensure the app has proper entitlements

#### "No data available"
- Allow time for data collection (starts from authorization)
- Verify apps have been selected for monitoring
- Check that selected apps have been used since monitoring started

#### Export failures
- Ensure device has adequate storage space
- Check sharing permissions in iOS Settings
- Try exporting smaller datasets

### Debug Steps
1. **Check iOS Version**: Verify device runs iOS 16.0+
2. **Verify Entitlements**: Use Xcode to inspect app entitlements
3. **Monitor Console**: Use Xcode Console for native module logs
4. **Test Permissions**: Reset app permissions and re-grant
5. **Rebuild Client**: Clean build when changing native code

## 🔮 Future Enhancements

### Planned Features
- **Android Support**: Implementation using UsageStatsManager API
- **Data Visualization**: Charts and graphs for usage trends
- **Goal Setting**: Daily/weekly usage limits and notifications
- **Category Analysis**: Breakdown by app categories
- **Historical Trends**: Long-term usage pattern analysis

### Technical Improvements
- **Offline Sync**: Robust data persistence and synchronization
- **Performance Optimization**: Lazy loading for large datasets
- **Advanced Filtering**: Complex query capabilities
- **Automation**: Scheduled reports and insights

## 📚 Additional Resources

### Apple Documentation
- [Family Controls Framework](https://developer.apple.com/documentation/familycontrols)
- [Device Activity Framework](https://developer.apple.com/documentation/deviceactivity)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Expo Documentation
- [Custom Development Client](https://docs.expo.dev/development/create-development-builds/)
- [Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### React Native Resources
- [Native Modules](https://reactnative.dev/docs/native-modules-intro)
- [TypeScript Support](https://reactnative.dev/docs/typescript)
- [Testing](https://reactnative.dev/docs/testing-overview)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

Please ensure all tests pass and follow the established code style before submitting.

---

For questions or support, please open an issue on the GitHub repository.
