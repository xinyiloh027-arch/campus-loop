import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// UTM DOMAIN ALLOWLIST
// ==========================================
const ALLOWED_UTM_DOMAINS = [
  'graduate.utm.my',
  'student.utm.my',
  'utm.my',
] as const;

type UtmDomain = typeof ALLOWED_UTM_DOMAINS[number];

function isUtmEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  return ALLOWED_UTM_DOMAINS.includes(parts[1] as UtmDomain);
}

// In-Memory Database for Server-Side Enforcement
interface ServerUser {
  id: string;
  email: string;
  name: string;
  studentId: string;
  faculty: string;
  dorm: string;
  contactHandle: string;
  role: 'student' | 'staff';
  accountState: 'Signed Out' | 'Email Verification Pending' | 'Verified UTM Member' | 'Suspended';
  emailVerified: boolean;
  isSuspended: boolean;
  passwordHash: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: number;
  resetCode?: string;
  resetCodeExpiresAt?: number;
}

const serverUsers: Map<string, ServerUser> = new Map();
const activeSessions: Map<string, string> = new Map(); // token -> user.id

// Pre-seed sample accounts matching the frontend prototype
const defaultUsers: ServerUser[] = [
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
    passwordHash: 'UtmPass2026!',
    verificationCode: '654321',
    verificationCodeExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
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
    passwordHash: 'UtmPass2026!',
  }
];

defaultUsers.forEach(u => serverUsers.set(u.email.toLowerCase(), u));
// Default session for Alex Tan
activeSessions.set('utm-sess-alex-tan-valid-token', 'utm-user-alex');

// In-Memory store for listings and requests to enforce ownership on backend
interface ServerListing {
  id: string;
  sellerId: string;
  sellerEmail: string;
  sellerName: string;
  title: string;
  price: number;
  category: string;
}

const serverListings: Map<string, ServerListing> = new Map([
  ['item-1', { id: 'item-1', sellerId: 'utm-user-danial', sellerEmail: 'danial@graduate.utm.my', sellerName: 'Danial Hakim', title: 'Calculus: Early Transcendentals', price: 45, category: 'Textbooks & Notes' }],
  ['item-2', { id: 'item-2', sellerId: 'utm-user-alex', sellerEmail: 'alex.tan@graduate.utm.my', sellerName: 'Alex Tan', title: 'Texas Instruments TI-84 Plus CE', price: 120, category: 'Electronics' }],
  ['item-3', { id: 'item-3', sellerId: 'utm-user-sarah', sellerEmail: 'sarah@graduate.utm.my', sellerName: 'Sarah Lim', title: 'Logitech MX Master 3S Wireless Mouse', price: 85, category: 'Electronics' }],
]);

// Extend express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      utmUser?: ServerUser;
    }
  }
}

