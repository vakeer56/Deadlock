const { validateSubmission } = require('./utils/solutionRunner');
const mongoose = require('mongoose');

const test = async () => {
    // Mock question: Vowel Check
    const question = {
        functionName: "isVowel",
        parameters: { python: "c", cpp: "char c", java: "char c" },
        testCases: [
            { input: "'a'", output: "true", isHidden: false }
        ]
    };

    const code = `
class Solution:
    def isVowel(self, c):
        return c in 'aeiou'
    `;

    try {
        console.log("Testing Python submission for Vowel Check (single quote char)...");
        const result = await validateSubmission({
            language: 'python',
            code: code,
            question: question,
            testCase: question.testCases[0]
        });

        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
};

test();
