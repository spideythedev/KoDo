// components/dashboard.js
import { getAllLabs } from '../curriculum.js';

export function renderDashboard(user, profile) {
    const kLevel = profile?.kLevel || 'JUNIOR';
    const purityScore = profile?.purityScore || 100;
    const labs = profile?.labs || {};
    const totalCompletions = profile?.totalCompletions || 0;
    
    const allLabs = getAllLabs();
    
    return `
        <div class="h-full flex flex-col p-8">
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

            <div class="flex-1 py-12 overflow-y-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-xs font-bold uppercase tracking-[.25em] text-white/30">Active Forges</h2>
                    <span class="text-[10px] text-white/20">${totalCompletions}/${allLabs.length} Completed</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${generateLabCards(allLabs, labs)}
                </div>
            </div>
            
            <footer class="pt-8 border-t border-subtle flex justify-between items-center">
                <div class="text-[10px] text-white/20">
                    K. Level: ${kLevel} • ${getNextLevelMessage(kLevel, totalCompletions)}
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

function generateLabCards(allLabs, userLabs) {
    return allLabs.map(lab => {
        const progress = userLabs[lab.id] || { status: 'locked', bestTTG: null };
        const isLocked = progress.status === 'locked';
        const isCompleted = progress.status === 'completed';
        const bestTTG = progress.bestTTG || lab.estimatedTime;
        
        return `
            <div data-lab-id="${lab.id}" 
                 class="glass-panel p-6 rounded-lg ${isLocked ? 'opacity-40 pointer-events-none' : 'cursor-pointer group hover:border-white/20'} transition-all duration-300">
                <div class="flex justify-between items-start mb-8">
                    <div class="flex gap-2">
                        <span data-lang="${lab.language}" class="text-[10px] font-mono px-2 py-1 rounded-full bg-white/5 text-white/40">${lab.language.toUpperCase()}</span>
                        ${isCompleted ? '<span class="text-[10px] text-emerald-400/60 px-2 py-1">✓</span>' : ''}
                    </div>
                    <span class="text-white/20 group-hover:text-white/50 transition-colors">→</span>
                </div>
                <h3 class="text-xl font-medium tracking-tight mb-2">${lab.title}</h3>
                <p class="text-xs text-white/30 uppercase tracking-wider">
                    ${lab.difficulty} • Best TTG: ${bestTTG}m
                </p>
                ${progress.attempts ? `<p class="text-[10px] text-white/20 mt-2">${progress.attempts} attempt${progress.attempts > 1 ? 's' : ''}</p>` : ''}
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

function getNextLevelMessage(currentLevel, completions) {
    const thresholds = { 'JUNIOR': 1, 'SENIOR': 3, 'ARCHITECT': Infinity };
    const next = { 'JUNIOR': 'SENIOR', 'SENIOR': 'ARCHITECT', 'ARCHITECT': 'MAX' };
    const needed = thresholds[currentLevel] - completions;
    if (needed <= 0) return `${next[currentLevel]} Unlocked!`;
    return `${needed} to ${next[currentLevel]}`;
}