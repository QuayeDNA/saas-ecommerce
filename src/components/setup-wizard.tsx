// src/components/setup-wizard.tsx

/**
 * Setup Wizard Component
 * 
 * Features:
 * - Multi-step guided setup process
 * - Progress tracking
 * - Form validation
 * - Mobile-first responsive design
 * - Animated transitions between steps
 */

import React, { useState } from 'react';
import { Button, Alert } from '../design-system';
import { FaCheck, FaArrowLeft, FaArrowRight, FaTimes, FaCheckCircle } from 'react-icons/fa';

export interface SetupStep {
  id: string;
  title: string;
  description?: string;
  component: React.ReactNode;
  isOptional?: boolean;
  isCompleted?: boolean;
  isEnabled?: boolean;
}

interface SetupWizardProps {
  steps: SetupStep[];
  onComplete: () => void;
  onClose?: () => void;
  showSkip?: boolean;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  steps,
  onComplete,
  onClose,
  showSkip = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(
    steps.reduce((acc, step) => ({ ...acc, [step.id]: !!step.isCompleted }), {})
  );
  const [isSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current step
  const currentStep = steps[currentStepIndex];

  // Check if a step is completed
  const isStepCompleted = (stepId: string) => completedSteps[stepId];

  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepId]: true }));
  };

  // Move to the next step
  const handleNext = async () => {
    setError(null);
    
    try {
      // Mark current step as completed
      markStepCompleted(currentStep.id);
      
      // If this is the last step, call onComplete
      if (currentStepIndex === steps.length - 1) {
        onComplete();
        return;
      }
      
      // Otherwise, move to next step
      setCurrentStepIndex(currentStepIndex + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Move to the previous step
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Skip to a specific step (if enabled)
  const jumpToStep = (index: number) => {
    // Only allow jumping to enabled steps
    if (index >= 0 && index < steps.length && (steps[index].isEnabled !== false)) {
      setCurrentStepIndex(index);
    }
  };

  // Skip the wizard entirely
  const handleSkip = () => {
    if (onClose) {
      onClose();
    }
  };

  // Calculate overall progress
  const progress = Math.round(
    (Object.values(completedSteps).filter(Boolean).length / steps.length) * 100
  );

  return (
    <div className="min-h-[500px] flex flex-col">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {currentStep.title}
          </h2>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
              aria-label="Close wizard"
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        {currentStep.description && (
          <p className="text-gray-600 mb-4">{currentStep.description}</p>
        )}
        
        {/* Progress bar */}
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex mt-4 items-center justify-between">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => jumpToStep(index)}
              disabled={step.isEnabled === false}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${index === currentStepIndex 
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                  : isStepCompleted(step.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700'
                }
                ${step.isEnabled === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={step.title}
            >
              {isStepCompleted(step.id) ? <FaCheck size={12} /> : index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert status="error" variant="left-accent" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Step content */}
      <div className="flex-grow">
        <div className="animate-fadeIn">
          {currentStep.component}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevious}
              className="flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back
            </Button>
          )}
        </div>
        
        <div className="flex gap-3">
          {showSkip && !isStepCompleted(currentStep.id) && currentStep.isOptional && (
            <Button
              variant="ghost"
              size="md"
              onClick={handleSkip}
            >
              Skip
            </Button>
          )}
          
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            isLoading={isSubmitting}
            className="flex items-center"
          >
            {currentStepIndex === steps.length - 1 ? (
              'Complete Setup'
            ) : (
              <>
                Next <FaArrowRight className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sample step components
export const WelcomeStep = () => (
  <div className="text-center py-8">
    <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
      <FaCheckCircle className="text-blue-600 text-3xl" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Complete this quick setup to get started with your account and customize your experience.
    </p>
  </div>
);

export const ProfileStep = () => {
  // Implementation of a profile setup step would go here
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Complete Your Profile</h3>
      <p className="text-gray-600">
        Add your personal details to get the most out of your account.
      </p>
      {/* Form fields would go here */}
    </div>
  );
};

export default SetupWizard;
