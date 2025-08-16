import { AuthService } from './auth.js';
import { AccessLevel, AppState, Session, UserCode, AdminPanelState } from './types.js';

export class LabApp {
  private state: AppState;
  private adminState: AdminPanelState;

  constructor() {
    this.state = {
      isAuthenticated: false,
      currentSession: null,
      userCodes: [],
      guestAccessEnabled: false,
      isLoading: false,
      error: null
    };

    this.adminState = {
      showAddCodeForm: false,
      newCodeExpiry: '',
      selectedCodes: [],
      sortBy: 'createdAt',
      filterActive: null
    };

    this.init();
  }

  private init(): void {
    this.loadInitialState();
    this.setupEventListeners();
    this.checkSession();
    this.render();
  }

  private loadInitialState(): void {
    this.state.userCodes = AuthService.getUserCodes();
    this.state.guestAccessEnabled = AuthService.isGuestAccessEnabled();
  }

  private setupEventListeners(): void {
    // Login form
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
      togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    // Admin panel events
    this.setupAdminEventListeners();
  }

  private setupAdminEventListeners(): void {
    // Toggle guest access
    const guestToggle = document.getElementById('guestToggle') as HTMLInputElement;
    if (guestToggle) {
      guestToggle.addEventListener('change', this.handleGuestToggle.bind(this));
    }

    // Add code form
    const addCodeForm = document.getElementById('addCodeForm') as HTMLFormElement;
    if (addCodeForm) {
      addCodeForm.addEventListener('submit', this.handleAddCode.bind(this));
    }

    // Show/hide add code form
    const showAddCodeBtn = document.getElementById('showAddCodeBtn');
    if (showAddCodeBtn) {
      showAddCodeBtn.addEventListener('click', () => {
        this.adminState.showAddCodeForm = !this.adminState.showAddCodeForm;
        this.renderAdminPanel();
      });
    }
  }

  private checkSession(): void {
    const session = AuthService.loadSession();
    if (session && AuthService.isSessionValid(session)) {
      this.state.currentSession = session;
      this.state.isAuthenticated = true;
    } else {
      AuthService.clearSession();
      this.state.isAuthenticated = false;
      this.state.currentSession = null;
    }
  }

  private async handleLogin(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const code = formData.get('accessCode') as string;

    this.setLoading(true);
    this.clearError();

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const authResult = AuthService.authenticate(code);
    
    if (authResult.success) {
      const session = AuthService.createSession(authResult.accessLevel);
      AuthService.saveSession(session);
      
      this.state.currentSession = session;
      this.state.isAuthenticated = true;
      
      this.showSuccess(authResult.message);
    } else {
      this.setError(authResult.message);
    }

    this.setLoading(false);
    this.render();
  }

  private handleLogout(): void {
    AuthService.clearSession();
    this.state.isAuthenticated = false;
    this.state.currentSession = null;
    this.clearError();
    this.render();
  }

