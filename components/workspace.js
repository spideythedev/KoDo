// components/workspace.js
import { getLab } from '../curriculum.js';
import { LabValidator } from '../validator.js';
import { updateUserProgress } from '../app.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../firebase.js';

let autoSaveInterval = null;
let ttgStartTime = null;
let ttgInterval = null;
let currentValidator = null;
let hintCount = 0;

export function renderWorkspace(lab) {
    const labData = getLab(lab?.id);
    if (!labData) {
        return `<div class="h-full flex items-center justify-center text-white/40">Lab not found</div>`;
    }
    
    const labName = labData.title;
    const labId = lab?.id;
    const language = labData.language;
    
    return `
        <div class="h-screen w-screen flex flex-col bg-black overflow-hidden">
            <header class="h-12 border-b border-subtle flex items-center justify-between px-4 flex-shrink-0">
                <div class="flex items-center gap-4">
                    <button id="back-to-dash" class="text-white/40 hover:text-white/80 transition-colors text-sm">
                        ← Dashboard
                    </button>
                    <div class="w-px h-4 bg-white/10"></div>
                    <span class="text-sm font-medium text-white/80">${labName}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/40">${language}</span>
                </div>
                
                <div class="flex items-center gap-3">
                    <span id="ttg-display" class="text-[10px] text-white/30 uppercase tracking-wider font-mono">00:00</span>
                    <div class="w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <div id="compute-gauge" class="h-full bg-emerald-500/60 transition-all duration-1000" style="width: 100%"></div>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span id="k-status" class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span class="text-xs text-white/40 font-mono">K.</span>
                    </div>
                    <button id="hint-btn" class="text-xs text-white/40 hover:text-white/60 transition-colors">
                        Hint ${hintCount}/3
                    </button>
                    <button id="run-tests" class="glass-panel px-4 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors">
                        Run Tests ▶
                    </button>
                </div>
            </header>
            
            <div class="flex-1 flex overflow-hidden">
                
                <!-- Theory Panel -->
                <div id="theory-panel" class="w-[30%] border-r border-subtle flex flex-col bg-[#080808]">
                    <div class="p-4 border-b border-subtle">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white/30">Briefing</h3>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6">
                        <div class="prose prose-invert prose-sm max-w-none">
                            ${renderTheory(labData)}
                        </div>
                    </div>
                    <div class="p-4 border-t border-subtle">
                        <button id="acknowledge-intent" class="w-full glass-panel py-2 text-xs font-medium text-white/50 hover:text-white/80 transition-colors">
                            Check Understanding
                        </button>
                    </div>
                </div>
                
                <!-- Editor Panel -->
                <div id="editor-panel" class="w-[45%] flex flex-col bg-[#0A0A0A]">
                    <div class="px-4 py-2 border-b border-subtle flex justify-between items-center">
                        <span class="text-[10px] text-white/30 uppercase tracking-wider font-mono">${labId}.js</span>
                        <span id="editor-status" class="text-[10px] text-emerald-400/60">✓ Saved</span>
                    </div>
                    <div id="monaco-container" class="flex-1 w-full"></div>
                </div>
                
                <!-- Results Panel -->
                <div id="sidecar-panel" class="w-[25%] border-l border-subtle flex flex-col bg-black">
                    <div class="p-4 border-b border-subtle">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white/30">Test Results</h3>
                    </div>
                    <div id="results-container" class="flex-1 overflow-auto p-4">
                        <div id="test-results" class="space-y-2">
                            <p class="text-white/30 text-xs">Run tests to validate your solution</p>
                        </div>
                    </div>
                    <div id="k-inquiry" class="glass-panel m-4 p-4 rounded-lg opacity-0 transition-opacity">
                        <div class="flex gap-3">
                            <span class="text-emerald-400 text-xs font-mono">K.</span>
                            <p id="k-message" class="text-xs text-white/70 flex-1"></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer class="h-6 border-t border-subtle flex items-center px-4 text-[10px] text-white/20 flex-shrink-0">
                <span id="cursor-position">Ln 1, Col 1</span>
                <span class="mx-2">•</span>
                <span>${language}</span>
                <span class="mx-2">•</span>
                <span id="test-summary">0/0 tests passing</span>
            </footer>
        </div>
    `;
}