// ==========================================
// BACKEND AUTHORIZATION MIDDLEWARE
// ==========================================
function requireVerifiedUtmUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access denied. You must provide a valid Bearer token from a signed-in UTM account.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const userId = activeSessions.get(token);
  if (!userId) {
    res.status(401).json({
      error: 'INVALID_SESSION',
      message: 'Invalid or expired authentication session. Please sign in again with your UTM email.',
    });
    return;
  }

  let foundUser: ServerUser | undefined;
  for (const u of serverUsers.values()) {
    if (u.id === userId) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    res.status(401).json({
      error: 'USER_NOT_FOUND',
      message: 'User record not found on server.',
    });
    return;
  }

  // Enforce approved UTM domain
  if (!isUtmEmail(foundUser.email)) {
    res.status(403).json({
      error: 'UNAPPROVED_DOMAIN',
      message: 'Account does not belong to an approved UTM domain (@graduate.utm.my, @student.utm.my, @utm.my).',
    });
    return;
  }

  // Enforce Suspended status
  if (foundUser.isSuspended || foundUser.accountState === 'Suspended') {
    res.status(403).json({
      error: 'ACCOUNT_SUSPENDED',
      message: 'This UTM account is currently suspended. Marketplace transactions are prohibited.',
    });
    return;
  }

  // Enforce Email Verification Pending status
  if (!foundUser.emailVerified || foundUser.accountState === 'Email Verification Pending') {
    res.status(403).json({
      error: 'EMAIL_UNVERIFIED',
      message: 'Your UTM email is unverified. You must complete verification before creating or modifying marketplace resources.',
    });
    return;
  }

  req.utmUser = foundUser;
  next();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // ==========================================
  // AUTHENTICATION API ROUTES
  // ==========================================

  // 1. Register new UTM Account
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, name, faculty, studentId } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Email is required.' });
      return;
    }

    if (!isUtmEmail(email)) {
      res.status(400).json({
        error: 'INVALID_UTM_DOMAIN',
        message: 'Registration rejected. Email must end with @graduate.utm.my, @student.utm.my, or @utm.my.',
      });
      return;
    }

    if (!password || password.length < 8) {
      res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (!name || name.trim().length < 2) {
      res.status(400).json({
        error: 'NAME_REQUIRED',
        message: 'Full display name is required.',
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (serverUsers.has(trimmedEmail)) {
      res.status(409).json({
        error: 'ALREADY_EXISTS',
        message: 'An account with this UTM email address is already registered. Please sign in.',
      });
      return;
    }

    const isStaff = trimmedEmail.endsWith('@utm.my');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: ServerUser = {
      id: `utm-${Date.now()}`,
      email: trimmedEmail,
      name: name.trim(),
      studentId: studentId?.trim() || (isStaff ? `UTM-STF-${Math.floor(1000 + Math.random() * 9000)}` : `A24${Math.floor(10000 + Math.random() * 90000)}`),
      faculty: faculty?.trim() || (isStaff ? 'Faculty of Engineering' : 'Faculty of Computing (FC)'),
      dorm: isStaff ? 'Staff Quarters' : 'Kolej Rahman Putra (KRP)',
      contactHandle: `@${trimmedEmail.split('@')[0]}`,
      role: isStaff ? 'staff' : 'student',
      accountState: 'Email Verification Pending',
      emailVerified: false,
      isSuspended: false,
      passwordHash: password,
      verificationCode,
      verificationCodeExpiresAt: Date.now() + 15 * 60 * 1000,
    };

    serverUsers.set(trimmedEmail, newUser);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: trimmedEmail,
      message: `Verification code sent to ${trimmedEmail}. Please verify to activate your UTM account.`,
    });
  });

  // 2. Verify Email Code
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and 6-digit verification code are required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = serverUsers.get(trimmedEmail);
    if (!user) {
      res.status(404).json({ error: 'USER_NOT_FOUND', message: 'No registered UTM account found.' });
      return;
    }

    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      res.status(400).json({ error: 'NO_PENDING_CODE', message: 'No pending verification code found. Please request a new code.' });
      return;
    }

    if (Date.now() > user.verificationCodeExpiresAt) {
      res.status(400).json({ error: 'EXPIRED_CODE', message: 'Verification code has expired. Please click Resend.' });
      return;
    }

    if (user.verificationCode !== code.trim()) {
      res.status(400).json({ error: 'INVALID_CODE', message: 'Incorrect verification code. Please check your UTM inbox.' });
      return;
    }

    // Activate account
    user.emailVerified = true;
    user.accountState = 'Verified UTM Member';
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;

    const token = `utm-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    activeSessions.set(token, user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        faculty: user.faculty,
        dorm: user.dorm,
        role: user.role,
        accountState: user.accountState,
        emailVerified: user.emailVerified,
        isSuspended: user.isSuspended,
      },
      message: 'UTM email verified successfully! Welcome to CampusLoop.',
    });
  });

  // 3. Resend Verification Code
  app.post('/api/auth/resend-code', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Email is required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = serverUsers.get(trimmedEmail);
    if (!user) {
      res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Account not found.' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'ALREADY_VERIFIED', message: 'This UTM email is already verified.' });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000;

    res.json({
      success: true,
      message: `A fresh 6-digit verification code has been dispatched to ${trimmedEmail}.`,
    });
  });

  // 4. Sign In
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password are required.' });
      return;
    }

    if (!isUtmEmail(email)) {
      res.status(400).json({
        error: 'INVALID_DOMAIN',
        message: 'Access denied. Only @graduate.utm.my, @student.utm.my, or @utm.my accounts are allowed.',
      });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = serverUsers.get(trimmedEmail);
    if (!user || user.passwordHash !== password) {
      res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Incorrect UTM email or password.',
      });
      return;
    }

    if (user.isSuspended || user.accountState === 'Suspended') {
      res.status(403).json({
        error: 'ACCOUNT_SUSPENDED',
        message: 'This UTM account is suspended and cannot access marketplace transactions.',
      });
      return;
    }

    if (!user.emailVerified || user.accountState === 'Email Verification Pending') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = code;
      user.verificationCodeExpiresAt = Date.now() + 15 * 60 * 1000;

      res.status(403).json({
        error: 'EMAIL_UNVERIFIED',
        requiresVerification: true,
        message: 'Your UTM email is not verified yet. Please enter the verification code sent to your inbox.',
      });
      return;
    }

    const token = `utm-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    activeSessions.set(token, user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        faculty: user.faculty,
        dorm: user.dorm,
        role: user.role,
        accountState: user.accountState,
        emailVerified: user.emailVerified,
        isSuspended: user.isSuspended,
      },
      message: `Welcome back, ${user.name}!`,
    });
  });

  // 5. Get Current User Profile
  app.get('/api/auth/me', requireVerifiedUtmUser, (req: Request, res: Response) => {
    const user = req.utmUser!;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        faculty: user.faculty,
        dorm: user.dorm,
        role: user.role,
        accountState: user.accountState,
        emailVerified: user.emailVerified,
        isSuspended: user.isSuspended,
      }
    });
  });

  // 6. Sign Out
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      activeSessions.delete(token);
    }
    res.json({ success: true, message: 'Signed out successfully.' });
  });

  // 7. Forgot Password
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !isUtmEmail(email)) {
      res.status(400).json({ error: 'INVALID_DOMAIN', message: 'Valid UTM email address is required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = serverUsers.get(trimmedEmail);
    if (!user) {
      res.status(404).json({ error: 'USER_NOT_FOUND', message: 'No account found with this UTM email.' });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpiresAt = Date.now() + 15 * 60 * 1000;

    res.json({
      success: true,
      message: `Password reset instructions sent to ${trimmedEmail}.`,
    });
  });

  // 8. Reset Password
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email, code, and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = serverUsers.get(trimmedEmail);
    if (!user || user.resetCode !== code.trim() || !user.resetCodeExpiresAt || Date.now() > user.resetCodeExpiresAt) {
      res.status(400).json({ error: 'INVALID_RESET_CODE', message: 'Invalid or expired reset code.' });
      return;
    }

    user.passwordHash = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiresAt = undefined;

    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  });

  // ==========================================
  // PROTECTED MARKETPLACE BACKEND API ROUTES
  // (Cannot be bypassed by direct API calls)
  // ==========================================

  // Create Listing: Requires Verified UTM Member
  app.post('/api/listings', requireVerifiedUtmUser, (req: Request, res: Response) => {
    const user = req.utmUser!;
    const { title, price, category } = req.body;

    if (!title || price === undefined) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Title and price are required.' });
      return;
    }

    const newId = `item-${Date.now()}`;
    const listing: ServerListing = {
      id: newId,
      sellerId: user.id,
      sellerEmail: user.email,
      sellerName: user.name,
      title,
      price: Number(price),
      category: category || 'Other Items',
    };

    serverListings.set(newId, listing);
    res.status(201).json({ success: true, listing });
  });

  // Update Listing: Requires Verified UTM Member AND Seller Ownership
  app.put('/api/listings/:id', requireVerifiedUtmUser, (req: Request, res: Response) => {
    const user = req.utmUser!;
    const { id } = req.params;
    const existing = serverListings.get(id);

    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Listing not found.' });
      return;
    }

    // Strict Ownership Enforcement: Users can edit only their own listings!
    if (existing.sellerId !== user.id && existing.sellerEmail.toLowerCase() !== user.email.toLowerCase()) {
      res.status(403).json({
        error: 'FORBIDDEN_OWNERSHIP',
        message: 'Security Violation: You can only edit or modify your own listings.',
      });
      return;
    }

    const updated: ServerListing = {
      ...existing,
      ...req.body,
      id: existing.id,
      sellerId: existing.sellerId, // cannot spoof seller ID
      sellerEmail: existing.sellerEmail,
    };

    serverListings.set(id, updated);
    res.json({ success: true, listing: updated });
  });

  // Delete Listing: Requires Verified UTM Member AND Seller Ownership
  app.delete('/api/listings/:id', requireVerifiedUtmUser, (req: Request, res: Response) => {
    const user = req.utmUser!;
    const { id } = req.params;
    const existing = serverListings.get(id);

    if (!existing) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Listing not found.' });
      return;
    }

    if (existing.sellerId !== user.id && existing.sellerEmail.toLowerCase() !== user.email.toLowerCase()) {
      res.status(403).json({
        error: 'FORBIDDEN_OWNERSHIP',
        message: 'Security Violation: You can only delete your own listings.',
      });
      return;
    }

    serverListings.delete(id);
    res.json({ success: true, message: 'Listing deleted.' });
  });

  // Protected Trade / Purchase Request Route
  app.post('/api/trades', requireVerifiedUtmUser, (req: Request, res: Response) => {
    res.status(201).json({ success: true, message: 'Purchase request accepted by server.' });
  });

  // Protected Rental Operations
  app.post('/api/rentals', requireVerifiedUtmUser, (req: Request, res: Response) => {
    res.status(201).json({ success: true, message: 'Rental listing registered on server.' });
  });

  app.post('/api/rentals/requests', requireVerifiedUtmUser, (req: Request, res: Response) => {
    res.status(201).json({ success: true, message: 'Rental booking registered on server.' });
  });

  // ==========================================
  // VITE DEV SERVER / PRODUCTION STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusLoop UTM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
