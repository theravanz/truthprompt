import { MessageCircleQuestion } from 'lucide-react';
import './ToolPanels.css';

interface ClarifyingQuestionsProps {
  questions: string[];
}

export function ClarifyingQuestions({ questions }: ClarifyingQuestionsProps) {
  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <MessageCircleQuestion size={24} />
        </div>
        <h3 className="tool-panel-title">Уточняющие вопросы</h3>
      </div>

      <div className="tool-panel-content">
        <p style={{ marginBottom: 16, color: '#9ca3af' }}>
          Чтобы я мог выполнить работу максимально качественно, ответьте на несколько вопросов:
        </p>

        <ul className="questions-list">
          {questions.map((question, index) => (
            <li key={index}>
              <span className="question-number">{index + 1}</span>
              <span className="question-text">{question}</span>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: 16, fontSize: 13, color: '#6b7280', fontStyle: 'italic' }}>
          💡 Эти вопросы помогут мне лучше понять вашу задачу и избежать ошибок в решении
        </p>
      </div>
    </div>
  );
}
