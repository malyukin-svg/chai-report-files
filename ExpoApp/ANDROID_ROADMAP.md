# Android Implementation Path

While this app currently focuses on iOS, here's a roadmap for implementing similar functionality on Android using the UsageStatsManager API.

## Android Platform Overview

### Available APIs
- **UsageStatsManager**: Access to app usage statistics (API 21+)
- **UsageEvents**: Detailed app interaction events
- **NetworkStatsManager**: Network usage data (API 23+)

### Permission Requirements
- `PACKAGE_USAGE_STATS`: Special permission requiring user approval via Settings
- `QUERY_ALL_PACKAGES`: For app metadata access (API 30+)

## Implementation Strategy

### 1. Native Android Module

```kotlin
// Android Native Module (Kotlin)
class DeviceUsageModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val usageStatsManager: UsageStatsManager by lazy {
        reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    }
    
    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        if (hasUsageStatsPermission()) {
            promise.resolve(mapOf("granted" to true))
        } else {
            // Launch Settings app to grant permission
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            currentActivity?.startActivity(intent)
            promise.resolve(mapOf("granted" to false))
        }
    }
    
    @ReactMethod
    fun getUsageStats(range: String, promise: Promise) {
        if (!hasUsageStatsPermission()) {
            promise.reject("PERMISSION_DENIED", "Usage stats permission not granted")
            return
        }
        
        val (startTime, endTime) = getTimeRange(range)
        val usageStats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )
        
        val result = usageStats.map { stat ->
            mapOf(
                "packageName" to stat.packageName,
                "totalTimeInForeground" to stat.totalTimeInForeground,
                "firstTimeStamp" to stat.firstTimeStamp,
                "lastTimeStamp" to stat.lastTimeStamp
            )
        }
        
        promise.resolve(result)
    }
    
    private fun hasUsageStatsPermission(): Boolean {
        val appOpsManager = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOpsManager.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            reactApplicationContext.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }
}
```

### 2. Permission Flow Differences

#### iOS vs Android Permission Model
| Aspect | iOS (FamilyControls) | Android (UsageStats) |
|--------|---------------------|---------------------|
| Permission Type | In-app prompt | Settings app redirect |
| User Selection | App-specific picker | All-or-nothing access |
| Granularity | Selected apps only | All installed apps |
| Historical Data | From authorization | Full historical access |

#### Android Permission Implementation
```typescript
// Android-specific permission handling
export class AndroidUsageManager {
  async requestPermission(): Promise<boolean> {
    const result = await DeviceUsageNative.requestUsageStatsPermission();
    
    if (!result.granted) {
      // Show instructions for manual permission grant
      Alert.alert(
        'Permission Required',
        'To view usage statistics, please:\n\n1. Find this app in the list\n2. Toggle "Allow usage access" ON\n3. Return to the app',
        [
          { text: 'Open Settings', onPress: () => this.openUsageSettings() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
    
    return result.granted;
  }
  
  private openUsageSettings() {
    // Native module opens Settings.ACTION_USAGE_ACCESS_SETTINGS
    DeviceUsageNative.requestUsageStatsPermission();
  }
}
```

### 3. Data Structure Mapping

```typescript
// Unified data interface for both platforms
interface PlatformUsageData {
  ios?: {
    applicationTokens: string[];
    categoryTokens: string[];
    userSelected: boolean;
  };
  android?: {
    packageName: string;
    totalTimeInForeground: number;
    appInfo: {
      displayName: string;
      icon: string;
    };
  };
}

// Cross-platform usage row
interface UnifiedUsageRow {
  identifier: string; // bundleId (iOS) or packageName (Android)
  displayName: string;
  icon?: string;
  minutesToday: number;
  minutes7d: number;
  minutes30d: number;
}
```

### 4. Android-Specific Features

#### Package Manager Integration
```kotlin
private fun getAppDisplayName(packageName: String): String {
    return try {
        val appInfo = packageManager.getApplicationInfo(packageName, 0)
        packageManager.getApplicationLabel(appInfo).toString()
    } catch (e: PackageManager.NameNotFoundException) {
        packageName // Fallback to package name
    }
}

private fun getAppIcon(packageName: String): Drawable? {
    return try {
        packageManager.getApplicationIcon(packageName)
    } catch (e: PackageManager.NameNotFoundException) {
        null
    }
}
```

