import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/login.css";
import logo from "../assets/logo.png";

function Deadlock() {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(["", "", ""]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("INITIALIZING UPLINK...");
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Network Animation & Loading Logic
  useEffect(() => {
    if (!loading) return;

    // 1. Text Cycle Logic
    const states = [
      "INITIALIZING UPLINK...",
      "ESTABLISHING SECURE HANDSHAKE...",
      "LINKING NEURAL NODES...",
      "DEPLOYMENT SEQUENCE READY."
    ];
    let stateIndex = 0;
    const textInterval = setInterval(() => {
      stateIndex++;
      if (stateIndex < states.length) {
        setLoadingText(states[stateIndex]);
      } else {
        clearInterval(textInterval);
        setTimeout(() => setLoading(false), 800);
      }
    }, 1200); // Change text every 1.2s

    // 2. Canvas Network Animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "#00c6ff"; // Cyan dots
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor(width * height / 15000), 100);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    const animate = () => {
      if (!loading) return;
      ctx.clearRect(0, 0, width, height);

      // Draw Particles & Connections
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        // Connect to nearby particles
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 198, 255, ${1 - dist / 150})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      clearInterval(textInterval);
      window.removeEventListener("resize", resize);
    };
  }, [loading]);

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
        // Prepare Success Animation
        setShowSuccess(true);

        // Store session
        localStorage.setItem("teamId", response.data.team._id);

        // Redirect after animation
        setTimeout(() => {
          navigate("/crackTheCode");
        }, 3000);
      }
    } catch (error) {
      console.error("Error deploying team:", error);
      if (error.response) {
        alert(error.response.data.message || "Failed to deploy team");
      } else if (error.request) {
        alert("Cannot connect to server. Please ensure the backend is running.");
      } else {
        alert("An error occurred while deploying the team.");
      }
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <canvas ref={canvasRef} className="loader-canvas" />
        <div className="loader-content">
          <div className="loader-logo-section">
            <img src={logo} alt="Loading Logo" className="loader-logo" />
            <span className="loader-takshashila-text">Takshashila</span>
          </div>
          <div className="terminal-text">{loadingText}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="deadlock-container animate-fade-in">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="access-granted-container">
            <h1 className="access-granted-text">ACCESS GRANTED</h1>
            <div className="redirect-text">ESTABLISHING SECURE CONNECTION...</div>
          </div>
        </div>
      )}

      <div className="top-header animate-slide-down">
        <div className="logo-container">
          <img src={logo} alt="Takshashila Logo" className="takshashila-logo" />
          <span className="takshashila-text">Takshashila</span>
        </div>
        <div className="celestius-text">Celestius</div>
      </div>

      <h1 className="title animate-scale-in">DEADLOCK</h1>

      <div className="login-content animate-slide-up">
        <div className="team-section">
          <input
            type="text"
            className="team-input-large"
            placeholder="ENTER TEAM NAME"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>

        <div className="members-section">
          <p className="members-title">OPERATIVES</p>
          <div className="members-grid">
            {members.map((member, index) => (
              <div className="member-card" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <span className="member-index">0{index + 1}</span>
                <input
                  type="text"
                  className="member-input"
                  value={member}
                  placeholder={`Operative ${index + 1}`}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="action-section">
          <button className="deploy-btn-large" onClick={deployTeam}>
            INITIALIZE DEPLOYMENT
          </button>
        </div>
      </div>
    </div>
  );
}

export default Deadlock;
