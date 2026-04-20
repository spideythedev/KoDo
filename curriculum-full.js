export const curriculum = {
    'js-basics': {
        title: 'JavaScript Basics',
        steps: [
            {
                title: 'What is a Variable?',
                content: 'A variable is like a **box** where you can store a value. You give it a name so you can use it later.',
                example: `let myName = "Alex";\nconsole.log(myName);`,
                challenge: 'Create a variable called `favoriteColor` and set it to your favorite color.',
                starterCode: '// Write your code here\n',
                test: `return typeof favoriteColor !== 'undefined' && favoriteColor.length > 0;`,
                hint: 'Use `let favoriteColor = "blue";`'
            },
            // ... more steps
        ]
    }
};