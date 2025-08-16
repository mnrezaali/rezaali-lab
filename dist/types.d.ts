export interface UserCode {
    id: string;
    code: string;
    notes: string;
    expiryDate: Date;
    isActive: boolean;
    createdAt: Date;
    lastUsed?: Date;
}
export interface Session {
    accessLevel: AccessLevel;
    loginTime: Date;
    expiryTime: Date;
    userId?: string;
}
export declare enum AccessLevel {
    GUEST = "guest",
    USER = "user",
    ADMIN = "admin"
}
export interface AppState {
    isAuthenticated: boolean;
    currentSession: Session | null;
    userCodes: UserCode[];
    guestAccessEnabled: boolean;
    isLoading: boolean;
    error: string | null;
}
export interface AuthResponse {
    success: boolean;
    accessLevel: AccessLevel;
    message: string;
    sessionDuration?: number;
}
export interface ValidationResult {
    isValid: boolean;
    message: string;
}
export interface AdminPanelState {
    showAddCodeForm: boolean;
    newCodeExpiry: string;
    selectedCodes: string[];
    sortBy: 'createdAt' | 'expiryDate' | 'lastUsed';
    filterActive: boolean | null;
}
export interface MiniApp {
    id: string;
    name: string;
    description: string;
    category: string;
    status: 'coming_soon' | 'available';
}
export interface Workshop {
    id: string;
    name: string;
    apps: MiniApp[];
}
//# sourceMappingURL=types.d.ts.map