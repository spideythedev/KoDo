// monaco.js
let editorInstance = null;

export async function initMonaco() {
    return new Promise((resolve) => {
        require.config({ 
            paths: { 
                vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs' 
            } 
        });
        
        require(['vs/editor/editor.main'], function() {
            // Register KoDo Dark Theme (Arceus-tier)
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
                    'editorCursor.foreground': '#00A3FF',
                    'editor.findMatchBackground': '#9E6A0340',
                    'editorBracketMatch.background': '#00A3FF20',
                    'editorBracketMatch.border': '#00A3FF80',
                    'editorGutter.background': '#0A0A0A',
                    'editorIndentGuide.background': '#FFFFFF08',
                    'editorIndentGuide.activeBackground': '#FFFFFF20'
                }
            });
            
            // Create editor instance
            const container = document.getElementById('monaco-container');
            if (!container) {
                console.warn('Monaco container not found');
                return;
            }
            
            editorInstance = monaco.editor.create(container, {
                value: '// KoDo Laboratory\n// Loading...',
                language: 'javascript',
                theme: 'kodo-dark',
                fontSize: 13,
                fontFamily: 'Geist Mono, Monaco, Consolas, monospace',
                fontLigatures: true,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: false },
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 8,
                lineNumbersMinChars: 4,
                renderWhitespace: 'selection',
                wordWrap: 'on'
            });
            
            // Expose to window for workspace access
            window.kodoMonacoInstance = editorInstance;
            
            // Add custom keybinding for save
            editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                const status = document.getElementById('editor-status');
                if (status) {
                    status.textContent = '✓ Saved';
                    status.classList.add('text-emerald-400');
                    status.classList.remove('text-amber-400');
                    
                    // Flash the gutter
                    const lineNumbers = document.querySelector('.margin-view-overlays');
                    if (lineNumbers) {
                        lineNumbers.style.transition = 'background 0.15s';
                        lineNumbers.style.background = 'rgba(0, 163, 255, 0.05)';
                        setTimeout(() => {
                            lineNumbers.style.background = 'transparent';
                        }, 150);
                    }
                    
                    setTimeout(() => {
                        status.textContent = '● Saved';
                        status.classList.remove('text-emerald-400');
                    }, 2000);
                }
            });
            
            // Initialize workspace if lab is active
            if (window.AppState?.currentLab) {
                const { initializeWorkspace } = await import('./components/workspace.js');
                initializeWorkspace(window.AppState.currentLab);
            }
            
            resolve(editorInstance);
        });
    });
}

export function getEditorInstance() {
    return editorInstance;
}

export function updateEditorLanguage(language) {
    if (!editorInstance) return;
    
    const model = editorInstance.getModel();
    if (model) {
        monaco.editor.setModelLanguage(model, language);
    }
}