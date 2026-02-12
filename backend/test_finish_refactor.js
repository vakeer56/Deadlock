const axios = require('axios');

async function runTest() {
    try {
        console.log("TEST: Verification of Finish By Team ID");

        // 1. Create Teams
        console.log("1. Creating Teams...");
        const teamA = await axios.post('http://localhost:5000/api/admin/deadlock/team', { name: "VERIFY_TEAM_A_" + Date.now(), members: ["VA"] });
        const teamB = await axios.post('http://localhost:5000/api/admin/deadlock/team', { name: "VERIFY_TEAM_B_" + Date.now(), members: ["VB"] });
        const teamAId = teamA.data.team._id;
        const teamBId = teamB.data.team._id;
        console.log(`Teams Created: A=${teamAId}, B=${teamBId}`);

        // 2. Start Match
        console.log("2. Starting Match...");
        // Use start-all to ensure they are in 'deadlock' round and match is 'ongoing'
        const startRes = await axios.post('http://localhost:5000/api/admin/deadlock/deadlock/start-all', {
            teamAIds: [teamAId],
            teamBIds: [teamBId]
        });
        const matchId = startRes.data.matches[0]._id;
        console.log(`Match Started: ${matchId}`);

        // 3. Finish Match using ONLY Team ID (New Route)
        console.log("3. Finishing Match by Team ID (Team A wins)...");
        const finishRes = await axios.patch('http://localhost:5000/api/admin/deadlock/finish', {
            winner: teamAId
        });

        console.log("Finish Result:", finishRes.status, finishRes.data.message);
        console.log("Winner in DB:", finishRes.data.match.winner);

        if (finishRes.data.match.winner === teamAId && finishRes.data.match.status === 'finished') {
            console.log("SUCCESS: Match finished correctly using only Team ID.");
        } else {
            console.error("FAILURE: Match state incorrect.");
        }

    } catch (err) {
        console.error("TEST FAILED:", err.message);
        if (err.response) {
            console.error("Response:", err.response.data);
        }
    }
}

runTest();
