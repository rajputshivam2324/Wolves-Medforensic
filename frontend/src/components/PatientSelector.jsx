import React, { useState } from 'react';
import { User, Plus, Check, X } from 'lucide-react';

function PatientSelector({ patients, selectedId, onChange, onPatientAdded }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', record: '' });

  const handleSelect = (e) => {
    if (e.target.value === 'ADD_NEW') {
      setIsAdding(true);
      onChange('');
    } else {
      setIsAdding(false);
      onChange(e.target.value);
    }
  };

  const handleCreate = async () => {
    if (!newPatient.name.trim()) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPatient.name,
          age: parseInt(newPatient.age) || 30,
          record: { clinical_history: newPatient.record }
        })
      });
      if (!res.ok) throw new Error("Failed to create patient");
      const data = await res.json();
      setIsAdding(false);
      setNewPatient({ name: '', age: '', record: '' });
      if (onPatientAdded) onPatientAdded(data.patient_id); // Refresh list and select
    } catch (e) {
      console.error(e);
    }
  };
  if (patients.length === 0) return <div>Loading patients...</div>;

  const selectedPatient = patients.find(p => p.patient_id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
        <User size={18} />
        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Patient Context
        </h3>
      </div>
      
      <select 
        value={isAdding ? 'ADD_NEW' : selectedId} 
        onChange={handleSelect}
        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
      >
        <option value="" disabled>Select from clinical DB...</option>
        {patients.map(p => (
          <option key={p.patient_id} value={p.patient_id}>
            {p.name} (Age {p.age}) - {p.patient_id}
          </option>
        ))}
        <option value="ADD_NEW">➕ Create New Patient...</option>
      </select>

      {isAdding && (
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Patient Name" 
              value={newPatient.name} 
              onChange={e => setNewPatient({...newPatient, name: e.target.value})}
              style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
            />
            <input 
              type="number" 
              placeholder="Age" 
              value={newPatient.age} 
              onChange={e => setNewPatient({...newPatient, age: e.target.value})}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
            />
          </div>
          <textarea 
            placeholder="Brief Clinical History (e.g. Past Medical History, Allergies)" 
            value={newPatient.record} 
            onChange={e => setNewPatient({...newPatient, record: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', minHeight: '80px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setIsAdding(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><X size={16}/> Cancel</button>
            <button className="btn-primary" onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.5rem 1rem' }}><Check size={16}/> Save & Select</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientSelector;
