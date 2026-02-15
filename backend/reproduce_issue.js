const { validateSubmission } = require('./utils/solutionRunner');

async function testReverseString() {
    const question = {
        functionName: "reverseStr"
    };

    // Mimic the "Reverse String" question from Seeder
    // in: "\"abc\"", out: "cba"
    const testCase = {
        input: "\"abc\"",
        output: "cba"
    };

    const code = `
class Solution:
    def reverseStr(self, s: str) -> str:
        return s[::-1]
`;

    console.log("Testing Python Reverse String s[::-1]...");
    try {
        const result = await validateSubmission({
            language: 'python',
            code: code,
            question: question,
            testCase: testCase
        });

        console.log("Result:", result);
        if (result.success) {
            console.log("PASS");
        } else {
            console.log("FAIL");
            console.log("Expected:", testCase.output);
            console.log("Actual:", result.actual);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

testReverseString();
