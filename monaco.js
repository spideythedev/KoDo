// monaco.js
let editorInstance = null;

export async function initMonaco() {
    return new Promise((resolve, reject) => {
        // Check if Monaco already loaded
        if (typeof monaco !== 'undefined' && editorInstance) {
            resolve(editorInstance);
            return;
        }
        
        // Set timeout for CDN failure
        const timeout = setTimeout(() => {
            reject(new Error('Monaco CDN timeout'));
            showFallbackEditor();
        }, 8000);
        
        require.config({ 
            paths: { 
                vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs' 
            } 
        });
        
        require(['vs/editor/editor.main'], function() {
            clearTimeout(timeout);
            
            // Register KoDo Dark Theme
            monaco.editor.defineTheme('kodo-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'FF7B72' },
                    { token: 'string', foreground: 'A5D6FF' },
                    { token: 'number', foreground: '79C0FF' },
                    { token: 'type', foreground: 'FFA657' },
                    { token: 'function', foreground: 'D2A8FF' },
                    { token: 'variable', foreground: 'E6EDF3' }
                ],
                colors: {
                    'editor.background': '#0A0A0A',
                    'editor.foreground': '#E6EDF3',
                    'editor.lineHighlightBackground': '#FFFFFF08',
                    'editorLineNumber.foreground': '#6A737D',
                    'editorLineNumber.activeForeground': '#E6EDF3',
                    'editor.selectionBackground': '#264F7840',
                    'editorCursor.foreground': '#00A3FF'
                }
            });
            
            const container = document.getElementById('monaco-container');
            if (!container) {
                reject(new Error('Monaco container not found'));
                return;
            }
            
            editorInstance = monaco.editor.create(container, {
                value: '// Loading...',
                language: 'javascript',
                theme: 'kodo-dark',
                fontSize: 13,
                fontFamily: 'Geist Mono, Monaco, Consolas, monospace',
                minimap: { enabled: false },
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                bracketPairColorization: { enabled: true }
            });
            
            // Enable TypeScript/JavaScript diagnostics
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false
            });
            
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                checkJs: true
            });
            
            window.kodoMonacoInstance = editorInstance;
            
            // Initialize workspace if lab is active
            if (window.AppState?.currentLab) {
                import('./components/workspace.js').then(ws => {
                    ws.initializeWorkspace(window.AppState.currentLab);
                });
            }
            
            resolve(editorInstance);
        });
    });
}

function showFallbackEditor() {
    const container = document.getElementById('monaco-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="h-full flex items-center justify-center p-8">
            <div class="glass-panel p-6 text-center">
                <p class="text-amber-400 mb-4">⚠ Editor failed to load</p>
                <textarea id="fallback-editor" class="w-full h-64 bg-black border border-subtle text-white font-mono text-sm p-4 rounded">// Fallback editor - save your work locally</textarea>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 text-sm text-white/60 hover:text-white">Retry</button>
            </div>
        </div>
    `;
}

export function getEditorInstance() {
    return editorInstance;
}