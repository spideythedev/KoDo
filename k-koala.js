export function showKMessage(text, emotion = 'happy') {
    const bubble = document.getElementById('k-bubble');
    const mascot = document.getElementById('k-mascot');
    bubble.textContent = text;
    bubble.style.opacity = '1';
    
    const emojis = { happy: '😊', thinking: '🤔', celebrate: '🎉', sad: '😢' };
    mascot.innerHTML = `<span class="text-3xl">🐨${emojis[emotion] || ''}</span>`;
    
    if (emotion === 'celebrate') {
        mascot.classList.add('k-bounce');
        setTimeout(() => mascot.classList.remove('k-bounce'), 1000);
    }
    
    setTimeout(() => bubble.style.opacity = '0', 4000);
}