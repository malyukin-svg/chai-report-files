import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type { 
  DeviceUsageNativeModule, 
  AuthorizationResult, 
  PickerResult, 
  UsageSummary, 
  UsageRange 
} from '../types/DeviceUsage';

// Native module interface
const DeviceUsageNative = NativeModules.DeviceUsageModule as DeviceUsageNativeModule | undefined;

// Event emitter for listening to native events
const deviceUsageEmitter = DeviceUsageNative 
  ? new NativeEventEmitter(NativeModules.DeviceUsageModule)
  : null;

/**
 * Device Usage Bridge - Provides a unified interface to access device usage statistics
 * 
 * Platform Support:
 * - iOS 16+: Full support with FamilyControls framework
 * - iOS < 16: Not supported
 * - Android: Future implementation with UsageStatsManager
 * - Expo Go: Mock data only
 */
export class DeviceUsageBridge {
  private static instance: DeviceUsageBridge;
  
  static getInstance(): DeviceUsageBridge {
    if (!DeviceUsageBridge.instance) {
      DeviceUsageBridge.instance = new DeviceUsageBridge();
    }
    return DeviceUsageBridge.instance;
  }

  /**
   * Check if device usage features are available on this platform
   */
  isSupported(): boolean {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    // Check iOS version - requires iOS 16+
    const iosVersion = Platform.Version;
    if (typeof iosVersion === 'string') {
      const majorVersion = parseInt(iosVersion.split('.')[0], 10);
      return majorVersion >= 16;
    }
    
    return iosVersion >= 16;
  }

  /**
   * Check if running in Expo Go (which doesn't support custom native modules)
   */
  isExpoGo(): boolean {
    return !DeviceUsageNative;
  }

  /**
   * Request authorization for Family Controls
   */
  async requestAuthorization(): Promise<AuthorizationResult> {
    if (!DeviceUsageNative) {
      throw new Error('Device usage not available in Expo Go. Use a custom dev client.');
    }

    if (!this.isSupported()) {
      throw new Error('Device usage requires iOS 16 or later');
    }

    return DeviceUsageNative.requestAuthorization();
  }

  /**
   * Get current authorization status
   */
  async getAuthorizationStatus(): Promise<AuthorizationResult> {
    if (!DeviceUsageNative) {
      return { status: 'notDetermined', granted: false };
    }

    if (!this.isSupported()) {
      return { status: 'denied', granted: false };
    }

    return DeviceUsageNative.getAuthorizationStatus();
  }

  /**
   * Present the Family Activity Picker to select apps/categories to monitor
   */
  async presentFamilyActivityPicker(): Promise<PickerResult> {
    if (!DeviceUsageNative) {
      throw new Error('Family Activity Picker not available in Expo Go');
    }

    if (!this.isSupported()) {
      throw new Error('Family Activity Picker requires iOS 16 or later');
    }

    return DeviceUsageNative.presentFamilyActivityPicker();
  }

  /**
   * Get usage summary for the specified time range
   */
  async getUsageSummary(range: UsageRange = 'day'): Promise<UsageSummary> {
    if (!DeviceUsageNative) {
      // Return mock data for Expo Go
      return this.getMockUsageSummary(range);
    }

    if (!this.isSupported()) {
      throw new Error('Usage summary requires iOS 16 or later');
    }

    return DeviceUsageNative.getUsageSummary(range);
  }

  /**
   * Start monitoring selected apps and categories
   */
  async startMonitoring(): Promise<{ success: boolean }> {
    if (!DeviceUsageNative) {
      return { success: false };
    }

    if (!this.isSupported()) {
      throw new Error('Monitoring requires iOS 16 or later');
    }

    return DeviceUsageNative.startMonitoring();
  }

  /**
   * Add listener for authorization status changes
   */
  addAuthorizationListener(callback: (event: { status: string }) => void): () => void {
    if (!deviceUsageEmitter) {
      return () => {}; // No-op for Expo Go
    }

    const subscription = deviceUsageEmitter.addListener('onAuthorizationStatusChanged', callback);
    return () => subscription.remove();
  }

  /**
   * Add listener for usage data updates
   */
  addUsageUpdateListener(callback: (event: any) => void): () => void {
    if (!deviceUsageEmitter) {
      return () => {}; // No-op for Expo Go
    }

    const subscription = deviceUsageEmitter.addListener('onUsageDataUpdated', callback);
    return () => subscription.remove();
  }

  /**
   * Generate mock usage data for development in Expo Go
   */
  private getMockUsageSummary(range: UsageRange): UsageSummary {
    const mockApps = [
      {
        bundleId: 'com.apple.MobileSMS',
        appName: 'Messages',
        minutesToday: 45,
        minutes7d: 320,
        minutes30d: 1250,
      },
      {
        bundleId: 'com.apple.mobilemail',
        appName: 'Mail',
        minutesToday: 25,
        minutes7d: 180,
        minutes30d: 720,
      },
      {
        bundleId: 'com.apple.mobilesafari',
        appName: 'Safari',
        minutesToday: 60,
        minutes7d: 420,
        minutes30d: 1680,
      },
      {
        bundleId: 'com.instagram.ios',
        appName: 'Instagram',
        minutesToday: 35,
        minutes7d: 245,
        minutes30d: 980,
      },
      {
        bundleId: 'com.spotify.client',
        appName: 'Spotify',
        minutesToday: 120,
        minutes7d: 840,
        minutes30d: 3360,
      },
      {
        bundleId: 'com.apple.mobileslideshow',
        appName: 'Photos',
        minutesToday: 15,
        minutes7d: 105,
        minutes30d: 420,
      }
    ];

    // Add some randomization to mock data
    const randomizedApps = mockApps.map(app => ({
      ...app,
      minutesToday: Math.floor(app.minutesToday * (0.8 + Math.random() * 0.4)),
      minutes7d: Math.floor(app.minutes7d * (0.8 + Math.random() * 0.4)),
      minutes30d: Math.floor(app.minutes30d * (0.8 + Math.random() * 0.4)),
    }));

    const totals = {
      today: randomizedApps.reduce((sum, app) => sum + app.minutesToday, 0),
      week: randomizedApps.reduce((sum, app) => sum + app.minutes7d, 0),
      month: randomizedApps.reduce((sum, app) => sum + app.minutes30d, 0),
    };

    return {
      apps: randomizedApps,
      totals,
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const deviceUsage = DeviceUsageBridge.getInstance();
