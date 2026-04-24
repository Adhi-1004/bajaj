import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ResultsDisplay } from './components/ResultsDisplay';
import './index.css';

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const parsedArray = input.split(',').map(item => item.trim()).filter(Boolean);

      const response = await fetch('http://localhost:3000/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedArray }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>BFHL Hierarchy Explorer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter node relationships to analyze hierarchies and cycles.</p>
      </header>

      <main className="glass-panel animate-enter">
        <form onSubmit={handleSubmit} className="input-section">
          <label htmlFor="node-input" style={{ fontWeight: 600 }}>
            Input Edges (comma-separated, e.g., A-&gt;B, A-&gt;C)
          </label>
          <textarea
            id="node-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="A->B, A->C, B->D, C->E..."
          />
          <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
            {loading ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
      </main>

      {results && <ResultsDisplay data={results} />}
    </div>
  );
}

export default App;
