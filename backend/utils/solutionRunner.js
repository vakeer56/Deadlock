const { runCode } = require('./piston');

/**
 * Wraps user code into a driver script for verification.
 */
const wrapCode = ({ language, code, functionName }) => {
    if (language === 'python') {
        return `
import json
import sys
from typing import *

${code}

if __name__ == "__main__":
    sol = Solution()
    try:
        input_data = sys.stdin.read().strip()
        if "|" in input_data:
            parts = [json.loads(p.strip()) for p in input_data.split("|")]
        else:
            parts = [json.loads(input_data)] if input_data else []
            
        result = sol.${functionName}(*parts)
        
        if isinstance(result, bool):
            print(json.dumps(result).lower())
        else:
            print(json.dumps(result, separators=(',', ':')))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
`;
    }

    if (language === 'js' || language === 'javascript') {
        const lang = 'javascript';
        return `
const fs = require('fs');

${code}

(function() {
    try {
        const sol = new Solution();
        const inputData = fs.readFileSync(0, 'utf8').trim();
        let parts = [];
        if (inputData.includes('|')) {
            parts = inputData.split('|').map(p => JSON.parse(p.trim()));
        } else if (inputData) {
            parts = [JSON.parse(inputData)];
        }
        
        const result = sol.${functionName}(...parts);
        console.log(JSON.stringify(result));
    } catch (e) {
        process.stderr.write(e.message);
        process.exit(1);
    }
})();
`;
    }

    if (language === 'cpp') {
        return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>

using namespace std;

${code}

int main() {
    Solution sol;
    string inputData;
    if (!getline(cin, inputData)) inputData = "";
    
    stringstream ss(inputData);
    string segment;
    vector<string> parts;
    
    if (inputData.find('|') != string::npos) {
        while(getline(ss, segment, '|')) parts.push_back(segment);
    } else if (!inputData.empty()) {
        parts.push_back(inputData);
    }

    try {
        if (parts.size() == 0) {
            // No params - assume no arg call
        } else if (parts.size() == 1) {
            if (parts[0][0] == '"') {
                string s = parts[0].substr(1, parts[0].length()-2);
                cout << boolalpha << sol.${functionName}(s) << endl;
            } else if (parts[0][0] == '[') {
                // Vector heuristic (simplified for now)
                cout << "UNSUPPORTED_VECTOR_INPUT_CPP" << endl;
            } else {
                try {
                    int n = stoi(parts[0]);
                    cout << boolalpha << sol.${functionName}(n) << endl;
                } catch(...) {
                    cout << boolalpha << sol.${functionName}(parts[0]) << endl;
                }
            }
        } else if (parts.size() == 2) {
            try {
                int a = stoi(parts[0]);
                int b = stoi(parts[1]);
                cout << boolalpha << sol.${functionName}(a, b) << endl;
            } catch(...) {
                // Try strings
                cout << boolalpha << sol.${functionName}(parts[0], parts[1]) << endl;
            }
        }
    } catch (exception& e) {
        cerr << e.what() << endl;
        return 1;
    }

    return 0;
}
`;
    }

    if (language === 'java') {
        return `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            Scanner sc = new Scanner(System.in);
            if (!sc.hasNextLine()) return;
            String inputData = sc.nextLine().trim();
            
            String[] parts;
            if (inputData.contains("|")) {
                parts = inputData.split("\\\\|");
            } else {
                parts = new String[]{inputData};
            }

            if (parts.length == 1) {
                try {
                    int n = Integer.parseInt(parts[0]);
                    System.out.println(sol.${functionName}(n));
                } catch(Exception e) {
                    System.out.println(sol.${functionName}(parts[0]));
                }
            } else if (parts.length == 2) {
                try {
                    int a = Integer.parseInt(parts[0].trim());
                    int b = Integer.parseInt(parts[1].trim());
                    System.out.println(sol.${functionName}(a, b));
                } catch(Exception e) {
                     System.out.println(sol.${functionName}(parts[0].trim(), parts[1].trim()));
                }
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
    }
}
`;
    }

    return code;
};

/**
 * Executes code against a test case and returns the result.
 */
exports.validateSubmission = async ({ language, code, question, testCase }) => {
    const fullCode = wrapCode({
        language,
        code,
        functionName: question.functionName
    });

    const result = await runCode({
        language,
        code: fullCode,
        input: testCase.input
    });

    if (result.run.stderr) {
        return { success: false, verdict: "RUNTIME_ERROR", error: result.run.stderr.trim() };
    }

    let output = result.run.stdout.trim();
    let expected = testCase.output.trim();

    if (output.toLowerCase() === "true") output = "true";
    if (output.toLowerCase() === "false") output = "false";
    if (expected.toLowerCase() === "true") expected = "true";
    if (expected.toLowerCase() === "false") expected = "false";

    if (output.startsWith('[') || output.startsWith('{')) {
        try {
            output = JSON.stringify(JSON.parse(output.replace(/'/g, '"')));
        } catch (e) { }
    }
    if (expected.startsWith('[') || expected.startsWith('{')) {
        try {
            expected = JSON.stringify(JSON.parse(expected.replace(/'/g, '"')));
        } catch (e) { }
    }

    if (output === expected) {
        return { success: true, verdict: "AC" };
    } else {
        return { success: false, verdict: "WRONG_ANSWER", actual: output, expected: expected };
    }
};
