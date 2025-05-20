import Foundation
import os.log
import AppKit

class FileSearchIndex: ObservableObject {
    private var fileIndex: [String: [String]] = [:] // Maps file names to their full paths
    private var pathIndex: [String: String] = [:] // Maps full paths to their file names
    private let fileManager = FileManager.default
    private var targetDirectory = "/Users/slawomirstec/Documents/projects"
    private var progressTimer: Timer?
    private let logger = Logger(subsystem: "com.barmac", category: "FileSearchIndex")
    private let indexingQueue = DispatchQueue(label: "com.barmac.indexing", qos: .userInitiated)
    
    @Published var isIndexing: Bool = false
    @Published var indexedFilesCount: Int = 0
    @Published var totalFilesCount: Int = 0
    @Published var currentIndexingFile: String = ""
    @Published var permissionError: String? = nil
    
    // Initialize and build the index
    init() {
        logger.info("FileSearchIndex initialized")
        DispatchQueue.main.async { [weak self] in
            self?.requestDirectoryAccess()
        }
    }
    
    deinit {
        progressTimer?.invalidate()
    }
    
    private func requestDirectoryAccess() {
        let openPanel = NSOpenPanel()
        openPanel.canChooseDirectories = true
        openPanel.canChooseFiles = false
        openPanel.allowsMultipleSelection = false
        openPanel.message = "Please select the projects directory to index"
        openPanel.prompt = "Select Directory"
        openPanel.directoryURL = URL(fileURLWithPath: targetDirectory)
        
        openPanel.begin { [weak self] response in
            guard let self = self else { return }
            
            if response == .OK, let url = openPanel.url {
                // Store the selected directory
                self.targetDirectory = url.path
                self.buildIndex()
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
            
            // Check if directory exists and is accessible
            var isDir: ObjCBool = false
            if !self.fileManager.fileExists(atPath: self.targetDirectory, isDirectory: &isDir) {
                self.handleError("Directory does not exist: \(self.targetDirectory)", "The selected directory does not exist")
                return
            }
            
            if !isDir.boolValue {
                self.handleError("Path is not a directory: \(self.targetDirectory)", "The selected path is not a directory")
                return
            }
            
            // Check read permissions
            if !self.fileManager.isReadableFile(atPath: self.targetDirectory) {
                self.handleError("No read permission for directory: \(self.targetDirectory)", """
                    No permission to access the directory.
                    Please grant Full Disk Access in:
                    System Preferences > Security & Privacy > Privacy > Full Disk Access
                    """)
                return
            }
            
            // First, count total files
            do {
                self.logger.info("Counting total files in \(self.targetDirectory, privacy: .public)")
                let enumerator = try self.fileManager.enumerator(at: URL(fileURLWithPath: self.targetDirectory),
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
                return
            }
            
            // Now build the index
            do {
                self.logger.info("Building file index")
                let enumerator = try self.fileManager.enumerator(at: URL(fileURLWithPath: self.targetDirectory),
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
                return
            }
            
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
    
    // Search for files matching the query
    func search(query: String) -> [(name: String, path: String)] {
        guard query.count >= 3 else { return [] }
        
        let searchWords = query.lowercased().split(separator: " ")
        var results: Set<String> = [] // Use Set to avoid duplicates
        var finalResults: [(name: String, path: String)] = []
        
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
                finalResults.append((name: fileName, path: path))
            }
        }
        
        // Sort results by filename
        return finalResults.sorted { $0.name < $1.name }
    }
    
    // Refresh the index
    func refreshIndex() {
        fileIndex.removeAll()
        pathIndex.removeAll()
        buildIndex()
    }
    
    var progress: Double {
        guard totalFilesCount > 0 else { return 0 }
        return Double(indexedFilesCount) / Double(totalFilesCount)
    }
} 