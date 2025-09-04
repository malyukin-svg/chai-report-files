# Manual Testing Checklist for iOS Device Usage App

## Pre-Test Setup
- [ ] Install dependencies: `npm install`
- [ ] Create custom dev client: `eas build --profile development --platform ios`
- [ ] Install dev client on physical iOS device (iOS 16+)
- [ ] Ensure device has Screen Time enabled in Settings

## Authorization Flow Tests

### First Launch (Expo Go)
- [ ] Launch app in Expo Go
- [ ] Verify mock data banner is displayed
- [ ] Verify "Demo Mode - Using mock data" message
- [ ] Check that mock data is displayed in table
- [ ] Verify "Select Apps" button shows limitation alert

### First Launch (Custom Dev Client)
- [ ] Launch app in custom dev client
- [ ] Tap "Enable Screen Time" button
- [ ] Verify Family Controls permission prompt appears
- [ ] Grant permission and verify success state
- [ ] Check authorization status updates correctly

### Permission Denied Flow
- [ ] Reset app permissions in Settings > Privacy & Security > Screen Time
- [ ] Launch app
- [ ] Tap "Enable Screen Time"
- [ ] Deny permission
- [ ] Verify appropriate error message displays
- [ ] Verify app remains in unauthorized state

## App Selection Tests

### Family Activity Picker
- [ ] With authorization granted, tap "Select Apps"
- [ ] Verify FamilyActivityPicker opens
- [ ] Select several apps and categories
- [ ] Tap "Done"
- [ ] Verify success alert with app/category counts
- [ ] Check that monitoring starts automatically

### Re-selection
- [ ] Tap "Select Apps" again
- [ ] Verify previous selection is maintained
- [ ] Add/remove apps from selection
- [ ] Verify changes are reflected in monitoring

## Data Display Tests

### Table Functionality
- [ ] Verify app names and bundle IDs display correctly
- [ ] Check that usage times show in Today/7d/30d columns
- [ ] Verify percentage calculations are accurate
- [ ] Test sorting by each column (ascending/descending)
- [ ] Verify sort indicators (↑↓) work correctly

### Time Range Selection
- [ ] Test "Today" range selection
- [ ] Test "7 Days" range selection  
- [ ] Test "30 Days" range selection
- [ ] Verify total screen time updates for each range
- [ ] Check that data remains consistent

### Filtering
- [ ] Enter text in search box
- [ ] Verify apps filter by name and bundle ID
- [ ] Test case-insensitive search
- [ ] Enter minimum minutes value
- [ ] Verify apps below threshold are hidden
- [ ] Test combined search + minutes filtering

## Data Refresh Tests

### Pull to Refresh
- [ ] Pull down on table to refresh
- [ ] Verify loading indicator appears
- [ ] Check that data updates (timestamps change)
- [ ] Test refresh with network connectivity issues

### Background Updates
- [ ] Leave app running in background for >1 minute
- [ ] Return to app
- [ ] Verify data has updated automatically
- [ ] Check last updated timestamp

## Export Functionality

### CSV Export
- [ ] Tap "Export CSV" button
- [ ] Verify share sheet appears
- [ ] Save to Files app
- [ ] Open CSV file and verify data integrity
- [ ] Check column headers are correct
- [ ] Verify data matches table display

### Export with Filters
- [ ] Apply search filter
- [ ] Apply minimum minutes filter
- [ ] Export CSV
- [ ] Verify only filtered data is exported

## Error Handling Tests

### iOS Version Compatibility
- [ ] Test on iOS 15 device (if available)
- [ ] Verify "Not Supported" message displays
- [ ] Check that no crashes occur

### No Data Scenarios
- [ ] Fresh app install with no monitored apps
- [ ] Verify empty state message displays
- [ ] Check that totals show zero values
- [ ] Verify export button is disabled

### Permission Revocation
- [ ] Grant permissions initially
- [ ] Revoke Screen Time permission in Settings
- [ ] Return to app
- [ ] Verify permission status updates
- [ ] Check appropriate messaging displays

## Performance Tests

### Large Dataset
- [ ] Select many apps for monitoring
- [ ] Allow data collection for several days
- [ ] Verify table scrolling remains smooth
- [ ] Check sorting performance with large dataset
- [ ] Test search performance with many apps

### Memory Usage
- [ ] Monitor memory usage during extended use
- [ ] Test app backgrounding/foregrounding
- [ ] Verify no memory leaks during data refresh
- [ ] Check performance with rapid filter changes

## Accessibility Tests

### VoiceOver
- [ ] Enable VoiceOver in Settings
- [ ] Navigate through app using VoiceOver
- [ ] Verify all buttons have accessible labels
- [ ] Check table data is readable
- [ ] Test sorting and filtering with VoiceOver

### Dynamic Type
- [ ] Change text size in Settings
- [ ] Verify app layout adapts appropriately
- [ ] Check readability at largest text size
- [ ] Ensure no text is cut off

## Edge Cases

### Timezone Changes
- [ ] Change device timezone
- [ ] Verify daily totals update correctly
- [ ] Check that historical data remains accurate

### App Updates
- [ ] Update or delete a monitored app
- [ ] Verify usage data handles missing apps gracefully
- [ ] Check that bundle IDs are preserved

### System Reboot
- [ ] Restart iOS device
- [ ] Launch app
- [ ] Verify monitoring resumes automatically
- [ ] Check data persistence across reboots

## Platform-Specific Tests

### iOS 16 Features
- [ ] Test on iOS 16.0+
- [ ] Verify FamilyControls integration works
- [ ] Check DeviceActivity monitoring functions

### iOS 17/18 Features  
- [ ] Test on latest iOS versions
- [ ] Verify new privacy features don't break functionality
- [ ] Check for deprecated API warnings

## App Store Readiness

### Privacy Compliance
- [ ] Verify usage description strings are user-friendly
- [ ] Check that no user data is transmitted externally
- [ ] Confirm all data processing happens locally

### Performance Requirements
- [ ] App launches in <3 seconds
- [ ] No crashes during normal operation
- [ ] Memory usage stays within reasonable limits
- [ ] Battery usage is minimal

## Test Results Template

```
Test Date: ___________
iOS Version: _________
Device Model: _______
App Version: ________

Authorization Flow: PASS/FAIL
App Selection: PASS/FAIL  
Data Display: PASS/FAIL
Filtering: PASS/FAIL
Export: PASS/FAIL
Error Handling: PASS/FAIL
Performance: PASS/FAIL
Accessibility: PASS/FAIL

Notes:
_____________________
_____________________
_____________________
```

## Troubleshooting Common Issues

### "No data available"
1. Check Screen Time is enabled in iOS Settings
2. Verify apps have been selected for monitoring
3. Ensure sufficient time has passed for data collection
4. Check app has background refresh enabled

### "Permission denied" errors
1. Reset all app permissions in Settings
2. Restart app and re-grant permissions
3. Check iOS version compatibility
4. Verify custom dev client has proper entitlements

### Export failures
1. Check device storage space
2. Verify share sheet permissions
3. Try different export destinations
4. Check for iOS sharing restrictions
