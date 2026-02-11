const axios = require('axios');

const test = async () => {
    try {
        const payload = {
            matchId: "698c672fe8a1e7888dc494e2",
            teamId: "6989829cef7a9a1b692674b8",
            questionId: "698c4887ca5fddae5ef072d8",
            language: "python",
            code: "a, b = map(int, input().split())\nprint(a * b)"
        };

        const res = await axios.post('http://localhost:5000/api/public/deadlock/submit', payload);
        console.log("Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
};

test();
