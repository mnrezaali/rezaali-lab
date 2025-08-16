import { AccessLevel, Session, UserCode, AuthResponse, ValidationResult } from './types.js';

export class AuthService {
  private static readonly ADMIN_CODE = 'admin-unlock-righteye';
  private static readonly SESSION_DURATION = {
    [AccessLevel.ADMIN]: 24 * 60 * 60 * 1000, // 24 hours
    [AccessLevel.USER]: 8 * 60 * 60 * 1000,   // 8 hours
    [AccessLevel.GUEST]: 2 * 60 * 60 * 1000   // 2 hours
  };

  static validateCode(code: string): ValidationResult {
    if (!code || code.trim().length === 0) {
      return { isValid: false, message: 'Please enter an access code' };
    }

    if (code.length < 3) {
      return { isValid: false, message: 'Access code must be at least 3 characters' };
    }

    return { isValid: true, message: '' };
  }

  static authenticate(code: string): AuthResponse {
    const validation = this.validateCode(code);
    if (!validation.isValid) {
      return {
        success: false,
        accessLevel: AccessLevel.GUEST,
        message: validation.message
      };
    }

    // Admin access
    if (code === this.ADMIN_CODE) {
      return {
        success: true,
        accessLevel: AccessLevel.ADMIN,
        message: 'Admin access granted',
        sessionDuration: this.SESSION_DURATION[AccessLevel.ADMIN]
      };
    }

    // Check user codes
    const userCodes = this.getUserCodes();
    const userCode = userCodes.find(uc => 
      uc.code === code && 
      uc.isActive && 
      new Date() < new Date(uc.expiryDate)
    );

    if (userCode) {
      // Update last used
      userCode.lastUsed = new Date();
      this.saveUserCodes(userCodes);

      return {
        success: true,
        accessLevel: AccessLevel.USER,
        message: 'User access granted',
        sessionDuration: this.SESSION_DURATION[AccessLevel.USER]
      };
    }

    // Check guest access
    if (this.isGuestAccessEnabled()) {
      return {
        success: true,
        accessLevel: AccessLevel.GUEST,
        message: 'Guest access granted',
        sessionDuration: this.SESSION_DURATION[AccessLevel.GUEST]
      };
    }

    return {
      success: false,
      accessLevel: AccessLevel.GUEST,
      message: 'Invalid access code'
    };
  }

  static createSession(accessLevel: AccessLevel): Session {
    const now = new Date();
    const expiryTime = new Date(now.getTime() + this.SESSION_DURATION[accessLevel]);

    return {
      accessLevel,
      loginTime: now,
      expiryTime,
      userId: accessLevel === AccessLevel.USER ? this.generateUserId() : undefined
    };
  }

  static isSessionValid(session: Session | null): boolean {
    if (!session) return false;
    return new Date() < new Date(session.expiryTime);
  }

  static saveSession(session: Session): void {
    localStorage.setItem('labSession', JSON.stringify({
      ...session,
      loginTime: session.loginTime.toISOString(),
      expiryTime: session.expiryTime.toISOString()
    }));
  }

  static loadSession(): Session | null {
    try {
      const stored = localStorage.getItem('labSession');
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        loginTime: new Date(parsed.loginTime),
        expiryTime: new Date(parsed.expiryTime)
      };
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem('labSession');
  }

  static getUserCodes(): UserCode[] {
    try {
      const stored = localStorage.getItem('labUserCodes');
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((code: any) => ({
        ...code,
        createdAt: new Date(code.createdAt),
        expiryDate: new Date(code.expiryDate),
        lastUsed: code.lastUsed ? new Date(code.lastUsed) : undefined
      }));
    } catch {
      return [];
    }
  }

  static saveUserCodes(codes: UserCode[]): void {
    localStorage.setItem('labUserCodes', JSON.stringify(codes));
  }

  static isGuestAccessEnabled(): boolean {
    return localStorage.getItem('labGuestAccess') === 'true';
  }

  static setGuestAccess(enabled: boolean): void {
    localStorage.setItem('labGuestAccess', enabled.toString());
  }

  private static generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  static generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static addUserCode(expiryDate: Date, notes: string = ''): UserCode {
    const codes = this.getUserCodes();
    const newCode: UserCode = {
      id: 'code_' + Date.now(),
      code: this.generateCode(),
      notes,
      expiryDate,
      isActive: true,
      createdAt: new Date()
    };

    codes.push(newCode);
    this.saveUserCodes(codes);
    return newCode;
  }

  static removeUserCode(codeId: string): boolean {
    const codes = this.getUserCodes();
    const index = codes.findIndex(c => c.id === codeId);
    
    if (index === -1) return false;
    
    codes.splice(index, 1);
    this.saveUserCodes(codes);
    return true;
  }

  static toggleUserCode(codeId: string): boolean {
    const codes = this.getUserCodes();
    const code = codes.find(c => c.id === codeId);
    
    if (!code) return false;
    
    code.isActive = !code.isActive;
    this.saveUserCodes(codes);
    return true;
  }
}
