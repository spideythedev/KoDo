export function renderWorkspace(lab) {
    const isMobile = window.innerWidth < 1024;
    const labData = getLab(lab.id);
    
    if (isMobile) {
        return `
            <div class="flex flex-col h-full safe-top">
                <header class="flex items-center justify-between px-4 py-3 border-b border-subtle">
                    <button id="back-btn" class="text-white/60">←</button>
                    <span class="font-medium">${labData.title}</span>
                    <div class="w-6"></div>
                </header>
                
                <!-- Tab Switcher -->
                <div class="flex border-b border-subtle">
                    <button class="tab-btn active flex-1 py-2 text-sm" data-tab="theory">📖 Learn</button>
                    <button class="tab-btn flex-1 py-2 text-sm" data-tab="code">💻 Code</button>
                    <button class="tab-btn flex-1 py-2 text-sm" data-tab="output">✅ Test</button>
                </div>
                
                <!-- Tab Content -->
                <div id="tab-content" class="flex-1 overflow-auto">
                    <!-- Theory Tab -->
                    <div id="theory-tab" class="p-4">${renderTheorySteps(labData)}</div>
                    <!-- Code Tab (hidden initially) -->
                    <div id="code-tab" class="h-full hidden">
                        <div id="monaco-container-mobile" class="h-full"></div>
                    </div>
                    <!-- Output Tab (hidden) -->
                    <div id="output-tab" class="p-4 hidden">
                        <div id="test-results-mobile"></div>
                    </div>
                </div>
                
                <!-- Bottom Action Bar -->
                <div class="flex items-center justify-between p-4 border-t border-subtle safe-bottom">
                    <button id="hint-btn" class="glass-panel px-4 py-2 text-sm">💡 Hint</button>
                    <button id="run-btn" class="bg-blue-500/20 border border-blue-400 px-6 py-2 rounded-full text-sm font-medium">▶ Run</button>
                    <button id="next-step-btn" class="glass-panel px-4 py-2 text-sm">Next →</button>
                </div>
            </div>
        `;
    }
    // ... desktop layout
}