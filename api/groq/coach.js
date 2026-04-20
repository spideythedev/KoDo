// api/groq/coach.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { code, context, error } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    // Socratic System Prompt (Arceus-tier restriction)
    const systemPrompt = `
You are K., an elite software architect coaching a senior engineer.
You NEVER provide the corrected code. You NEVER write code snippets in your answers.
You ONLY ask probing, Socratic questions that expose logical flaws or edge cases.
Your tone is terse, precise, and assumes the user is highly competent but temporarily blind to a specific detail.
Context: The user is writing ${context} code.
    `;

    const userPrompt = `
Code:
\`\`\`
${code}
\`\`\`
${error ? `Error observed: ${error}` : ''}
What is the one critical question I should ask myself about this implementation?
    `;

    try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                temperature: 0.2,
                max_tokens: 150
            })
        });
        
        const data = await groqRes.json();
        res.status(200).json({ content: data.choices[0].message.content });
    } catch (e) {
        res.status(500).json({ content: "K. is thinking... (Service disruption)" });
    }
}