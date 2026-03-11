import { CheckSquare, Check } from 'lucide-react';
import './ToolPanels.css';

interface ToDoStep {
  id: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface ToDoPlanProps {
  steps: ToDoStep[];
  currentStep?: number;
}

export function ToDoPlan({ steps, currentStep = 0 }: ToDoPlanProps) {
  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <div className="tool-panel-icon">
          <CheckSquare size={24} />
        </div>
        <h3 className="tool-panel-title">План выполнения</h3>
      </div>

      <div className="tool-panel-content">
        <p style={{ marginBottom: 16, color: '#9ca3af' }}>
          Пошаговый план решения вашей задачи:
        </p>

        <ul className="todo-steps">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`todo-step ${step.status === 'completed' ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            >
              {step.status === 'completed' ? (
                <div className="todo-check">
                  <Check size={14} />
                </div>
              ) : (
                <div className="todo-step-number">{index + 1}</div>
              )}
              <span className="todo-step-text">{step.description}</span>
              {index === currentStep && step.status !== 'completed' && (
                <span style={{ fontSize: 12, color: '#818cf8' }}>⏳</span>
              )}
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 16, padding: 12, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8 }}>
          <div style={{ fontSize: 13, color: '#818cf8' }}>
            📊 Прогресс: {steps.filter(s => s.status === 'completed').length} из {steps.length} шагов выполнено
          </div>
        </div>
      </div>
    </div>
  );
}
