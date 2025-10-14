import { useState } from "react";
import { 
  FaCube, 
  FaPlus, 
  FaArrowLeft,
  FaLayerGroup
} from "react-icons/fa";
import { 
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Card,
  CardBody,
  Badge
} from "../../design-system";
import { BundleFormModal } from "./BundleFormModal";
import type { Bundle } from "../../types/package";

interface BundleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Bundle) => Promise<void>;
  initialData?: Bundle | null;
  packageId?: string;
  providerId?: string;
  providerCode?: string;
}

type CreationStep = 'select' | 'single' | 'bulk';

export const BundleCreationModal: React.FC<BundleCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  packageId,
  providerId,
  providerCode
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>('select');
  const [showSingleForm, setShowSingleForm] = useState(false);

  const handleClose = () => {
    setCurrentStep('select');
    setShowSingleForm(false);
    onClose();
  };

  const handleSelectSingle = () => {
    setCurrentStep('single');
    setShowSingleForm(true);
  };

  const handleSelectBulk = () => {
    setCurrentStep('bulk');
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
    setShowSingleForm(false);
  };

  const handleSingleFormClose = () => {
    setShowSingleForm(false);
    setCurrentStep('select');
  };

  const handleSingleFormSubmit = async (data: Bundle) => {
    await onSubmit(data);
    handleClose();
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Bundle Creation Type
        </h3>
        <p className="text-sm text-gray-600">
          Select how you want to create bundles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Single Bundle Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200"
          onClick={handleSelectSingle}
        >
          <CardBody className="text-center p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <FaCube className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Single Bundle
                </h4>
                <p className="text-sm text-gray-600">
                  Create one bundle at a time with detailed configuration
                </p>
              </div>
              <Badge colorScheme="info" size="sm">
                Recommended
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* Bulk Bundle Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-purple-200"
          onClick={handleSelectBulk}
        >
          <CardBody className="text-center p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-purple-100 rounded-full">
                <FaLayerGroup className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Bulk Creation
                </h4>
                <p className="text-sm text-gray-600">
                  Create multiple bundles with predefined templates
                </p>
              </div>
              <Badge colorScheme="warning" size="sm">
                Coming Soon
              </Badge>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const renderBulkStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FaLayerGroup className="text-purple-600 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Bulk Bundle Creation
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          This feature is coming soon! You'll be able to create multiple bundles at once using predefined templates.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">What's Coming:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Template-based bundle creation</li>
            <li>• Batch upload from CSV files</li>
            <li>• Predefined bundle configurations</li>
            <li>• Bulk pricing and validity settings</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'select':
        return renderSelectStep();
      case 'single':
        return null; // Single form will be rendered separately
      case 'bulk':
        return renderBulkStep();
      default:
        return renderSelectStep();
    }
  };

  const renderFooter = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        );
      case 'single':
        return null; // Single form handles its own footer
      case 'bulk':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBackToSelect}>
              <FaArrowLeft className="mr-2" />
              Back to Selection
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      {/* Main Modal */}
      <Dialog isOpen={isOpen && currentStep !== 'single'} onClose={handleClose}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaPlus className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {currentStep === 'select' && 'Create Bundle'}
                {currentStep === 'bulk' && 'Bulk Bundle Creation'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentStep === 'select' && 'Choose your bundle creation method'}
                {currentStep === 'bulk' && 'Coming soon feature'}
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          {renderContent()}
        </DialogBody>
        <DialogFooter>
          {renderFooter()}
        </DialogFooter>
      </Dialog>

      {/* Single Bundle Form Modal */}
      <BundleFormModal
        open={showSingleForm}
        onClose={handleSingleFormClose}
        onSubmit={handleSingleFormSubmit}
        initialData={initialData}
        packageId={packageId}
        providerId={providerId}
        providerCode={providerCode}
      />
    </>
  );
}; 