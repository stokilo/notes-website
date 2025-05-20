import SwiftUI

struct SettingsView: View {
    @ObservedObject var fileIndex: FileSearchIndex
    @Environment(\.dismiss) private var dismiss
    @State private var showingDirectoryPicker = false
    @State private var selectedDuration: TimeInterval
    
    init(fileIndex: FileSearchIndex) {
        self.fileIndex = fileIndex
        _selectedDuration = State(initialValue: fileIndex.indexValidityDuration)
    }
    
    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Text("Settings")
                    .font(.title)
                    .fontWeight(.bold)
                Spacer()
                Button(action: { dismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.gray)
                        .imageScale(.large)
                }
                .buttonStyle(.plain)
            }
            .padding(.bottom)
            
            // Index Validity Duration
            VStack(alignment: .leading, spacing: 8) {
                Text("Index Validity Duration")
                    .font(.headline)
                
                Picker("Duration", selection: $selectedDuration) {
                    Text("30 minutes").tag(TimeInterval(1800))
                    Text("1 hour").tag(TimeInterval(3600))
                    Text("2 hours").tag(TimeInterval(7200))
                    Text("4 hours").tag(TimeInterval(14400))
                    Text("8 hours").tag(TimeInterval(28800))
                    Text("24 hours").tag(TimeInterval(86400))
                }
                .onChange(of: selectedDuration) { newValue in
                    fileIndex.setIndexValidityDuration(newValue)
                }
            }
            .padding()
            .background(Color(.windowBackgroundColor))
            .cornerRadius(10)
            
            // Indexed Directories
            VStack(alignment: .leading, spacing: 8) {
                Text("Indexed Directories")
                    .font(.headline)
                
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(fileIndex.indexedDirectoriesList, id: \.self) { directory in
                            HStack {
                                Image(systemName: "folder.fill")
                                    .foregroundColor(.blue)
                                VStack(alignment: .leading) {
                                    Text(directory)
                                        .lineLimit(1)
                                    Text("\(fileIndex.getIndexedFilesCount(for: directory)) files")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                                Spacer()
                                Button(action: {
                                    fileIndex.removeDirectory(directory)
                                }) {
                                    Image(systemName: "minus.circle.fill")
                                        .foregroundColor(.red)
                                }
                                .buttonStyle(.plain)
                            }
                            .padding(8)
                            .background(Color(.windowBackgroundColor))
                            .cornerRadius(8)
                        }
                    }
                }
                .frame(maxHeight: 200)
            }
            .padding()
            .background(Color(.windowBackgroundColor))
            .cornerRadius(10)
            
            // Add Directory Button
            Button(action: { showingDirectoryPicker = true }) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Add Directory")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .padding(.top)
            
            Spacer()
        }
        .padding()
        .frame(width: 500, height: 400)
        .fileImporter(
            isPresented: $showingDirectoryPicker,
            allowedContentTypes: [.folder],
            allowsMultipleSelection: false
        ) { result in
            switch result {
            case .success(let urls):
                if let url = urls.first {
                    fileIndex.addDirectory(url.path)
                }
            case .failure(let error):
                print("Error selecting directory: \(error.localizedDescription)")
            }
        }
    }
} 