const { CRACK_CODE_DURATION_MINUTES } = require("../config/crackCode.config");

function isCrackCodeSessionActive(startedAt) {
  const durationMs = CRACK_CODE_DURATION_MINUTES * 60 * 1000;
  const endTime = new Date(startedAt.getTime() + durationMs);
  return new Date() < endTime;
}

function getCrackCodeSessionEndTime(startedAt) {
  const durationMs = CRACK_CODE_DURATION_MINUTES * 60 * 1000;
  return new Date(startedAt.getTime() + durationMs);
}

module.exports = {
  isCrackCodeSessionActive,
  getCrackCodeSessionEndTime,
};
