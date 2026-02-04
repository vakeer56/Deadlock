import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/login.css";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Deadlock() {
  const navigate = useNavigate();
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
        // Redirect to dashboard on success
        navigate("/deadlock-lobby");
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
    <div style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#050505',
        color: '#fff',
        fontFamily: '"Exo 2", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
    }}>
        {/* Ambient Background */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 1) 0%, rgba(5, 5, 5, 1) 100%)',
            zIndex: 0
        }}></div>

        {/* Grid Overlay */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            zIndex: 1,
            opacity: 0.5
        }}></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        margin: 'auto',
        width: '520px',
        maxWidth: '92%',
        padding: '46px 42px',
        borderRadius: '26px',
        background: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 255, 0.2)',
        boxShadow: '0 40px 80px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 255, 255, 0.1)'
      }}>
        <h1 style={{
            textAlign: 'center',
            fontSize: '3rem',
            margin: '0 0 1rem 0',
            fontWeight: '900',
            color: '#fff',
            letterSpacing: '5px',
            textShadow: '0 0 20px rgba(0,255,255,0.5)'
        }}>DEADLOCK</h1>
        
        <div style={{ marginBottom: '26px' }}>
             <input
                type="text"
                placeholder="ENTER TEAM NAME"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                style={{
                    width: '100%',
                    padding: '15px 18px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    color: '#00ffff',
                    fontSize: '15px',
                    outline: 'none',
                    letterSpacing: '1px'
                }}
            />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ textAlign: "center", marginBottom: "15px", color: "#00ffff", letterSpacing: '2px', fontSize: '0.9rem' }}>TEAM MEMBERS</p>

          {members.map((member, index) => (
            <div key={index} style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'center' }}>
              <span style={{ 
                  color: '#00ffff', 
                  fontSize: '1.2rem', 
                  width: '30px', 
                  textAlign: 'center',
                  textShadow: '0 0 10px rgba(0,255,255,0.5)'
               }}>
                   0{index + 1}
               </span>
              <input
                type="text"
                value={member}
                placeholder={`MEMBER CODENAME`}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                style={{
                    width: '100%',
                    padding: '15px 18px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0, 255, 255, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          ))}
        </div>

        <button 
            onClick={deployTeam}
            style={{
                width: '100%',
                marginTop: '18px',
                padding: '18px',
                background: 'transparent',
                border: '1px solid #00ffff',
                color: '#00ffff',
                fontSize: '17px',
                fontWeight: '800',
                letterSpacing: '2px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
          INITIATE SEQUENCE
        </button>
      </div>
    </div>
  );
}

export default Deadlock;
