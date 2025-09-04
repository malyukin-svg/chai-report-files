import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Share,
  Platform,
  SafeAreaView
} from 'react-native';
import { useDeviceUsage } from '../contexts/DeviceUsageContext';
import type { UsageRow, UsageRange } from '../types/DeviceUsage';

type SortField = 'appName' | 'minutesToday' | 'minutes7d' | 'minutes30d' | 'percentOfTotal';
type SortDirection = 'asc' | 'desc';

export function UsageTableScreen() {
  const {
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
  } = useDeviceUsage();

  const [searchText, setSearchText] = useState('');
  const [minMinutes, setMinMinutes] = useState('');
  const [sortField, setSortField] = useState<SortField>('minutesToday');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!usageData?.apps) return [];

    let filtered = usageData.apps.filter(app => {
      const matchesSearch = app.appName.toLowerCase().includes(searchText.toLowerCase()) ||
                          app.bundleId.toLowerCase().includes(searchText.toLowerCase());
      
      const minMinutesNum = parseInt(minMinutes) || 0;
      const appMinutes = getCurrentMinutes(app);
      const matchesMinutes = appMinutes >= minMinutesNum;

      return matchesSearch && matchesMinutes;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'appName':
          aValue = a.appName;
          bValue = b.appName;
          break;
        case 'percentOfTotal':
          aValue = a.percentOfTotal || 0;
          bValue = b.percentOfTotal || 0;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [usageData, searchText, minMinutes, sortField, sortDirection, currentRange]);

  const getCurrentMinutes = (app: UsageRow): number => {
    switch (currentRange) {
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

  const getCurrentTotal = (): number => {
    if (!usageData) return 0;
    switch (currentRange) {
      case 'day':
      case 'today':
        return usageData.totals.today;
      case 'week':
      case '7d':
        return usageData.totals.week;
      case 'month':
      case '30d':
        return usageData.totals.month;
      default:
        return usageData.totals.today;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = async () => {
    if (!usageData?.apps) {
      Alert.alert('No Data', 'No usage data available to export.');
      return;
    }

    try {
      const csvContent = exportToCSV(filteredAndSortedData);
      const fileName = `screen-time-${currentRange}-${new Date().toISOString().split('T')[0]}.csv`;
      
      if (Platform.OS === 'ios') {
        await Share.share({
          message: csvContent,
          title: 'Screen Time Export'
        });
      } else {
        // For Android, you would typically write to a file and share it
        await Share.share({
          message: csvContent,
          title: 'Screen Time Export'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Screen Time</Text>
      
      {isExpoGo && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>
            📱 Demo Mode - Using mock data in Expo Go
          </Text>
        </View>
      )}

      {!isSupported && !isExpoGo && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ❌ Requires iOS 16 or later
          </Text>
        </View>
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Screen Time</Text>
        <Text style={styles.totalValue}>{formatMinutes(getCurrentTotal())}</Text>
      </View>

      {/* Range Selector */}
      <View style={styles.rangeSelector}>
        {(['day', 'week', 'month'] as UsageRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              currentRange === range && styles.rangeButtonActive
            ]}
            onPress={() => setCurrentRange(range)}
          >
            <Text style={[
              styles.rangeButtonText,
              currentRange === range && styles.rangeButtonTextActive
            ]}>
              {range === 'day' ? 'Today' : range === 'week' ? '7 Days' : '30 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isAuthorized && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestAuthorization}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Loading...' : 'Enable Screen Time'}
            </Text>
          </TouchableOpacity>
        )}

        {isAuthorized && !isExpoGo && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={selectApps}
          >
            <Text style={styles.secondaryButtonText}>Select Apps</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleExportCSV}
          disabled={!usageData?.apps?.length}
        >
          <Text style={styles.secondaryButtonText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          value={searchText}
          onChangeText={setSearchText}
        />
        
        <TextInput
          style={styles.minMinutesInput}
          placeholder="Min minutes"
          value={minMinutes}
          onChangeText={setMinMinutes}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <TouchableOpacity
        style={styles.headerCell}
        onPress={() => handleSort('appName')}
      >
        <Text style={styles.headerText}>
          App {sortField === 'appName' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.headerCellNarrow}
        onPress={() => handleSort('minutesToday')}
      >
        <Text style={styles.headerText}>
          Today {sortField === 'minutesToday' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.headerCellNarrow}
        onPress={() => handleSort('minutes7d')}
      >
        <Text style={styles.headerText}>
          7d {sortField === 'minutes7d' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.headerCellNarrow}
        onPress={() => handleSort('minutes30d')}
      >
        <Text style={styles.headerText}>
          30d {sortField === 'minutes30d' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.headerCellNarrow}
        onPress={() => handleSort('percentOfTotal')}
      >
        <Text style={styles.headerText}>
          % {sortField === 'percentOfTotal' && (sortDirection === 'asc' ? '↑' : '↓')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppRow = (app: UsageRow, index: number) => (
    <View 
      key={app.bundleId} 
      style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
    >
      <View style={styles.cell}>
        <Text style={styles.appName} numberOfLines={1}>
          {app.appName}
        </Text>
        <Text style={styles.bundleId} numberOfLines={1}>
          {app.bundleId}
        </Text>
      </View>
      
      <View style={styles.cellNarrow}>
        <Text style={styles.cellText}>{formatMinutes(app.minutesToday)}</Text>
      </View>
      
      <View style={styles.cellNarrow}>
        <Text style={styles.cellText}>{formatMinutes(app.minutes7d)}</Text>
      </View>
      
      <View style={styles.cellNarrow}>
        <Text style={styles.cellText}>{formatMinutes(app.minutes30d)}</Text>
      </View>
      
      <View style={styles.cellNarrow}>
        <Text style={styles.cellText}>
          {(app.percentOfTotal || 0).toFixed(1)}%
        </Text>
      </View>
    </View>
  );

  if (!isSupported && !isExpoGo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorTitle}>Not Supported</Text>
          <Text style={styles.errorMessage}>
            Screen Time tracking requires iOS 16 or later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshUsageData}
          />
        }
      >
        {renderHeader()}

        {(isAuthorized || isExpoGo) && usageData && (
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {filteredAndSortedData.map(renderAppRow)}
            
            {filteredAndSortedData.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No apps match your current filters.
                </Text>
              </View>
            )}
          </View>
        )}

        {!isAuthorized && !isExpoGo && (
          <View style={styles.centeredContainer}>
            <Text style={styles.infoTitle}>Screen Time Access Required</Text>
            <Text style={styles.infoMessage}>
              To view your app usage statistics, please grant Screen Time permission.
              This data stays on your device and is never shared.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  mockBanner: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  mockBannerText: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    textAlign: 'center',
    color: '#721c24',
    fontSize: 14,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  rangeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  minMinutesInput: {
    width: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  tableContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    flex: 1,
    padding: 12,
  },
  headerCellNarrow: {
    width: 60,
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  cell: {
    flex: 1,
    padding: 12,
  },
  cellNarrow: {
    width: 60,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bundleId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cellText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
