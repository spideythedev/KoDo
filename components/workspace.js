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
                        Run