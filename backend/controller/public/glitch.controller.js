const GameState = require("../../model/gameState.model");

/*
----------------------------------------------------
ACTIVATE GLITCH (FIRST BLOOD REWARD)
POST /api/public/glitch/activate
----------------------------------------------------
*/
exports.activateGlitch = async (req, res) => {
    try {
        const { teamId } = req.body;

        // 1. Get current state (atomic check not strictly needed for read, but good for validation)
        const state = await GameState.findOne({ key: 'GLOBAL_STATE' });

        if (!state || !state.firstBloodTeamId) {
            return res.status(400).json({ success: false, message: "First Blood not yet claimed." });
        }

        if (state.firstBloodTeamId.toString() !== teamId) {
            return res.status(403).json({ success: false, message: "Only First Blood winner can activate this." });
        }

        if (state.glitchUsed) {
            return res.status(400).json({ success: false, message: "Glitch ability already used." });
        }

        // 2. Atomic Activation
        // Ensure we only activate if it hasn't been used yet (race condition protection)
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 15 * 1000); // 15 Seconds Duration

        const result = await GameState.updateOne(
            { key: 'GLOBAL_STATE', glitchUsed: false },
            {
                $set: {
                    glitchUsed: true,
                    glitchActiveUntil: expiresAt
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ success: false, message: "Activation failed. Already used?" });
        }

        res.json({ success: true, message: "CYBER-ATTACK INITIATED", expiresAt });

    } catch (err) {
        console.error("Glitch activation error:", err);
        res.status(500).json({ message: "System error" });
    }
};

/*
----------------------------------------------------
GET GLITCH STATUS (POLLING)
GET /api/public/glitch/status
----------------------------------------------------
*/
exports.getGlitchStatus = async (req, res) => {
    try {
        const state = await GameState.findOne({ key: 'GLOBAL_STATE' });

        if (!state) {
            return res.json({ active: false, ownerId: null });
        }

        const now = new Date();
        const isActive = state.glitchActiveUntil && new Date(state.glitchActiveUntil) > now;
        const remainingTime = isActive ? Math.ceil((new Date(state.glitchActiveUntil) - now) / 1000) : 0;

        res.json({
            active: isActive,
            ownerId: state.firstBloodTeamId,
            remainingTime,
            glitchUsed: state.glitchUsed
        });

    } catch (err) {
        console.error("Glitch status error:", err);
        res.status(500).json({ message: "System error" });
    }
};
