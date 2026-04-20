// api/groq/coach.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { code, context, error, labId } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Rate limiting (simple per-IP)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // In production, use Upstash Redis for proper rate limiting
    
    const systemPrompt = `You are K., an elite software architect coaching a developer through the KoDo platform.
Current lab context: ${labId || 'General programming'}
You NEVER provide the complete solution. You ask Socratic questions that guide the developer to discover the answer themselves.
Your tone is precise, slightly demanding, and assumes competence.`;

    const userPrompt = `
Code:
\`\`\`
${code}
\`\`\`
${error ? `Error: ${error}` : 'The tests are failing.'}

What is the ONE critical question I should ask myself right now?
`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-70b-8192',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 150
            })
        });
        
        const data = await response.json();
        
        res.status(200).json({ 
            content: data.choices[0].message.content 
        });
    } catch (error) {
        console.error('Groq API error:', error);
        res.status(500).json({ 
            content: 'K. is thinking deeply. Ask again in a moment.' 
        });
    }
}