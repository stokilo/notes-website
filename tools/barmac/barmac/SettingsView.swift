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
                Button("Add Directory") {
                    let openPanel = NSOpenPanel()
                    openPanel.canChooseDirectories = true
                    openPanel.canChooseFiles = false
                    openPanel.allowsMultipleSelection = false
                    openPanel.message = "Select a directory to index"
                    openPanel.prompt = "Select Directory"
                    
                    if openPanel.runModal() == .OK, let url = openPanel.url {
                        searchState.fileIndex.addDirectory(url.path)
                    }
                }
            }
            .padding(.horizontal)
            
            List {
                ForEach(searchState.fileIndex.indexedDirectoriesList, id: \.self) { directory in
                    HStack {
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