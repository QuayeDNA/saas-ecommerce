import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  FormField,
  Input,
  Button,
  Alert,
} from "../../design-system";
import { useAuth } from "../../hooks";
import { FaExclamationTriangle } from "react-icons/fa";

interface UpdatePinDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdatePinDialog: React.FC<UpdatePinDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { authState, setupPin } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setPin("");
    setConfirmPin("");
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!/^\d{4}$/.test(pin)) {
      setLocalError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setLocalError("PINs do not match.");
      return;
    }

    try {
      await setupPin(pin);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to update PIN:", error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="md">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Update Security PIN
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Create a new 4-digit security PIN for your account. This PIN is
              required for secure account operations and password resets.
            </p>

            {(authState.error || localError) && (
              <Alert
                status="error"
                variant="left-accent"
                className="flex items-start mb-4"
              >
                <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                <span>{localError || authState.error}</span>
              </Alert>
            )}

            <FormField>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                label="New 4-Digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                required
                fullWidth
              />
            </FormField>

            <FormField>
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                label="Confirm New PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                required
                fullWidth
              />
            </FormField>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            colorScheme="default"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            colorScheme="default"
            isLoading={authState.isLoading}
            disabled={
              authState.isLoading || pin.length !== 4 || confirmPin.length !== 4
            }
          >
            Update PIN
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
