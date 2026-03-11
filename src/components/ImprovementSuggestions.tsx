import { Lightbulb } from 'lucide-react';
import './ToolPanels.css';

interface ImprovementSuggestion {
  id: number;
  title: string;
  description: string;
}

interface ImprovementSuggestionsProps {
  suggestions: ImprovementSuggestion[];
}

export function ImprovementSuggestions({ suggestions }: ImprovementSuggestionsProps) {
  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <Lightbulb size={24} />
        </div>
        <h3 className="tool-panel-title">Предложения по улучшению</h3>
      </div>

      <div className="tool-panel-content">
        <p style={{ marginBottom: 16, color: '#9ca3af' }}>
          Как можно дополнить запрос или улучшить решение:
        </p>

        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <div className="suggestion-icon">
                <Lightbulb size={18} />
              </div>
              <div className="suggestion-text">
                <strong style={{ color: '#22c55e', display: 'block', marginBottom: 4 }}>
                  {suggestion.title}
                </strong>
                {suggestion.description}
              </div>
            </li>
          ))}
        </ul>

        {suggestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>
            <Lightbulb size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p>Предложений нет — запрос составлен отлично!</p>
          </div>
        )}
      </div>
    </div>
  );
}
