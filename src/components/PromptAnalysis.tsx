import { Brain, CheckCircle2, XCircle } from 'lucide-react';
import './ToolPanels.css';

interface PromptAnalysisProps {
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
}

function getScoreStatus(score: number): string {
  if (score >= 80) return 'Отлично';
  if (score >= 60) return 'Хорошо';
  return 'Требует улучшений';
}

export function PromptAnalysis({ score, strengths, weaknesses, summary }: PromptAnalysisProps) {
  const scoreColor = getScoreColor(score);

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
          <div 
            className="score-circle" 
            style={{ 
              '--score-percent': `${score}%`,
              '--score-color': scoreColor
            } as React.CSSProperties}
          >
            <span className="score-value" style={{ color: scoreColor }}>{score}</span>
          </div>
          <div>
            <div className="score-label">Качество промпта</div>
            <div className="score-status" style={{ color: scoreColor }}>
              {getScoreStatus(score)}
            </div>
          </div>
        </div>

        <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>{summary}</p>

        {strengths.length > 0 && (
          <>
            <h4 style={{ color: 'var(--score-high)', fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} />
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
            <h4 style={{ color: 'var(--score-low)', fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={16} />
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
