import React from 'react';
import Editor from "@monaco-editor/react";

const CodePanel = ({ code, setCode, language, setLanguage, isLocked }) => {

    // Check if monaco is available, if not fallback (handled by library usually)

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
                    <option value="javascript">JavaScript</option>
                    {/* Add more as backend supports */}
                </select>
                {isLocked && <span style={{ color: '#ff4757' }}>LOCKED</span>}
            </div>
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
                    padding: { top: 10 }
                }}
            />
        </div>
    );
};

export default CodePanel;
