import { useState } from 'react';
import { Sparkles, ThumbsUp, Star } from 'lucide-react';
import './ToolPanels.css';

interface AIAssessmentProps {
  aiScore?: number;
  usefulness?: number;
  accuracy?: number;
  completeness?: number;
  onUserRate?: (rating: number) => void;
}

function getBadgeType(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
}

export function AIAssessment({ 
  aiScore = 85, 
  usefulness = 80, 
  accuracy = 90, 
  completeness = 75,
  onUserRate 
}: AIAssessmentProps) {
  const [userRating, setUserRating] = useState<number>(0);
  const [rated, setRated] = useState(false);

  const handleRate = (rating: number) => {
    setUserRating(rating);
    setRated(true);
    onUserRate?.(rating);
  };

  const badgeType = getBadgeType(aiScore);
  const scoreColor = getScoreColor(aiScore);

  return (
    <div className="tool-panel ai-assessment">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <Sparkles size={24} />
        </div>
        <h3 className="tool-panel-title">Оценка ответа ИИ</h3>
      </div>

      <div className="tool-panel-content">
        {/* Главный бейдж с оценкой */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div 
            className="request-badge" 
            style={{ 
              background: `linear-gradient(135deg, ${scoreColor}25, ${scoreColor}15)`,
              border: `1px solid ${scoreColor}40`,
              color: scoreColor,
              padding: '8px 16px',
              fontSize: '24px',
              fontWeight: 700,
              borderRadius: '100px'
            }}
          >
            {aiScore}/100
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: 4 }}>Качество ответа</div>
            <div style={{ fontSize: '13px', color: scoreColor, fontWeight: 500 }}>
              {badgeType === 'high' ? 'Отлично' : badgeType === 'medium' ? 'Хорошо' : 'Требует улучшений'}
            </div>
          </div>
        </div>

        <div className="assessment-grid">
          <div className="assessment-item">
            <div className="assessment-value" style={{ color: getScoreColor(usefulness) }}>{usefulness}%</div>
            <div className="assessment-label">Полезность</div>
          </div>
          <div className="assessment-item">
            <div className="assessment-value" style={{ color: getScoreColor(accuracy) }}>{accuracy}%</div>
            <div className="assessment-label">Точность</div>
          </div>
          <div className="assessment-item">
            <div className="assessment-value" style={{ color: getScoreColor(completeness) }}>{completeness}%</div>
            <div className="assessment-label">Полнота</div>
          </div>
        </div>

        <div className="user-rating">
          <div className="rating-title">
            <ThumbsUp size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Оцените этот ответ
          </div>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`rating-star ${userRating >= star ? 'active' : ''}`}
                onClick={() => handleRate(star)}
                type="button"
              >
                <Star size={20} fill={userRating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          {rated && (
            <div className="rating-feedback">
              {userRating >= 4 
                ? '✓ Спасибо за оценку! Рад, что ответ был полезен.' 
                : '✓ Спасибо за отзыв! Буду стараться лучше.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
