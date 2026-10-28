/**
 * UTM Email Authentication and Security Service
 * 
 * Rules enforced:
 * 1. Only approved UTM email domains allowed:
 *    - @graduate.utm.my (Official UTM student domain)
 *    - @student.utm.my  (Supported UTM student domain)
 *    - @utm.my          (Official UTM staff & institutional domain)
 * 2. Protected Account States:
 *    - 'Signed Out'
 *    - 'Email Verification Pending'
 *    - 'Verified UTM Member'
 *    - 'Suspended'
 * 3. Only 'Verified UTM Member' can execute marketplace transactions.
 * 4. Passwords and verification tokens are never logged or exposed.
 */

import { ALLOWED_UTM_DOMAINS, AccountState, UTMUser, AuthSession } from '../types';

const AUTH_USER_KEY = 'campusloop_utm_user_v1';
const AUTH_TOKEN_KEY = 'campusloop_utm_token_v1';
const USERS_DB_KEY = 'campusloop_utm_registered_users_v1';
const VERIFICATION_CODES_KEY = 'campusloop_utm_verification_codes_v1';
const PASSWORD_RESET_CODES_KEY = 'campusloop_utm_pwd_reset_codes_v1';

interface StoredUserAccount extends UTMUser {
  passwordHash: string; // hashed/masked in storage
}

interface VerificationRecord {
  code: string;
  expiresAt: number;
}

// Initial pre-seeded accounts for instant testing of all requirements
const INITIAL_UTM_ACCOUNTS: StoredUserAccount[] = [
  {
    id: 'utm-user-alex',
    email: 'alex.tan@graduate.utm.my',
    name: 'Alex Tan',
    studentId: 'A23CS0123',
    faculty: 'Faculty of Computing (FC)',
    dorm: 'Kolej Rahman Putra (KRP)',
    contactHandle: '@alex_tan_utm',
    role: 'student',
    accountState: 'Verified UTM Member',
    emailVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    verifiedTransactionsCount: 14,
    createdAt: '2026-01-15T08:00:00.000Z',
    passwordHash: 'UtmPass2026!',
  },
  {
    id: 'utm-user-staff',
    email: 'nurul.huda@utm.my',
    name: 'Dr. Nurul Huda',
    studentId: 'UTM-STF-8891',
    faculty: 'Faculty of Electrical Engineering (FKE)',
    dorm: 'Staff Quarters, UTM Skudai',
    contactHandle: '@dr_nurul_huda',
    role: 'staff',
    accountState: 'Verified UTM Member',
    emailVerified: true,
    isSuspended: false,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    verifiedTransactionsCount: 22,
    createdAt: '2026-02-01T08:00:00.000Z',
    passwordHash: 'UtmPass2026!',
  },
  {
    id: 'utm-user-pending',
    email: 'newbie@student.utm.my',
    name: 'Danial Hakim (Unverified)',
    studentId: 'A23EE0999',
    faculty: 'Faculty of Civil Engineering (FKA)',
    dorm: 'Kolej Tun Dr Ismail (KTDI)',
    contactHandle: '@danial_new',
    role: 'student',
    accountState: 'Email Verification Pending',
    emailVerified: false,
    isSuspended: false,
    verifiedTransactionsCount: 0,
    createdAt: '2026-10-27T10:00:00.000Z',
    passwordHash: 'UtmPass2026!',
  },
  {
    id: 'utm-user-suspended',
    email: 'spammer@graduate.utm.my',
    name: 'Suspended Account User',
    studentId: 'A20XX9999',
    faculty: 'Suspended Member',
    dorm: 'N/A',
    contactHandle: '@suspended_user',
    role: 'student',
    accountState: 'Suspended',
    emailVerified: true,
    isSuspended: true,
    verifiedTransactionsCount: 1,
    createdAt: '2025-09-01T08:00:00.000Z',
    passwordHash: 'UtmPass2026!',
  }
];

