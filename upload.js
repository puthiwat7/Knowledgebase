// Upload Page Application
class UploadPage {
    constructor() {
        // Check authentication
        if (!Auth.requireAuth()) {
            return;
        }
        
        this.sections = this.loadSections();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSectionsIntoSelect();
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
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadContainer = document.getElementById('uploadContainer');
        const fileInput = document.getElementById('fileInput');
        const addSectionBtn = document.getElementById('addSectionBtn');
        const closeSectionModal = document.getElementById('closeSectionModal');
        const cancelSectionBtn = document.getElementById('cancelSectionBtn');
        const createSectionBtn = document.getElementById('createSectionBtn');
        const sectionSelect = document.getElementById('sectionSelect');
        const logoutBtn = document.getElementById('logoutBtn');

        // File upload
        uploadBtn.addEventListener('click', () => {
            const selectedSection = sectionSelect.value;
            if (!selectedSection) {
                alert('Please select a knowledgebase section first!');
                return;
            }
            fileInput.click();
        });

        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });

        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            const selectedSection = sectionSelect.value;
            if (!selectedSection) {
                alert('Please select a knowledgebase section first!');
                return;
            }
            this.handleFiles(e.dataTransfer.files, selectedSection);
        });

        fileInput.addEventListener('change', (e) => {
            const selectedSection = sectionSelect.value;
            if (!selectedSection) {
                alert('Please select a knowledgebase section first!');
                fileInput.value = '';
                return;
            }
            this.handleFiles(e.target.files, selectedSection);
            fileInput.value = '';
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

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addSectionModal');
            if (e.target === modal) {
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

    loadSectionsIntoSelect() {
        const sectionSelect = document.getElementById('sectionSelect');
        sectionSelect.innerHTML = '';

        if (this.sections.length === 0) {
            sectionSelect.innerHTML = '<option value="">No sections available</option>';
            return;
        }

        this.sections.forEach(section => {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = section.name;
            sectionSelect.appendChild(option);
        });

        // Select first section by default
        if (this.sections.length > 0) {
            sectionSelect.value = this.sections[0].id;
        }
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
        this.loadSectionsIntoSelect();
        
        // Select the newly created section
        document.getElementById('sectionSelect').value = newSection.id;
        
        this.closeSectionModal();
        input.value = '';
    }

    closeSectionModal() {
        document.getElementById('addSectionModal').style.display = 'none';
        document.getElementById('newSectionName').value = '';
    }

    handleFiles(fileList, sectionId) {
        const filesArray = Array.from(fileList);
        const progressContainer = document.getElementById('uploadProgress');
        progressContainer.style.display = 'block';
        progressContainer.innerHTML = '';

        filesArray.forEach((file, index) => {
            this.uploadFile(file, index, filesArray.length, progressContainer, sectionId);
        });
    }

    uploadFile(file, index, total, progressContainer, sectionId) {
        const reader = new FileReader();
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <span>${file.name}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
        progressContainer.appendChild(progressItem);
        const progressFill = progressItem.querySelector('.progress-fill');

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentLoaded = Math.round((e.loaded / e.total) * 100);
                progressFill.style.width = percentLoaded + '%';
            }
        };

        reader.onload = (e) => {
            const fileData = {
                id: Date.now() + index,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date().toISOString(),
                sectionId: sectionId,
                data: e.target.result
            };

            // Load existing files
            let files = Auth.getUserFiles();
            files.push(fileData);

            // Save files
            if (!Auth.saveUserFiles(files)) {
                progressItem.remove();
                return;
            }

            // Remove progress item after a delay
            setTimeout(() => {
                progressItem.remove();
                if (progressContainer.children.length === 0) {
                    progressContainer.style.display = 'none';
                }
            }, 500);
        };

        reader.readAsDataURL(file);
    }
}

// Initialize the upload page
const uploadPage = new UploadPage();
