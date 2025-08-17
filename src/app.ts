import { AuthService } from './auth.js';
import { AccessLevel, AppState, Session, UserCode, AdminPanelState, Workshop, MiniApp } from './types.js';

export class LabApp {
  private state: AppState;
  private adminState: AdminPanelState;
  private workshops: Workshop[];

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

    this.workshops = this.initializeWorkshops();
    this.init();
  }

  private initializeWorkshops(): Workshop[] {
    return [
      {
        id: 'presentations',
        name: 'Presentations Workshop',
        apps: [
          { 
            name: 'AI Prompt Generator', 
            description: 'Create professional AI assistant prompts',
            status: 'available',
            url: 'prompt-generator.html'
          },
          { 
            name: 'Presentation Analyser', 
            description: 'Analyze vocal delivery, body language, and content structure',
            status: 'available',
            url: 'presentation-analyser.html'
          },
          { 
            name: 'Presentations Verbal Analysis', 
            description: 'AI-powered analysis of presentation transcripts with detailed feedback',
            status: 'available',
            url: 'presentations-verbal-analysis.html'
          },
          { id: 'pitch-polisher', name: 'Pitch Polisher', description: 'Refines a rough pitch draft into a concise, clear elevator pitch.', category: 'presentations', status: 'coming_soon' },
          { id: 'audience-analyzer', name: 'Audience Analyzer', description: 'Captures live audience sentiment via word clouds and polls during a pitch to provide real-time feedback.', category: 'presentations', status: 'coming_soon' },
          { id: 'verbal-analyser', name: 'Verbal Analyser', description: 'Provides a report on a speaker\'s vocal delivery, including filler words, pace, and clarity.', category: 'presentations', status: 'coming_soon' },
          { id: 'presence-coach', name: 'Presence Coach', description: 'Analyzes body language through a live camera feed to provide feedback on posture, gestures, and eye contact.', category: 'presentations', status: 'coming_soon' },
          { id: 'scorre-coach', name: 'SCORRE Presentation Outline Coach', description: 'A guided app that helps users develop a complete presentation outline using the SCORRE framework.', category: 'presentations', status: 'coming_soon' }
        ]
      },
      {
        id: 'sustainable-development',
        name: 'Sustainable Development Workshop',
        apps: [
          { id: 'impact-calculator', name: 'Impact Calculator', description: 'A mini-app that takes user habits and visualizes their personal carbon footprint, making an abstract concept tangible.', category: 'sustainable-development', status: 'coming_soon' },
          { id: 'eco-designer', name: 'Eco-Designer', description: 'An app where participants can "vibe code" a sustainable building using green materials and the app provides a simple score on its sustainability.', category: 'sustainable-development', status: 'coming_soon' },
          { id: 'sdg-expert-coach', name: 'SDG Expert Coach', description: 'An AI assistant pre-prompted with deep knowledge of the UN\'s Sustainable Development Goals. It can help participants define a specific SDG they want to impact and generate a list of actionable steps or project ideas aligned with that goal.', category: 'sustainable-development', status: 'coming_soon' }
        ]
      },
      {
        id: 'artificial-intelligence',
        name: 'Artificial Intelligence Workshop',
        apps: [
          { id: 'super-prompt-generator', name: 'Super Prompt Generator', description: 'Guides a user through the R.A.C.E. framework to create a specialized, copy-and-paste-ready prompt.', category: 'artificial-intelligence', status: 'coming_soon' },
          { id: 'ai-team-roster', name: 'AI Team Roster', description: 'A visual app where participants can "drag and drop" predefined AI personas onto a team roster, solidifying the idea of building a personal AI army.', category: 'artificial-intelligence', status: 'coming_soon' },
          { id: 'content-amplifier', name: 'Content Amplifier', description: 'Takes a single piece of content (e.g., an article) and automatically generates multiple, platform-specific versions for social media (e.g., LinkedIn, Instagram, X).', category: 'artificial-intelligence', status: 'coming_soon' }
        ]
      },
      {
        id: 'leadership-development',
        name: 'Leadership Development Workshop',
        apps: [
          { id: 'decision-architect', name: 'Decision Architect', description: 'An app where a participant inputs a tough leadership problem, and the app uses AI to generate a list of potential solutions and a SWOT analysis for each.', category: 'leadership-development', status: 'coming_soon' },
          { id: 'role-play-assistant', name: 'Role-Play Assistant', description: 'Uses an internal prompt to have the AI act as a difficult team member, allowing a leader to practice a challenging conversation in a safe environment.', category: 'leadership-development', status: 'coming_soon' },
          { id: 'kotters-8-step-coach', name: 'Kotter\'s 8-Step Change Coach', description: 'A guided app that walks a user through John Kotter\'s 8-step model for managing change. The app prompts the user to address each step, from creating a sense of urgency to anchoring the change in culture, and generates a structured change management plan.', category: 'leadership-development', status: 'coming_soon' }
        ]
      },
      {
        id: 'mindset-matters',
        name: 'Mindset Matters Workshop',
        apps: [
          { id: 'mindset-mapper', name: 'Mindset Mapper', description: 'A visual app where a user can input their fixed mindset beliefs and the app uses AI to challenge them, providing alternative, growth-oriented perspectives.', category: 'mindset-matters', status: 'coming_soon' },
          { id: 'goal-smasher', name: 'Goal Smasher', description: 'An app that takes a user\'s big, overwhelming goal and uses AI to break it down into a series of smaller, manageable daily or weekly habits, creating a tangible plan for success.', category: 'mindset-matters', status: 'coming_soon' }
        ]
      }
    ];
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

    // Guest access button
    const guestAccessBtn = document.getElementById('guestAccessBtn');
    if (guestAccessBtn) {
      guestAccessBtn.addEventListener('click', this.handleGuestLogin.bind(this));
    }

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
      togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
    }

    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    const dashboardLogoutBtn = document.getElementById('dashboardLogoutBtn');
    if (dashboardLogoutBtn) {
      dashboardLogoutBtn.addEventListener('click', this.handleLogout.bind(this));
    }

    // Enter Lab button
    const enterLabBtn = document.getElementById('enterLabBtn');
    if (enterLabBtn) {
      enterLabBtn.addEventListener('click', this.showDashboard.bind(this));
    }

    // Back to welcome button
    const backToWelcomeBtn = document.getElementById('backToWelcomeBtn');
    if (backToWelcomeBtn) {
      backToWelcomeBtn.addEventListener('click', this.showWelcome.bind(this));
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
      
      // Clear the form
      form.reset();
    } else {
      this.setError(authResult.message);
    }

    this.setLoading(false);
    this.render();
  }

  private async handleGuestLogin(): Promise<void> {
    if (!this.state.guestAccessEnabled) {
      return;
    }

    this.setLoading(true);
    this.clearError();

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const session = AuthService.createSession(AccessLevel.GUEST);
    AuthService.saveSession(session);
    
    this.state.currentSession = session;
    this.state.isAuthenticated = true;
    
    this.showSuccess('Guest access granted');
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

  private showDashboard(): void {
    const mainContent = document.getElementById('mainContent');
    const labDashboard = document.getElementById('labDashboard');
    
    if (mainContent) mainContent.style.display = 'none';
    if (labDashboard) labDashboard.style.display = 'block';
    
    this.renderDashboard();
  }

  private showWelcome(): void {
    const mainContent = document.getElementById('mainContent');
    const labDashboard = document.getElementById('labDashboard');
    
    if (mainContent) mainContent.style.display = 'block';
    if (labDashboard) labDashboard.style.display = 'none';
    
    this.renderAccessLevel();
  }

  public togglePasswordVisibility(): void {
    const passwordInput = document.getElementById('accessCode') as HTMLInputElement;
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput && passwordInput.type === 'password') {
      passwordInput.type = 'text';
      if (toggleIcon) toggleIcon.textContent = '🙈';
    } else if (passwordInput) {
      passwordInput.type = 'password';
      if (toggleIcon) toggleIcon.textContent = '👁️';
    }
  }

  private handleGuestToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    AuthService.setGuestAccess(target.checked);
    this.state.guestAccessEnabled = target.checked;
    this.renderGuestAccess();
  }

  private async handleAddCode(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const expiryDateStr = formData.get('expiryDate') as string;
    const notes = formData.get('codeNotes') as string || '';
    
    if (!expiryDateStr) {
      this.setError('Please select an expiry date');
      return;
    }

    const expiryDate = new Date(expiryDateStr);
    if (expiryDate <= new Date()) {
      this.setError('Expiry date must be in the future');
      return;
    }

    const newCode = AuthService.addUserCode(expiryDate, notes);
    this.state.userCodes = AuthService.getUserCodes();
    this.adminState.showAddCodeForm = false;
    
    this.showSuccess(`New code created: ${newCode.code}`);
    this.renderAdminPanel();
    form.reset();
  }

  private removeCodeHandler(codeId: string): void {
    if (confirm('Are you sure you want to remove this code?')) {
      AuthService.removeUserCode(codeId);
      this.state.userCodes = AuthService.getUserCodes();
      this.renderAdminPanel();
    }
  }

  private toggleCodeHandler(codeId: string): void {
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
    this.renderGuestAccess();
    
    if (this.state.isAuthenticated && this.state.currentSession?.accessLevel === AccessLevel.ADMIN) {
      this.renderAdminPanel();
    }
  }

  private renderAuthState(): void {
    const loginSection = document.getElementById('loginSection');
    const mainContent = document.getElementById('mainContent');
    const labDashboard = document.getElementById('labDashboard');
    const adminPanel = document.getElementById('adminPanel');

    if (this.state.isAuthenticated) {
      if (loginSection) loginSection.style.display = 'none';
      if (mainContent) mainContent.style.display = 'block';
      if (labDashboard) labDashboard.style.display = 'none';
      if (adminPanel && this.state.currentSession?.accessLevel === AccessLevel.ADMIN) {
        adminPanel.style.display = 'block';
      }
    } else {
      if (loginSection) loginSection.style.display = 'block';
      if (mainContent) mainContent.style.display = 'none';
      if (labDashboard) labDashboard.style.display = 'none';
      if (adminPanel) adminPanel.style.display = 'none';
    }
  }

  private renderAccessLevel(): void {
    const accessLevelEl = document.getElementById('accessLevel');
    const dashboardAccessLevelEl = document.getElementById('dashboardAccessLevel');
    
    if (this.state.currentSession) {
      const level = this.state.currentSession.accessLevel;
      const text = `Access Level: ${level.toUpperCase()}`;
      const className = `access-level access-level-${level}`;
      
      if (accessLevelEl) {
        accessLevelEl.textContent = text;
        accessLevelEl.className = className;
      }
      
      if (dashboardAccessLevelEl) {
        dashboardAccessLevelEl.textContent = text;
        dashboardAccessLevelEl.className = className;
      }
    }
  }

  private renderGuestAccess(): void {
    const guestAccessBtn = document.getElementById('guestAccessBtn') as HTMLButtonElement;
    const guestDisabledMessage = document.getElementById('guestDisabledMessage');
    
    if (this.state.guestAccessEnabled) {
      if (guestAccessBtn) {
        guestAccessBtn.style.display = 'block';
        guestAccessBtn.disabled = false;
      }
      if (guestDisabledMessage) guestDisabledMessage.style.display = 'none';
    } else {
      if (guestAccessBtn) {
        guestAccessBtn.style.display = 'none';
      }
      if (guestDisabledMessage) guestDisabledMessage.style.display = 'block';
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
    const guestBtn = document.getElementById('guestAccessBtn') as HTMLButtonElement;
    
    if (loadingEl) {
      loadingEl.style.display = this.state.isLoading ? 'block' : 'none';
    }
    
    if (submitBtn) {
      submitBtn.disabled = this.state.isLoading;
      submitBtn.textContent = this.state.isLoading ? 'Authenticating...' : 'Enter Lab';
    }
    
    if (guestBtn) {
      (guestBtn as HTMLButtonElement).disabled = this.state.isLoading;
    }
  }

  private renderDashboard(): void {
    const workshopsGrid = document.getElementById('workshopsGrid');
    if (!workshopsGrid) return;

    const workshopsHtml = this.workshops.map(workshop => {
      // Separate available and coming soon apps
      const availableApps = workshop.apps.filter(app => app.status === 'available');
      const comingSoonApps = workshop.apps.filter(app => app.status === 'coming_soon');
      
      const renderApp = (app: any) => `
        <div class="mini-app-card ${app.status === 'available' && app.url ? 'clickable' : 'coming-soon'}" 
             ${app.status === 'available' && app.url ? `onclick="window.location.href='${app.url}'"` : ''}>
          <h4>${app.name}</h4>
          <p>${app.description}</p>
          <span class="status ${app.status === 'available' ? 'available' : 'coming-soon'}">
            ${app.status === 'available' ? 'Available' : 'Coming Soon'}
          </span>
        </div>
      `;
      
      let appsHtml = '';
      
      if (availableApps.length > 0) {
        appsHtml += `
          <div class="section-label">
            <h4 class="text-lg font-semibold text-green-400 mb-3">✅ Available</h4>
          </div>
          <div class="mini-apps-grid mb-6">
            ${availableApps.map(renderApp).join('')}
          </div>
        `;
      }
      
      if (comingSoonApps.length > 0) {
        appsHtml += `
          <div class="section-label">
            <h4 class="text-lg font-semibold text-gray-500 mb-3">🚧 Coming Soon</h4>
          </div>
          <div class="mini-apps-grid">
            ${comingSoonApps.map(renderApp).join('')}
          </div>
        `;
      }

      return `
        <div class="workshop-category">
          <h3>${workshop.name}</h3>
          ${appsHtml}
        </div>
      `;
    }).join('');

    workshopsGrid.innerHTML = workshopsHtml;
    this.renderAccessLevel();
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
            ${code.notes ? `<span class="code-notes">${code.notes}</span>` : ''}
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
    this.toggleCodeHandler(codeId);
  }

  public removeCode(codeId: string): void {
    this.removeCodeHandler(codeId);
  }
}
