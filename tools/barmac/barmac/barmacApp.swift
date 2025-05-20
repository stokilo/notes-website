import SwiftUI
import HotKey

@main
struct MacBarApp: App {
    @StateObject private var searchState = SearchState()
    @State private var isWindowVisible = false
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(searchState)
                .onAppear {
                    setupGlobalShortcut()
                    setupWindow()
                }
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
        .commands {
            CommandGroup(replacing: .newItem) { }
        }
    }
    
    private func setupWindow() {
        if let window = NSApplication.shared.windows.first {
            window.backgroundColor = .clear
            window.isOpaque = false
            window.hasShadow = false
            window.level = .floating
            window.collectionBehavior = [.canJoinAllSpaces, .stationary]
            window.styleMask = [.borderless, .fullSizeContentView, .titled]
            window.ignoresMouseEvents = false
            window.isMovableByWindowBackground = true
            window.acceptsMouseMovedEvents = true
            window.makeFirstResponder(nil)
        }
    }
    
    private func setupGlobalShortcut() {
        let hotKey = HotKey(key: .minus, modifiers: [.command])
        hotKey.keyDownHandler = {
            if let window = NSApplication.shared.windows.first {
                window.makeKeyAndOrderFront(nil)
                NSApplication.shared.activate(ignoringOtherApps: true)
                if let searchField = window.firstResponder?.nextResponder?.nextResponder as? NSTextField {
                    searchField.becomeFirstResponder()
                }
            }
        }
    }
}

class SearchState: ObservableObject {
    @Published var searchText: String = "" {
        didSet {
            isSearching = !searchText.isEmpty
            debouncedSearch()
        }
    }
    @Published var isSearching: Bool = false
    @Published var searchResults: [(name: String, path: String, icon: NSImage?, isApp: Bool, parentDirectory: String)] = []
    @Published var currentIndexingFile: String = ""
    @Published var permissionError: String? = nil
    
    let fileIndex = FileSearchIndex()
    
    private let indexingQueue = DispatchQueue(label: "com.barmac.indexing", qos: .userInitiated)
    private let searchQueue = DispatchQueue(label: "com.barmac.search", qos: .userInitiated)
    private var searchWorkItem: DispatchWorkItem?
    
    var shouldShowResults: Bool {
        searchText.count >= 3
    }
    
    private func debouncedSearch() {
        searchWorkItem?.cancel()
        
        guard shouldShowResults else {
            searchResults = []
            return
        }
        
        let workItem = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            let results = self.fileIndex.search(query: self.searchText)
            DispatchQueue.main.async {
                self.searchResults = results
            }
        }
        
        searchWorkItem = workItem
        searchQueue.asyncAfter(deadline: .now() + 0.3, execute: workItem)
    }
    
    func refreshIndex() {
        fileIndex.refreshIndex()
        debouncedSearch()
    }
    
    var isIndexing: Bool {
        fileIndex.isIndexing
    }
    
    var indexingProgress: Double {
        fileIndex.progress
    }
    
    var indexedFilesCount: Int {
        fileIndex.indexedFilesCount
    }
    
    var totalFilesCount: Int {
        fileIndex.totalFilesCount
    }
} 