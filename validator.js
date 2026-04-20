// validator.js
import { curriculum } from './curriculum.js';

export class LabValidator {
    constructor(labId) {
        this.labId = labId;
        this.lab = curriculum[labId];
        this.results = [];
    }
    
    async validate(code) {
        if (!this.lab) {
            return { passed: false, error: 'Lab not found' };
        }
        
        this.results = [];
        
        for (const testCase of this.lab.testCases) {
            const result = await this.runTest(code, testCase);
            this.results.push(result);
        }
        
        const passedCount = this.results.filter(r => r.passed).length;
        const totalCount = this.results.length;
        const allPassed = passedCount === totalCount;
        
        return {
            passed: allPassed,
            passedCount,
            totalCount,
            results: this.results,
            score: Math.round((passedCount / totalCount) * 100)
        };
    }
    
    async runTest(code, testCase) {
        return new Promise((resolve) => {
            const worker = new Worker(
                URL.createObjectURL(
                    new Blob([`
                        self.onmessage = function(e) {
                            try {
                                const code = e.data.code;
                                const testCode = e.data.testCode;
                                
                                // Execute user code
                                eval(code);
                                
                                // Run test
                                const passed = eval(testCode);
                                
                                self.postMessage({ passed, error: null });
                            } catch (err) {
                                self.postMessage({ passed: false, error: err.message });
                            }
                        };
                    `], { type: 'application/javascript' })
                )
            );
            
            worker.onmessage = (e) => {
                resolve({
                    description: testCase.description,
                    passed: e.data.passed,
                    error: e.data.error
                });
                worker.terminate();
            };
            
            setTimeout(() => {
                worker.terminate();
                resolve({
                    description: testCase.description,
                    passed: false,
                    error: 'Test timeout (3s limit)'
                });
            }, 3000);
            
            worker.postMessage({ code, testCode: testCase.test });
        });
    }
    
    getHint(attemptNumber) {
        if (!this.lab) return null;
        
        const hints = this.lab.challenge.hints;
        if (attemptNumber <= hints.length) {
            return hints[attemptNumber - 1];
        }
        return hints[hints.length - 1];
    }
}