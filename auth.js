// Authentication System
class Auth {
    static isAuthenticated() {
        const session = localStorage.getItem('kb_session');
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            // Check if session is expired (24 hours)
            if (Date.now() > sessionData.expires) {
                localStorage.removeItem('kb_session');
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    static getCurrentUser() {
        const session = localStorage.getItem('kb_session');
        if (!session) return null;
        
        try {
            const sessionData = JSON.parse(session);
            if (Date.now() > sessionData.expires) {
                localStorage.removeItem('kb_session');
                return null;
            }
            return sessionData.user;
        } catch (e) {
            return null;
        }
    }

    static getUserKey(email) {
        // Create a safe key from email
        return 'kb_user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '');
    }

    static register(email, password) {
        const userKey = this.getUserKey(email);
        
        // Check if user already exists
        if (localStorage.getItem(userKey)) {
            return { success: false, message: 'Email already registered!' };
        }

        // Simple password hash (not secure, but works for demo)
        const passwordHash = btoa(password);
        
        const userData = {
            email: email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString()
        };

        try {
            localStorage.setItem(userKey, JSON.stringify(userData));
            return { success: true, message: 'Registration successful!' };
        } catch (e) {
            return { success: false, message: 'Registration failed. Please try again.' };
        }
    }

    static login(email, password) {
        const userKey = this.getUserKey(email);
        const userDataStr = localStorage.getItem(userKey);
        
        if (!userDataStr) {
            return { success: false, message: 'Invalid email or password!' };
        }

        try {
            const userData = JSON.parse(userDataStr);
            const passwordHash = btoa(password);
            
            if (userData.passwordHash !== passwordHash) {
                return { success: false, message: 'Invalid email or password!' };
            }

            // Create session (24 hours)
            const session = {
                user: {
                    email: userData.email,
                    createdAt: userData.createdAt
                },
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };

            localStorage.setItem('kb_session', JSON.stringify(session));
            return { success: true, message: 'Login successful!' };
        } catch (e) {
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    static logout() {
        localStorage.removeItem('kb_session');
        window.location.href = 'login.html';
    }

    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    static getUserStorageKey(key) {
        const user = this.getCurrentUser();
        if (!user) return null;
        const userKey = this.getUserKey(user.email);
        return `${userKey}_${key}`;
    }

    static getUserFiles() {
        const storageKey = this.getUserStorageKey('files');
        if (!storageKey) return [];
        
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    static saveUserFiles(files) {
        const storageKey = this.getUserStorageKey('files');
        if (!storageKey) return false;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(files));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage limit exceeded! Please delete some files.');
                return false;
            }
            return false;
        }
    }

    static getUserSections() {
        const storageKey = this.getUserStorageKey('sections');
        if (!storageKey) return [];
        
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
            // Create default section
            const defaultSections = [{ id: 'default', name: 'General' }];
            this.saveUserSections(defaultSections);
            return defaultSections;
        } catch (e) {
            return [{ id: 'default', name: 'General' }];
        }
    }

    static saveUserSections(sections) {
        const storageKey = this.getUserStorageKey('sections');
        if (!storageKey) return false;
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(sections));
            return true;
        } catch (e) {
            return false;
        }
    }
}
