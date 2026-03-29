import React, { useState, useEffect } from 'react';
import PatientSelector from './components/PatientSelector';
import InputPanel from './components/InputPanel';
import AgentCards from './components/AgentCards';
import { Activity, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from './config';

function App() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [llmOutput, setLlmOutput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [agentResults, setAgentResults] = useState({});
  const [agentLogs, setAgentLogs] = useState({});
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const loadPatients = () => {
    fetch(`${API_BASE_URL}/api/patients`)
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        if (data.length > 0 && !selectedPatientId) setSelectedPatientId(data[0].patient_id);
      })
      .catch(err => {
        console.error('Failed to load patients', err);
        setError('Failed to connect to backend server.');
      });
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handlePatientAdded = (newId) => {
    fetch(`${API_BASE_URL}/api/patients`)
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setSelectedPatientId(newId);
      });
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId || !llmOutput.trim()) return;
    
    setIsAnalyzing(true);
    setSessionId(null);
    setAgentResults({});
    setAgentLogs({});
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          llm_output: llmOutput
        })
      });

      if (!response.ok) throw new Error('Analysis failed to start');
      
      const data = await response.json();
      setSessionId(data.session_id);
      
    } catch (err) {
      console.error(err);
      setError('Error starting analysis. Is the backend running?');
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const eventSource = new EventSource(`${API_BASE_URL}/api/stream/${sessionId}`);

    eventSource.addEventListener('agent_update', (e) => {
      const parsed = JSON.parse(e.data);
      if (parsed.type === "stream") {
        setAgentLogs(prev => ({
          ...prev,
          [parsed.node]: (prev[parsed.node] || "") + parsed.chunk
        }));
      } else {
        const { node, data } = parsed;
        setAgentResults(prev => ({
          ...prev,
          [node]: data
        }));
      }
    });

    eventSource.addEventListener('done', () => {
      setIsAnalyzing(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      eventSource.close();
      setIsAnalyzing(false);
      setError('Stream connection lost.');
    };

    return () => eventSource.close();
  }, [sessionId]);

  const riskScore = agentResults.aggregate_risk?.risk_score || 0;
  const riskLevel = agentResults.aggregate_risk?.risk_level || 'PENDING';
  const finalFlags = agentResults.aggregate_risk?.final_flags || [];
  const rewritten = agentResults.maybe_rewrite?.rewritten_output;

  // Build the markdown summary string
  const summaryMarkdown = finalFlags.length > 0 
    ? finalFlags.map(f => `- **${f.verdict || f.outlier_type || f.issue}**: ${f.reason || f.suggested_revision || f.issue}`).join('\n')
    : "No critical safety issues or clinical outliers detected. The proposed plan appears aligned with the patient's context.";

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={28} color="#3b82f6" />
          <h1>MedForensics</h1>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>Clinical AI Safety Middleware</div>
      </header>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-red)', color: 'var(--status-red)' }}>
          {error}
        </div>
      )}

      <main className="main-content">
        <div className="left-panel glass-panel">
          <PatientSelector 
            patients={patients} 
            selectedId={selectedPatientId} 
            onChange={setSelectedPatientId} 
            onPatientAdded={handlePatientAdded}
          />
          <InputPanel 
            llmOutput={llmOutput} 
            setLlmOutput={setLlmOutput} 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
        </div>
        
        <div className="right-panel glass-panel">
          <div>
            <div 
              style={{ 
                padding: '1rem', 
                borderRadius: showSummary ? '12px 12px 0 0' : '12px', 
                background: riskLevel === 'PASS' ? 'rgba(16, 185, 129, 0.1)' : riskLevel === 'WARN' ? 'rgba(217, 119, 6, 0.1)' : riskLevel === 'HOLD' ? 'rgba(220, 38, 38, 0.1)' : 'var(--bg-card)',
                border: `1px solid ${riskLevel === 'PASS' ? 'var(--status-green)' : riskLevel === 'WARN' ? 'var(--status-amber)' : riskLevel === 'HOLD' ? 'var(--status-red)' : 'var(--glass-border)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: (sessionId || isAnalyzing) ? 'pointer' : 'default'
              }}
              onClick={() => (sessionId || isAnalyzing) && setShowSummary(!showSummary)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {riskLevel === 'WARN' || riskLevel === 'HOLD' ? <AlertTriangle size={24} color={riskLevel === 'HOLD' ? 'var(--status-red)' : 'var(--status-amber)'} /> : null}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Forensic Risk Assessment</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: '1.125rem',
                  color: riskLevel === 'PASS' ? 'var(--status-green)' : riskLevel === 'WARN' ? 'var(--status-amber)' : riskLevel === 'HOLD' ? 'var(--status-red)' : 'var(--text-muted)'
                }}>
                  {sessionId || isAnalyzing ? `${riskLevel} (${riskScore.toFixed(2)})` : 'READY'}
                </div>
                {(sessionId || isAnalyzing) && (
                  <div style={{ color: 'var(--text-muted)' }}>
                    {showSummary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                )}
              </div>
            </div>
            
            {showSummary && (
              <div className="animate-slide-in" style={{
                padding: '1.5rem',
                background: 'var(--bg-card)',
                border: `1px solid ${riskLevel === 'PASS' ? 'var(--status-green)' : riskLevel === 'WARN' ? 'var(--status-amber)' : riskLevel === 'HOLD' ? 'var(--status-red)' : 'var(--glass-border)'}`,
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                color: 'var(--text-main)',
                lineHeight: 1.6
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>Summary Report</h3>
                <ReactMarkdown>{summaryMarkdown}</ReactMarkdown>
              </div>
            )}
          </div>

          <AgentCards results={agentResults} logs={agentLogs} isAnalyzing={isAnalyzing} />

          {rewritten && (
            <div className="glass-card animate-slide-in" style={{ padding: '1.5rem', marginTop: 'auto', border: '1px solid var(--status-amber)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--status-amber)', fontWeight: 600 }}>
                Safe Rewrite Generated
              </div>
              <div style={{ lineHeight: 1.6, color: 'var(--text-main)' }}>
                {rewritten}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
