import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var searchState: SearchState
    @FocusState private var isSearchFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            if let error = searchState.permissionError {
                Text(error)
                    .foregroundColor(.red)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.ultraThinMaterial)
            }
            
            if searchState.isIndexing {
                Text("Indexing: \(searchState.currentIndexingFile) (\(searchState.indexedFilesCount) of \(searchState.totalFilesCount) files)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(.ultraThinMaterial)
            }
            
            searchBar
                .padding()
            
            if searchState.isIndexing {
                indexingProgressView
            } else {
                VStack {
                    if searchState.shouldShowResults {
                        searchResults
                    } else if !searchState.searchText.isEmpty {
                        Text("Type at least 3 characters to search...")
                            .foregroundColor(.gray)
                            .padding()
                    }
                }
            }
        }
        .frame(width: 600)
        .background(.ultraThinMaterial)
        .onAppear {
            isSearchFocused = true
            // Hide the title bar
            if let window = NSApplication.shared.windows.first {
                window.titlebarAppearsTransparent = true
                window.titleVisibility = .hidden
                window.styleMask.insert(.fullSizeContentView)
            }
        }
    }
    
    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search files...", text: $searchState.searchText)
                .textFieldStyle(.plain)
                .font(.system(size: 16))
                .focused($isSearchFocused)
            
            if !searchState.searchText.isEmpty {
                Button(action: {
                    searchState.searchText = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                }
                .buttonStyle(.plain)
            }
            
            Button(action: {
                searchState.refreshIndex()
            }) {
                Image(systemName: "arrow.clockwise")
                    .foregroundColor(.gray)
            }
            .buttonStyle(.plain)
            .help("Refresh file index")
            .disabled(searchState.isIndexing)
        }
        .padding(12)
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
    
    private var indexingProgressView: some View {
        VStack(spacing: 12) {
            Text("Indexing Files")
                .font(.headline)
                .padding(.bottom, 4)
            
            ProgressView(value: searchState.indexingProgress)
                .progressViewStyle(.linear)
                .padding(.horizontal)
                .frame(height: 8)
            
            Text("\(Int(searchState.indexingProgress * 100))%")
                .font(.system(.body, design: .monospaced))
                .foregroundColor(.primary)
            
            Text("Indexing files: \(searchState.indexedFilesCount) of \(searchState.totalFilesCount)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text("Please wait...")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.top, 4)
        }
        .padding()
        .frame(height: 300)
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .padding()
    }
    
    private var searchResults: some View {
        List {
            if searchState.searchResults.isEmpty {
                Text("No results found")
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding()
            } else {
                ForEach(searchState.searchResults, id: \.path) { result in
                    HStack {
                        if let icon = result.icon {
                            Image(nsImage: icon)
                                .resizable()
                                .frame(width: 32, height: 32)
                        } else {
                            Image(systemName: "doc")
                                .foregroundColor(.gray)
                                .frame(width: 32, height: 32)
                        }
                        VStack(alignment: .leading) {
                            Text(result.name)
                                .lineLimit(1)
                            Text(result.path)
                                .font(.caption)
                                .foregroundColor(.gray)
                                .lineLimit(1)
                        }
                    }
                    .padding(.vertical, 4)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        if result.path.hasSuffix(".app") {
                            // Launch the application using the new API
                            let url = URL(fileURLWithPath: result.path)
                            NSWorkspace.shared.openApplication(at: url, configuration: NSWorkspace.OpenConfiguration()) { runningApp, error in
                                if let error = error {
                                    print("Error launching application: \(error.localizedDescription)")
                                }
                            }
                        } else {
                            // Open the file in Finder
                            NSWorkspace.shared.selectFile(result.path, inFileViewerRootedAtPath: "")
                        }
                    }
                }
            }
        }
        .listStyle(.plain)
        .frame(height: 300)
        .background(.ultraThinMaterial)
    }
} 
