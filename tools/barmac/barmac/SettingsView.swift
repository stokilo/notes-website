import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var searchState: SearchState
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Indexed Directories")
                    .font(.headline)
                Spacer()
            }
            .padding(.horizontal)
            
            List {
                ForEach(searchState.fileIndex.indexedDirectoriesList, id: \.self) { directory in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Image(systemName: "folder")
                                .foregroundColor(.blue)
                            Text(directory)
                                .lineLimit(1)
                            Spacer()
                            Button(action: {
                                searchState.fileIndex.removeDirectory(directory)
                            }) {
                                Image(systemName: "minus.circle.fill")
                                    .foregroundColor(.red)
                            }
                            .buttonStyle(.plain)
                        }
                        
                        if searchState.isIndexing && searchState.currentIndexingFile.contains(directory) {
                            HStack {
                                ProgressView()
                                    .scaleEffect(0.5)
                                Text("Indexing...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        } else {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.green)
                                Text("\(searchState.fileIndex.getIndexedFilesCount(for: directory)) files indexed")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .frame(height: 300)
            
            HStack {
                Spacer()
                Button("Close") {
                    dismiss()
                }
                .keyboardShortcut(.defaultAction)
            }
            .padding()
        }
        .frame(width: 500)
        .background(.ultraThinMaterial)
    }
} 