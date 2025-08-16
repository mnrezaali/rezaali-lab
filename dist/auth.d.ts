import { AccessLevel, Session, UserCode, AuthResponse, ValidationResult } from './types.js';
export declare class AuthService {
    private static readonly ADMIN_CODE;
    private static readonly SESSION_DURATION;
    static validateCode(code: string): ValidationResult;
    static authenticate(code: string): AuthResponse;
    static createSession(accessLevel: AccessLevel): Session;
    static isSessionValid(session: Session | null): boolean;
    static saveSession(session: Session): void;
    static loadSession(): Session | null;
    static clearSession(): void;
    static getUserCodes(): UserCode[];
    static saveUserCodes(codes: UserCode[]): void;
    static isGuestAccessEnabled(): boolean;
    static setGuestAccess(enabled: boolean): void;
    private static generateUserId;
    static generateCode(): string;
    static addUserCode(expiryDate: Date, notes?: string): UserCode;
    static removeUserCode(codeId: string): boolean;
    static toggleUserCode(codeId: string): boolean;
}
//# sourceMappingURL=auth.d.ts.map