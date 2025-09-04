import DeviceActivity
import SwiftUI

// MARK: - Device Activity Report Extension
// This extension runs in the background to collect usage statistics

@main
struct DeviceUsageReportExtension: DeviceActivityReportExtension {
    var body: some DeviceActivityReportScene {
        DeviceActivityReportScene(filter: .all) { data in
            UsageReportView(data: data)
        }
    }
}

struct UsageReportView: View {
    let data: DeviceActivityResults<DeviceActivityData>
    
    var body: some View {
        VStack {
            ForEach(data.flatMap { $0.activitySegments }, id: \.dateInterval) { segment in
                HStack {
                    Text(segment.dateInterval.start.formatted())
                    Spacer()
                    Text(segment.totalActivityDuration.formatted())
                }
            }
        }
    }
}

// MARK: - Usage Data Manager
// Manages the collection and processing of usage statistics

class UsageDataManager {
    static let shared = UsageDataManager()
    private let userDefaults = UserDefaults(suiteName: "group.com.yourcompany.deviceusage.shared")
    
    private init() {}
    
    func storeUsageData(_ data: [String: Any]) {
        userDefaults?.set(data, forKey: "latestUsageData")
        userDefaults?.set(Date(), forKey: "lastUpdated")
    }
    
    func getStoredUsageData() -> [String: Any]? {
        return userDefaults?.dictionary(forKey: "latestUsageData")
    }
    
    func getLastUpdated() -> Date? {
        return userDefaults?.object(forKey: "lastUpdated") as? Date
    }
}