#### Network Usage Integration
```kotlin
@ReactMethod
fun getNetworkUsage(promise: Promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val networkStatsManager = reactApplicationContext
            .getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
        
        // Query network usage data
        val bucket = networkStatsManager.querySummaryForDevice(
            ConnectivityManager.TYPE_WIFI,
            null,
            startTime,
            endTime
        )
        
        promise.resolve(mapOf(
            "rxBytes" to bucket.rxBytes,
            "txBytes" to bucket.txBytes
        ))
    } else {
        promise.reject("API_NOT_AVAILABLE", "NetworkStatsManager requires API 23+")
    }
}
```

### 5. Platform Detection and Routing

```typescript
// Platform-aware usage provider
export class UniversalUsageProvider {
  private iosManager: DeviceUsageBridge;
  private androidManager: AndroidUsageManager;
  
  constructor() {
    if (Platform.OS === 'ios') {
      this.iosManager = new DeviceUsageBridge();
    } else if (Platform.OS === 'android') {
      this.androidManager = new AndroidUsageManager();
    }
  }
  
  async getUsageData(range: UsageRange): Promise<UnifiedUsageRow[]> {
    if (Platform.OS === 'ios') {
      const iosData = await this.iosManager.getUsageSummary(range);
      return this.convertIOSData(iosData);
    } else if (Platform.OS === 'android') {
      const androidData = await this.androidManager.getUsageStats(range);
      return this.convertAndroidData(androidData);
    }
    
    throw new Error('Platform not supported');
  }
  
  private convertIOSData(data: UsageSummary): UnifiedUsageRow[] {
    return data.apps.map(app => ({
      identifier: app.bundleId,
      displayName: app.appName,
      icon: app.iconUri,
      minutesToday: app.minutesToday,
      minutes7d: app.minutes7d,
      minutes30d: app.minutes30d
    }));
  }
  
  private convertAndroidData(data: AndroidUsageStats[]): UnifiedUsageRow[] {
    // Convert Android usage stats to unified format
    return data.map(stat => ({
      identifier: stat.packageName,
      displayName: stat.appInfo.displayName,
      icon: stat.appInfo.icon,
      minutesToday: Math.floor(stat.totalTimeInForeground / 60000),
      minutes7d: Math.floor(stat.weeklyTotal / 60000),
      minutes30d: Math.floor(stat.monthlyTotal / 60000)
    }));
  }
}
```

### 6. Configuration Updates

#### Expo Config Plugin for Android
```typescript
// Update device-usage-plugin.ts for Android support
const withAndroidUsagePermissions: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = getMainApplicationOrThrow(config.modResults);
    
    // Add required permissions
    addUsesToPermission(config.modResults, {
      name: 'android.permission.PACKAGE_USAGE_STATS',
      tools: 'replace'
    });
    
    if (getMinSdkVersionFromBuildGradle() >= 30) {
      addUsesToPermission(config.modResults, {
        name: 'android.permission.QUERY_ALL_PACKAGES'
      });
    }
    
    return config;
  });
};
```

### 7. Testing Strategy for Android

#### Emulator Testing
```bash
# Enable usage stats permission via ADB
adb shell appops set com.yourpackage.name GET_USAGE_STATS allow

# Query usage stats directly
adb shell dumpsys usagestats
```

#### Device Testing Checklist
- [ ] Test on Android 5.0+ (API 21+)
- [ ] Verify permission flow on different Android versions
- [ ] Test with different OEM customizations (Samsung, etc.)
- [ ] Check performance with large numbers of installed apps
- [ ] Validate data accuracy against Android Settings

### 8. Migration Path

#### Phase 1: Core Infrastructure
1. Create Android native module
2. Implement basic permission flow
3. Add usage stats querying
4. Create unified data interface

#### Phase 2: Feature Parity
1. Port table UI components
2. Implement sorting and filtering
3. Add CSV export functionality
4. Create platform-aware context

#### Phase 3: Android-Specific Features
1. Network usage integration
2. Enhanced app metadata
3. System-level usage insights
4. Android-specific UI patterns

### 9. Deployment Considerations

#### Google Play Store Requirements
- Declare PACKAGE_USAGE_STATS permission usage clearly
- Provide detailed privacy policy
- Explain legitimate use case for sensitive permissions
- Include user-facing permission explanations

#### Technical Challenges
- **OEM Variations**: Different Android skins may affect API behavior
- **Battery Optimization**: Apps may be restricted from background usage stats access
- **Privacy Changes**: Newer Android versions have stricter usage stats access
- **Performance**: Large numbers of installed apps can impact query performance

This Android implementation would provide feature parity with the iOS version while leveraging Android's more permissive usage statistics APIs. The unified interface ensures a consistent user experience across platforms.
