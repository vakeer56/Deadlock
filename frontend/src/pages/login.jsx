import React, { useState } from "react";
import axios from "axios";
import "../style/login.css";

function Deadlock() {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(["", "", ""]);

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const deployTeam = async () => {
    if (!teamName || members.some(m => !m)) {
      alert("Please fill all fields");
      return;
    }

    const teamData = {
      name: teamName,
      members: members
    };

    try {
      const response = await axios.post("http://localhost:5000/api/admin/deadlock/team", teamData);

      if (response.data.success) {
        alert("Team Deployed Successfully!");
        // Store teamId for session management
        localStorage.setItem("teamId", response.data.team._id);
        console.log("Team created:", response.data.team);
      }
    } catch (error) {
      console.error("Error deploying team:", error);
      if (error.response) {
        // Server responded with a status other than 2xx
        alert(error.response.data.message || "Failed to deploy team");
      } else if (error.request) {
        // Request was made but no response received
        alert("Cannot connect to server. Please ensure the backend is running.");
      } else {
        // Something else happened
        alert("An error occurred while deploying the team.");
      }
    }
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
