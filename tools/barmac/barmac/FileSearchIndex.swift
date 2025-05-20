import Foundation
import os.log
import AppKit

class FileSearchIndex: ObservableObject {
    private var fileIndex: [String: [String]] = [:] // Maps file names to their full paths
    private var pathIndex: [String: String] = [:] // Maps full paths to their file names
    private var appIndex: [(name: String, path: String, icon: NSImage)] = [] // Applications with icons
    private let fileManager = FileManager.default
    private var indexedDirectories: Set<String> = []
    private var progressTimer: Timer?
    private let logger = Logger(subsystem: "com.barmac", category: "FileSearchIndex")
    private let indexingQueue = DispatchQueue(label: "com.barmac.indexing", qos: .userInitiated)
    
    private let indexCacheURL: URL
    private let indexTimestampURL: URL
    private let directoriesCacheURL: URL
    
    @Published var isIndexing: Bool = false
    @Published var indexedFilesCount: Int = 0
    @Published var totalFilesCount: Int = 0
    @Published var currentIndexingFile: String = ""
    @Published var permissionError: String? = nil
    @Published var showSettings: Bool = false
    
    init() {
        // Set up cache URLs in the user's home directory
        let homeDirectory = FileManager.default.homeDirectoryForCurrentUser
        let cacheDirectory = homeDirectory.appendingPathComponent(".barmac", isDirectory: true)
        
        // Create cache directory if it doesn't exist
        try? fileManager.createDirectory(at: cacheDirectory, withIntermediateDirectories: true)
        
        indexCacheURL = cacheDirectory.appendingPathComponent("file_index.json")
        indexTimestampURL = cacheDirectory.appendingPathComponent("index_timestamp")
        directoriesCacheURL = cacheDirectory.appendingPathComponent("indexed_directories.json")
        
        logger.info("FileSearchIndex initialized")
        loadIndexedDirectories()
        DispatchQueue.main.async { [weak self] in
            self?.loadOrCreateIndex()
        }
    }
    
    deinit {
        progressTimer?.invalidate()
    }
    
    private func loadIndexedDirectories() {
        if let data = try? Data(contentsOf: directoriesCacheURL),
           let directories = try? JSONDecoder().decode(Set<String>.self, from: data) {
            indexedDirectories = directories
        }
    }
    
    private func saveIndexedDirectories() {
        if let data = try? JSONEncoder().encode(indexedDirectories) {
            try? data.write(to: directoriesCacheURL)
        }
    }
    
    func addDirectory(_ path: String) {
        indexedDirectories.insert(path)
        saveIndexedDirectories()
        buildIndex()
    }
    
    func removeDirectory(_ path: String) {
        indexedDirectories.remove(path)
        saveIndexedDirectories()
        buildIndex()
    }
    
    var indexedDirectoriesList: [String] {
        Array(indexedDirectories).sorted()
    }
    
    private func loadOrCreateIndex() {
        // Check if we have a valid cached index
        if let timestamp = try? Data(contentsOf: indexTimestampURL),
           let timestampString = String(data: timestamp, encoding: .utf8),
           let lastIndexTime = Double(timestampString) {
            
            let currentTime = Date().timeIntervalSince1970
            let oneHourInSeconds: TimeInterval = 3600
            
            // If index is less than 1 hour old, load it
            if currentTime - lastIndexTime < oneHourInSeconds {
                if loadCachedIndex() {
                    logger.info("Loaded cached index")
                    return
                }
            }
        }
        
        // If no valid cache exists or no directories are indexed, show settings
        if indexedDirectories.isEmpty {
            showSettings = true
        } else {
            buildIndex()
        }
    }
    
    private func loadCachedIndex() -> Bool {
        guard let data = try? Data(contentsOf: indexCacheURL),
              let decodedIndex = try? JSONDecoder().decode(CachedIndex.self, from: data) else {
            return false
        }
        
        fileIndex = decodedIndex.fileIndex
        pathIndex = decodedIndex.pathIndex
        
        // Rebuild app index as it can't be cached
        indexApplications()
        
        return true
    }
    
    private func saveIndex() {
        let cachedIndex = CachedIndex(fileIndex: fileIndex, pathIndex: pathIndex)
        
        do {
            let data = try JSONEncoder().encode(cachedIndex)
            try data.write(to: indexCacheURL)
            
            // Save timestamp
            let timestamp = String(Date().timeIntervalSince1970)
            try timestamp.data(using: .utf8)?.write(to: indexTimestampURL)
            
            logger.info("Saved index to cache")
        } catch {
            logger.error("Failed to save index: \(error.localizedDescription)")
        }
    }
    
