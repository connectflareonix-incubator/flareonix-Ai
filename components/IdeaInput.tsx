
import React, { useState } from 'react';

interface IdeaInputProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

const IdeaInput: React.FC<IdeaInputProps> = ({ onAnalyze, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 20) return;
    onAnalyze(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          placeholder="Describe your startup idea in detail... (e.g., 'An AI-powered logistics platform for sustainable farming in SE Asia')"
          className="w-full h-48 p-6 bg-dark-card border border-dark-border rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-lg resize-none placeholder:text-zinc-600 group-hover:border-zinc-700 disabled:opacity-50"
        />
        
        <div className="absolute bottom-4 right-4 flex items-center space-x-4">
          <span className="text-xs text-zinc-500 font-medium">
            {text.length} characters
          </span>
          <button
            type="submit"
            disabled={loading || text.length < 20}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              loading 
              ? 'bg-zinc-800 text-zinc-500' 
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Market...</span>
              </>
            ) : (
              <>
                <i className="fas fa-bolt"></i>
                <span>Evaluate Clarity</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {!loading && text.length > 0 && text.length < 20 && (
        <p className="text-brand-500 text-sm font-medium animate-pulse">
          Provide more context for a high-fidelity evaluation.
        </p>
      )}
    </div>
  );
};

export default IdeaInput;
