import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  route?: string;
  waitForElement?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '¡Bienvenido a StudyWithTest!',
    description: 'Esta aplicación te ayudará a crear, gestionar y ejecutar tests de estudio para mejorar tu aprendizaje. Te guiaremos a través de las funcionalidades principales.',
    route: '/'
  },
  {
    title: 'Página Principal - Asignaturas',
    description: 'Esta es tu página principal donde verás todas tus asignaturas. Desde aquí puedes crear nuevas asignaturas haciendo clic en el botón "New Subject".',
    route: '/',
    targetElement: '.add-subject-btn',
    waitForElement: true
  },
  {
    title: 'Ver Detalle de Asignatura',
    description: 'Si ya tienes asignaturas creadas, haz clic en cualquier tarjeta para ver sus detalles. Aquí podrás gestionar todos los tests relacionados con esa asignatura.',
    route: '/',
    targetElement: '.subject-card'
  },
  {
    title: 'Herramientas de IA',
    description: 'En la sección "AI Tools" puedes generar tests automáticamente a partir de documentos PDF, textos o apuntes usando inteligencia artificial. Es la forma más rápida de crear contenido.',
    route: '/ai-tools',
    targetElement: '[href="/ai-tools"]'
  },
  {
    title: 'Importar Tests con IA',
    description: 'Aquí puedes pegar texto, subir PDFs o usar tu API de OpenAI para generar preguntas automáticamente. Una vez generadas, puedes seleccionar la asignatura destino y guardar el test.',
    route: '/ai-tools'
  },
  {
    title: 'Historial y Estadísticas',
    description: 'En esta sección puedes ver todo tu progreso: tests realizados, puntuaciones a lo largo del tiempo, tendencias de mejora y preguntas que necesitas repasar.',
    route: '/history',
    targetElement: '[href="/history"]'
  },
  {
    title: 'Tus Resultados',
    description: 'Aquí se mostrarán todos los intentos de tests que hayas realizado, con gráficos de rendimiento, preguntas falladas y marcadas. Es tu centro de análisis de progreso.',
    route: '/history'
  },
  {
    title: 'Menú de Navegación',
    description: 'Usa el menú lateral para navegar entre secciones. En dispositivos móviles, puedes abrir el menú con el botón de hamburguesa en la parte superior.',
    targetElement: 'nav'
  },
  {
    title: 'Exportar e Importar Datos',
    description: 'En la parte inferior del menú lateral encontrarás opciones para exportar todos tus datos a un archivo JSON y para importar datos desde otros dispositivos o copias de seguridad. ¡Así nunca perderás tu progreso!',
    targetElement: '.data-management'
  },
  {
    title: 'Flujo Básico de Uso',
    description: '1) Crea una asignatura 2) Añade tests (manualmente o con IA) 3) Ejecuta los tests en modo Study o Exam 4) Revisa tus estadísticas y repasa las preguntas falladas. ¡Así de simple!',
    route: '/'
  },
  {
    title: '¡Todo Listo!',
    description: 'Ya conoces las funcionalidades principales. Puedes volver a ver este tutorial en cualquier momento haciendo clic en el icono de ayuda en la esquina superior. ¡Buena suerte con tus estudios!',
    route: '/'
  }
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to the appropriate route when step changes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setHighlightedElement(null);
      return;
    }

    const step = tutorialSteps[currentStep];
    
    // Clear highlight immediately when changing steps
    setHighlightedElement(null);
    
    // Navigate to the route if specified and different from current
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [currentStep, isOpen, navigate, location.pathname]);

  // Handle element highlighting after navigation
  useEffect(() => {
    if (!isOpen) return;

    const step = tutorialSteps[currentStep];
    
    const highlightElement = () => {
      if (step.targetElement) {
        const element = document.querySelector(step.targetElement) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          // Wait a bit for any animations, then scroll
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          return true;
        }
        return false;
      } else {
        setHighlightedElement(null);
        return true;
      }
    };

    // If the step needs to wait for an element to appear, retry a few times
    if (step.waitForElement && step.targetElement) {
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(() => {
        attempts++;
        if (highlightElement() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    } else {
      // Small delay to let the route render
      const timeout = setTimeout(highlightElement, 300);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, isOpen, location.pathname]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[100] transition-opacity" onClick={handleSkip} />
      
      {/* Highlight effect for targeted elements */}
      {highlightedElement && (
        <div
          className="fixed z-[101] pointer-events-none"
          style={{
            top: `${highlightedElement.getBoundingClientRect().top - 6}px`,
            left: `${highlightedElement.getBoundingClientRect().left - 6}px`,
            width: `${highlightedElement.getBoundingClientRect().width + 12}px`,
            height: `${highlightedElement.getBoundingClientRect().height + 12}px`,
            border: '4px solid #22c55e',
            borderRadius: '12px',
            boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.6), inset 0 0 20px rgba(34, 197, 94, 0.1)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}

      {/* Tutorial Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[102] w-full max-w-2xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close tutorial"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/90">
              <span>Paso {currentStep + 1} de {tutorialSteps.length}</span>
              <div className="flex-1 bg-white/20 rounded-full h-2 max-w-xs">
                <div
                  className="bg-white h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-slate-700 text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-700 transition-colors font-medium"
            >
              Saltar tutorial
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isFirstStep
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Anterior</span>
              </button>

              {isLastStep ? (
                <button
                  onClick={handleComplete}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Check className="w-5 h-5" />
                  <span>Finalizar</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
};

export default Tutorial;
