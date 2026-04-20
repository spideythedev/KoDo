// components/workspace.js
export function renderWorkspace(lab) {
    const labName = lab?.name || 'Untitled Laboratory';
    const labId = lab?.id || 'unknown';
    const language = mapLanguageToMonaco(lab?.language || 'JS');
    
    return `
        <div class="h-screen w-screen flex flex-col bg-black overflow-hidden">
            <!-- Header Bar (48px) -->
            <header class="h-12 border-b border-subtle flex items-center justify-between px-4 flex-shrink-0">
                <div class="flex items-center gap-4">
                    <button id="back-to-dash" class="text-white/40 hover:text-white/80 transition-colors text-sm">
                        ← Dashboard
                    </button>
                    <div class="w-px h-4 bg-white/10"></div>
                    <span class="text-sm font-medium text-white/80">${labName}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/40">${lab?.language || 'JS'}</span>
                </div>
                
                <!-- Center: Compute Gauge -->
                <div class="flex items-center gap-3">
                    <span class="text-[10px] text-white/30 uppercase tracking-wider">Compute</span>
                    <div class="w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <div id="compute-gauge" class="h-full bg-emerald-500/60 transition-all duration-1000" style="width: 100%"></div>
                    </div>
                </div>
                
                <!-- Right: K. Status & Actions -->
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span id="k-status" class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        <span class="text-xs text-white/40 font-mono">K.</span>
                    </div>
                    <button id="run-code" class="glass-panel px-4 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors">
                        Execute ▶
                    </button>
                </div>
            </header>
            
            <!-- Main Workspace (Three Panels) -->
            <div class="flex-1 flex overflow-hidden">
                
                <!-- Panel 1: Theory / Instructions (30%) -->
                <div id="theory-panel" class="w-[30%] border-r border-subtle flex flex-col bg-[#080808]">
                    <div class="p-4 border-b border-subtle">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white/30">Briefing</h3>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6">
                        <div class="prose prose-invert prose-sm max-w-none">
                            <div id="theory-content" class="space-y-4 text-white/70 text-sm leading-relaxed">
                                ${getTheoryContent(labId)}
                            </div>
                        </div>
                    </div>
                    <div class="p-4 border-t border-subtle">
                        <button id="acknowledge-intent" class="w-full glass-panel py-2 text-xs font-medium text-white/50 hover:text-white/80 transition-colors">
                            Acknowledge Intent
                        </button>
                    </div>
                </div>
                
                <!-- Panel 2: Monaco Editor (45%) -->
                <div id="editor-panel" class="w-[45%] flex flex-col bg-[#0A0A0A]">
                    <div class="px-4 py-2 border-b border-subtle flex justify-between items-center">
                        <span class="text-[10px] text-white/30 uppercase tracking-wider font-mono">
                            ${labId}.${getFileExtension(lab?.language)}
                        </span>
                        <span id="editor-status" class="text-[10px] text-white/20">● Unsaved</span>
                    </div>
                    <div id="monaco-container" class="flex-1 w-full"></div>
                </div>
                
                <!-- Panel 3: Execution Canvas / Sidecar (25%) -->
                <div id="sidecar-panel" class="w-[25%] border-l border-subtle flex flex-col bg-black">
                    <div class="p-4 border-b border-subtle">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-white/30">Execution Canvas</h3>
                    </div>
                    <div id="canvas-container" class="flex-1 relative overflow-hidden">
                        <!-- Empty State: Grid Pattern -->
                        <div id="canvas-empty-state" class="absolute inset-0 flex items-center justify-center opacity-20">
                            <svg width="100%" height="100%">
                                <defs>
                                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)"/>
                            </svg>
                        </div>
                        
                        <!-- Visual Debug Output Area -->
                        <div id="visual-debug" class="absolute inset-0 p-4 overflow-auto">
                            <div id="execution-output" class="font-mono text-xs space-y-2"></div>
                        </div>
                        
                        <!-- K. Inquiry Panel -->
                        <div id="k-inquiry" class="absolute bottom-0 left-0 right-0 glass-panel m-4 p-4 rounded-lg opacity-0 transition-opacity duration-300">
                            <div class="flex gap-3">
                                <span class="text-emerald-400 text-xs font-mono">K.</span>
                                <p id="k-message" class="text-xs text-white/70 flex-1"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer Status Bar (24px) -->
            <footer class="h-6 border-t border-subtle flex items-center px-4 text-[10px] text-white/20 flex-shrink-0">
                <span id="cursor-position">Ln 1, Col 1</span>
                <span class="mx-2">•</span>
                <span>${language}</span>
                <span class="mx-2">•</span>
                <span id="memory-usage">KoDo Runtime v1.0</span>
            </footer>
        </div>
    `;
}

function mapLanguageToMonaco(lang) {
    const map = {
        'JS': 'javascript',
        'JavaScript': 'javascript',
        'Node': 'javascript',
        'Python': 'python',
        'C++': 'cpp',
        'Java': 'java'
    };
    return map[lang] || 'javascript';
}

