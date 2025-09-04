import { ConfigPlugin, withInfoPlist, withEntitlementsPlist } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';

const withDeviceUsageCapabilities: ConfigPlugin = (config) => {
  // Add entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults = {
      ...config.modResults,
      'com.apple.developer.family-controls': true,
      'com.apple.developer.deviceactivity': true,
      'com.apple.security.application-groups': [
        'group.com.yourcompany.deviceusage.shared'
      ],
      'com.apple.developer.default-data-protection': 'NSFileProtectionComplete'
    };
    return config;
  });

  // Add Info.plist entries
  config = withInfoPlist(config, (config) => {
    config.modResults = {
      ...config.modResults,
      NSFamilyControlsUsageDescription: 'This app needs access to screen time data to show your app usage statistics and help you track your digital wellbeing.',
      NSDeviceActivityUsageDescription: 'This app monitors your app usage to provide personalized insights about your screen time patterns.',
      UIBackgroundModes: [
        ...(config.modResults.UIBackgroundModes || []),
        'background-processing'
      ]
    };
    return config;
  });

  return config;
};

export default withDeviceUsageCapabilities;
