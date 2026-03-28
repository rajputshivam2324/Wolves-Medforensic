import React, { useState } from 'react';
import { ShieldAlert, BookOpen, AlertCircle, Scale, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AGENT_CONFIG = {
  run_contradiction: { title: 'Contradiction Hunter', icon: ShieldAlert, weight: '40%' },
  run_citation: { title: 'Citation Verifier', icon: BookOpen, weight: '25%' },
  run_outlier: { title: 'Outlier Detector', icon: AlertCircle, weight: '20%' },
  run_calibrator: { title: 'Epistemic Calibrator', icon: Scale, weight: '15%' }
};

function AgentCard({ agentId, data, log, isAnalyzing }) {
  const [expanded, setExpanded] = useState(false);
  const config = AGENT_CONFIG[agentId] || { title: agentId, icon: ShieldAlert };
  const Icon = config.icon;
  
  const hasStarted = !!data;
  const isDone = data && !data.error;
  const score = isDone ? (data[`${agentId.replace('run_', '')}_result`]?.score || 0) : 0;
  const flags = isDone ? (data[`${agentId.replace('run_', '')}_result`]?.flags || []) : [];
  
  // Color coding
  let statusColor = 'var(--text-muted)';
  if (isDone) {
    if (score < 0.4) statusColor = 'var(--status-green)';
    else if (score < 0.7) statusColor = 'var(--status-amber)';
    else statusColor = 'var(--status-red)';
  }

  return (
    <div className={`glass-card ${isAnalyzing && !isDone ? 'animate-pulse' : ''}`} style={{ overflow: 'hidden' }}>
      <div 
        style={{ padding: '1rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '8px', 
            background: `rgba(${statusColor === 'var(--status-green)' ? '16, 185, 129' : statusColor === 'var(--status-amber)' ? '245, 158, 11' : statusColor === 'var(--status-red)' ? '239, 68, 68' : '156, 163, 175'}, 0.1)`,
            color: statusColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{config.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Weight: {config.weight}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {hasStarted ? (
            <div style={{ 
              fontWeight: 700, 
              fontSize: '1.25rem',
              color: statusColor
            }}>
              {(score * 100).toFixed(0)}%
            </div>
          ) : (
             <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Waiting...</div>
          )}
          
          <div style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {expanded && log && (
        <div style={{ padding: '0 1rem 1rem 1rem', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{
            background: 'var(--bg-panel)',
            color: 'var(--text-main)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            maxHeight: '350px',
            overflowY: 'auto',
            border: '1px solid var(--glass-border)'
          }}>
            <ReactMarkdown>{log}</ReactMarkdown>
          </div>
        </div>
      )}

      {expanded && flags.length > 0 && (
        <div style={{ 
          padding: '0 1rem 1rem 1rem', 
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(0,0,0,0.1)' 
        }}>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {flags.map((flag, i) => (
              <div key={i} style={{ 
                padding: '0.75rem', 
                borderRadius: '6px', 
                background: 'var(--bg-panel)',
                borderLeft: `4px solid ${flag.severity === 'HIGH' ? 'var(--status-red)' : 'var(--status-amber)'}`
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                  {flag.verdict || flag.outlier_type || flag.issue}
                </div>
                {flag.claim && <div style={{ fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '4px' }}>"{flag.claim}"</div>}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{flag.reason || flag.suggested_revision}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {expanded && isDone && flags.length === 0 && (
        <div style={{ padding: '0 1rem 1rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No concerning flags detected.
        </div>
      )}
    </div>
  );
}

function AgentCards({ results, logs = {}, isAnalyzing }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Object.keys(AGENT_CONFIG).map(agentId => (
        <AgentCard 
          key={agentId} 
          agentId={agentId} 
          data={results[agentId]} 
          log={logs[agentId]}
          isAnalyzing={isAnalyzing} 
        />
      ))}
    </div>
  );
}

export default AgentCards;