function getFileExtension(lang) {
    const map = {
        'JS': 'js',
        'JavaScript': 'js',
        'Node': 'js',
        'Python': 'py',
        'C++': 'cpp',
        'Java': 'java'
    };
    return map[lang] || 'js';
}

function getTheoryContent(labId) {
    const theories = {
        'js-lexical': `
            <h4 class="text-white font-medium mb-3">Lexical Scope & Closure</h4>
            <p>In JavaScript, scope is determined by <strong>where functions are declared</strong>, not where they are called.</p>
            <div class="glass-panel p-3 my-4">
                <code class="text-emerald-400 text-xs">const outer = () => {<br>  let count = 0;<br>  return () => ++count;<br>}</code>
            </div>
            <p class="mt-4">Your task: Implement a <code>createCounter</code> function that maintains private state through closure.</p>
        `,
        'discord-bot-core': `
            <h4 class="text-white font-medium mb-3">Gateway Intents</h4>
            <p>Discord.js v14+ requires explicit intents for privileged events.</p>
            <div class="glass-panel p-3 my-4">
                <code class="text-emerald-400 text-xs">GatewayIntentBits.MessageContent</code>
            </div>
            <p class="mt-4">Implement a bot that responds to "!ping" with "Pong!" using proper intents.</p>
        `,
        'python-async': `
            <h4 class="text-white font-medium mb-3">Event Loop Mechanics</h4>
            <p>Asyncio uses cooperative multitasking. Tasks yield control at <code>await</code> points.</p>
            <p class="mt-4">Create a coroutine that fetches three URLs concurrently using <code>asyncio.gather</code>.</p>
        `,
        'cpp-pointers': `
            <h4 class="text-white font-medium mb-3">Memory Layout & Pointers</h4>
            <p>Understanding stack vs heap allocation is critical for performance.</p>
            <p class="mt-4">Implement a custom <code>Vector</code> class with dynamic memory management.</p>
        `
    };
    return theories[labId] || '<p>Loading laboratory briefing...</p>';
}

