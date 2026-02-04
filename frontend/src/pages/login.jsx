import React, { useState } from "react";
import "../style/login.css";

function Deadlock() {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(["", "", ""]);

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const deployTeam = () => {
    if (!teamName || members.some(m => !m)) {
      alert("Please fill all fields");
      return;
    }

    const teamData = {
      name: teamName,
      members: members
    };

    console.log("Send to backend:", teamData);

  };

  return (
    <div className="deadlock-container">
      <div className="card">
        <h1 className="title">DEADLOCK</h1>

        <input
          type="text"
          className="team-input"
          placeholder="ENTER TEAM NAME"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <div className="members-box">
          <p className="members-title" style={{ textAlign: "center", marginBottom: "15px", color: "#aaaaaa" }}>TEAM MEMBERS</p>

          {members.map((member, index) => (
            <div className="member-row" key={index}>
              <span className="avatar">👤</span>
              <input
                type="text"
                value={member}
                placeholder={`Member ${index + 1}`}
                onChange={(e) => handleMemberChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <button className="deploy-btn" onClick={deployTeam}>
          DEPLOY TEAM
        </button>
      </div>
    </div>
  );
}

export default Deadlock;
