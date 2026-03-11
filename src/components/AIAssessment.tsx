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

  return (
    <div className="tool-panel ai-assessment">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <Sparkles size={24} />
        </div>
        <h3 className="tool-panel-title">Оценка ответа ИИ</h3>
      </div>

      <div className="tool-panel-content">
        <div className="assessment-grid">
          <div className="assessment-item">
            <div className="assessment-value">{aiScore}%</div>
            <div className="assessment-label">Общее качество</div>
          </div>
          <div className="assessment-item">
            <div className="assessment-value">{usefulness}%</div>
            <div className="assessment-label">Полезность</div>
          </div>
          <div className="assessment-item">
            <div className="assessment-value">{accuracy}%</div>
            <div className="assessment-label">Точность</div>
          </div>
          <div className="assessment-item">
            <div className="assessment-value">{completeness}%</div>
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
