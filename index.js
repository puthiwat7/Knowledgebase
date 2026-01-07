// File Knowledgebase Application
class FileKnowledgebase {
    constructor() {
        // Check authentication
        if (!Auth.requireAuth()) {
            return;
        }
        
        this.files = this.loadFiles();
        this.sections = this.loadSections();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSectionsIntoFilter();
        this.renderFiles();
        this.updateFileCount();
        this.displayUserInfo();
    }

    displayUserInfo() {
        const user = Auth.getCurrentUser();
        if (user) {
            const userEmailEl = document.getElementById('userEmail');
            if (userEmailEl) {
                userEmailEl.textContent = user.email;
            }
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const filterType = document.getElementById('filterType');
        const sectionFilter = document.getElementById('sectionFilter');
        const clearBtn = document.getElementById('clearBtn');
        const closeModal = document.getElementById('closeModal');
        const addSectionBtn = document.getElementById('addSectionBtn');
        const closeSectionModal = document.getElementById('closeSectionModal');
        const cancelSectionBtn = document.getElementById('cancelSectionBtn');
        const createSectionBtn = document.getElementById('createSectionBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        // Search and filter
        searchInput.addEventListener('input', () => this.renderFiles());
        filterType.addEventListener('change', () => this.renderFiles());
        sectionFilter.addEventListener('change', () => this.renderFiles());
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterType.value = 'all';
            sectionFilter.value = 'all';
            this.renderFiles();
        });

        // Section management
        addSectionBtn.addEventListener('click', () => {
            document.getElementById('addSectionModal').style.display = 'block';
            document.getElementById('newSectionName').focus();
        });

        closeSectionModal.addEventListener('click', () => {
            this.closeSectionModal();
        });

        cancelSectionBtn.addEventListener('click', () => {
            this.closeSectionModal();
        });

        createSectionBtn.addEventListener('click', () => {
            this.createNewSection();
        });

        // Modal
        closeModal.addEventListener('click', () => {
            document.getElementById('previewModal').style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            const previewModal = document.getElementById('previewModal');
            const sectionModal = document.getElementById('addSectionModal');
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
            }
            if (e.target === sectionModal) {
                this.closeSectionModal();
            }
        });

