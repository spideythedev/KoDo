// app.js
import { auth, db, githubProvider, signInWithPopup, signOut } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// --- State Management ---
export const AppState = new Proxy({
    user: null,
    userProfile: null, // Firestore user data (labs progress, TTG scores)
    currentLab: null,
    route: 'dashboard',
    theme: 'dark'
}, {
    set(target, prop, value) {
        target[prop] = value;
        if (prop === 'user' || prop === 'route') renderApp();
        return true;
    }
});

// --- Router & Renderer ---
const root = document.getElementById('app-root');

async function renderApp() {
    const { user, route } = AppState;
    
    if (!user) {
        renderLoginScreen();
        return;
    }

    // Fetch/Create user profile in Firestore
    await syncUserProfile(user);

    if (route === 'dashboard') {
        const { renderDashboard } = await import('./components/dashboard.js');
        root.innerHTML = renderDashboard(user, AppState.userProfile);
        attachDashboardListeners();
    } else if (route === 'workspace') {
        const { renderWorkspace } = await import('./components/workspace.js');
        root.innerHTML = renderWorkspace(AppState.currentLab);
        setTimeout(() => import('./monaco.js').then(m => m.initMonaco()), 10);
    }
}

function renderLoginScreen() {
    root.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full space-y-8">
            <div class="text-center space-y-2">
                <h1 class="text-8xl font-light tracking-tight text-white">KoDo</h1>
                <p class="text-sm uppercase tracking-[.5em] text-white/30">The Forge</p>
            </div>
            <div class="w-px h-12 bg-white/10"></div>
            <button id="login-btn" class="glass-panel px-8 py-3 text-sm font-medium text-white/80 hover:text-white hover:border-white/20 transition-all duration-500 rounded-sm flex items-center gap-3">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Authenticate with GitHub
            </button>
            <p class="text-xs text-white/20 fixed bottom-8">kodo-559e9 • Arceus Core</p>
        </div>
    `;
    
    document.getElementById('login-btn').addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, githubProvider);
        } catch (error) {
            console.error('Auth error:', error);
        }
    });
}

async function syncUserProfile(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        // New user - create profile
        const profile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            labs: {
                'js-lexical': { status: 'locked', ttg: null },
                'discord-bot-core': { status: 'locked', ttg: null },
                'python-async': { status: 'locked', ttg: null },
                'cpp-pointers': { status: 'locked', ttg: null }
            },
            purityScore: 100,
            kLevel: 'JUNIOR' // K. starts in junior mode
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
            const labLang = card.querySelector('[data-lang]').dataset.lang;
            
            AppState.currentLab = { 
                id: labId, 
                name: labName,
                language: labLang
            };
            AppState.route = 'workspace';
        });
    });
    
    // Sign out button
    const signOutBtn = document.getElementById('signout-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            await signOut(auth);
            AppState.user = null;
            AppState.route = 'dashboard';
        });
    }
}

// --- Bootstrap ---
onAuthStateChanged(auth, (user) => {
    AppState.user = user;
    if (user) AppState.route = 'dashboard';
    renderApp();
});