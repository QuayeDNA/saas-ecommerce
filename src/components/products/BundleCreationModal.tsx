import { useState, useEffect } from "react";
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

export const BundleCreationModal: React.FC<BundleCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  packageId,
  providerId,
  providerCode
}) => {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [isOpen]);

  const handleFormClose = () => {
    setShowForm(false);
    onClose();
  };

  const handleFormSubmit = async (data: Bundle) => {
    await onSubmit(data);
    handleFormClose();
  };

  return (
    <BundleFormModal
      open={showForm}
      onClose={handleFormClose}
      onSubmit={handleFormSubmit}
      initialData={initialData}
      packageId={packageId}
      providerId={providerId}
      providerCode={providerCode}
    />
  );
};
