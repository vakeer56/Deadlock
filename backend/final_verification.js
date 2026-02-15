const { validateSubmission } = require('./utils/solutionRunner');

const SUITE = [
    {
        name: "Edge Case: Boolean Case Sensitivity",
        question: { functionName: "isTrue", parameters: { python: "n", cpp: "int n", java: "int n" } },
        cases: [
            // Python prints True, JS expects "true"
            {
                language: "python", code: `class Solution: 
    def isTrue(self, n): return True`, testCase: { input: "1", output: "true" }
            }
        ]
    },
    {
        name: "Edge Case: String Quote Normalization",
        question: { functionName: "echo", parameters: { python: "s", cpp: "string s", java: "String s" } },
        cases: [
            // Python json.dumps adds quotes, expected is raw
            {
                language: "python", code: `class Solution: 
    def echo(self, s): return s`, testCase: { input: "\"test\"", output: "test" }
            }
        ]
    },
    {
        name: "Edge Case: C++ Vector Formatting",
        question: { functionName: "getVec", parameters: { cpp: "int n" } },
        cases: [
            // Output must match JSON format exactly: [1,2]
            { language: "cpp", code: `class Solution { public: vector<int> getVec(int n) { return {1, 2}; } };`, testCase: { input: "0", output: "[1,2]" } },
            // Empty vector
            { language: "cpp", code: `class Solution { public: vector<int> getVec(int n) { return {}; } };`, testCase: { input: "0", output: "[]" } }
        ]
    },
    {
        name: "Edge Case: Java Array Formatting",
        question: { functionName: "getArr", parameters: { java: "int n" } },
        cases: [
            // Output must match JSON format exactly: [1,2] - Prevents [I@1234
            { language: "java", code: `class Solution { public int[] getArr(int n) { return new int[]{1, 2}; } }`, testCase: { input: "0", output: "[1,2]" } },
            // String Array
            { language: "java", code: `class Solution { public String[] getArr(int n) { return new String[]{"a", "b"}; } }`, testCase: { input: "0", output: "[\"a\",\"b\"]" } }
        ]
    }
];

async function verify() {
    console.log("🔒 Running Final System Verification Protocol...\n");
    let passed = 0;
    let failed = 0;

    for (const test of SUITE) {
        console.log(`TYPE: ${test.name}`);
        for (const c of test.cases) {
            process.stdout.write(`  [${c.language.toUpperCase()}] Testing... `);
            try {
                // Ensure legacy mock approach works with new runner requirements
                const res = await validateSubmission({
                    language: c.language,
                    code: c.code,
                    question: test.question,
                    testCase: c.testCase
                });

                if (res.success) {
                    console.log("✅ PASSED");
                    passed++;
                } else {
                    console.log("❌ FAILED");
                    console.log("     Verdict:", res.verdict);
                    console.log("     Error:", res.error);
                    console.log("     Actual:", res.actual);
                    console.log("     Expected:", c.testCase.output);
                    failed++;
                }
            } catch (e) {
                console.log("💥 CRASH", e.message);
                failed++;
            }
        }
    }

    console.log(`\n📊 SUMMARY: ${passed}/${passed + failed} Tests Passed.`);
    if (failed === 0) {
        console.log("🎉 SYSTEM INTEGRITY: 100% - READY FOR DEPLOYMENT");
    } else {
        console.log("⚠️ SYSTEM INTEGRITY COMPROMISED");
        process.exit(1);
    }
}

verify();