function renderTheory(labData) {
    return labData.theory.sections.map(section => `
        <div class="mb-6">
            <h4 class="text-white font-medium mb-3">${section.title}</h4>
            <div class="text-white/60 text-sm leading-relaxed mb-3">${section.content}</div>
            ${section.codeExample ? `
                <div class="glass-panel p-3 my-4">
                    <pre class="text-emerald-400 text-xs font-mono whitespace-pre-wrap">${escapeHtml(section.codeExample)}</pre>
                </div>
            ` : ''}
        </div>
    `).join('') + `
        <div class="mt-8 p-4 bg-white/5 rounded-lg border border-subtle">
            <h4 class="text-white text-sm font-medium mb-3">🎯 Challenge</h4>
            <p class="text-white/60 text-sm mb-3">${labData.challenge.description}</p>
            <ul class="space-y-1">
                ${labData.challenge.requirements.map(req => `
                    <li class="text-xs text-white/40 flex items-start gap-2">
                        <span class="text-emerald-400/60">•</span>
                        ${req}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

export async function initializeWorkspace(lab) {
    const labData = getLab(lab?.id);
    currentValidator = new LabValidator(lab?.id);
    hintCount = 0;
    
    // Start TTG timer
    startTTG(lab?.id);
    
    // Load saved code
    await loadSavedCode(lab?.id);
    
    const editor = window.kodoMonacoInstance;
    if (!editor) return;
    
    // Set default if no saved code
    if (!editor.getValue() || editor.getValue().trim() === '') {
        editor.setValue(labData.challenge.starterCode);
    }
    
    // Setup auto-save
    setupAutoSave(editor, lab?.id);
    
    // Setup event listeners
    setupWorkspaceListeners(editor, lab);
    
    // Track cursor
    editor.onDidChangeCursorPosition((e) => {
        const pos = document.getElementById('cursor-position');
        if (pos) pos.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });
}

async function loadSavedCode(labId) {
    const user = window.AppState?.user;
    if (!user) return;
    
    const codeRef = doc(db, 'user_code', `${user.uid}_${labId}`);
    const codeSnap = await getDoc(codeRef);
    
    if (codeSnap.exists() && window.kodoMonacoInstance) {
        window.kodoMonacoInstance.setValue(codeSnap.data().code);
    }
}

function setupAutoSave(editor, labId) {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    
    autoSaveInterval = setInterval(async () => {
        const code = editor.getValue();
        const user = window.AppState?.user;
        if (!user || !code) return;
        
        const codeRef = doc(db, 'user_code', `${user.uid}_${labId}`);
        await setDoc(codeRef, {
            code,
            labId,
            updatedAt: new Date().toISOString()
        });
        
        const status = document.getElementById('editor-status');
        if (status) {
            status.textContent = '✓ Saved';
            status.classList.add('text-emerald-400/60');
            status.classList.remove('text-amber-400');
        }
    }, 2000);
}

function startTTG(labId) {
    ttgStartTime = Date.now();
    
    if (ttgInterval) clearInterval(ttgInterval);
    
    ttgInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - ttgStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        const display = document.getElementById('ttg-display');
        if (display) {
            display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function stopTTG() {
    if (ttgInterval) {
        clearInterval(ttgInterval);
        ttgInterval = null;
    }
    return Math.floor((Date.now() - ttgStartTime) / 1000);
}

function setupWorkspaceListeners(editor, lab) {
    document.getElementById('back-to-dash')?.addEventListener('click', () => {
        stopTTG();
        if (autoSaveInterval) clearInterval(autoSaveInterval);
        window.AppState.route = 'dashboard';
    });
    
    document.getElementById('acknowledge-intent')?.addEventListener('click', async () => {
        const btn = document.getElementById('acknowledge-intent');
        btn.textContent = '✓ Ready';
        btn.classList.add('text-emerald-400');
        
        // Quick quiz check
        const kMsg = document.getElementById('k-message');
        const inquiry = document.getElementById('k-inquiry');
        kMsg.textContent = 'Good. What is the key benefit of closure in this challenge?';
        inquiry.style.opacity = '1';
        
        setTimeout(() => {
            btn.textContent = 'Acknowledge Intent';
            btn.classList.remove('text-emerald-400');
        }, 2000);
    });
    
    document.getElementById('hint-btn')?.addEventListener('click', () => {
        if (!currentValidator) return;
        
        hintCount++;
        const hint = currentValidator.getHint(hintCount);
        
        const kMsg = document.getElementById('k-message');
        const inquiry = document.getElementById('k-inquiry');
        const hintBtn = document.getElementById('hint-btn');
        
        kMsg.textContent = hint || 'No more hints available. Try reviewing the theory section.';
        inquiry.style.opacity = '1';
        hintBtn.textContent = `Hint ${hintCount}/3`;
    });
    
    document.getElementById('run-tests')?.addEventListener('click', async () => {
        const code = editor.getValue();
        await runTests(code, lab?.id);
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, async () => {
        const code = editor.getValue();
        await runTests(code, lab?.id);
    });
}

async function runTests(code, labId) {
    const resultsContainer = document.getElementById('test-results');
    const testSummary = document.getElementById('test-summary');
    const runBtn = document.getElementById('run-tests');
    const kStatus = document.getElementById('k-status');
    
    resultsContainer.innerHTML = '<p class="text-white/30 text-xs">Running tests...</p>';
    runBtn.textContent = 'Testing...';
    runBtn.disabled = true;
    kStatus.classList.add('k-thinking');
    
    try {
        const result = await currentValidator.validate(code);
        
        // Display results
        resultsContainer.innerHTML = result.results.map(r => `
            <div class="flex items-start gap-2 p-2 rounded ${r.passed ? 'bg-emerald-500/5' : 'bg-red-500/5'}">
                <span class="${r.passed ? 'text-emerald-400' : 'text-red-400'} text-xs">${r.passed ? '✓' : '✗'}</span>
                <div class="flex-1">
                    <p class="text-xs ${r.passed ? 'text-white/60' : 'text-red-300/80'}">${r.description}</p>
                    ${r.error ? `<p class="text-[10px] text-red-400/60 mt-0.5">${r.error}</p>` : ''}
                </div>
            </div>
        `).join('');
        
        testSummary.textContent = `${result.passedCount}/${result.totalCount} tests passing`;
        
        if (result.passed) {
            const ttg = stopTTG();
            kStatus.classList.remove('bg-emerald-500', 'k-thinking');
            kStatus.classList.add('bg-emerald-500');
            
            // Celebration!
            resultsContainer.innerHTML += `
                <div class="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-center">
                    <p class="text-emerald-400 text-sm font-medium">🎉 Challenge Complete!</p>
                    <p class="text-white/40 text-xs mt-1">Time: ${ttg}s</p>
                </div>
            `;
            
            // Update progress
            await updateUserProgress(labId, true, ttg);
            
            // Update K. inquiry
            const kMsg = document.getElementById('k-message');
            const inquiry = document.getElementById('k-inquiry');
            kMsg.textContent = 'Excellent. You understand lexical scope. Ready for the next challenge?';
            inquiry.style.opacity = '1';
        } else {
            kStatus.classList.remove('bg-emerald-500', 'k-thinking');
            kStatus.classList.add('bg-amber-500');
            
            // Trigger K. with Socratic question
            const kMsg = document.getElementById('k-message');
            const inquiry = document.getElementById('k-inquiry');
            kMsg.textContent = `${result.passedCount}/${result.totalCount} tests pass. Where might the issue be?`;
            inquiry.style.opacity = '1';
        }
        
    } catch (error) {
        resultsContainer.innerHTML = `<p class="text-red-400 text-xs">Error: ${error.message}</p>`;
    } finally {
        runBtn.textContent = 'Run Tests ▶';
        runBtn.disabled = false;
        setTimeout(() => kStatus.classList.remove('k-thinking'), 500);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cleanup on navigation
window.addEventListener('beforeunload', () => {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    if (ttgInterval) clearInterval(ttgInterval);
});