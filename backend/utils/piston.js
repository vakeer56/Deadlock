const axios = require("axios");
const ThrottleQueue = require("./throttleQueue");

const PISTON_URL = "https://wandbox.org/api/compile.json";
const wandboxQueue = new ThrottleQueue(2); // 2 requests per second

const languageMap = {
    python: "cpython-3.10.15",
    js: "nodejs-18.20.4",
    javascript: "nodejs-18.20.4",
    java: "openjdk-jdk-21+35",
    cpp: "gcc-11.4.0",
    "c++": "gcc-11.4.0"
};

exports.runCode = async ({ language, code, input }) => {
    const compiler = languageMap[language];

    if (!compiler) {
        throw new Error("Unsupported language");
    }

    // Wrap the axios call in the throttle queue
    const response = await wandboxQueue.add(() =>
        axios.post(PISTON_URL, {
            compiler,
            code,
            stdin: input,
            save: false
        })
    );

    const data = response.data;

    // Normalize Wandbox response to match the Piston-like structure expected by solutionRunner.js
    // Wandbox returns status (exit code), program_output (combined stdout), program_error (stderr), compiler_error
    return {
        run: {
            stdout: data.program_output || "",
            stderr: (data.program_error || "") + (data.compiler_error || ""),
            code: parseInt(data.status) || 0
        }
    };
};