    private func requestDirectoryAccess() {
        let openPanel = NSOpenPanel()
        openPanel.canChooseDirectories = true
        openPanel.canChooseFiles = false
        openPanel.allowsMultipleSelection = false
        openPanel.message = "Please select a directory to index"
        openPanel.prompt = "Select Directory"
        
        openPanel.begin { [weak self] response in
            guard let self = self else { return }
            
            if response == .OK, let url = openPanel.url {
                // Add the selected directory
                self.addDirectory(url.path)
            } else {
                self.permissionError = "Please select a directory to continue"
                self.isIndexing = false
            }
        }
    }
    
    private func buildIndex() {
        logger.info("Starting index build")
        
        // Set initial state on main thread
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.isIndexing = true
            self.indexedFilesCount = 0
            self.totalFilesCount = 0
            self.currentIndexingFile = "Starting indexing process..."
            self.permissionError = nil
            self.objectWillChange.send()
        }
        
        // Start progress update timer on main thread
        DispatchQueue.main.async { [weak self] in
            self?.progressTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
                self?.objectWillChange.send()
            }
        }
        
        // Run indexing in background
        indexingQueue.async { [weak self] in
            guard let self = self else { return }
            
            // Clear existing indexes
            self.fileIndex.removeAll()
            self.pathIndex.removeAll()
            self.appIndex.removeAll()
            
            // First, index applications
            self.indexApplications()
            
            // Then index each directory
            for directory in self.indexedDirectories {
                // Check if directory exists and is accessible
                var isDir: ObjCBool = false
                if !self.fileManager.fileExists(atPath: directory, isDirectory: &isDir) {
                    self.handleError("Directory does not exist: \(directory)", "The selected directory does not exist")
                    continue
                }
                
                if !isDir.boolValue {
                    self.handleError("Path is not a directory: \(directory)", "The selected path is not a directory")
                    continue
                }
                
                // Check read permissions
                if !self.fileManager.isReadableFile(atPath: directory) {
                    self.handleError("No read permission for directory: \(directory)", """
                        No permission to access the directory.
                        Please grant Full Disk Access in:
                        System Preferences > Security & Privacy > Privacy > Full Disk Access
                        """)
                    continue
                }
                
                // First, count total files
                do {
                    self.logger.info("Counting total files in \(directory, privacy: .public)")
                    let enumerator = try self.fileManager.enumerator(at: URL(fileURLWithPath: directory),
                                                              includingPropertiesForKeys: [.isDirectoryKey, .isReadableKey],
                                                              options: [.skipsHiddenFiles])
                    
                    while let fileURL = enumerator?.nextObject() as? URL {
                        do {
                            let resourceValues = try fileURL.resourceValues(forKeys: [.isReadableKey])
                            if resourceValues.isReadable ?? false {
                                DispatchQueue.main.async {
                                    self.totalFilesCount += 1
                                }
                            } else {
                                self.logger.warning("Skipping unreadable file: \(fileURL.path, privacy: .public)")
                            }
                        } catch {
                            self.logger.error("Error checking file permissions: \(error.localizedDescription, privacy: .public)")
                        }
                    }
                    self.logger.info("Found \(self.totalFilesCount, privacy: .public) total files")
                } catch {
                    self.handleError("Error counting files: \(error.localizedDescription)", error.localizedDescription)
                    continue
                }
                
                // Now build the index
                do {
                    self.logger.info("Building file index")
                    let enumerator = try self.fileManager.enumerator(at: URL(fileURLWithPath: directory),
                                                              includingPropertiesForKeys: [.isDirectoryKey, .isReadableKey],
                                                              options: [.skipsHiddenFiles])
                    
                    while let fileURL = enumerator?.nextObject() as? URL {
                        do {
                            let resourceValues = try fileURL.resourceValues(forKeys: [.isReadableKey])
                            guard resourceValues.isReadable ?? false else {
                                self.logger.warning("Skipping unreadable file: \(fileURL.path, privacy: .public)")
                                continue
                            }
                            
                            let filePath = fileURL.path
                            DispatchQueue.main.async {
                                self.currentIndexingFile = fileURL.lastPathComponent
                            }
                            self.logger.debug("Indexing file: \(fileURL.lastPathComponent, privacy: .public)")
                            
                            // Get file attributes
                            let attributes = try self.fileManager.attributesOfItem(atPath: filePath)
                            let isDirectory = attributes[.type] as? FileAttributeType == .typeDirectory
                            
                            if !isDirectory {
                                // Add file to index
                                let fileName = fileURL.lastPathComponent
                                if self.fileIndex[fileName] == nil {
                                    self.fileIndex[fileName] = []
                                }
                                self.fileIndex[fileName]?.append(filePath)
                                self.pathIndex[filePath] = fileName
                            }
                            
                            DispatchQueue.main.async {
                                self.indexedFilesCount += 1
                                if self.indexedFilesCount % 100 == 0 {
                                    self.logger.info("Indexed \(self.indexedFilesCount, privacy: .public) of \(self.totalFilesCount, privacy: .public) files")
                                }
                            }
                        } catch {
                            self.logger.error("Error processing file \(fileURL.path, privacy: .public): \(error.localizedDescription, privacy: .public)")
                        }
                    }
                } catch {
                    self.handleError("Error building index: \(error.localizedDescription)", error.localizedDescription)
                    continue
                }
            }
            
            // Save the index to cache
            self.saveIndex()
            
            // Complete indexing
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.logger.info("Indexing complete. Indexed \(self.indexedFilesCount, privacy: .public) files")
                self.isIndexing = false
                self.currentIndexingFile = "Indexing complete"
                self.progressTimer?.invalidate()
                self.objectWillChange.send()
            }
        }
    }
    
    private func indexApplications() {
        let appDirectories = [
            "/Applications",
            "/System/Applications",
            "/System/Library/CoreServices/Applications",
            "/System/Library/PreferencePanes"
        ]
        
        for directory in appDirectories {
            do {
                let contents = try fileManager.contentsOfDirectory(atPath: directory)
                for item in contents {
                    let fullPath = (directory as NSString).appendingPathComponent(item)
                    if item.hasSuffix(".app") {
                        let appName = (item as NSString).deletingPathExtension
                        let icon = NSWorkspace.shared.icon(forFile: fullPath)
                        DispatchQueue.main.async {
                            self.appIndex.append((name: appName, path: fullPath, icon: icon))
                        }
                    }
                }
            } catch {
                logger.error("Error indexing applications in \(directory): \(error.localizedDescription)")
            }
        }
    }
    
    private func handleError(_ logMessage: String, _ userMessage: String) {
        logger.error("\(logMessage, privacy: .public)")
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.currentIndexingFile = "Error: \(logMessage)"
            self.permissionError = userMessage
            self.isIndexing = false
            self.progressTimer?.invalidate()
            self.objectWillChange.send()
        }
    }
    
    // Search for files and applications matching the query
    func search(query: String) -> [(name: String, path: String, icon: NSImage?, isApp: Bool, parentDirectory: String)] {
        guard query.count >= 3 else { return [] }
        
        let searchWords = query.lowercased().split(separator: " ")
        var results: Set<String> = [] // Use Set to avoid duplicates
        var finalResults: [(name: String, path: String, icon: NSImage?, isApp: Bool, parentDirectory: String)] = []
        
        // First pass: Find all paths that match any word
        for word in searchWords {
            // Search in filenames
            for (fileName, paths) in fileIndex {
                if fileName.lowercased().contains(word) {
                    results.formUnion(paths)
                }
            }
            
            // Search in paths
            for (path, _) in pathIndex {
                if path.lowercased().contains(word) {
                    results.insert(path)
                }
            }
        }
        
        // Second pass: Filter paths that match all words
        for path in results {
            let lowercasedPath = path.lowercased()
            let fileName = pathIndex[path] ?? ""
            let lowercasedFileName = fileName.lowercased()
            
            // Check if all search words match either the filename or the path
            let allWordsMatch = searchWords.allSatisfy { word in
                lowercasedFileName.contains(word) || lowercasedPath.contains(word)
            }
            
            if allWordsMatch {
                let parentDirectory = (path as NSString).deletingLastPathComponent
                finalResults.append((name: fileName, path: path, icon: nil, isApp: false, parentDirectory: parentDirectory))
            }
        }
        
        // Search applications
        for app in appIndex {
            let lowercasedAppName = app.name.lowercased()
            let lowercasedAppPath = app.path.lowercased()
            
            let allWordsMatch = searchWords.allSatisfy { word in
                lowercasedAppName.contains(word) || lowercasedAppPath.contains(word)
            }
            
            if allWordsMatch {
                finalResults.insert((name: app.name, path: app.path, icon: app.icon, isApp: true, parentDirectory: ""), at: 0)
            }
        }
        
        return finalResults
    }
    
    // Refresh the index
    func refreshIndex() {
        fileIndex.removeAll()
        pathIndex.removeAll()
        appIndex.removeAll()
        buildIndex()
    }
    
    var progress: Double {
        guard totalFilesCount > 0 else { return 0 }
        return Double(indexedFilesCount) / Double(totalFilesCount)
    }
    
    func showSettingsPanel() {
        showSettings = true
    }
    
    func hideSettingsPanel() {
        showSettings = false
    }
}

// Structure for caching the index
private struct CachedIndex: Codable {
    let fileIndex: [String: [String]]
    let pathIndex: [String: String]
} 