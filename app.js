// app.js
import { 
    auth, 
    db, 
    googleProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile
} from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAllLabs } from './curriculum.js';

// --- State Management ---
export const AppState = new Proxy({
    user: null,
    userProfile: null,
    currentLab: null,
    route: 'dashboard',
    theme: 'dark',
    authMode: 'login'
}, {
    set(target, prop, value) {
        target[prop] = value;
        if (prop === 'user' || prop === 'route' || prop === 'authMode') renderApp();
        return true;
    }
});

const root = document.getElementById('app-root');

async function renderApp() {
    const { user, route } = AppState;
    
    if (!user) {
        renderAuthScreen();
        return;
    }

    await syncUserProfile(user);

    if (route === 'dashboard') {
        const { renderDashboard } = await import('./components/dashboard.js');
        root.innerHTML = renderDashboard(user, AppState.userProfile);
        attachDashboardListeners();
    } else if (route === 'workspace') {
        const { renderWorkspace } = await import('./components/workspace.js');
        root.innerHTML = renderWorkspace(AppState.currentLab);
        setTimeout(async () => {
            const monaco = await import('./monaco.js');
            await monaco.initMonaco();
        }, 10);
    }
}

function renderAuthScreen() {
    const isLogin = AppState.authMode === 'login';
    
    root.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen p-8">
            <div class="text-center space-y-2 mb-12">
                <div class="relative mb-6">
                    <div class="w-16 h-16 mx-auto relative">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full blur-xl"></div>
                        <div class="relative w-full h-full flex items-center justify-center">
                            <span class="text-4xl font-light text-white/80">K</span>
                        </div>
                    </div>
                </div>
                <h1 class="text-5xl font-light tracking-tight text-white">KoDo</h1>
                <p class="text-xs uppercase tracking-[.4em] text-white/30">The Forge</p>
            </div>
            
            <div class="glass-panel w-full max-w-md p-8 rounded-lg">
                <div class="flex gap-2 mb-8 border-b border-subtle">
                    <button id="tab-login" class="flex-1 pb-3 text-sm font-medium transition-all ${isLogin ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/60'}">
                        Sign In
                    </button>
                    <button id="tab-register" class="flex-1 pb-3 text-sm font-medium transition-all ${!isLogin ? 'text-white border-b-2 border-blue-500' : 'text-white/40 hover:text-white/60'}">
                        Create Account
                    </button>
                </div>
                
                <button id="google-auth-btn" class="w-full glass-panel py-3 px-4 rounded-md flex items-center justify-center gap-3 text-sm font-medium text-white/80 hover:text-white hover:border-white/20 transition-all mb-6">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
                
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-subtle"></div>
                    </div>
                    <div class="relative flex justify-center text-xs">
                        <span class="px-2 bg-black text-white/30">or</span>
                    </div>
                </div>
                
                <form id="auth-form" class="space-y-4">
                    ${!isLogin ? `
                        <div>
                            <label class="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Display Name</label>
                            <input type="text" id="display-name" name="displayName" class="w-full bg-white/5 border border-subtle rounded-md px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="John Doe">
                        </div>
                    ` : ''}
                    
                    <div>
                        <label class="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Email</label>
                        <input type="email" id="email" name="email" required class="w-full bg-white/5 border border-subtle rounded-md px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="you@example.com">
                    </div>
                    
                    <div>
                        <label class="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Password</label>
                        <input type="password" id="password" name="password" required minlength="6" class="w-full bg-white/5 border border-subtle rounded-md px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="••••••••">
                    </div>
                    
                    ${isLogin ? `
                        <div class="text-right">
                            <button type="button" id="forgot-password-btn" class="text-xs text-white/40 hover:text-white/60 transition-colors">
                                Forgot password?
                            </button>
                        </div>
                    ` : ''}
                    
                    <div id="auth-error" class="text-xs text-red-400 min-h-[20px] hidden"></div>
                    
                    <button type="submit" class="w-full glass-panel py-3 px-4 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                        ${isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <p class="text-center text-xs text-white/30 mt-6">
                    ${isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button id="switch-mode-btn" class="text-blue-400 hover:text-blue-300 transition-colors ml-1">
                        ${isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>
            
            <p class="text-[10px] text-white/15 uppercase tracking-widest mt-8">kodo-559e9 • Arceus Core</p>
        </div>
    `;
    
    attachAuthListeners();
}

function attachAuthListeners() {
    document.getElementById('tab-login')?.addEventListener('click', () => {
        AppState.authMode = 'login';
    });
    
    document.getElementById('tab-register')?.addEventListener('click', () => {
        AppState.authMode = 'register';
    });
    
    document.getElementById('switch-mode-btn')?.addEventListener('click', () => {
        AppState.authMode = AppState.authMode === 'login' ? 'register' : 'login';
    });
    
    document.getElementById('google-auth-btn')?.addEventListener('click', async () => {
        try {
            setAuthError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('[KoDo] Google auth error:', error);
            setAuthError(getReadableAuthError(error.code));
        }
    });
    
    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        setAuthError(null);
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const displayName = document.getElementById('display-name')?.value;
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        try {
            if (AppState.authMode === 'register') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (displayName) {
                    await updateProfile(userCredential.user, { displayName });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error('[KoDo] Auth error:', error);
            setAuthError(getReadableAuthError(error.code));
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    document.getElementById('forgot-password-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        
        if (!email) {
            setAuthError('Please enter your email address first');
            return;
        }
        
        try {
            await sendPasswordResetEmail(auth, email);
            setAuthError('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            setAuthError(getReadableAuthError(error.code));
        }
    });
}

function setAuthError(message, type = 'error') {
    const errorEl = document.getElementById('auth-error');
    if (!errorEl) return;
    
    if (!message) {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
        return;
    }
    
    errorEl.classList.remove('hidden');
    errorEl.textContent = message;
    
    if (type === 'success') {
        errorEl.classList.remove('text-red-400');
        errorEl.classList.add('text-emerald-400');
    } else {
        errorEl.classList.remove('text-emerald-400');
        errorEl.classList.add('text-red-400');
    }
}

function getReadableAuthError(code) {
    const errors = {
        'auth/email-already-in-use': 'This email is already registered. Sign in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Try again or reset it.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return errors[code] || 'Authentication failed. Please try again.';
}

async function syncUserProfile(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        const allLabs = getAllLabs();
        const labsProgress = {};
        allLabs.forEach((lab, index) => {
            labsProgress[lab.id] = {
                status: index === 0 ? 'unlocked' : 'locked',
                ttg: null,
                bestTTG: null,
                completedAt: null,
                attempts: 0
            };
        });
        
        const profile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Forger',
            photoURL: user.photoURL || null,
            createdAt: new Date().toISOString(),
            labs: labsProgress,
            purityScore: 100,
            kLevel: 'JUNIOR',
            totalCompletions: 0
        };
        await setDoc(userRef, profile);
        AppState.userProfile = profile;
    } else {
        AppState.userProfile = userSnap.data();
    }
}

function attachDashboardListeners() {
    document.querySelectorAll('[data-lab-id]').forEach(card => {
        card.addEventListener('click', (e) => {
            const labId = card.dataset.labId;
            const labName = card.querySelector('h3').innerText;
            const labLang = card.querySelector('[data-lang]')?.dataset.lang || 'JS';
            
            AppState.currentLab = { 
                id: labId, 
                name: labName,
                language: labLang
            };
            AppState.route = 'workspace';
        });
    });
    
    document.getElementById('signout-btn')?.addEventListener('click', async () => {
        await signOut(auth);
        AppState.user = null;
        AppState.userProfile = null;
        AppState.route = 'dashboard';
        AppState.authMode = 'login';
    });
}

// Bootstrap
onAuthStateChanged(auth, (user) => {
    AppState.user = user;
    AppState.route = user ? 'dashboard' : 'dashboard';
    if (!user) AppState.authMode = 'login';
    renderApp();
});

export async function updateUserProgress(labId, completed, ttg) {
    if (!AppState.user) return;
    
    const userRef = doc(db, 'users', AppState.user.uid);
    const labKey = `labs.${labId}`;
    
    const updates = {};
    updates[`${labKey}.status`] = completed ? 'completed' : 'unlocked';
    updates[`${labKey}.ttg`] = ttg;
    if (completed) {
        updates[`${labKey}.completedAt`] = new Date().toISOString();
    }
    
    // Update best TTG
    const currentBest = AppState.userProfile?.labs?.[labId]?.bestTTG;
    if (!currentBest || ttg < currentBest) {
        updates[`${labKey}.bestTTG`] = ttg;
    }
    
    await updateDoc(userRef, updates);
    
    // Unlock next lab if completed
    if (completed) {
        const allLabs = getAllLabs();
        const currentIndex = allLabs.findIndex(l => l.id === labId);
        if (currentIndex < allLabs.length - 1) {
            const nextLabId = allLabs[currentIndex + 1].id;
            updates[`labs.${nextLabId}.status`] = 'unlocked';
        }
        
        updates.totalCompletions = (AppState.userProfile.totalCompletions || 0) + 1;
        
        // Upgrade K. level
        if (updates.totalCompletions >= 3) {
            updates.kLevel = 'ARCHITECT';
        } else if (updates.totalCompletions >= 1) {
            updates.kLevel = 'SENIOR';
        }
        
        await updateDoc(userRef, updates);
    }
    
    // Refresh local profile
    const userSnap = await getDoc(userRef);
    AppState.userProfile = userSnap.data();
}