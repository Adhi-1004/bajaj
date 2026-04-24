import React from 'react';
import { User, Activity, AlertTriangle, AlertCircle, Database, Network } from 'lucide-react';

interface ResultsDisplayProps {
  data: any;
}

const TreeNode = ({ name, childrenObj }: { name: string, childrenObj: any }) => {
  const childrenKeys = Object.keys(childrenObj || {});
  
  return (
    <div className="node-item">
      <div className="node-label">
        <Network size={16} style={{ color: 'var(--primary-color)' }} />
        {name}
      </div>
      {childrenKeys.length > 0 && (
        <ul className="nested-list">
          {childrenKeys.map(child => (
            <li key={child}>
              <TreeNode name={child} childrenObj={childrenObj[child]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="results-container">
      <div className="results-grid">
        <div className="glass-panel identity-card animate-enter delay-1">
          <h2 className="card-title"><User size={20} /> Identity</h2>
          <div className="info-row">
            <span className="info-label">User ID</span>
            <span className="info-value">{data.user_id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{data.email_id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Roll Number</span>
            <span className="info-value">{data.college_roll_number}</span>
          </div>
        </div>

        <div className="glass-panel summary-card animate-enter delay-2">
          <h2 className="card-title"><Activity size={20} /> Summary</h2>
          <div className="info-row">
            <span className="info-label">Total Trees</span>
            <span className="info-value">{data.summary.total_trees}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Cycles</span>
            <span className="info-value">{data.summary.total_cycles}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Largest Tree Root</span>
            <span className="info-value">{data.summary.largest_tree_root || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="results-grid" style={{ marginTop: '1.5rem' }}>
        <div className="glass-panel animate-enter delay-3">
          <h2 className="card-title"><AlertCircle size={20} /> Invalid Entries</h2>
          <div className="chip-container">
            {data.invalid_entries.length === 0 ? (
              <span className="info-label">None</span>
            ) : (
              data.invalid_entries.map((entry: string, i: number) => (
                <span key={i} className="chip chip-error animate-enter" style={{ animationDelay: `${0.3 + i * 0.05}s` }}>{entry}</span>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel animate-enter delay-4">
          <h2 className="card-title"><AlertTriangle size={20} /> Duplicate Edges</h2>
          <div className="chip-container">
            {data.duplicate_edges.length === 0 ? (
              <span className="info-label">None</span>
            ) : (
              data.duplicate_edges.map((entry: string, i: number) => (
                <span key={i} className="chip chip-warning animate-enter" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>{entry}</span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel animate-enter delay-5" style={{ marginTop: '1.5rem' }}>
        <h2 className="card-title"><Database size={20} /> Hierarchies</h2>
        {data.hierarchies.length === 0 ? (
          <p className="info-label">No valid hierarchies generated.</p>
        ) : (
          <div className="tree-container">
            {data.hierarchies.map((h: any, i: number) => (
              <div key={i} className="tree-item animate-enter" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className="tree-header">
                  <span className="tree-root">Root: {h.root}</span>
                  {h.has_cycle ? (
                    <span className="badge badge-cycle">⚠ Cycle Detected</span>
                  ) : (
                    <span className="badge badge-depth">Depth: {h.depth}</span>
                  )}
                </div>
                {!h.has_cycle && h.tree && (
                  <ul className="nested-list" style={{ marginTop: '0.5rem' }}>
                    <li>
                      <TreeNode name={h.root} childrenObj={h.tree[h.root]} />
                    </li>
                  </ul>
                )}
                {h.has_cycle && (
                  <p className="info-label" style={{ marginTop: '0.5rem' }}>
                    Cycle detected involving root '{h.root}'. Tree cannot be rendered.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
