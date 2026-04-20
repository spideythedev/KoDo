// curriculum.js
export const curriculum = {
    'js-lexical': {
        title: 'JavaScript Lexical Scope & Closure',
        language: 'javascript',
        difficulty: 'intermediate',
        estimatedTime: 15,
        objectives: [
            'Understand lexical scoping rules',
            'Create functions that maintain private state',
            'Recognize closure in practical applications'
        ],
        theory: {
            sections: [
                {
                    title: 'What is Lexical Scope?',
                    content: 'In JavaScript, scope is determined by **where functions are declared**, not where they are called. This is called **lexical scoping**. The word "lexical" refers to the fact that scoping is determined by the physical placement of functions and blocks in the source code.',
                    codeExample: `let x = 10;
function outer() {
    let y = 20;
    function inner() {
        console.log(x, y); // Can access both!
    }
    return inner;
}`
                },
                {
                    title: 'Closure in Action',
                    content: 'A **closure** is created when a function retains access to its lexical scope even when executed outside that scope. This is JavaScript\'s mechanism for **data privacy** and **state encapsulation**.',
                    codeExample: `function createCounter() {
    let count = 0;  // Private variable
    return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count
    };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
// count is NOT accessible directly`
                }
            ]
        },
        challenge: {
            description: 'Implement a `createCounter` function that maintains private state through closure.',
            requirements: [
                'Return an object with `increment()`, `decrement()`, and `getValue()` methods',
                'The internal count should start at 0',
                'The count variable must NOT be accessible from outside',
                'Bonus: Add a `reset()` method'
            ],
            starterCode: `// Lexical Scope Challenge
function createCounter() {
    // Your code here
    
}

// Test your implementation
const counter = createCounter();
console.log(counter.increment()); // Expected: 1
console.log(counter.increment()); // Expected: 2
console.log(counter.decrement()); // Expected: 1
console.log(counter.getValue());  // Expected: 1`,
            hints: [
                'Remember: variables declared inside a function are local to that function',
                'Return an object where each method closes over the count variable',
                'The count variable should be declared with `let` inside createCounter'
            ]
        },
        testCases: [
            {
                description: 'Initial value is 0',
                test: `const c = createCounter(); return c.getValue() === 0;`
            },
            {
                description: 'Increment works',
                test: `const c = createCounter(); c.increment(); return c.getValue() === 1;`
            },
            {
                description: 'Multiple increments work',
                test: `const c = createCounter(); c.increment(); c.increment(); return c.getValue() === 2;`
            },
            {
                description: 'Decrement works',
                test: `const c = createCounter(); c.increment(); c.increment(); c.decrement(); return c.getValue() === 1;`
            },
            {
                description: 'Count is private',
                test: `const c = createCounter(); return typeof c.count === 'undefined';`
            }
        ]
    },
    
    'discord-bot-core': {
        title: 'Discord.js Gateway Intents',
        language: 'javascript',
        difficulty: 'advanced',
        estimatedTime: 30,
        objectives: [
            'Understand Discord Gateway Intents',
            'Configure proper intents for message reading',
            'Create a basic ping-pong bot'
        ],
        theory: {
            sections: [
                {
                    title: 'Gateway Intents Explained',
                    content: 'Discord.js v14+ requires **explicit intents** to receive certain events. This is a security and performance feature. Without proper intents, your bot won\'t receive message content.',
                    codeExample: `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent  // Critical!
    ]
});`
                }
            ]
        },
        challenge: {
            description: 'Create a Discord bot that responds to "!ping" with "Pong!"',
            requirements: [
                'Use proper Gateway Intent configuration',
                'Listen for messageCreate event',
                'Check if message content is "!ping"',
                'Reply with "Pong!"',
                'Ignore bot messages to prevent loops'
            ],
            starterCode: `const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // Add missing intent here
    ]
});

client.on('ready', () => {
    console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('messageCreate', async (message) => {
    // Your code here
    // Remember: check if author is bot first!
});

client.login('YOUR_TOKEN_HERE');`,
            hints: [
                'You need GatewayIntentBits.MessageContent to read message text',
                'Check message.author.bot before processing',
                'Use message.content === "!ping" for exact match'
            ]
        },
        testCases: [
            {
                description: 'MessageContent intent is present',
                test: `return code.includes('MessageContent');`
            },
            {
                description: 'Bot check exists',
                test: `return code.includes('message.author.bot') || code.includes('author.bot');`
            },
            {
                description: 'Ping detection exists',
                test: `return code.includes('!ping');`
            },
            {
                description: 'Reply sends Pong',
                test: `return code.includes('Pong!') || code.includes('"Pong!"');`
            }
        ]
    }
};

export function getLab(id) {
    return curriculum[id] || null;
}

export function getAllLabs() {
    return Object.keys(curriculum).map(id => ({
        id,
        ...curriculum[id]
    }));
}