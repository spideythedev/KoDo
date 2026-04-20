// components/dashboard.js
export function renderDashboard(user, profile) {
    const kLevel = profile?.kLevel || 'JUNIOR';
    const purityScore = profile?.purityScore || 100;
    const labs = profile?.labs || {};
    
    return `
        <div class="h-full flex flex-col p-8">
            <!-- Header -->
            <header class="flex justify-between items-center pb-12 border-b border-subtle">
                <div class="flex items-center gap-3">
                    <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span class="text-xs font-mono uppercase tracking-wider text-white/50">K. ${kLevel} MODE</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-white/40">${user.displayName || user.email}</span>
                    ${user.photoURL ? 
                        `<img src="${user.photoURL}" class="w-8 h-8 rounded-full border border-white/10" />` :
                        `<div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <span class="text-xs">${user.email?.charAt(0).toUpperCase()}</span>
                        </div>`
                    }
                    <button id="signout-btn" class="text-white/30 hover:text-white/60 transition-colors text-xs px-2">⟶</button>
                </div>
            </header>

            <!-- Labs Grid -->
            <div class="flex-1 py-12 overflow-y-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-xs font-bold uppercase tracking-[.25em] text-white/30">Active Forges</h2>
                    <span class="text-[10px] text-white/20">kodo-559e9</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${generateLabCards(labs)}
                </div>
            </div>
            
            <!-- Footer: Purity Score -->
            <footer class="pt-8 border-t border-subtle flex justify-between items-center">
                <div class="text-[10px] text-white/20">
                    K. Level: ${kLevel} • ${kLevel === 'JUNIOR' ? '10 inquiries to Senior' : 'Architect Mode Unlocked'}
                </div>
                <div class="flex items-center gap-2 text-white/20 text-xs">
                    <span>MAINTAINABILITY</span>
                    <span class="text-white/60 font-mono">${getPurityGrade(purityScore)}</span>
                    <div class="w-16 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-white/60" style="width: ${purityScore}%"></div>
                    </div>
                </div>
            </footer>
        </div>
    `;
}

function generateLabCards(labs) {
    const labDefinitions = [
        { id: 'js-lexical', name: 'JavaScript Lexical Scope', lang: 'JS', difficulty: 'Intermediate', baseTTG: 15 },
        { id: 'discord-bot-core', name: 'Discord.js Gateway Intent', lang: 'Node', difficulty: 'Advanced', baseTTG: 30 },
        { id: 'python-async', name: 'Python Asyncio Loop', lang: 'Python', difficulty: 'Expert', baseTTG: 25 },
        { id: 'cpp-pointers', name: 'C++ Memory Layout', lang: 'C++', difficulty: 'Expert', baseTTG: 40 }
    ];
    
    return labDefinitions.map(lab => {
        const userProgress = labs[lab.id];
        const isLocked = userProgress?.status === 'locked';
        const bestTTG = userProgress?.ttg || lab.baseTTG;
        
        return `
            <div data-lab-id="${lab.id}" class="glass-panel p-6 rounded-lg cursor-pointer group transition-all duration-300 hover:border-white/20 ${isLocked ? 'opacity-50' : ''}">
                <div class="flex justify-between items-start mb-8">
                    <span data-lang="${lab.lang}" class="text-[10px] font-mono px-2 py-1 rounded-full bg-white/5 text-white/40">${lab.lang}</span>
                    <span class="text-white/20 group-hover:text-white/50 transition-colors">→</span>
                </div>
                <h3 class="text-xl font-medium tracking-tight mb-2">${lab.name}</h3>
                <p class="text-xs text-white/30 uppercase tracking-wider">
                    ${lab.difficulty} • Best TTG: ${bestTTG}m
                    ${userProgress?.ttg ? '✓' : ''}
                </p>
            </div>
        `;
    }).join('');
}

function getPurityGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    return 'D';
}