// --- Workspace Initialization (Called from app.js) ---
export function initializeWorkspace(lab) {
    const language = mapLanguageToMonaco(lab?.language || 'JS');
    
    // Get Monaco instance from global
    const editor = window.kodoMonacoInstance;
    if (!editor) return;
    
    // Set default code template
    const defaultCode = getDefaultCode(lab?.id, lab?.language);
    editor.setValue(defaultCode);
    
    // Setup event listeners
    setupWorkspaceListeners(editor, lab);
    
    // Start compute gauge decay
    startComputeGauge();
    
    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
        document.getElementById('cursor-position').textContent = 
            `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });
    
    // Mark as saved on change (for visual feedback)
    editor.onDidChangeModelContent(() => {
        const status = document.getElementById('editor-status');
        if (status) {
            status.textContent = '● Modified';
            status.classList.add('text-amber-400');
            status.classList.remove('text-white/20');
        }
    });
}

function setupWorkspaceListeners(editor, lab) {
    // Back to dashboard
    document.getElementById('back-to-dash')?.addEventListener('click', () => {
        window.AppState.route = 'dashboard';
    });
    
    // Acknowledge intent button
    document.getElementById('acknowledge-intent')?.addEventListener('click', (e) => {
        const btn = e.target;
        btn.textContent = '✓ Acknowledged';
        btn.classList.add('text-emerald-400');
        setTimeout(() => {
            btn.textContent = 'Acknowledge Intent';
            btn.classList.remove('text-emerald-400');
        }, 2000);
    });
    
    // Run code button
    document.getElementById('run-code')?.addEventListener('click', async () => {
        const code = editor.getValue();
        await executeCode(code, lab);
    });
    
    // Keyboard shortcut: Cmd/Ctrl + Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, async () => {
        const code = editor.getValue();
        await executeCode(code, lab);
    });
}

async function executeCode(code, lab) {
    const outputEl = document.getElementById('execution-output');
    const kMessageEl = document.getElementById('k-message');
    const inquiryPanel = document.getElementById('k-inquiry');
    const kStatus = document.getElementById('k-status');
    
    // Clear previous output
    outputEl.innerHTML = '';
    
    // Show loading state
    kStatus.classList.remove('bg-emerald-500');
    kStatus.classList.add('bg-amber-500', 'animate-pulse');
    
    try {
        // Capture console.log
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
            logs.push(args.join(' '));
            originalLog.apply(console, args);
        };
        
        // Execute based on language
        let result;
        if (lab?.language === 'JS' || lab?.language === 'JavaScript') {
            result = await executeJavaScript(code);
        } else if (lab?.language === 'Python') {
            result = await executePython(code);
        } else {
            result = { output: '[KoDo] Language runtime not yet available', error: null };
        }
        
        // Restore console.log
        console.log = originalLog;
        
        // Display output
        if (logs.length > 0) {
            outputEl.innerHTML = logs.map(log => 
                `<div class="text-emerald-400/80">→ ${escapeHtml(log)}</div>`
            ).join('');
        }
        
        if (result?.output) {
            outputEl.innerHTML += `<div class="text-white/60">${escapeHtml(result.output)}</div>`;
        }
        
        // If error, trigger K. inquiry
        if (result?.error) {
            outputEl.innerHTML += `<div class="text-red-400/80 mt-2">⚠ ${escapeHtml(result.error)}</div>`;
            
            // Call Groq API for Socratic question
            const { GroqCoach } = await import('../groq.js');
            const coach = new GroqCoach(lab?.language || 'javascript');
            const question = await coach.inquire(code, result.error);
            
            kMessageEl.textContent = question;
            inquiryPanel.style.opacity = '1';
            
            // Visual feedback: error vignette
            document.getElementById('editor-panel')?.classList.add('error-vignette');
            setTimeout(() => {
                document.getElementById('editor-panel')?.classList.remove('error-vignette');
            }, 500);
        } else {
            // Success state
            kStatus.classList.remove('bg-amber-500', 'animate-pulse');
            kStatus.classList.add('bg-emerald-500');
            
            // Hide inquiry panel
            inquiryPanel.style.opacity = '0';
            
            // Flash line numbers green (save indicator)
            document.getElementById('editor-status').textContent = '✓ Executed';
            setTimeout(() => {
                document.getElementById('editor-status').textContent = '● Modified';
            }, 1000);
        }
        
    } catch (error) {
        outputEl.innerHTML = `<div class="text-red-400">Runtime Error: ${escapeHtml(error.message)}</div>`;
    } finally {
        kStatus.classList.remove('animate-pulse');
    }
}

function executeJavaScript(code) {
    return new Promise((resolve) => {
        const worker = new Worker(
            URL.createObjectURL(
                new Blob([`
                    self.onmessage = function(e) {
                        try {
                            const logs = [];
                            const originalLog = console.log;
                            console.log = (...args) => {
                                logs.push(args.join(' '));
                            };
                            
                            const result = eval(e.data);
                            console.log = originalLog;
                            
                            self.postMessage({ 
                                output: logs.join('\\n'), 
                                result: result,
                                error: null 
                            });
                        } catch (err) {
                            self.postMessage({ 
                                output: '', 
                                error: err.message 
                            });
                        }
                    };
                `], { type: 'application/javascript' })
            )
        );
        
        worker.onmessage = (e) => {
            resolve(e.data);
            worker.terminate();
        };
        
        // Timeout after 3 seconds
        setTimeout(() => {
            worker.terminate();
            resolve({ error: 'Execution timeout (3s limit)' });
        }, 3000);
        
        worker.postMessage(code);
    });
}

async function executePython(code) {
    // Placeholder for Pyodide integration
    return {
        output: '',
        error: 'Python runtime loading... (Pyodide WebAssembly)'
    };
}

function startComputeGauge() {
    const gauge = document.getElementById('compute-gauge');
    if (!gauge) return;
    
    let width = 100;
    const interval = setInterval(() => {
        width -= 0.1;
        if (width <= 0) {
            clearInterval(interval);
            width = 0;
        }
        gauge.style.width = `${width}%`;
        
        if (width < 20) {
            gauge.classList.remove('bg-emerald-500/60');
            gauge.classList.add('bg-amber-500/60');
        }
    }, 1000);
}

function getDefaultCode(labId, language) {
    const templates = {
        'js-lexical': `// Lexical Scope Challenge
function createCounter() {
    // Implement counter with private state
    // Return an object with increment() and getValue()
    
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getValue());  // 2`,
        
        'discord-bot-core': `// Discord.js Gateway Intent Challenge
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // Add required intent here
    ]
});

client.on('messageCreate', async (message) => {
    // Implement !ping command
});

client.login('YOUR_TOKEN');`,
        
        'python-async': `# Asyncio Challenge
import asyncio

async def fetch_url(url):
    # Simulate network request
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    urls = ['api.github.com', 'api.vercel.com', 'api.openai.com']
    # Fetch all URLs concurrently
    
asyncio.run(main())`,
        
        'cpp-pointers': `// C++ Memory Challenge
#include <iostream>

template<typename T>
class Vector {
private:
    T* data;
    size_t capacity;
    size_t size;
    
public:
    Vector() : data(nullptr), capacity(0), size(0) {}
    
    void push_back(const T& value) {
        // Implement dynamic resizing
    }
    
    ~Vector() {
        // Clean up memory
    }
};`
    };
    
    return templates[labId] || '// KoDo Laboratory\n// Write your solution here';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add error vignette style
const style = document.createElement('style');
style.textContent = `
    .error-vignette {
        position: relative;
    }
    .error-vignette::after {
        content: '';
        position: absolute;
        inset: 0;
        box-shadow: inset 0 0 50px rgba(239, 68, 68, 0.15);
        pointer-events: none;
        animation: vignette-pulse 0.5s ease-out;
    }
    @keyframes vignette-pulse {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);