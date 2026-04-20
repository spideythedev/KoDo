// groq.js
export class GroqCoach {
    constructor(context = 'javascript', labId = null) {
        this.context = context;
        this.labId = labId;
    }

    async inquire(code, error = null) {
        try {
            const response = await fetch('/api/groq/coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    context: this.context,
                    error,
                    labId: this.labId
                })
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            return data.content;
        } catch (err) {
            console.error('[Groq] Error:', err);
            return 'K. is thinking. Try again in a moment.';
        }
    }
}