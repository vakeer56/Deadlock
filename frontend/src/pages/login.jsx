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
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Network Animation & Loading Logic
  useEffect(() => {
    // 1. Text Cycle Logic (Only runs if loading)
    if (loading) {
      const states = [
        "INITIALIZING UPLINK...",
        "ESTABLISHING SECURE HANDSHAKE...",
        "LINKING NEURAL NODES...",
        "DEPLOYMENT SEQUENCE READY."
      ];
      let stateIndex = 0;

      // Progress Bar Logic
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
      }, 40);

      const textInterval = setInterval(() => {
        stateIndex++;
        if (stateIndex < states.length) {
          setLoadingText(states[stateIndex]);
        } else {
          clearInterval(textInterval);
          clearInterval(progressInterval);
          setProgress(100);
          setTimeout(() => setLoading(false), 800);
        }
      }, 1200);

      return () => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
      };
    }
  }, [loading]);

  // 2. Canvas Network Animation (Runs always)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId;

    // Mouse State
    const mouse = { x: null, y: null, radius: 200 };

    const handleMouseMove = (e) => {
      // Disable effect if hovering over an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        mouse.x = null;
        mouse.y = null;
      } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

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

        // Mouse Repulsion / Interaction (Optional - let's just do connection)
        // const dx = mouse.x - this.x;
        // const dy = mouse.y - this.y;
        // const distance = Math.sqrt(dx*dx + dy*dy);
        // if (distance < mouse.radius) { ... }
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

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles(); // Re-initialize particles on resize
    };
    window.addEventListener("resize", resize);
    resize(); // Initial call to set dimensions and particles

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Mouse Glow Effect
      if (mouse.x != null) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
        glow.addColorStop(0, "rgba(0, 198, 255, 0.2)");
        glow.addColorStop(1, "rgba(0, 198, 255, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Particles & Connections
      particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Connect to Mouse (Stronger Interaction)
        if (mouse.x != null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 255, ${1 - dist / 250})`; // Bright Cyan
            ctx.lineWidth = 1.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

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
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run once on mount

  const [isResumeMode, setIsResumeMode] = useState(false);
  const [checkingTeam, setCheckingTeam] = useState(false);

  // Debounce Team Check
  useEffect(() => {
    const checkTeamDelay = setTimeout(async () => {
      if (!teamName) {
        setIsResumeMode(false);
        return;
      }

      try {
        setCheckingTeam(true);
        const response = await axios.post("http://localhost:5000/api/admin/deadlock/team/check", { name: teamName });
        if (response.data.exists) {
          setIsResumeMode(true);
          // Auto-fill members if needed, or just keep them hidden
        } else {
          setIsResumeMode(false);
        }
      } catch (error) {
        console.error("Team check failed", error);
      } finally {
        setCheckingTeam(false);
      }
    }, 500);

    return () => clearTimeout(checkTeamDelay);
  }, [teamName]);


  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const showErrorMsg = (msg) => {
    setError(msg);
    setTimeout(() => {
      setError("");
    }, 5000); // Disappear after 5s
  };

  const deployTeam = async () => {
    if (!teamName) {
      showErrorMsg("TEAM NAME REQUIRED");
      return;
    }

    if (!isResumeMode && members.some(m => !m)) {
      showErrorMsg("ALL FIELDS ARE REQUIRED");
      return;
    }

    // RESUME SESSION
    if (isResumeMode) {
      try {
        // Re-fetch team details to be sure (or just trust the check)
        const response = await axios.post("http://localhost:5000/api/admin/deadlock/team/check", { name: teamName });
        if (response.data.success && response.data.exists) {
          setShowSuccess(true);
          localStorage.setItem("teamId", response.data.team._id);
          setTimeout(() => {
            navigate("/crackTheCode");
          }, 2000);
        } else {
          showErrorMsg("TEAM NOT FOUND");
          setIsResumeMode(false);
        }
      } catch (e) {
        showErrorMsg("RESUME FAILED");
      }
      return;
    }

    // NEW DEPLOYMENT
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
        showErrorMsg(error.response.data.message || "DEPLOYMENT FAILED");
      } else if (error.request) {
        showErrorMsg("SERVER UPLINK FAILED");
      } else {
        showErrorMsg("UNKNOWN SYSTEM ERROR");
      }
    }
  };

  return (
    <div className="deadlock-container">
      {/* Background Canvas (Persistent) */}
      <canvas ref={canvasRef} className="loader-canvas" />

      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="access-granted-container">
            <h1 className="access-granted-text">ACCESS GRANTED</h1>
            <div className="redirect-text">ESTABLISHING SECURE CONNECTION...</div>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="error-message-container">
          <h2 className="error-text">⚠️ {error}</h2>
        </div>
      )}

      {/* Conditionally Render Content */}
      {loading ? (
        // LOADER CONTENT
        <div className="loader-content">
          <div className="loader-logo-section">
            <img src={logo} alt="Loading Logo" className="loader-logo" />
            <span className="loader-takshashila-text">Takshashila</span>
          </div>
          <div className="terminal-text">{loadingText}</div>

          {/* Progress Bar */}
          <div className="loader-progress-container">
            <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="loader-progress-text">{progress}%</div>
        </div>
      ) : (
        // LOGIN FORM CONTENT
        <div className="login-content-wrapper animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                className={`team-input-large ${isResumeMode ? 'team-input-found' : ''}`}
                placeholder="ENTER TEAM NAME"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <div className={`checking-text ${checkingTeam ? 'pulsing' : (teamName ? 'success-text' : '')}`}>
                {checkingTeam ? "SEARCHING DATABASE..." : (
                  isResumeMode ? "TEAM FOUND — SESSION RESTORED" : (teamName && !isResumeMode ? "TEAM NAME IS AVAILABLE" : "")
                )}
              </div>
            </div>

            <div className={`members-section-wrapper ${isResumeMode ? 'hidden' : ''}`}>
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
            </div>

            <div className="action-section">
              <button className="deploy-btn-large" onClick={deployTeam}>
                {isResumeMode ? "BEGIN WHERE YOU LEFT OFF" : "INITIALIZE DEPLOYMENT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deadlock;
