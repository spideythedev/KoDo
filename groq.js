// groq.js
export class GroqCoach {
    constructor(context = 'javascript') {
        this.context = context;
    }

    async inquire(codeSnippet, errorMessage = null) {
        const response = await fetch('/api/groq/coach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: codeSnippet,
                context: this.context,
                error: errorMessage,
                mode: 'socratic' // Enforces question-only responses
            })
        });
        
        const data = await response.json();
        return data.content;
    }
}