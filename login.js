// Login Page Logic
class LoginPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        // If already logged in, redirect to main page
        if (Auth.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        const authTabs = document.querySelectorAll('.auth-tab-btn');
        const loginForm = document.getElementById('loginFormElement');
        const registerForm = document.getElementById('registerFormElement');

        // Tab switching
        authTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Login form
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });

        // Update forms
        document.getElementById('loginForm').classList.toggle('active', tab === 'login');
        document.getElementById('registerForm').classList.toggle('active', tab === 'register');
        
        // Clear messages
        document.getElementById('loginMessage').textContent = '';
        document.getElementById('registerMessage').textContent = '';
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('loginMessage');

        if (!email || !password) {
            messageEl.textContent = 'Please fill in all fields!';
            messageEl.className = 'auth-message error';
            return;
        }

        const result = Auth.login(email, password);
        
        if (result.success) {
            messageEl.textContent = result.message;
            messageEl.className = 'auth-message success';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            messageEl.textContent = result.message;
            messageEl.className = 'auth-message error';
        }
    }

    handleRegister() {
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const messageEl = document.getElementById('registerMessage');

        if (!email || !password || !passwordConfirm) {
            messageEl.textContent = 'Please fill in all fields!';
            messageEl.className = 'auth-message error';
            return;
        }

        if (password.length < 6) {
            messageEl.textContent = 'Password must be at least 6 characters!';
            messageEl.className = 'auth-message error';
            return;
        }

        if (password !== passwordConfirm) {
            messageEl.textContent = 'Passwords do not match!';
            messageEl.className = 'auth-message error';
            return;
        }

        const result = Auth.register(email, password);
        
        if (result.success) {
            messageEl.textContent = result.message + ' Logging in...';
            messageEl.className = 'auth-message success';
            
            // Auto-login after registration
            setTimeout(() => {
                const loginResult = Auth.login(email, password);
                if (loginResult.success) {
                    window.location.href = 'index.html';
                }
            }, 500);
        } else {
            messageEl.textContent = result.message;
            messageEl.className = 'auth-message error';
        }
    }
}

// Initialize login page
const loginPage = new LoginPage();
