const { validateSubmission } = require('./utils/solutionRunner');

const DIAGNOSTICS = [
    {
        name: "Integer Return",
        question: { functionName: "addOne" },
        cases: [
            { language: "cpp", code: `class Solution { public: int addOne(int n) { return n + 1; } };`, testCase: { input: "1", output: "2" } },
            { language: "java", code: `class Solution { public int addOne(int n) { return n + 1; } }`, testCase: { input: "1", output: "2" } }
        ]
    },
    {
        name: "String Return",
        question: { functionName: "echo" },
        cases: [
            { language: "cpp", code: `class Solution { public: string echo(string s) { return s; } };`, testCase: { input: "\"hello\"", output: "hello" } },
            { language: "java", code: `class Solution { public String echo(String s) { return s; } }`, testCase: { input: "\"hello\"", output: "hello" } }
        ]
    },
    {
        name: "Array Return (The Problem Area)",
        question: { functionName: "getArray" },
        cases: [
            // EXPECT FAILURE: C++ cout << vector is invalid
            { language: "cpp", code: `class Solution { public: vector<int> getArray(int n) { return {1, 2, 3}; } };`, testCase: { input: "0", output: "[1,2,3]" } },
            // EXPECT FAILURE: Java System.out.println(array) prints address
            { language: "java", code: `class Solution { public int[] getArray(int n) { return new int[]{1, 2, 3}; } }`, testCase: { input: "0", output: "[1,2,3]" } }
        ]
    }
];

async function run() {
    console.log("Starting Deep Diagnostics...");
    for (const suite of DIAGNOSTICS) {
        console.log(`\n--- ${suite.name} ---`);
        for (const test of suite.cases) {
            console.log(`Testing ${test.language}...`);
            try {
                const result = await validateSubmission({
                    language: test.language,
                    code: test.code,
                    question: suite.question,
                    testCase: test.testCase
                });

                if (result.success) {
                    console.log(`  ✅ PASS`);
                } else {
                    console.log(`  ❌ FAIL: ${result.verdict}`);
                    console.log(`     Actual: ${result.actual}`);
                    console.log(`     Error: ${result.error}`);
                }
            } catch (e) {
                console.log(`  💥 EXCEPTION: ${e.message}`);
            }
        }
    }
}

run();
