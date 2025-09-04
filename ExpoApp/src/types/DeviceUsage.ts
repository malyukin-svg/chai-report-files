export interface UsageRow {
  bundleId: string;
  appName: string;
  iconUri?: string;
  minutesToday: number;
  minutes7d: number;
  minutes30d: number;
  percentOfTotal?: number;
}

export interface UsageTotals {
  today: number;
  week: number;
  month: number;
}

export interface UsageSummary {
  apps: UsageRow[];
  totals: UsageTotals;
  lastUpdated: string;
}

export interface AuthorizationResult {
  status: 'notDetermined' | 'denied' | 'approved' | 'unknown';
  granted: boolean;
}

export interface PickerResult {
  appCount: number;
  categoryCount: number;
}

export type UsageRange = 'day' | 'week' | 'month' | 'today' | '7d' | '30d';

export interface DeviceUsageNativeModule {
  requestAuthorization(): Promise<AuthorizationResult>;
  getAuthorizationStatus(): Promise<AuthorizationResult>;
  presentFamilyActivityPicker(): Promise<PickerResult>;
  getUsageSummary(range: UsageRange): Promise<UsageSummary>;
  startMonitoring(): Promise<{ success: boolean }>;
  
  // Event emitter methods
  addListener(eventName: string, listener: (...args: any[]) => any): void;
  removeListeners(count: number): void;
}
