import { Brain, CheckCircle2, XCircle } from 'lucide-react';
import './ToolPanels.css';

interface PromptAnalysisProps {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export function PromptAnalysis({ score, strengths, weaknesses, summary }: PromptAnalysisProps) {
  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <Brain size={24} />
        </div>
        <h3 className="tool-panel-title">Анализ промпта</h3>
      </div>

      <div className="tool-panel-content">
        <div className="analysis-score">
          <div className="score-circle" style={{ '--score-percent': `${score}%` } as React.CSSProperties}>
            <span className="score-value">{score}</span>
          </div>
          <div>
            <div className="score-label">Качество промпта</div>
            <div style={{ color: score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444' }}>
              {score >= 80 ? 'Отлично' : score >= 60 ? 'Хорошо' : 'Требует улучшений'}
            </div>
          </div>
        </div>

        <p style={{ marginBottom: 16, color: '#d1d5db' }}>{summary}</p>

        {strengths.length > 0 && (
          <>
            <h4 style={{ color: '#22c55e', fontSize: 14, marginBottom: 8 }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Сильные стороны
            </h4>
            <ul className="strengths-list">
              {strengths.map((strength, index) => (
                <li key={index}>✓ {strength}</li>
              ))}
            </ul>
          </>
        )}

        {weaknesses.length > 0 && (
          <>
            <h4 style={{ color: '#ef4444', fontSize: 14, marginBottom: 8 }}>
              <XCircle size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Слабые стороны
            </h4>
            <ul className="weaknesses-list">
              {weaknesses.map((weakness, index) => (
                <li key={index}>⚠ {weakness}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
