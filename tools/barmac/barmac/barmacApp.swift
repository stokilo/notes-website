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
            updateSearchResults()
        }
    }
    @Published var isSearching: Bool = false
    @Published var searchResults: [(name: String, path: String)] = []
    @Published var currentIndexingFile: String = ""
    @Published var permissionError: String? = nil
    
    @ObservedObject private var fileIndex = FileSearchIndex()
    
    private let indexingQueue = DispatchQueue(label: "com.barmac.indexing", qos: .userInitiated)
    
    var shouldShowResults: Bool {
        searchText.count >= 3
    }
    
    private func updateSearchResults() {
        if shouldShowResults {
            searchResults = fileIndex.search(query: searchText)
        } else {
            searchResults = []
        }
    }
    
    func refreshIndex() {
        fileIndex.refreshIndex()
        updateSearchResults()
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