  private togglePasswordVisibility(): void {
    const passwordInput = document.getElementById('accessCode') as HTMLInputElement;
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      if (toggleIcon) toggleIcon.textContent = '🙈';
    } else {
      passwordInput.type = 'password';
      if (toggleIcon) toggleIcon.textContent = '👁️';
    }
  }

  private handleGuestToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    AuthService.setGuestAccess(target.checked);
    this.state.guestAccessEnabled = target.checked;
  }

  private async handleAddCode(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const expiryDateStr = formData.get('expiryDate') as string;
    
    if (!expiryDateStr) {
      this.setError('Please select an expiry date');
      return;
    }

    const expiryDate = new Date(expiryDateStr);
    if (expiryDate <= new Date()) {
      this.setError('Expiry date must be in the future');
      return;
    }

    const newCode = AuthService.addUserCode(expiryDate);
    this.state.userCodes = AuthService.getUserCodes();
    this.adminState.showAddCodeForm = false;
    
    this.showSuccess(`New code created: ${newCode.code}`);
    this.renderAdminPanel();
    form.reset();
  }

  private removeCode(codeId: string): void {
    if (confirm('Are you sure you want to remove this code?')) {
      AuthService.removeUserCode(codeId);
      this.state.userCodes = AuthService.getUserCodes();
      this.renderAdminPanel();
    }
  }

  private toggleCode(codeId: string): void {
    AuthService.toggleUserCode(codeId);
    this.state.userCodes = AuthService.getUserCodes();
    this.renderAdminPanel();
  }

  private setLoading(loading: boolean): void {
    this.state.isLoading = loading;
  }

  private setError(message: string): void {
    this.state.error = message;
  }

  private clearError(): void {
    this.state.error = null;
  }

  private showSuccess(message: string): void {
    const successEl = document.getElementById('successMessage');
    if (successEl) {
      successEl.textContent = message;
      successEl.style.display = 'block';
      setTimeout(() => {
        successEl.style.display = 'none';
      }, 3000);
    }
  }

  private render(): void {
    this.renderAuthState();
    this.renderAccessLevel();
    this.renderError();
    this.renderLoading();
    
    if (this.state.isAuthenticated && this.state.currentSession?.accessLevel === AccessLevel.ADMIN) {
      this.renderAdminPanel();
    }
  }

  private renderAuthState(): void {
    const loginSection = document.getElementById('loginSection');
    const mainContent = document.getElementById('mainContent');
    const adminPanel = document.getElementById('adminPanel');

    if (this.state.isAuthenticated) {
      if (loginSection) loginSection.style.display = 'none';
      if (mainContent) mainContent.style.display = 'block';
      if (adminPanel && this.state.currentSession?.accessLevel === AccessLevel.ADMIN) {
        adminPanel.style.display = 'block';
      }
    } else {
      if (loginSection) loginSection.style.display = 'block';
      if (mainContent) mainContent.style.display = 'none';
      if (adminPanel) adminPanel.style.display = 'none';
    }
  }

  private renderAccessLevel(): void {
    const accessLevelEl = document.getElementById('accessLevel');
    if (accessLevelEl && this.state.currentSession) {
      const level = this.state.currentSession.accessLevel;
      accessLevelEl.textContent = `Access Level: ${level.toUpperCase()}`;
      accessLevelEl.className = `access-level access-level-${level}`;
    }
  }

  private renderError(): void {
    const errorEl = document.getElementById('errorMessage');
    if (errorEl) {
      if (this.state.error) {
        errorEl.textContent = this.state.error;
        errorEl.style.display = 'block';
      } else {
        errorEl.style.display = 'none';
      }
    }
  }

  private renderLoading(): void {
    const loadingEl = document.getElementById('loadingSpinner');
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
    
    if (loadingEl) {
      loadingEl.style.display = this.state.isLoading ? 'block' : 'none';
    }
    
    if (submitBtn) {
      submitBtn.disabled = this.state.isLoading;
      submitBtn.textContent = this.state.isLoading ? 'Authenticating...' : 'Enter Lab';
    }
  }

  private renderAdminPanel(): void {
    this.renderGuestToggle();
    this.renderAddCodeForm();
    this.renderCodesList();
  }

  private renderGuestToggle(): void {
    const guestToggle = document.getElementById('guestToggle') as HTMLInputElement;
    if (guestToggle) {
      guestToggle.checked = this.state.guestAccessEnabled;
    }
  }

  private renderAddCodeForm(): void {
    const addCodeForm = document.getElementById('addCodeFormContainer');
    if (addCodeForm) {
      addCodeForm.style.display = this.adminState.showAddCodeForm ? 'block' : 'none';
    }
  }

  private renderCodesList(): void {
    const codesContainer = document.getElementById('codesContainer');
    if (!codesContainer) return;

    const codes = this.state.userCodes;
    
    if (codes.length === 0) {
      codesContainer.innerHTML = '<p class="no-codes">No user codes created yet.</p>';
      return;
    }

    const codesHtml = codes.map(code => {
      const isExpired = new Date() > new Date(code.expiryDate);
      const statusClass = code.isActive && !isExpired ? 'active' : 'inactive';
      
      return `
        <div class="code-item ${statusClass}">
          <div class="code-info">
            <span class="code-value">${code.code}</span>
            <span class="code-expiry">Expires: ${new Date(code.expiryDate).toLocaleDateString()}</span>
            ${code.lastUsed ? `<span class="code-last-used">Last used: ${new Date(code.lastUsed).toLocaleDateString()}</span>` : ''}
          </div>
          <div class="code-actions">
            <button onclick="app.toggleCode('${code.id}')" class="btn-toggle">
              ${code.isActive ? 'Disable' : 'Enable'}
            </button>
            <button onclick="app.removeCode('${code.id}')" class="btn-remove">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    codesContainer.innerHTML = codesHtml;
  }

  // Public methods for global access
  public toggleCode(codeId: string): void {
    this.toggleCode(codeId);
  }

  public removeCode(codeId: string): void {
    this.removeCode(codeId);
  }
}
