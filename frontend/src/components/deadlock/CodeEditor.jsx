import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const languages = [
    { id: "python", name: "PYTHON 3" },
    { id: "js", name: "JAVASCRIPT" },
    { id: "java", name: "JAVA" },
    { id: "cpp", name: "C++" },
];

const CodeEditor = ({ onSubmit, isSubmitting, disabled }) => {
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("");

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const handleSubmit = () => {
        if (code.trim()) {
            onSubmit(code, language);
            // Optional: Don't clear code on submit failure so they can retry
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl overflow-hidden focus-within:border-blue-500/30 transition-colors">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0 h-14">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">EXECUTION ENV</span>
                    </div>

                    <div className="h-4 w-px bg-gray-700" />

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={disabled || isSubmitting}
                        className="bg-transparent text-white text-xs font-mono font-bold uppercase cursor-pointer hover:text-blue-400 outline-none appearance-none"
                    >
                        {languages.map((lang) => (
                            <option key={lang.id} value={lang.id} className="bg-gray-900 text-gray-300">
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setCode("")}
                        disabled={disabled || isSubmitting}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white hover:bg-white/5 rounded transition-all"
                    >
                        Reset
                    </button>
                    {!disabled && (
                        <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                            Ready
                        </div>
                    )}
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative bg-[#1e1e1e]">
                <Editor
                    height="100%"
                    language={language === "js" ? "javascript" : language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Consolas', monospace",
                        fontLigatures: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 20 },
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        readOnly: disabled || isSubmitting,
                    }}
                />

                {disabled && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 pointer-events-none">
                        <div className="text-4xl mb-4">🔒</div>
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                            Interface Locked
                        </span>
                    </div>
                )}
            </div>

            {/* Footer / Submit Action */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center shrink-0">
                <div className="text-[10px] text-gray-600 font-mono hidden md:block">
                    ID: {language.toUpperCase()}_RUNTIME_v2.0
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={disabled || isSubmitting || !code.trim()}
                    className={`
                        relative overflow-hidden px-8 py-3 rounded group transition-all duration-300
                        ${disabled || isSubmitting || !code.trim()
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400/50"
                        }
                    `}
                >
                    <span className="relative z-10 flex items-center gap-2 font-bold text-sm tracking-widest uppercase">
                        {isSubmitting ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <span>Deploy Solution</span>
                                <span className="text-blue-200 group-hover:translate-x-1 transition-transform">→</span>
                            </>
                        )}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default CodeEditor;
