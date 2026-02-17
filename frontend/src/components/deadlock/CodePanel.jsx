import React from 'react';
import Editor from "@monaco-editor/react";

import useSecurity from '../../hooks/useSecurity';

const CodePanel = ({ code, setCode, language, setLanguage, isLocked }) => {
    const teamName = localStorage.getItem('teamName') || 'UNKNOWN';
    const { security, reportAction } = useSecurity(teamName);

    const handlePaste = (e) => {
        if (security.disableCopyPaste) {
            e.preventDefault();
            reportAction('ALERT', 'Attempted to paste code into editor');
            alert("PASTING IS NOT ALLOWED! ACTION LOGGED.");
        }
    };


    return (
        <div className="code-panel">
            <div className="editor-toolbar" style={{ padding: '0.5rem', background: '#1a1a1a', display: 'flex', gap: '1rem' }}>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isLocked}
                    style={{ padding: '4px', borderRadius: '4px', background: '#333', color: 'white', border: 'none' }}
                >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    {/* Add more as backend supports */}
                </select>
                {isLocked && <span style={{ color: '#ff4757' }}>LOCKED</span>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={setCode}
                    options={{
                        readOnly: isLocked,
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        padding: { top: 10 },
                        contextmenu: !security.disableCopyPaste && !security.disableTextSelection,
                        copySelection: !security.disableCopyPaste,
                        links: false,
                        dragAndDrop: false,
                        selectionClipboard: false
                    }}
                />
            </div>

        </div>
    );
};

export default CodePanel;
