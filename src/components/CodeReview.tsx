import { Code2, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import './ToolPanels.css';

interface ReviewIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
}

interface CodeReviewProps {
  issues: ReviewIssue[];
  summary?: string;
}

export function CodeReview({ issues, summary }: CodeReviewProps) {
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <Code2 size={24} />
        </div>
        <h3 className="tool-panel-title">Code Review</h3>
      </div>

      <div className="tool-panel-content">
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {criticalCount > 0 && (
            <div style={{ color: '#ef4444', fontSize: 14 }}>
              🔴 {criticalCount} критических
            </div>
          )}
          {warningCount > 0 && (
            <div style={{ color: '#f59e0b', fontSize: 14 }}>
              🟡 {warningCount} предупреждений
            </div>
          )}
          {infoCount > 0 && (
            <div style={{ color: '#3b82f6', fontSize: 14 }}>
              🔵 {infoCount} заметок
            </div>
          )}
        </div>

        {summary && (
          <p style={{ marginBottom: 16, color: '#d1d5db' }}>{summary}</p>
        )}

        {issues.map((issue, index) => (
          <div
            key={index}
            className={`review-${issue.severity}`}
          >
            <div className="review-title">
              {issue.severity === 'critical' && <AlertTriangle size={18} />}
              {issue.severity === 'warning' && <AlertCircle size={18} />}
              {issue.severity === 'info' && <Info size={18} />}
              {issue.title}
            </div>
            <div className="review-description">{issue.description}</div>
          </div>
        ))}

        {issues.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#22c55e' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
            <p>Код не содержит критических ошибок!</p>
          </div>
        )}
      </div>
    </div>
  );
}
