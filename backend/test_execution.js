const { validateSubmission } = require('./utils/solutionRunner');

const TEST_SCENARIOS = [
    {
        name: "Single Int (Easy)",
        question: {
            functionName: "isEven",
            parameters: { python: "n", cpp: "int n", java: "int n" },
        },
        cases: [
            { language: "python", code: "class Solution:\n    def isEven(self, n: int) -> bool:\n        return n % 2 == 0", testCase: { input: "10", output: "true" } },
            { language: "js", code: "class Solution {\n    isEven(n) {\n        return n % 2 === 0;\n    }\n}", testCase: { input: "10", output: "true" } }
        ]
    },
    {
        name: "String Input (Easy)",
        question: {
            functionName: "isPalin",
            parameters: { python: "s", cpp: "string s", java: "String s" },
        },
        cases: [
            { language: "python", code: "class Solution:\n    def isPalin(self, s: str) -> bool:\n        return s == s[::-1]", testCase: { input: "\"racecar\"", output: "true" } },
            { language: "js", code: "class Solution {\n    isPalin(s) {\n        return s === s.split('').reverse().join('');\n    }\n}", testCase: { input: "\"racecar\"", output: "true" } }
        ]
    },
    {
        name: "Multi-parameter (Medium/Hard)",
        question: {
            functionName: "hammingDistance",
            parameters: { python: "x, y", cpp: "int x, int y", java: "int x, int y" },
        },
        cases: [
            { language: "python", code: "class Solution:\n    def hammingDistance(self, x: int, y: int) -> int:\n        return bin(x ^ y).count('1')", testCase: { input: "1|4", output: "2" } },
            { language: "js", code: "class Solution {\n    hammingDistance(x, y) {\n        return (x ^ y).toString(2).split('0').join('').length;\n    }\n}", testCase: { input: "1|4", output: "2" } }
        ]
    },
    {
        name: "Array Input (Medium)",
        question: {
            functionName: "sumArray",
            parameters: { python: "nums", cpp: "vector<int>& nums", java: "int[] nums" },
        },
        cases: [
            { language: "python", code: "class Solution:\n    def sumArray(self, nums: list) -> int:\n        return sum(nums)", testCase: { input: "[1,2,3]", output: "6" } },
            { language: "js", code: "class Solution {\n    sumArray(nums) {\n        return nums.reduce((a, b) => a + b, 0);\n    }\n}", testCase: { input: "[1,2,3]", output: "6" } }
        ]
    }
];

async function runDiagnostics() {
    console.log("=== Deadlock Solution Runner Diagnostics ===");
    let passCount = 0;
    let failCount = 0;

    for (const scenario of TEST_SCENARIOS) {
        console.log(`\nScenario: ${scenario.name}`);
        for (const test of scenario.cases) {
            console.log(`  Testing ${test.language}...`);
            try {
                const result = await validateSubmission({
                    language: test.language,
                    code: test.code,
                    question: scenario.question,
                    testCase: test.testCase
                });

                if (result.success) {
                    console.log(`    ✅ PASS: ${test.testCase.input} -> ${test.testCase.output}`);
                    passCount++;
                } else {
                    console.log(`    ❌ FAIL [${result.verdict}]: ${test.testCase.input}`);
                    if (result.error) console.log(`       Error: ${result.error}`);
                    if (result.actual) console.log(`       Actual: ${result.actual}, Expected: ${test.testCase.output}`);
                    failCount++;
                }
            } catch (err) {
                console.log(`    💥 CRASH: ${err.message}`);
                failCount++;
            }
        }
    }

    console.log(`\n=== Summary: ${passCount} Passed, ${failCount} Failed ===`);
    process.exit(failCount > 0 ? 1 : 0);
}

runDiagnostics();
