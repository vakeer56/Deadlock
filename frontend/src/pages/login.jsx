import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../style/login.css"; // Ensure this import is here

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Deadlock = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const debouncedTeamName = useDebounce(teamName, 300);

  const [members, setMembers] = useState(["", "", ""]);
  const [teamExists, setTeamExists] = useState(false);
  const [isTeamAvailable, setIsTeamAvailable] = useState(false);
  const [existingTeamData, setExistingTeamData] = useState(null);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING PROTOCOLS...");
  const [fadeOut, setFadeOut] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirect State
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectStep, setRedirectStep] = useState(0);
  const redirectMessages = [
    "ACCESS GRANTED",
    "ESTABLISHING UPLINK...",
    "BREACHING FIREWALL...",
    "WELCOME, OPERATIVE."
  ];

  // Notification State
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    document.title = "Deadlock // Login";
  }, []);

  // Check Team Existence
  useEffect(() => {
    const checkTeam = async () => {
      if (!debouncedTeamName || debouncedTeamName.length < 1) {
        setTeamExists(false);
        setIsTeamAvailable(false);
        setExistingTeamData(null);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/admin/deadlock/team/check/${debouncedTeamName}`);

        if (response.data.success) {
          if (response.data.exists) {
            setTeamExists(true);
            setIsTeamAvailable(false);
            setExistingTeamData(response.data.team);
            showNotification("TEAM RECORD FOUND. RESUMING SESSION.", "success");
          } else {
            setTeamExists(false);
            setIsTeamAvailable(true);
            setExistingTeamData(null);
          }
        }
      } catch (error) {
        console.error("Check team error:", error);
      }
    };

    checkTeam();
  }, [debouncedTeamName]);


  useEffect(() => {
    if (!isLoading) return;

    const phrases = [
      "ESTABLISHING SECURE CONNECTION...",
      "VERIFYING BIOMETRICS...",
      "CHECKING AUTHENTICATION...",
      "SYNCING WITH CELESTIUS...",
      "ACCESS GRANTED"
    ];

    let currentPhraseIndex = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoadingText("ACCESS GRANTED");
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              setIsLoading(false);
              setIsLoaded(true); // Trigger reveal animations
            }, 800);
          }, 500);
          return 100;
        }

        const phase = Math.floor((prev / 100) * phrases.length);
        if (phrases[phase] && phase !== currentPhraseIndex) {
          setLoadingText(phrases[phase]);
          currentPhraseIndex = phase;
        }

        return prev + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoading]);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const initRedirect = () => {
    setIsRedirecting(true);

    let step = 0;
    const redirectInterval = setInterval(() => {
      step++;
      if (step >= redirectMessages.length) {
        clearInterval(redirectInterval);
        navigate("/crackTheCode");
      } else {
        setRedirectStep(step);
      }
    }, 1200);
  };

  const handleSubmit = async () => {
    // RESUME MISSION FLOW
    if (teamExists && existingTeamData) {
      showNotification(`WELCOME BACK, ${existingTeamData.name}`, "success");
      localStorage.setItem("teamId", existingTeamData._id);
      setTimeout(initRedirect, 1000);
      return;
    }

    // CREATE TEAM FLOW
    if (!teamName || members.some(m => !m)) {
      showNotification("MISSING CREDENTIALS. FILL ALL FIELDS.", "error");
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
        showNotification("DEPLOYMENT SUCCESSFUL.", "success");
        localStorage.setItem("teamId", response.data.team._id);
        setTimeout(initRedirect, 1000);
      }
    } catch (error) {
      console.error("Error deploying team:", error);
      if (error.response) {
        showNotification(error.response.data.message || "DEPLOYMENT FAILED", "error");
      } else if (error.request) {
        showNotification("CONNECTION FAILURE. CHECK SERVER.", "error");
      } else {
        showNotification("SYSTEM ERROR. ABORTING.", "error");
      }
    }
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = Math.round((clientX / window.innerWidth) * 100);
    const y = Math.round((clientY / window.innerHeight) * 100);

    document.documentElement.style.setProperty('--mouse-x', `${x}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div id="login-page" className={isLoaded ? "loaded" : ""} onMouseMove={handleMouseMove}>

      {/* Advanced Redirect Overlay */}
      {isRedirecting && (
        <div id="redirect-overlay">
          <div className="warp-tunnel"></div>
          <div className="scanlines"></div>
          <div className="redirect-content">
            <h1 className="glitch-text" data-text={redirectMessages[redirectStep]}>
              {redirectMessages[redirectStep]}
            </h1>
          </div>
        </div>
      )}

      {/* Cyber Notification */}
      {notification && (
        <div className={`cyber-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div id="login-loading-overlay" className={fadeOut ? "fade-out" : ""}>
          <div className="hologram-container">
            <img src={logo} alt="Loading Logo" className="loading-logo-glow" />
            <h1 className="cinematic-title">DEADLOCK</h1>

            <div className="loading-text-container">
              <div className="loading-text">{loadingText}</div>
            </div>

            <div className="cyber-progress-container">
              <div className="cyber-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="login-header">
        <div className="brand-left">
          <img src={logo} alt="Logo" className="brand-logo" />
          <span className="brand-text">TAKSHASHILA</span>
        </div>
        <div className="brand-right">
          <span className="brand-text">Celestius</span>
        </div>
      </div>

      {/* Main Content with 3D Reveal */}
      <div className="login-content">
        <h1 className="main-title">DEADLOCK</h1>

        <div className="input-group cyber-input-group">
          <input
            type="text"
            className={`team-input ${teamExists ? "found" : ""}`}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            placeholder="ENTER TEAM NAME"
          />
          {/* <label className="input-label">ENTER TEAM NAME</label> */}
          <span className="input-highlight"></span>
          <div className="input-bar"></div>
          {teamExists && <div className="team-status-indicator">TEAM FOUND</div>}
          {isTeamAvailable && <div className="team-status-indicator available">TEAM NAME AVAILABLE</div>}
        </div>

        {/* Conditionally Render Operatives */}
        <div className={`operatives-section ${teamExists ? "hidden" : "visible"}`}>
          <div className="section-label">OPERATIVES</div>
          <div className="operatives-grid">
            {members.map((member, index) => (
              <div className="operative-card" key={index}>
                <span className="op-number">0{index + 1}</span>
                <input
                  type="text"
                  className="operative-input"
                  value={member}
                  placeholder={`Operative ${index + 1}`}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <button className={`deploy-btn ${teamExists ? "resume-mode" : ""}`} onClick={handleSubmit}>
          {teamExists ? "RESUME MISSION" : "INITIALIZE DEPLOYMENT"}
        </button>
      </div>
    </div>
  );
}

export default Deadlock;
