import React from 'react';

const OutputPanel = ({ result, onClose }) => {
    if (!result) return null;

    const { verdict, output, error, tugPosition } = result;
    const isSuccess = verdict === 'AC';
    const isError = !!error || verdict !== 'AC';

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-t border-gray-800 font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'} animate-pulse`} />
                    <span className="font-bold uppercase tracking-widest text-gray-400">
                        Execution Report
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {/* Verdict Banner */}
                <div className={`
                    mb-4 p-3 rounded border border-dashed text-center font-bold uppercase tracking-widest
                    ${isSuccess
                        ? 'bg-green-900/10 border-green-500/30 text-green-400'
                        : 'bg-red-900/10 border-red-500/30 text-red-400'}
                `}>
                    {verdict === 'AC' ? 'ACCEPTED' : verdict || 'EXECUTION FAILED'}
                </div>

                {/* Details */}
                <div className="space-y-4">
                    {/* Stdout */}
                    {output && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1 uppercase">Standard Output</div>
                            <pre className="bg-gray-800/50 p-3 rounded text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                {output}
                            </pre>
                        </div>
                    )}

                    {/* Stderr / Error */}
                    {isError && error && (
                        <div>
                            <div className="text-xs text-red-500/70 mb-1 uppercase h-4 flex items-center gap-2">
                                <span>Error Log</span>
                                <div className="h-px bg-red-900/50 flex-1" />
                            </div>
                            <pre className="bg-red-950/10 border border-red-900/30 p-3 rounded text-red-300 overflow-x-auto whitespace-pre-wrap">
                                {error}
                            </pre>
                        </div>
                    )}

                    {!output && !error && (
                        <div className="text-gray-600 italic text-center py-4">
                            No output generated.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutputPanel;
