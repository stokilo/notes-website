import SwiftUI

@main
struct MacBarApp: App {
    @StateObject private var searchState = SearchState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(searchState)
        }
        .windowStyle(.hiddenTitleBar)
        .windowResizability(.contentSize)
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
    @Published var searchResults: [(name: String, path: String)] = []
    @Published var currentIndexingFile: String = ""
    @Published var permissionError: String? = nil
    
    @ObservedObject private var fileIndex = FileSearchIndex()
    
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