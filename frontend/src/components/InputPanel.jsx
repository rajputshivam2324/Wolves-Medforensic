import React from 'react';
import { Send, Cpu } from 'lucide-react';

const SCENARIOS = [
  {
    label: 'Sample: Anaphylaxis Risk',
    text: `🏥 Clinical Note (Improved Version)

Chief Complaint:
Sore throat and fever

History of Present Illness:
The patient presents with acute onset of sore throat associated with high-grade fever (reported up to 102.4°F) and neck swelling. Symptoms began recently and have progressively worsened. No reported difficulty breathing or inability to swallow at present.

Physical Examination:

General: Febrile, mildly ill-appearing but not in acute distress
HEENT: Erythematous pharynx with tonsillar enlargement; tender anterior cervical lymphadenopathy
Airway: Patent, no signs of obstruction
Vitals: Febrile (102.4°F)

Investigations:

Rapid antigen detection test for Group A Streptococcus: Positive
🧾 Assessment

Acute streptococcal pharyngitis (Group A Streptococcus)

💊 Plan
1. Antibiotic Therapy
Amoxicillin 500 mg orally twice daily for 10 days
(Adjust based on allergy status; if penicillin allergy present, use alternative such as azithromycin or cephalexin depending on severity.)
2. Symptomatic Management
Paracetamol (acetaminophen) for fever and pain
Avoid routine use of NSAIDs in patients with renal impairment or other contraindications
Encourage adequate oral hydration and rest
3. Monitoring & Safety
Educate patient regarding warning signs:
Increasing throat pain
Difficulty swallowing or breathing
Persistent fever beyond 48–72 hours
Advise return immediately if red flag symptoms develop
4. Follow-Up
Re-evaluation if no clinical improvement within 48–72 hours`
  },
  {
    label: 'Sample: Renal Toxicity',
    text: `🏥 Clinical Note (Improved Version)

Chief Complaint:
Poorly controlled diabetes and fatigue

History of Present Illness:
The patient is a 68-year-old female presenting for routine diabetes management. She reports increased fatigue over the past month. No acute distress. Her recent HbA1c is elevated at 8.4%, indicating suboptimal glycemic control on her current regimen.

Physical Examination:

General: Fatigued but non-toxic appearing
CV: Regular rate and rhythm
Extremities: 1+ pitting edema bilaterally
Vitals: BP 138/85 mmHg, HR 78 bpm

Investigations:

Basic Metabolic Panel (BMP): 
- Creatinine: 1.8 mg/dL 
- eGFR: 29 mL/min/1.73m2 (indicating Stage 4 Chronic Kidney Disease)
HbA1c: 8.4%

🧾 Assessment

1. Uncontrolled Type 2 Diabetes Mellitus
2. Stage 4 Chronic Kidney Disease (CKD)

💊 Plan
1. Glycemic Management
Increase Metformin to 1000 mg orally twice daily
(Aggressive up-titration to address the elevated HbA1c.)
2. Lifestyle Modifications
Counsel on strict diabetic diet adherence and regular cardiovascular exercise.
3. Monitoring & Safety
Educate patient regarding symptoms of lactic acidosis:
- Unusual muscle pain
- Difficulty breathing
- Dizziness or lightheadedness
4. Follow-Up
Recheck HbA1c and renal function (BMP) in 3 months. Return sooner if symptoms worsen.`
  },
  {
    label: 'Sample: Safe Note',
    text: `🏥 Clinical Note (Improved Version)

Chief Complaint:
Routine 6-month follow-up

History of Present Illness:
Patient is a 55-year-old male with a history of essential hypertension, currently well-controlled. He presents today for a routine 6-month follow-up. He reports feeling well. No chest pain, shortness of breath, palpitations, or dizziness.

Physical Examination:

General: Well-developed, no acute distress
CV: Normal S1, S2. No murmurs, rubs, or gallops.
Resp: Clear to auscultation bilaterally.
Vitals: BP 122/78 mmHg, HR 72 bpm, O2 99% on room air.

Investigations:

Lipid Panel (Recent): Within normal limits.
BMP (Recent): Normal comprehensive metabolic profile.

🧾 Assessment

1. Essential Hypertension (Primary)
2. Hyperlipidemia (Primary)

💊 Plan
1. Medication Management
Essential Hypertension: Well-controlled on current regimen. Will continue Lisinopril 10 mg orally daily.
Hyperlipidemia: Stable. Continue Atorvastatin 20 mg orally daily.
2. Lifestyle Modifications
Counsel patient on the importance of continuing a low-sodium diet (DASH diet).
Maintain a routine of at least 30 minutes of cardiovascular exercise 5 days a week.
3. Monitoring & Safety
Advise to monitor blood pressure at home weekly. Return to clinic if readings consistently exceed 140/90.
4. Follow-Up
Follow up in 6 months with repeat lipid panel and BMP.`
  }
];

function InputPanel({ llmOutput, setLlmOutput, onAnalyze, isAnalyzing }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <Cpu size={18} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            LLM Output to Analyze
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {SCENARIOS.map(s => (
            <button 
              key={s.label}
              className="btn-secondary"
              onClick={() => setLlmOutput(s.text)}
              disabled={isAnalyzing}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={llmOutput}
        onChange={(e) => setLlmOutput(e.target.value)}
        placeholder="Paste clinical AI output here..."
        disabled={isAnalyzing}
        style={{ flex: 1 }}
      />

      <button 
        className="btn-primary" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'auto' }}
        onClick={onAnalyze}
        disabled={isAnalyzing || !llmOutput.trim()}
      >
        {isAnalyzing ? (
          <>
            <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            Analyzing...
          </>
        ) : (
          <>
            <Send size={18} />
            Run Agents
          </>
        )}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}} />
    </div>
  );
}

export default InputPanel;
