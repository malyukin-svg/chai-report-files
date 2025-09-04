import { UsageUtils } from '../src/utils/UsageUtils';

describe('UsageUtils', () => {
  describe('formatMinutes', () => {
    it('should format minutes less than 60', () => {
      expect(UsageUtils.formatMinutes(30)).toBe('30m');
      expect(UsageUtils.formatMinutes(0)).toBe('0m');
      expect(UsageUtils.formatMinutes(59)).toBe('59m');
    });

    it('should format exact hours', () => {
      expect(UsageUtils.formatMinutes(60)).toBe('1h');
      expect(UsageUtils.formatMinutes(120)).toBe('2h');
      expect(UsageUtils.formatMinutes(180)).toBe('3h');
    });

    it('should format hours and minutes', () => {
      expect(UsageUtils.formatMinutes(90)).toBe('1h 30m');
      expect(UsageUtils.formatMinutes(125)).toBe('2h 5m');
      expect(UsageUtils.formatMinutes(245)).toBe('4h 5m');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate correct percentages', () => {
      expect(UsageUtils.calculatePercentage(25, 100)).toBe(25);
      expect(UsageUtils.calculatePercentage(50, 200)).toBe(25);
      expect(UsageUtils.calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    });

    it('should handle zero total', () => {
      expect(UsageUtils.calculatePercentage(10, 0)).toBe(0);
    });
  });

  describe('generateCSV', () => {
    it('should generate proper CSV format', () => {
      const data = [
        {
          appName: 'Test App',
          bundleId: 'com.test.app',
          minutesToday: 30,
          minutes7d: 210,
          minutes30d: 900,
          percentOfTotal: 15.5
        }
      ];

      const csv = UsageUtils.generateCSV(data);
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('"App Name","Bundle ID","Today (minutes)","7 Days (minutes)","30 Days (minutes)","% of Total"');
      expect(lines[1]).toBe('"Test App","com.test.app","30","210","900","15.5%"');
    });
  });

  describe('isValidBundleId', () => {
    it('should validate correct bundle IDs', () => {
      expect(UsageUtils.isValidBundleId('com.apple.MobileSMS')).toBe(true);
      expect(UsageUtils.isValidBundleId('com.company.app-name')).toBe(true);
      expect(UsageUtils.isValidBundleId('org.example.MyApp')).toBe(true);
    });

    it('should reject invalid bundle IDs', () => {
      expect(UsageUtils.isValidBundleId('invalid')).toBe(false);
      expect(UsageUtils.isValidBundleId('com.')).toBe(false);
      expect(UsageUtils.isValidBundleId('.com.app')).toBe(false);
      expect(UsageUtils.isValidBundleId('com..app')).toBe(false);
    });
  });

  describe('sortUsageData', () => {
    const mockData = [
      { appName: 'Zebra', minutesToday: 10 },
      { appName: 'Apple', minutesToday: 30 },
      { appName: 'Beta', minutesToday: 20 }
    ];

    it('should sort by string field ascending', () => {
      const sorted = UsageUtils.sortUsageData(mockData, 'appName', 'asc');
      expect(sorted.map(d => d.appName)).toEqual(['Apple', 'Beta', 'Zebra']);
    });

    it('should sort by string field descending', () => {
      const sorted = UsageUtils.sortUsageData(mockData, 'appName', 'desc');
      expect(sorted.map(d => d.appName)).toEqual(['Zebra', 'Beta', 'Apple']);
    });

    it('should sort by numeric field descending', () => {
      const sorted = UsageUtils.sortUsageData(mockData, 'minutesToday', 'desc');
      expect(sorted.map(d => d.minutesToday)).toEqual([30, 20, 10]);
    });
  });

  describe('filterUsageData', () => {
    const mockData = [
      {
        appName: 'Messages',
        bundleId: 'com.apple.MobileSMS',
        minutesToday: 45,
        minutes7d: 320,
        minutes30d: 1250
      },
      {
        appName: 'Safari',
        bundleId: 'com.apple.mobilesafari',
        minutesToday: 15,
        minutes7d: 100,
        minutes30d: 400
      }
    ];

    it('should filter by search text', () => {
      const filtered = UsageUtils.filterUsageData(mockData, 'mess', 0, 'today');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].appName).toBe('Messages');
    });

    it('should filter by minimum minutes', () => {
      const filtered = UsageUtils.filterUsageData(mockData, '', 20, 'today');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].appName).toBe('Messages');
    });

    it('should filter by different time ranges', () => {
      const filtered7d = UsageUtils.filterUsageData(mockData, '', 200, '7d');
      expect(filtered7d).toHaveLength(1);
      expect(filtered7d[0].appName).toBe('Messages');
    });
  });

  describe('generateMockData', () => {
    it('should generate requested number of apps', () => {
      const data = UsageUtils.generateMockData(5);
      expect(data).toHaveLength(5);
    });

    it('should generate data with proper structure', () => {
      const data = UsageUtils.generateMockData(1);
      const app = data[0];
      
      expect(app).toHaveProperty('bundleId');
      expect(app).toHaveProperty('appName');
      expect(app).toHaveProperty('minutesToday');
      expect(app).toHaveProperty('minutes7d');
      expect(app).toHaveProperty('minutes30d');
      
      expect(typeof app.minutesToday).toBe('number');
      expect(app.minutesToday).toBeGreaterThan(0);
    });
  });
});
