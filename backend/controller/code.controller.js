const axios = require('axios');

/*
    POST /api/public/code/execute
    
    Request Body:
    {
        language: "python",
        version: "3.10.0",
        files: [
            {
                content: "print('Hello World')"
            }
        ],
        stdin: "optional input",
        args: ["optional", "args"]
    }

    Response:
    {
        output: "Hello World\n",
        error: "" 
    }
*/

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

const CrackCodeSession = require("../model/CrackCodeSession");
const CrackCodeAttempt = require("../model/CrackCodeAttempt");

const executeCode = async (req, res) => {
    try {
        const { teamId, language, version, files, stdin, args } = req.body;

        if (!teamId) {
            return res.status(400).json({
                message: "Team ID is required"
            });
        }

        if (!language || !version || !files || files.length === 0) {
            return res.status(400).json({
                message: "Language, version, and files are required"
            });
        }

        // 1. Find Session
        const session = await CrackCodeSession.findOne({ teamId });
        if (!session) {
            return res.status(404).json({
                message: "Session not found for this team"
            });
        }

        // 2. Execute Code
        const payload = {
            language,
            version,
            files,
            stdin: stdin || "",
            args: args || []
        };

        console.log("Sending payload to Piston:", JSON.stringify(payload, null, 2));

        const response = await axios.post(PISTON_API_URL, payload);
        const { run } = response.data;

        const output = run.stdout;
        const error = run.stderr;

        // 3. Save Attempt
        // We'll increment attempt count regardless of success/error for now, or maybe just success?
        // Let's increment attemptsUsed in session
        session.attemptsUsed += 1;
        await session.save();

        await CrackCodeAttempt.create({
            teamId,
            crackCodeSessionId: session._id,
            input: stdin || "", // Saving input/stdin
            output: output || error || "", // Saving whatever came back
            attemptNumber: session.attemptsUsed
        });

        return res.json({
            output: output,
            error: error
        });

    } catch (error) {
        console.error("Code execution error:", error.message);
        return res.status(500).json({
            message: "Error executing code",
            error: error.message
        });
    }
};

module.exports = {
    executeCode
};
