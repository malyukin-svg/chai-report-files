/**
 * Device Usage Utility Functions
 * Shared utilities for formatting and processing usage data
 */

export class UsageUtils {
  /**
   * Format minutes into human readable time string
   */
  static formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Calculate percentage of total usage
   */
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  /**
   * Generate CSV content from usage data
   */
  static generateCSV(data: Array<{
    appName: string;
    bundleId: string;
    minutesToday: number;
    minutes7d: number;
    minutes30d: number;
    percentOfTotal?: number;
  }>): string {
    const headers = [
      'App Name',
      'Bundle ID', 
      'Today (minutes)',
      '7 Days (minutes)',
      '30 Days (minutes)',
      '% of Total'
    ];

    const rows = data.map(app => [
      app.appName,
      app.bundleId,
      app.minutesToday.toString(),
      app.minutes7d.toString(),
      app.minutes30d.toString(),
      (app.percentOfTotal?.toFixed(1) || '0') + '%'
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Sort usage data by specified field and direction
   */
  static sortUsageData<T extends Record<string, any>>(
    data: T[],
    field: keyof T,
    direction: 'asc' | 'desc'
  ): T[] {
    return [...data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }

  /**
   * Filter usage data by search text and minimum minutes
   */
  static filterUsageData(
    data: Array<{
      appName: string;
      bundleId: string;
      minutesToday: number;
      minutes7d: number;
      minutes30d: number;
    }>,
    searchText: string,
    minMinutes: number,
    timeRange: 'today' | '7d' | '30d'
  ) {
    return data.filter(app => {
      // Search filter
      const matchesSearch = !searchText || 
        app.appName.toLowerCase().includes(searchText.toLowerCase()) ||
        app.bundleId.toLowerCase().includes(searchText.toLowerCase());

      // Minutes filter
      const appMinutes = timeRange === 'today' ? app.minutesToday :
                        timeRange === '7d' ? app.minutes7d : app.minutes30d;
      const matchesMinutes = appMinutes >= minMinutes;

      return matchesSearch && matchesMinutes;
    });
  }

  /**
   * Validate bundle identifier format
   */
  static isValidBundleId(bundleId: string): boolean {
    const bundleIdRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*(\.[a-zA-Z0-9][a-zA-Z0-9\-]*)+$/;
    return bundleIdRegex.test(bundleId);
  }

  /**
   * Generate mock usage data for testing
   */
  static generateMockData(appCount: number = 10): Array<{
    bundleId: string;
    appName: string;
    minutesToday: number;
    minutes7d: number;
    minutes30d: number;
  }> {
    const sampleApps = [
      { bundleId: 'com.apple.MobileSMS', appName: 'Messages' },
      { bundleId: 'com.apple.mobilemail', appName: 'Mail' },
      { bundleId: 'com.apple.mobilesafari', appName: 'Safari' },
      { bundleId: 'com.instagram.ios', appName: 'Instagram' },
      { bundleId: 'com.spotify.client', appName: 'Spotify' },
      { bundleId: 'com.apple.mobileslideshow', appName: 'Photos' },
      { bundleId: 'com.twitter.twitter', appName: 'Twitter' },
      { bundleId: 'com.facebook.Facebook', appName: 'Facebook' },
      { bundleId: 'com.google.Gmail', appName: 'Gmail' },
      { bundleId: 'com.netflix.Netflix', appName: 'Netflix' },
    ];

    return sampleApps.slice(0, appCount).map(app => ({
      ...app,
      minutesToday: Math.floor(Math.random() * 180) + 5, // 5-185 minutes
      minutes7d: Math.floor(Math.random() * 1200) + 50,  // 50-1250 minutes
      minutes30d: Math.floor(Math.random() * 4800) + 200, // 200-5000 minutes
    }));
  }
}
