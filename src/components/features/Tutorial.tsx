import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Language, getTranslation } from '../../services/translations';

interface TutorialStep {
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  route?: string;
  waitForElement?: boolean;
}

const getTutorialSteps = (lang: Language): TutorialStep[] => {
  const t = getTranslation(lang);
  return [
  {
    title: t.welcome,
    description: t.welcomeDescription,
    route: '/'
  },
  {
    title: t.mainPageTitle,
    description: t.mainPageDescription,
    route: '/',
    targetElement: '.add-subject-btn',
    waitForElement: true
  },
  {
    title: t.viewSubjectDetail,
    description: t.viewSubjectDescription,
    route: '/',
    targetElement: '.subject-card'
  },
  {
    title: t.aiToolsTitle,
    description: t.aiToolsDescription,
    route: '/ai-tools',
    targetElement: '[href="/ai-tools"]'
  },
  {
    title: t.importTestsAI,
    description: t.importTestsDescription,
    route: '/ai-tools'
  },
  {
    title: t.historyStatsTitle,
    description: t.historyStatsDescription,
    route: '/history',
    targetElement: '[href="/history"]'
  },
  {
    title: t.yourResultsTitle,
    description: t.yourResultsDescription,
    route: '/history'
  },
  {
    title: t.navigationMenu,
    description: t.navigationDescription,
    targetElement: 'nav'
  },
  {
    title: t.exportImport,
    description: t.exportImportDescription,
    targetElement: '.data-management'
  },
  {
    title: t.basicWorkflow,
    description: t.basicWorkflowDescription,
    route: '/'
  },
  {
    title: t.allReady,
    description: t.allReadyDescription,
    route: '/'
  }
];
};

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, language }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const t = getTranslation(language);
  const tutorialSteps = getTutorialSteps(language);

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
      <div className="fixed inset-4 md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 z-[102] md:w-full md:max-w-2xl flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 md:p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl md:text-2xl font-bold">{step.title}</h2>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close tutorial"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-white/90">
              <span>Paso {currentStep + 1} de {tutorialSteps.length}</span>
              <div className="flex-1 bg-white/20 rounded-full h-2 max-w-xs">
                <div
                  className="bg-white h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 md:p-8 overflow-y-auto flex-1">
            <p className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button
              onClick={handleSkip}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors font-medium text-sm"
            >
              Saltar tutorial
            </button>

            <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className={`flex items-center justify-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-lg transition-all text-sm md:text-base flex-1 sm:flex-initial ${
                  isFirstStep
                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {isLastStep ? (
                <button
                  onClick={handleComplete}
                  className="flex items-center justify-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm md:text-base flex-1 sm:flex-initial"
                >
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Finalizar</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium text-sm md:text-base flex-1 sm:flex-initial"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
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
