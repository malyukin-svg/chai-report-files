import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { deviceUsage } from '../services/DeviceUsageBridge';
import type { 
  UsageSummary, 
  AuthorizationResult, 
  UsageRange,
  UsageRow 
} from '../types/DeviceUsage';

interface DeviceUsageContextValue {
  // Auth state
  isAuthorized: boolean;
  authorizationStatus: string;
  isLoading: boolean;
  
  // Usage data
  usageData: UsageSummary | null;
  currentRange: UsageRange;
  
  // Platform info
  isSupported: boolean;
  isExpoGo: boolean;
  
  // Actions
  requestAuthorization: () => Promise<void>;
  selectApps: () => Promise<void>;
  refreshUsageData: () => Promise<void>;
  setCurrentRange: (range: UsageRange) => void;
  
  // Utilities
  formatMinutes: (minutes: number) => string;
  exportToCSV: (data: UsageRow[]) => string;
}

const DeviceUsageContext = createContext<DeviceUsageContextValue | null>(null);

interface DeviceUsageProviderProps {
  children: ReactNode;
}

export function DeviceUsageProvider({ children }: DeviceUsageProviderProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authorizationStatus, setAuthorizationStatus] = useState('notDetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageSummary | null>(null);
  const [currentRange, setCurrentRange] = useState<UsageRange>('day');
  
  const isSupported = deviceUsage.isSupported();
  const isExpoGo = deviceUsage.isExpoGo();

  // Initialize and check authorization status
  useEffect(() => {
    checkAuthorizationStatus();
    setupEventListeners();
  }, []);

  // Load usage data when range changes or authorization is granted
  useEffect(() => {
    if (isAuthorized || isExpoGo) {
      loadUsageData();
    }
  }, [currentRange, isAuthorized, isExpoGo]);

  const checkAuthorizationStatus = async () => {
    try {
      setIsLoading(true);
      const result = await deviceUsage.getAuthorizationStatus();
      setAuthorizationStatus(result.status);
      setIsAuthorized(result.granted);
    } catch (error) {
      console.error('Error checking authorization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    const authListener = deviceUsage.addAuthorizationListener((event) => {
      setAuthorizationStatus(event.status);
      setIsAuthorized(event.status === 'approved');
    });

    const usageListener = deviceUsage.addUsageUpdateListener(() => {
      loadUsageData();
    });

    return () => {
      authListener();
      usageListener();
    };
  };

  const requestAuthorization = async () => {
    try {
      setIsLoading(true);
      
      if (isExpoGo) {
        Alert.alert(
          'Expo Go Limitation',
          'Device usage tracking requires a custom development client. Mock data will be shown for demonstration.',
          [{ text: 'OK' }]
        );
        setIsAuthorized(true);
        return;
      }

      if (!isSupported) {
        Alert.alert(
          'Not Supported',
          'Device usage tracking requires iOS 16 or later.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await deviceUsage.requestAuthorization();
      setAuthorizationStatus(result.status);
      setIsAuthorized(result.granted);

      if (!result.granted) {
        Alert.alert(
          'Permission Denied',
          'Please grant Screen Time permission in Settings > Screen Time > See All App & Website Activity to track your usage.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Authorization error:', error);
      Alert.alert(
        'Error',
        'Failed to request authorization. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectApps = async () => {
    try {
      if (isExpoGo) {
        Alert.alert(
          'Mock Mode',
          'App selection is not available in Expo Go. A predefined set of apps will be used for demonstration.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!isAuthorized) {
        Alert.alert(
          'Not Authorized',
          'Please authorize Screen Time access first.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await deviceUsage.presentFamilyActivityPicker();
      
      Alert.alert(
        'Apps Selected',
        `Successfully selected ${result.appCount} apps and ${result.categoryCount} categories for monitoring.`,
        [{ text: 'OK' }]
      );

      // Refresh data after selection
      await loadUsageData();
    } catch (error) {
      console.error('App selection error:', error);
      Alert.alert(
        'Error',
        'Failed to open app selection. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadUsageData = async () => {
    try {
      const data = await deviceUsage.getUsageSummary(currentRange);
      
      // Calculate percentages
      const totalMinutes = getCurrentTotalMinutes(data, currentRange);
      const appsWithPercentages = data.apps.map(app => ({
        ...app,
        percentOfTotal: totalMinutes > 0 ? 
          (getCurrentMinutes(app, currentRange) / totalMinutes) * 100 : 0
      }));

      setUsageData({
        ...data,
        apps: appsWithPercentages
      });
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  };

  const refreshUsageData = async () => {
    await loadUsageData();
  };

  const getCurrentMinutes = (app: UsageRow, range: UsageRange): number => {
    switch (range) {
      case 'day':
      case 'today':
        return app.minutesToday;
      case 'week':
      case '7d':
        return app.minutes7d;
      case 'month':
      case '30d':
        return app.minutes30d;
      default:
        return app.minutesToday;
    }
  };

  const getCurrentTotalMinutes = (data: UsageSummary, range: UsageRange): number => {
    switch (range) {
      case 'day':
      case 'today':
        return data.totals.today;
      case 'week':
      case '7d':
        return data.totals.week;
      case 'month':
      case '30d':
        return data.totals.month;
      default:
        return data.totals.today;
    }
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  };

  const exportToCSV = (data: UsageRow[]): string => {
    const headers = ['App Name', 'Bundle ID', 'Today (minutes)', '7 Days (minutes)', '30 Days (minutes)', '% of Total'];
    const rows = data.map(app => [
      app.appName,
      app.bundleId,
      app.minutesToday.toString(),
      app.minutes7d.toString(),
      app.minutes30d.toString(),
      (app.percentOfTotal?.toFixed(1) || '0') + '%'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  const contextValue: DeviceUsageContextValue = {
    isAuthorized,
    authorizationStatus,
    isLoading,
    usageData,
    currentRange,
    isSupported,
    isExpoGo,
    requestAuthorization,
    selectApps,
    refreshUsageData,
    setCurrentRange,
    formatMinutes,
    exportToCSV
  };

  return (
    <DeviceUsageContext.Provider value={contextValue}>
      {children}
    </DeviceUsageContext.Provider>
  );
}

export function useDeviceUsage(): DeviceUsageContextValue {
  const context = useContext(DeviceUsageContext);
  if (!context) {
    throw new Error('useDeviceUsage must be used within a DeviceUsageProvider');
  }
  return context;
}
