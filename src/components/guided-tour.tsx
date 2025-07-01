// src/components/guided-tour.tsx

/**
 * Guided Tour Component
 * 
 * Features:
 * - Step-by-step introduction to key features
 * - Highlights important elements on the page
 * - Progress tracking
 * - Dismissible and can be restarted
 * - Mobile-friendly design
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaArrowLeft, FaTimes, FaLightbulb, FaRedo } from 'react-icons/fa';
import { Button } from '../design-system';

export interface TourStep {
  target: string; // CSS selector of the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  action?: () => void; // Optional action to perform when reaching this step
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ 
  steps, 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  
  // Update target element position on window resize or step change
  useEffect(() => {
    if (!isOpen) return;
    
    const updateTargetRect = () => {
      const currentTarget = steps[currentStep]?.target;
      if (!currentTarget) return;
      
      const element = document.querySelector(currentTarget);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      
      // Position tooltip based on target element position
      const position = steps[currentStep]?.position || 'bottom';
      
      let top, left;
      
      switch(position) {
        case 'top':
          top = rect.top - 10 - 150; // 150px is approx height of tooltip
          left = rect.left + rect.width / 2 - 150; // 150px is half the width of tooltip
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 75;
          left = rect.right + 10;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 75;
          left = rect.left - 10 - 300; // 300px is approx width of tooltip
          break;
        case 'bottom':
        default:
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - 150;
      }
      
      // Keep tooltip within viewport
      if (left < 20) left = 20;
      if (left > window.innerWidth - 320) left = window.innerWidth - 320;
      if (top < 20) top = 20;
      if (top > window.innerHeight - 200) top = window.innerHeight - 200;
      
      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    };
    
    // Highlight the target element
    const highlightTarget = () => {
      const currentTarget = steps[currentStep]?.target;
      if (!currentTarget) return;
      
      const element = document.querySelector(currentTarget);
      if (!element) return;
      
      // Add highlight class
      element.classList.add('tour-highlight');
      
      // Scroll element into view if needed
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };
    
    // Run optional action for current step
    const runStepAction = () => {
      const action = steps[currentStep]?.action;
      if (action) {
        action();
      }
    };
    
    updateTargetRect();
    highlightTarget();
    runStepAction();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateTargetRect);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      
      // Remove highlight class from all elements
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentStep, isOpen, steps]);
  
  // Handle navigation
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    onComplete();
  };
  
  // Skip the tour
  const handleSkip = () => {
    onClose();
  };
  
  // Removed unused handleRestart function
  
  if (!isOpen) return null;
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" />
      
      {/* Spotlight on target element */}
      {targetRect && (
        <div 
          className="absolute rounded-md"
          style={{
            top: targetRect.top - 8 + window.scrollY,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            zIndex: 60,
          }}
        />
      )}
      
      {/* Tooltip */}
      <div 
        className="absolute bg-white rounded-lg shadow-xl w-80 p-4 pointer-events-auto z-70 border-2 border-blue-500"
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaLightbulb className="text-yellow-500 mr-2" />
            <h3 className="font-bold text-gray-900">{steps[currentStep]?.title}</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close tour"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="text-gray-600 mb-4">
          {steps[currentStep]?.content}
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full mb-4">
          <div 
            className="h-1 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Footer with navigation */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="flex items-center"
              >
                <FaArrowLeft className="mr-1" /> Back
              </Button>
            )}
            
            {currentStep === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                Skip
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex items-center"
              >
                Next <FaArrowRight className="ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleComplete}
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Helper component to trigger the tour
interface TourTriggerProps {
  onStartTour: () => void;
  className?: string;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({ onStartTour, className = '' }) => {
  return (
    <button
      onClick={onStartTour}
      className={`inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 ${className}`}
    >
      <FaRedo className="mr-1" /> Take the tour
    </button>
  );
};

// Add CSS for tour highlighting to global styles
const addTourStyles = () => {
  const styleId = 'guided-tour-styles';
  
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = `
      .tour-highlight {
        position: relative;
        z-index: 60;
        animation: tour-pulse 1.5s infinite;
      }
      
      @keyframes tour-pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
        }
        70% {
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

// Execute on import
addTourStyles();

// Export the component as default
export default GuidedTour;
// No need to re-export TourStep and TourTrigger as they are already exported with 'export' keyword
