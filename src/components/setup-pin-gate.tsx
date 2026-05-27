// src/components/setup-pin-gate.tsx
import { useState } from "react";
import { useAuth } from "../hooks";
import {
  Button,
  Input,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "../design-system";
import { FaLock, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

export const SetupPinGate = () => {
  const { authState, setupPin } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // Validate PIN
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
    } catch (error) {
      console.error("PIN setup failed:", error);
      // Context will handle the global error
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--bg-surface-alt)] to-[var(--bg-surface)] p-4 sm:p-6 fixed inset-0 z-50 overflow-y-auto">
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-[var(--bg-surface-alt)] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaShieldAlt className="text-primary text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Set Up Security PIN
            </h2>
            <p className="mt-2 text-[var(--text-secondary)] text-sm">
              For your security, we've upgraded our authentication system.
              Please set a secure 4-digit PIN. This PIN will be used for future
              password resets and critical account operations.
            </p>
          </CardHeader>

          <CardBody>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {(authState.error || localError) && (
                <Alert
                  status="error"
                  variant="left-accent"
                  className="flex items-start"
                >
                  <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>{localError || authState.error}</span>
                </Alert>
              )}

              <div className="space-y-4">
                <Input
                  id="pin"
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  label="Create 4-Digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  placeholder="••••"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaLock className="text-[var(--text-muted)]" />}
                />
              </div>

              <Input
                id="confirmPin"
                name="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                label="Confirm 4-Digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                required
                placeholder="••••"
                size="md"
                variant="outline"
                colorScheme="default"
                fullWidth
                leftIcon={<FaLock className="text-[var(--text-muted)]" />}
                />
              <Button
                type="submit"
                disabled={
                  authState.isLoading ||
                  pin.length !== 4 ||
                  confirmPin.length !== 4
                }
                isLoading={authState.isLoading}
                variant="primary"
                colorScheme="default"
                size="lg"
                fullWidth
              >
                {authState.isLoading ? "Setting up..." : "Save Security PIN"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
