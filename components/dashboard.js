export function renderDashboard(user, profile) {
    const islands = [
        { id: 'js-basics', name: 'JavaScript Basics', unlocked: true, completed: false, position: { x: 20, y: 30 } },
        { id: 'js-functions', name: 'Functions', unlocked: false, completed: false, position: { x: 50, y: 60 } },
        // ... more islands
    ];
    
    return `
        <div class="h-full overflow-auto p-4 safe-top">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h1 class="text-2xl font-bold">👋 Hi, ${user.displayName?.split(' ')[0] || 'Coder'}!</h1>
                    <p class="text-white/50 text-sm">Forge Stones: ${profile?.stones || 0} 💎</p>
                </div>
                <button id="signout-btn" class="text-white/40">🚪</button>
            </div>
            
            <!-- Island Map -->
            <div class="relative min-h-[500px] bg-gradient-to-b from-blue-900/20 to-purple-900/20 rounded-3xl p-4 border border-white/10">
                ${islands.map(island => `
                    <div class="absolute transform -translate-x-1/2 -translate-y-1/2" 
                         style="left: ${island.position.x}%; top: ${island.position.y}%;">
                        <div data-island="${island.id}" 
                             class="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all
                                    ${island.unlocked ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-white/5 border border-white/20 opacity-50'}
                                    ${island.completed ? 'ring-4 ring-yellow-400/50' : ''}">
                            <span class="text-2xl">${island.completed ? '✅' : '🏝️'}</span>
                        </div>
                        <p class="text-center text-xs mt-1 text-white/60">${island.name}</p>
                    </div>
                `).join('')}
                
                <!-- Path lines (SVG) would go here -->
            </div>
            
            <!-- Streak & Stats -->
            <div class="mt-6 glass-panel p-4 rounded-2xl flex justify-around">
                <div class="text-center">
                    <span class="text-2xl">🔥</span>
                    <p class="text-sm font-bold">${profile?.streak || 0}</p>
                    <p class="text-xs text-white/40">Day Streak</p>
                </div>
                <div class="text-center">
                    <span class="text-2xl">🏆</span>
                    <p class="text-sm font-bold">${profile?.totalCompletions || 0}</p>
                    <p class="text-xs text-white/40">Challenges</p>
                </div>
            </div>
        </div>
    `;
}