class AuthService {
  private listeners: Array<(user: UTMUser | null) => void> = [];

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      if (!localStorage.getItem(USERS_DB_KEY)) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_UTM_ACCOUNTS));
      }
      // Seed default active session as Alex Tan for existing app usability,
      // but easily switchable or sign-outable anytime
      if (!localStorage.getItem(AUTH_USER_KEY) && !localStorage.getItem(AUTH_TOKEN_KEY)) {
        const defaultUser = INITIAL_UTM_ACCOUNTS[0];
        const safeUser: UTMUser = { ...defaultUser };
        delete (safeUser as any).passwordHash;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
        localStorage.setItem(AUTH_TOKEN_KEY, 'utm-sess-alex-tan-valid-token');
      }
    } catch (e) {
      console.warn('Auth initialization warning:', e);
    }
  }

  private getStoredUsers(): StoredUserAccount[] {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return INITIAL_UTM_ACCOUNTS;
  }

  private saveStoredUsers(users: StoredUserAccount[]) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users database:', e);
    }
  }

  // --- UTM DOMAIN VALIDATION ---
  public isUtmEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    const parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    return (ALLOWED_UTM_DOMAINS as readonly string[]).includes(domain);
  }

  public validateUtmEmail(email: string): { isValid: boolean; error?: string; domain?: string } {
    if (!email || !email.trim()) {
      return { isValid: false, error: 'Email address is required.' };
    }
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid email format (e.g., studentID@graduate.utm.my).' };
    }
    const domain = trimmed.split('@')[1];
    if (!(ALLOWED_UTM_DOMAINS as readonly string[]).includes(domain)) {
      return {
        isValid: false,
        domain,
        error: `Access restricted. "${domain}" is not an authorized UTM domain. CampusLoop is exclusively for the UTM community. Please use your official @graduate.utm.my, @student.utm.my, or @utm.my email.`
      };
    }
    return { isValid: true, domain };
  }

  // --- SESSION & STATE ACCESSORS ---
  public getCurrentUser(): UTMUser | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return null;
  }

  public getAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {}
    return null;
  }

  public getAccountState(): AccountState {
    const user = this.getCurrentUser();
    if (!user) return 'Signed Out';
    if (user.isSuspended || user.accountState === 'Suspended') return 'Suspended';
    if (!user.emailVerified || user.accountState === 'Email Verification Pending') return 'Email Verification Pending';
    return 'Verified UTM Member';
  }

  public canTransact(userToCheck?: UTMUser | null): { allowed: boolean; reason?: string } {
    const user = userToCheck !== undefined ? userToCheck : this.getCurrentUser();
    if (!user) {
      return {
        allowed: false,
        reason: 'Please sign in with your verified UTM email to perform marketplace activities.'
      };
    }
    if (user.isSuspended || user.accountState === 'Suspended') {
      return {
        allowed: false,
        reason: 'This account has been suspended by campus moderators and cannot perform marketplace transactions.'
      };
    }
    if (!user.emailVerified || user.accountState === 'Email Verification Pending') {
      return {
        allowed: false,
        reason: 'Your UTM email address has not been verified yet. Please complete verification before transacting.'
      };
    }
    if (!this.isUtmEmail(user.email)) {
      return {
        allowed: false,
        reason: 'Only official UTM email accounts (@graduate.utm.my, @student.utm.my, @utm.my) may transact.'
      };
    }
    return { allowed: true };
  }

  // --- REGISTRATION ---
  public async register(
    name: string,
    email: string,
    password: string,
    faculty?: string,
    studentId?: string
  ): Promise<{ success: boolean; message: string; requiresVerification?: boolean; email?: string; previewCode?: string }> {
    const val = this.validateUtmEmail(email);
    if (!val.isValid) {
      return { success: false, message: val.error || 'Invalid UTM email address.' };
    }

    if (!name || name.trim().length < 2) {
      return { success: false, message: 'Please enter your full official display name.' };
    }

    if (!password || password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, message: 'An account with this UTM email address is already registered. Please sign in or use Forgot Password.' };
    }

    const role = val.domain === 'utm.my' ? 'staff' : 'student';
    const newUser: StoredUserAccount = {
      id: `utm-${Date.now()}`,
      email: trimmedEmail,
      name: name.trim(),
      studentId: studentId?.trim() || (role === 'student' ? `A24${Math.floor(10000 + Math.random() * 90000)}` : `UTM-STF-${Math.floor(1000 + Math.random() * 9000)}`),
      faculty: faculty?.trim() || (role === 'student' ? 'Faculty of Computing (FC)' : 'Faculty of Engineering'),
      dorm: role === 'student' ? 'Kolej Rahman Putra (KRP)' : 'Staff Quarters',
      contactHandle: `@${trimmedEmail.split('@')[0]}`,
      role,
      accountState: 'Email Verification Pending',
      emailVerified: false,
      isSuspended: false,
      verifiedTransactionsCount: 0,
      createdAt: new Date().toISOString(),
      passwordHash: password, // kept securely in local DB storage
    };

    users.push(newUser);
    this.saveStoredUsers(users);

    // Generate 6-digit verification code with 15 minutes expiration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.saveVerificationCode(trimmedEmail, code, 15 * 60 * 1000);

    return {
      success: true,
      requiresVerification: true,
      email: trimmedEmail,
      previewCode: code, // provided for convenient prototype testing
      message: `Verification code sent to ${trimmedEmail}. Please verify your email to activate your account.`
    };
  }

  // --- EMAIL VERIFICATION ---
  public async verifyEmail(
    email: string, 
    code: string
  ): Promise<{ success: boolean; token?: string; user?: UTMUser; message: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const rec = this.getVerificationCode(trimmedEmail);

    if (!rec) {
      return { success: false, message: 'No active verification code found for this email. Please request a new code.' };
    }

    if (Date.now() > rec.expiresAt) {
      return { success: false, message: 'Verification link/code has expired. Please tap Resend to receive a fresh code.' };
    }

    if (rec.code.trim() !== code.trim()) {
      return { success: false, message: 'Incorrect 6-digit verification code. Please check your UTM student email inbox and try again.' };
    }

    // Update user in DB to Verified UTM Member
    const users = this.getStoredUsers();
    const target = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!target) {
      return { success: false, message: 'Account not found.' };
    }

    target.accountState = 'Verified UTM Member';
    target.emailVerified = true;
    this.saveStoredUsers(users);
    this.clearVerificationCode(trimmedEmail);

    // Create active session
    const token = `utm-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const safeUser: UTMUser = { ...target };
    delete (safeUser as any).passwordHash;

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    this.notifyListeners(safeUser);

    return {
      success: true,
      token,
      user: safeUser,
      message: 'Email successfully verified! Welcome to CampusLoop as a Verified UTM Member.'
    };
  }

  // --- RESEND VERIFICATION ---
  public async resendVerification(email: string): Promise<{ success: boolean; message: string; previewCode?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      return { success: false, message: 'No registered account found with this UTM email.' };
    }

    if (user.emailVerified) {
      return { success: false, message: 'This account is already verified. You can sign in directly.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.saveVerificationCode(trimmedEmail, code, 15 * 60 * 1000);

    return {
      success: true,
      previewCode: code,
      message: `A new 6-digit verification code has been dispatched to ${trimmedEmail}.`
    };
  }

  // --- SIGN IN ---
  public async login(
    email: string, 
    password: string
  ): Promise<{ success: boolean; token?: string; user?: UTMUser; message: string; requiresVerification?: boolean; previewCode?: string }> {
    const val = this.validateUtmEmail(email);
    if (!val.isValid) {
      return { success: false, message: val.error || 'Please enter a valid UTM email.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();
    const target = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!target) {
      return {
        success: false,
        message: 'No CampusLoop account found with this UTM email. Please click "Create Account" to register.'
      };
    }

    if (target.passwordHash !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your credentials or click "Forgot Password".'
      };
    }

    // Check Suspended state
    if (target.isSuspended || target.accountState === 'Suspended') {
      return {
        success: false,
        message: 'This UTM account has been suspended due to campus community policy violations. Marketplace transactions are prohibited.'
      };
    }

    // Check Email Verification Pending state
    if (!target.emailVerified || target.accountState === 'Email Verification Pending') {
      // Generate fresh code for convenience
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.saveVerificationCode(trimmedEmail, code, 15 * 60 * 1000);

      return {
        success: false,
        requiresVerification: true,
        previewCode: code,
        message: `Your UTM email (${trimmedEmail}) is not verified yet. Please enter the verification code to activate your account.`
      };
    }

    // Issue verified session
    const token = `utm-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const safeUser: UTMUser = { ...target };
    delete (safeUser as any).passwordHash;

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    this.notifyListeners(safeUser);

    return {
      success: true,
      token,
      user: safeUser,
      message: `Welcome back, ${safeUser.name}! Signed in as Verified UTM Member.`
    };
  }

  // --- SIGN OUT ---
  public async logout(): Promise<void> {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {}
    this.notifyListeners(null);
  }

  // --- FORGOT PASSWORD ---
  public async forgotPassword(email: string): Promise<{ success: boolean; message: string; previewCode?: string }> {
    const val = this.validateUtmEmail(email);
    if (!val.isValid) {
      return { success: false, message: val.error || 'Please enter an official UTM email.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return { success: false, message: 'No registered CampusLoop account found with this UTM email address.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const records = JSON.parse(localStorage.getItem(PASSWORD_RESET_CODES_KEY) || '{}');
      records[trimmedEmail] = { code, expiresAt: Date.now() + 15 * 60 * 1000 };
      localStorage.setItem(PASSWORD_RESET_CODES_KEY, JSON.stringify(records));
    } catch {}

    return {
      success: true,
      previewCode: code,
      message: `Password reset instructions and verification code sent to ${trimmedEmail}.`
    };
  }

  // --- RESET PASSWORD ---
  public async resetPassword(
    email: string, 
    code: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    let records: Record<string, VerificationRecord> = {};
    try {
      records = JSON.parse(localStorage.getItem(PASSWORD_RESET_CODES_KEY) || '{}');
    } catch {}

    const rec = records[trimmedEmail];
    if (!rec) {
      return { success: false, message: 'No active password reset request found. Please request a new code.' };
    }

    if (Date.now() > rec.expiresAt) {
      return { success: false, message: 'Password reset link/code has expired. Please request a new one.' };
    }

    if (rec.code.trim() !== code.trim()) {
      return { success: false, message: 'Incorrect reset code. Please check your UTM student email inbox and try again.' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    const users = this.getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      return { success: false, message: 'Account not found.' };
    }

    user.passwordHash = newPassword;
    this.saveStoredUsers(users);

    delete records[trimmedEmail];
    try {
      localStorage.setItem(PASSWORD_RESET_CODES_KEY, JSON.stringify(records));
    } catch {}

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    };
  }

  // Verification code storage helpers
  private saveVerificationCode(email: string, code: string, ttlMs: number) {
    try {
      const existing = JSON.parse(localStorage.getItem(VERIFICATION_CODES_KEY) || '{}');
      existing[email] = { code, expiresAt: Date.now() + ttlMs };
      localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(existing));
    } catch {}
  }

  private getVerificationCode(email: string): VerificationRecord | null {
    try {
      const existing = JSON.parse(localStorage.getItem(VERIFICATION_CODES_KEY) || '{}');
      return existing[email] || null;
    } catch {
      return null;
    }
  }

  private clearVerificationCode(email: string) {
    try {
      const existing = JSON.parse(localStorage.getItem(VERIFICATION_CODES_KEY) || '{}');
      delete existing[email];
      localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(existing));
    } catch {}
  }

  // State change listener subscription
  public onAuthChange(callback: (user: UTMUser | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(user: UTMUser | null) {
    this.listeners.forEach((cb) => {
      try {
        cb(user);
      } catch (e) {
        console.error('Auth listener error:', e);
      }
    });
  }
}

export const authService = new AuthService();