        // Enter key to create section
        document.getElementById('newSectionName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createNewSection();
            }
        });

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
            });
        }
    }

    loadSections() {
        return Auth.getUserSections();
    }

    saveSections(sections) {
        Auth.saveUserSections(sections);
    }

    loadSectionsIntoFilter() {
        const sectionFilter = document.getElementById('sectionFilter');
        // Keep "All Sections" option
        const allOption = sectionFilter.querySelector('option[value="all"]');
        sectionFilter.innerHTML = '';
        sectionFilter.appendChild(allOption);

        this.sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = section.name;
            sectionFilter.appendChild(option);
        });
    }

    createNewSection() {
        const input = document.getElementById('newSectionName');
        const sectionName = input.value.trim();

        if (!sectionName) {
            alert('Please enter a section name!');
            return;
        }

        // Check if section name already exists
        if (this.sections.some(s => s.name.toLowerCase() === sectionName.toLowerCase())) {
            alert('A section with this name already exists!');
            return;
        }

        const newSection = {
            id: 'section_' + Date.now(),
            name: sectionName
        };

        this.sections.push(newSection);
        this.saveSections(this.sections);
        this.loadSectionsIntoFilter();
        this.closeSectionModal();
        input.value = '';
    }

    closeSectionModal() {
        document.getElementById('addSectionModal').style.display = 'none';
        document.getElementById('newSectionName').value = '';
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎥';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
        if (fileType.includes('text')) return '📃';
        return '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getFileCategory(fileType) {
        if (fileType.startsWith('image/')) return 'image';
        if (fileType.startsWith('video/')) return 'video';
        if (fileType.startsWith('audio/')) return 'audio';
        if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('document') || fileType.includes('text')) return 'document';
        return 'other';
    }

    filterFiles() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filterType = document.getElementById('filterType').value;
        const sectionFilter = document.getElementById('sectionFilter').value;

        return this.files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchTerm) ||
                                this.formatDate(file.uploadDate).toLowerCase().includes(searchTerm) ||
                                file.type.toLowerCase().includes(searchTerm);
            
            const matchesFilter = filterType === 'all' || this.getFileCategory(file.type) === filterType;
            
            const matchesSection = sectionFilter === 'all' || file.sectionId === sectionFilter;

            return matchesSearch && matchesFilter && matchesSection;
        });
    }

    renderFiles() {
        const filesGrid = document.getElementById('filesGrid');
        const filteredFiles = this.filterFiles();

        if (filteredFiles.length === 0) {
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>No files found</p>
                    <p class="empty-hint">Try adjusting your search or filter</p>
                </div>
            `;
            return;
        }

        // Get section name for each file
        const getSectionName = (sectionId) => {
            const section = this.sections.find(s => s.id === sectionId);
            return section ? section.name : 'Unknown';
        };

        filesGrid.innerHTML = filteredFiles.map(file => `
            <div class="file-card" onclick="knowledgebase.previewFile(${file.id})">
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-info">Section: ${getSectionName(file.sectionId || 'default')}</div>
                <div class="file-info">Size: ${this.formatFileSize(file.size)}</div>
                <div class="file-info">Type: ${file.type || 'Unknown'}</div>
                <div class="file-info">Uploaded: ${this.formatDate(file.uploadDate)}</div>
                <div class="file-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-download" onclick="knowledgebase.downloadFile(${file.id})">Download</button>
                    <button class="btn btn-delete" onclick="knowledgebase.deleteFile(${file.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    previewFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const modal = document.getElementById('previewModal');
        const modalBody = document.getElementById('modalBody');
        
        const getSectionName = (sectionId) => {
            const section = this.sections.find(s => s.id === sectionId);
            return section ? section.name : 'Unknown';
        };

        let previewHTML = `
            <h3>${file.name}</h3>
            <p><strong>Section:</strong> ${getSectionName(file.sectionId || 'default')}</p>
            <p><strong>Size:</strong> ${this.formatFileSize(file.size)}</p>
            <p><strong>Type:</strong> ${file.type || 'Unknown'}</p>
            <p><strong>Uploaded:</strong> ${this.formatDate(file.uploadDate)}</p>
            <hr style="margin: 20px 0;">
        `;

        if (file.type.startsWith('image/')) {
            previewHTML += `<img src="${file.data}" class="modal-preview" alt="${file.name}">`;
        } else if (file.type.startsWith('video/')) {
            previewHTML += `<video src="${file.data}" class="modal-preview" controls></video>`;
        } else if (file.type.startsWith('audio/')) {
            previewHTML += `<audio src="${file.data}" class="modal-preview" controls></audio>`;
        } else if (file.type.includes('text') || file.type.includes('pdf')) {
            previewHTML += `<iframe src="${file.data}" class="modal-preview" style="width: 100%; height: 60vh; border: none;"></iframe>`;
        } else {
            previewHTML += `<div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">${this.getFileIcon(file.type)}</div>
                <p>Preview not available for this file type</p>
                <button class="btn btn-download" onclick="knowledgebase.downloadFile(${file.id})" style="margin-top: 20px;">Download to view</button>
            </div>`;
        }

        modalBody.innerHTML = previewHTML;
        modal.style.display = 'block';
    }

    downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;

        this.files = this.files.filter(f => f.id !== fileId);
        this.saveFiles();
        this.renderFiles();
        this.updateFileCount();
    }

    updateFileCount() {
        const fileCount = document.getElementById('fileCount');
        const count = this.files.length;
        fileCount.textContent = `${count} file${count !== 1 ? 's' : ''}`;
    }

    saveFiles() {
        Auth.saveUserFiles(this.files);
    }

    loadFiles() {
        const files = Auth.getUserFiles();
        // Migrate old files without sectionId to default section
        return files.map(file => {
            if (!file.sectionId) {
                file.sectionId = 'default';
            }
            return file;
        });
    }
}

// Initialize the application
const knowledgebase = new FileKnowledgebase();
