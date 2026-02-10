const axios = require("axios");

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const languageMap = {
    python: { language: "python", version: "3.10.0" },
    js: { language: "javascript", version: "18.15.0" },
    java: { language: "java", version: "15.0.2" },
    cpp: { language: "cpp", version: "10.2.0" }
};

exports.runCode = async ({ language, code, input }) => {
    const runtime = languageMap[language];

    if (!runtime) {
    throw new Error("Unsupported language");
    }

    const response = await axios.post(PISTON_URL, {
    language: runtime.language,
    version: runtime.version,
    files: [{ content: code }],
    stdin: input
    });

    return response.data;
};
