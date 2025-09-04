import Foundation
import React
import FamilyControls
import DeviceActivity
import ManagedSettings

@objc(DeviceUsageModule)
class DeviceUsageModule: RCTEventEmitter {
    
    // MARK: - Properties
    private let authorizationCenter = AuthorizationCenter.shared
    private var deviceActivityMonitor: DeviceActivityMonitor?
    private var selectedApps: Set<ApplicationToken> = []
    private var selectedCategories: Set<ActivityCategoryToken> = []
    
    // MARK: - Module Setup
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["onAuthorizationStatusChanged", "onUsageDataUpdated"]
    }
    
    // MARK: - Public Methods
    
    @objc(requestAuthorization:rejecter:)
    func requestAuthorization(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                try await authorizationCenter.requestAuthorization(for: .individual)
                
                DispatchQueue.main.async {
                    let status = self.authorizationCenter.authorizationStatus
                    resolve([
                        "status": self.authorizationStatusString(status),
                        "granted": status == .approved
                    ])
                    
                    self.sendEvent(withName: "onAuthorizationStatusChanged", body: [
                        "status": self.authorizationStatusString(status)
                    ])
                }
            } catch {
                reject("AUTHORIZATION_ERROR", "Failed to request authorization: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc(getAuthorizationStatus:rejecter:)
    func getAuthorizationStatus(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let status = authorizationCenter.authorizationStatus
        resolve([
            "status": authorizationStatusString(status),
            "granted": status == .approved
        ])
    }
    
    @objc(presentFamilyActivityPicker:rejecter:)
    func presentFamilyActivityPicker(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            guard let rootViewController = RCTKeyWindow()?.rootViewController else {
                reject("NO_ROOT_VC", "No root view controller found", nil)
                return
            }
            
            let picker = FamilyActivityPicker()
            picker.selection = FamilyActivitySelection(
                applicationTokens: self.selectedApps,
                categoryTokens: self.selectedCategories
            )
            
            picker.selectionChangedHandler = { [weak self] selection in
                self?.selectedApps = selection.applicationTokens
                self?.selectedCategories = selection.categoryTokens
                
                // Start monitoring with new selection
                self?.startMonitoring()
                
                resolve([
                    "appCount": selection.applicationTokens.count,
                    "categoryCount": selection.categoryTokens.count
                ])
            }
            
            rootViewController.present(picker, animated: true)
        }
    }
    
    @objc(getUsageSummary:resolver:rejecter:)
    func getUsageSummary(
        _ range: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard authorizationCenter.authorizationStatus == .approved else {
            reject("NOT_AUTHORIZED", "Family Controls authorization not granted", nil)
            return
        }
        
        Task {
            do {
                let dateRange = self.dateRangeForPeriod(range)
                let report = try await self.generateUsageReport(for: dateRange)
                resolve(report)
            } catch {
                reject("USAGE_ERROR", "Failed to get usage data: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc(startMonitoring:rejecter:)
    func startMonitoring(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        startMonitoring()
        resolve(["success": true])
    }
    
    // MARK: - Private Methods
    
    private func startMonitoring() {
        guard authorizationCenter.authorizationStatus == .approved else { return }
        
        let monitor = DeviceActivityMonitor()
        
        let schedule = DeviceActivitySchedule(
            intervalStart: DateComponents(hour: 0, minute: 0),
            intervalEnd: DateComponents(hour: 23, minute: 59),
            repeats: true
        )
        
        let event = DeviceActivityEvent(
            applications: selectedApps,
            categories: selectedCategories,
            webDomains: Set(),
            threshold: DateComponents(minute: 1)
        )
        
        do {
            try monitor.startMonitoring(
                .usageTracking,
                during: schedule,
                events: ["usageEvent": event]
            )
            
            self.deviceActivityMonitor = monitor
            
            // Store selection for persistence
            UserDefaults.standard.set(
                selectedApps.map { $0.description },
                forKey: "selectedAppTokens"
            )
            
        } catch {
            print("Failed to start monitoring: \(error)")
        }
    }
    
    private func generateUsageReport(for dateRange: DateInterval) async throws -> [String: Any] {
        // In a real implementation, you would use DeviceActivityReport
        // For now, we'll simulate the data structure
        
        let mockData: [[String: Any]] = [
            [
                "bundleId": "com.apple.MobileSMS",
                "appName": "Messages",
                "minutesToday": 45,
                "minutes7d": 320,
                "minutes30d": 1250,
                "iconData": nil
            ],
            [
                "bundleId": "com.apple.mobilemail",
                "appName": "Mail",
                "minutesToday": 25,
                "minutes7d": 180,
                "minutes30d": 720,
                "iconData": nil
            ],
            [
                "bundleId": "com.apple.mobilesafari",
                "appName": "Safari",
                "minutesToday": 60,
                "minutes7d": 420,
                "minutes30d": 1680,
                "iconData": nil
            ]
        ]
        
        let totalToday = mockData.reduce(0) { $0 + ($1["minutesToday"] as? Int ?? 0) }
        let total7d = mockData.reduce(0) { $0 + ($1["minutes7d"] as? Int ?? 0) }
        let total30d = mockData.reduce(0) { $0 + ($1["minutes30d"] as? Int ?? 0) }
        
        return [
            "apps": mockData,
            "totals": [
                "today": totalToday,
                "week": total7d,
                "month": total30d
            ],
            "lastUpdated": ISO8601DateFormatter().string(from: Date())
        ]
    }
    
    private func dateRangeForPeriod(_ period: String) -> DateInterval {
        let calendar = Calendar.current
        let now = Date()
        
        switch period {
        case "day", "today":
            let startOfDay = calendar.startOfDay(for: now)
            return DateInterval(start: startOfDay, end: now)
            
        case "week", "7d":
            let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: now)?.start ?? now
            return DateInterval(start: startOfWeek, end: now)
            
        case "month", "30d":
            let thirtyDaysAgo = calendar.date(byAdding: .day, value: -30, to: now) ?? now
            return DateInterval(start: thirtyDaysAgo, end: now)
            
        default:
            return DateInterval(start: calendar.startOfDay(for: now), end: now)
        }
    }
    
    private func authorizationStatusString(_ status: AuthorizationStatus) -> String {
        switch status {
        case .notDetermined:
            return "notDetermined"
        case .denied:
            return "denied"
        case .approved:
            return "approved"
        @unknown default:
            return "unknown"
        }
    }
}

// MARK: - Module Registration

@objc(DeviceUsageModuleBridge)
class DeviceUsageModuleBridge: NSObject {
    
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
