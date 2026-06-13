import React, { memo } from "react";
import {
  Button,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
} from "../../../design-system";
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaIdCard,
  FaArrowRight,
  FaArrowLeft,
  FaPhone,
  FaBolt,
  FaWhatsapp,
} from "react-icons/fa6";
import type { PublicBundle, PublicOrderResult } from "../../../services/storefront.service";
import type { ThemeConfig, PaymentAccount } from "../types";
import { fmt, fmtValidity, normalizePhone, normalizeWhatsappNumber } from "../utils";

// =============================================================================
// OrderDialog — 3-step dialog: details → payment → confirmation
// =============================================================================

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: { bundle: PublicBundle; customerPhone: string } | null;
  bundle: PublicBundle;
  theme: ThemeConfig;
  storeClosed: boolean;
  storeClosedMessage: string;
  storefrontsClosed: boolean;
  storefrontsClosedMessage: string;
  // Step 1 state
  orderStep: "details" | "payment" | "confirmation";
  setOrderStep: (step: "details" | "payment" | "confirmation") => void;
  orderPhone: string;
  setOrderPhone: (value: string) => void;
  orderCustomerName: string;
  setOrderCustomerName: (value: string) => void;
  orderGhanaCard: string;
  setOrderGhanaCard: (value: string) => void;
  phoneOk: boolean;
  step1Valid: boolean;
  confirmDetails: () => void;
  feeEstimate: { charge: number; fee: number } | null;
  // Step 2 state
  customerName: string;
  setCustomerName: (value: string) => void;
  paymentType: string;
  setPaymentType: (type: "paystack" | "mobile_money" | "bank_transfer") => void;
  transactionRef: string;
  setTransactionRef: (value: string) => void;
  paymentMethods: Array<{ type: string; details?: Record<string, unknown>; isActive: boolean }>;
  canSubmitOrder: boolean;
  submitting: boolean;
  submitOrder: () => void;
  orderError: string | null;
  displayTotal: number;
  // Step 3 state
  orderResult: PublicOrderResult | null;
  paystackStatus: string;
  openPaystackInline: (ref: string, amount: number, accessCode: string) => void;
  closeOrderDialog: () => void;
  setShowTrackDrawer: (show: boolean) => void;
  storefrontContact?: {
    whatsapp?: string;
  };
}

export const OrderDialog = memo(
  ({
    isOpen,
    onClose,
    activeOrder,
    bundle,
    theme,
    storeClosed,
    storeClosedMessage,
    storefrontsClosed,
    storefrontsClosedMessage,
    orderStep,
    setOrderStep,
    orderPhone,
    setOrderPhone,
    orderCustomerName,
    setOrderCustomerName,
    orderGhanaCard,
    setOrderGhanaCard,
    phoneOk,
    step1Valid,
    confirmDetails,
    feeEstimate,
    customerName,
    setCustomerName,
    paymentType,
    setPaymentType,
    transactionRef,
    setTransactionRef,
    paymentMethods,
    canSubmitOrder,
    submitting,
    submitOrder,
    orderError,
    displayTotal,
    orderResult,
    paystackStatus,
    openPaystackInline,
    closeOrderDialog,
    setShowTrackDrawer,
    storefrontContact,
  }: OrderDialogProps) => {
    if (!activeOrder) return null;
    const pc = getProviderColors(bundle.provider);
    const isAfa = bundle.provider?.toUpperCase() === "AFA";
    const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

    const selectedPayment =
      paymentMethods.find((m) => m.type === paymentType) || paymentMethods[0];

    // Step indicator (1-based)
    const stepNum =
      orderStep === "details" ? 1 : orderStep === "payment" ? 2 : 3;

    return (
      <Dialog isOpen={isOpen} onClose={onClose} size="md">
        {/* ── Step progress bar ── */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center gap-1.5 mb-4">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300"
                  style={
                    n <= stepNum
                      ? { backgroundColor: theme.primary, color: "#fff" }
                      : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
                  }
                >
                  {n < stepNum ? <FaCircleCheck className="w-3.5 h-3.5" /> : n}
                </div>
                {n < 3 && (
                  <div
                    className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: n < stepNum ? theme.primary : "#E5E7EB",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
            <span
              className="ml-2 text-xs font-semibold whitespace-nowrap"
              style={{ color: "var(--text-tertiary)" }}
            >
              {orderStep === "details"
                ? "Bundle & Number"
                : orderStep === "payment"
                  ? "Your Details"
                  : "Order Placed"}
            </span>
          </div>
        </div>

        {storeClosed && (
          <div className="px-5 pb-4">
            <Alert status="warning">{storeClosedMessage}</Alert>
          </div>
        )}
        {storefrontsClosed && (
          <div className="px-5 pb-4">
            <Alert status="warning">{storefrontsClosedMessage}</Alert>
          </div>
        )}

        {/* ── STEP 1: Details ── */}
        {orderStep === "details" && (
          <>
            <DialogHeader>
              {/* Bundle preview */}
              <div
                className="rounded-2xl p-4"
                style={{
                  background: `linear-gradient(135deg, ${pc.primary}20, ${pc.primary}0a)`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {hasData && (
                      <div
                        className="text-4xl font-black leading-none"
                        style={{ color: pc.primary }}
                      >
                        {bundle.dataVolume}
                        <span className="text-2xl font-bold ml-1 opacity-80">
                          {bundle.dataUnit}
                        </span>
                      </div>
                    )}
                    <h3
                      className="font-bold mt-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {bundle.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border font-medium shadow-sm"
                        style={{
                          color: "var(--text-secondary)",
                          backgroundColor: "var(--bg-surface)",
                        }}
                      >
                        {fmtValidity(bundle.validity, bundle.validityUnit)}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          backgroundColor: pc.primary + "20",
                          color: pc.primary,
                        }}
                      >
                        {bundle.providerName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="text-2xl font-extrabold"
                      style={{ color: pc.primary }}
                    >
                      {fmt(bundle.price)}
                    </div>
                    {paymentType === "paystack" && feeEstimate && (
                      <div
                        className="text-[10px] mt-0.5"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        ~{fmt(feeEstimate.charge)} w/ fees
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-4">
                {isAfa && bundle.requiresGhanaCard && (
                  <Alert status="warning">
                    <strong>Ghana Card required</strong> — This bundle needs ID
                    verification.
                  </Alert>
                )}

                {/* Phone number */}
                <div>
                  <label
                    className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <FaPhone className="w-3 h-3 opacity-60" />
                    Recipient Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. 0244 123 456"
                    value={orderPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setOrderPhone(e.target.value)
                    }
                    autoComplete="tel"
                  />
                  {orderPhone && !phoneOk && (
                    <p
                      className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: "var(--error)" }}
                    >
                      <FaTriangleExclamation className="w-3 h-3" />
                      Enter a valid 10-digit Ghana number (e.g. 0244123456)
                    </p>
                  )}
                  {phoneOk && (
                    <p
                      className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: "var(--success)" }}
                    >
                      <FaCircleCheck className="w-3 h-3" /> Looks good!
                    </p>
                  )}
                </div>

                {/* AFA-specific fields */}
                {isAfa && (
                  <>
                    <div>
                      <label
                        className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FaIdCard className="w-3 h-3 opacity-60" /> Recipient
                        Full Name *
                      </label>
                      <Input
                        placeholder="Full name as on Ghana Card"
                        value={orderCustomerName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setOrderCustomerName(e.target.value)
                        }
                      />
                    </div>
                    {bundle.requiresGhanaCard && (
                      <div>
                        <label
                          className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <FaIdCard className="w-3 h-3 opacity-60" /> Ghana Card
                          Number *
                        </label>
                        <Input
                          placeholder="GHA-XXXXXXXXX-X"
                          value={orderGhanaCard}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setOrderGhanaCard(e.target.value)
                          }
                        />
                        {orderGhanaCard &&
                          !/^[A-Z]{3}-?\d{9}-?\d$/i.test(orderGhanaCard) && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--error)" }}
                            >
                              Format: GHA-000000000-0
                            </p>
                          )}
                      </div>
                    )}
                  </>
                )}

                {/* Fee estimate note for Paystack */}
                {feeEstimate && (
                  <div
                    className="rounded-xl p-3 text-xs space-y-1"
                    style={{
                      backgroundColor: theme.bg,
                      borderLeft: `3px solid ${theme.primary}`,
                    }}
                  >
                    <p
                      className="font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Price Breakdown (Paystack)
                    </p>
                    <div
                      className="flex justify-between"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span>Bundle price</span>
                      <span>{fmt(bundle.price)}</span>
                    </div>
                    <div
                      className="flex justify-between"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span>Processing fee (~1.95%)</span>
                      <span>+{fmt(feeEstimate.fee)}</span>
                    </div>
                    <div
                      className="flex justify-between font-black pt-1 border-t"
                      style={{
                        color: theme.primary,
                        borderColor: "var(--border-color)",
                      }}
                    >
                      <span>You pay</span>
                      <span>{fmt(feeEstimate.charge)}</span>
                    </div>
                    <p
                      className="text-[10px] pt-0.5"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Exact amount confirmed at payment. Fee covers Paystack
                      processing.
                    </p>
                  </div>
                )}
              </div>
            </DialogBody>

            <DialogFooter>
              <div className="flex gap-2 w-full">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="shrink-0"
                >
                  Cancel
                </Button>
                <button
                  disabled={!step1Valid}
                  onClick={confirmDetails}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40 text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  Continue to Payment <FaArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* ── STEP 2: Payment ── */}
        {orderStep === "payment" && (
          <>
            <DialogHeader>
              <div className="space-y-1">
                <h3
                  className="font-black text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Complete your details
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ordering <strong>{bundle.name}</strong> →{" "}
                  <span className="font-mono">
                    {normalizePhone(orderPhone)}
                  </span>
                </p>
              </div>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-5">
                {/* Customer info */}
                <div className="space-y-3">
                  <div>
                    <label
                      className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Your Full Name *
                    </label>
                    <Input
                      placeholder="e.g. Kwame Asante"
                      value={customerName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCustomerName(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <label
                    className="block text-xs font-bold mb-2 uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    How would you like to pay?
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => {
                      const icons: Record<string, string> = {
                        paystack: "⚡",
                        mobile_money: "📱",
                        bank_transfer: "🏦",
                      };
                      const labels: Record<string, string> = {
                        paystack: "Paystack (Card, MoMo & more)",
                        mobile_money: "Mobile Money",
                        bank_transfer: "Bank Transfer",
                      };
                      const descs: Record<string, string> = {
                        paystack:
                          "Instant, secure online checkout — powered by Paystack Ghana",
                        mobile_money:
                          "Send via MoMo first, then enter the reference number below",
                        bank_transfer:
                          "Transfer to our bank account, then notify the store owner",
                      };
                      const active = paymentType === pm.type;
                      return (
                        <button
                          key={pm.type}
                          onClick={() => setPaymentType(pm.type as "paystack" | "mobile_money" | "bank_transfer")}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
                          style={
                            active
                              ? {
                                  borderColor: theme.primary,
                                  backgroundColor: theme.bg,
                                }
                              : {
                                  borderColor: "#E5E7EB",
                                  backgroundColor: "#fff",
                                }
                          }
                        >
                          <span className="text-2xl shrink-0">
                            {icons[pm.type] || "💳"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {labels[pm.type] || pm.type}
                            </p>
                            <p
                              className="text-xs leading-snug"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {descs[pm.type] || ""}
                            </p>
                          </div>
                          <div
                            className="w-4 h-4 rounded-full border-2 shrink-0 transition-all"
                            style={
                              active
                                ? {
                                    borderColor: theme.primary,
                                    backgroundColor: theme.primary,
                                  }
                                : { borderColor: "#D1D5DB" }
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual payment account details */}
                {selectedPayment && selectedPayment.type !== "paystack" && (
                  <div
                    className="p-4 rounded-xl border-2 border-dashed space-y-2"
                    style={{
                      borderColor: theme.primary + "40",
                      backgroundColor: theme.bg,
                    }}
                  >
                    <h4
                      className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5"
                      style={{ color: theme.secondary }}
                    >
                      📋 Payment Instructions
                    </h4>
                    {Array.isArray(selectedPayment.details?.accounts)
                      ? (
                          selectedPayment.details.accounts as PaymentAccount[]
                        ).map((acc, i) => (
                          <div key={i} className="text-sm space-y-1">
                            {acc.provider && (
                              <div
                                className="flex justify-between"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <span className="">Provider</span>
                                <span className="font-semibold">
                                  {acc.provider}
                                </span>
                              </div>
                            )}
                            {acc.number && (
                              <div
                                className="flex justify-between"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <span className="">Number</span>
                                <span className="font-bold text-lg tracking-wider">
                                  {acc.number}
                                </span>
                              </div>
                            )}
                            {acc.accountName && (
                              <div
                                className="flex justify-between"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <span className="">Account Name</span>
                                <span className="font-semibold">
                                  {acc.accountName}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      : Object.entries(selectedPayment.details || {}).map(
                          ([k, v]) => {
                            if (v == null || typeof v === "object") return null;
                            return (
                              <div
                                key={k}
                                className="flex justify-between text-sm"
                              >
                                <span
                                  className="capitalize"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {k.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span className="font-semibold">
                                  {String(v)}
                                </span>
                              </div>
                            );
                          },
                        )}
                    <div
                      className="pt-2 border-t border-dashed"
                      style={{ borderColor: theme.primary + "30" }}
                    >
                      <p
                        className="font-black text-base"
                        style={{ color: theme.secondary }}
                      >
                        Send exactly: {fmt(bundle.price)}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        ✅ Send the exact amount — do not round up or down
                      </p>
                    </div>
                  </div>
                )}

                {/* MoMo transaction ref input */}
                {paymentType === "mobile_money" && (
                  <div>
                    <label
                      className="block text-xs font-bold mb-1.5 uppercase tracking-wide"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      MoMo Transaction Reference *
                    </label>
                    <Input
                      placeholder="e.g. S2304..."
                      value={transactionRef}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTransactionRef(e.target.value)
                      }
                    />
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      💡 Make the payment first, then paste your reference ID
                      here. You'll get it in your MoMo SMS.
                    </p>
                  </div>
                )}

                {/* Order summary */}
                <div
                  className="rounded-xl p-3 space-y-1.5"
                  style={{ backgroundColor: theme.bg }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Order Summary
                  </p>
                  <div
                    className="flex justify-between text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>{bundle.name}</span>
                    <span>{fmt(bundle.price)}</span>
                  </div>
                  {feeEstimate && paymentType === "paystack" && (
                    <div
                      className="flex justify-between text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span>Paystack processing fee (~1.95%)</span>
                      <span>+{fmt(feeEstimate.fee)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between font-black pt-2 border-t text-base"
                    style={{ color: theme.primary }}
                  >
                    <span>Total to Pay</span>
                    <span>
                      {fmt(
                        feeEstimate && paymentType === "paystack"
                          ? feeEstimate.charge
                          : bundle.price,
                      )}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <Alert status="error">
                    <strong>Order failed:</strong> {orderError}
                  </Alert>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <div className="flex gap-2 w-full">
                <Button
                  variant="secondary"
                  onClick={() => setOrderStep("details")}
                >
                  <FaArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                </Button>
                <button
                  disabled={!canSubmitOrder || submitting}
                  onClick={submitOrder}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      Place Order · {fmt(displayTotal)}
                      <FaBolt className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* ── STEP 3: Confirmation ── */}
        {orderStep === "confirmation" && orderResult && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <FaCircleCheck className="w-6 h-6" />
                <h3
                  className="font-black text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Order Placed! 🎉
                </h3>
              </div>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-5 py-1">
                {/* Success icon */}
                <div className="flex flex-col items-center text-center pb-2">
                  <div
                    className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-3"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--success) 8%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--success) 30%, transparent)",
                    }}
                  >
                    <FaCircleCheck className="w-10 h-10" />
                  </div>
                  <p
                    className="text-xl font-black"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Thank you!
                  </p>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Order #{orderResult.orderNumber}
                  </p>
                  <button
                    onClick={() => {
                      closeOrderDialog();
                      setShowTrackDrawer(true);
                    }}
                    className="text-xs font-bold mt-1.5 underline underline-offset-2"
                    style={{ color: theme.primary }}
                  >
                    Track this order →
                  </button>
                </div>

                {/* Order breakdown */}
                <div
                  className="rounded-2xl p-4 space-y-2 text-sm"
                  style={{ backgroundColor: "var(--bg-muted)" }}
                >
                  <div className="flex justify-between">
                    <span
                      className=""
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Bundle
                    </span>
                    <span className="font-semibold">{bundle.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className=""
                      style={{ color: "var(--text-secondary)" }}
                    >
                      For number
                    </span>
                    <span className="font-mono font-semibold">
                      {normalizePhone(orderPhone)}
                    </span>
                  </div>
                  {/* Show actual fee breakdown from API response if available */}
                  {(orderResult as any).subtotal &&
                    (orderResult as any).subtotal !== orderResult.total && (
                      <>
                        <div className="flex justify-between">
                          <span
                            className=""
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Bundle price
                          </span>
                          <span>{fmt((orderResult as any).subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className=""
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Processing fee
                          </span>
                          <span>
                            +
                            {fmt(
                              orderResult.total - (orderResult as any).subtotal,
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  <div
                    className="flex justify-between font-black text-lg pt-2 border-t"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <span>Total Charged</span>
                    <span style={{ color: theme.primary }}>
                      {fmt(orderResult.total)}
                    </span>
                  </div>
                </div>

                {/* Paystack payment status */}
                {orderResult.paystack?.authorizationUrl ? (
                  <div className="space-y-3">
                    {(() => {
                      const paystackReference = orderResult.paystack?.reference;
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Payment Status
                            </span>
                            {paystackStatus === "success" ? (
                              <span
                                className="text-xs border px-2.5 py-1 rounded-full font-bold"
                                style={{
                                  color: "var(--success)",
                                  backgroundColor:
                                    "color-mix(in srgb, var(--success) 8%, transparent)",
                                  borderColor:
                                    "color-mix(in srgb, var(--success) 30%, transparent)",
                                }}
                              >
                                ✓ Payment Confirmed
                              </span>
                            ) : paystackStatus === "failed" ? (
                              <span
                                className="text-xs border px-2.5 py-1 rounded-full font-bold"
                                style={{
                                  backgroundColor:
                                    "color-mix(in srgb, var(--error) 8%, transparent)",
                                  borderColor:
                                    "color-mix(in srgb, var(--error) 30%, transparent)",
                                }}
                              >
                                ✕ Failed
                              </span>
                            ) : (
                              <span
                                className="text-xs border px-2.5 py-1 rounded-full font-bold animate-pulse"
                                style={{
                                  color: "var(--warning)",
                                  backgroundColor:
                                    "color-mix(in srgb, var(--warning) 8%, transparent)",
                                  borderColor:
                                    "color-mix(in srgb, var(--warning) 30%, transparent)",
                                }}
                              >
                                ⏳ Awaiting Payment
                              </span>
                            )}
                          </div>
                          {paystackStatus !== "success" &&
                            paystackReference && (
                              <button
                                onClick={() =>
                                  openPaystackInline(
                                    paystackReference,
                                    orderResult.total,
                                    orderResult.paystack?.accessCode || "",
                                  )
                                }
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white"
                                style={{ backgroundColor: theme.primary }}
                              >
                                <FaBolt className="w-4 h-4" /> Continue to
                                Paystack Payment
                              </button>
                            )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div
                    className="flex justify-between items-center p-3 rounded-xl border"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--warning) 8%, transparent)",
                      borderColor:
                        "color-mix(in srgb, var(--warning) 30%, transparent)",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--warning)" }}
                    >
                      Awaiting manual verification
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        color: "var(--warning)",
                        backgroundColor:
                          "color-mix(in srgb, var(--warning) 15%, transparent)",
                      }}
                    >
                      Pending
                    </span>
                  </div>
                )}

                {/* What's next */}
                <div
                  className="rounded-2xl p-4 border"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--color-primary) 8%, transparent)",
                    borderColor:
                      "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                  }}
                >
                  <h4
                    className="text-xs font-black uppercase tracking-wide mb-2.5"
                    style={{ color: "var(--color-primary)" }}
                  >
                    What Happens Next
                  </h4>
                  <ol
                    className="text-xs space-y-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {orderResult.paystack?.authorizationUrl ? (
                      <>
                        <li className="flex items-start gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                            style={{ color: "var(--color-primary)" }}
                          >
                            1
                          </span>
                          Complete payment in the Paystack window that opened.
                        </li>
                        <li className="flex items-start gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                            style={{ color: "var(--color-primary)" }}
                          >
                            2
                          </span>
                          Your order is automatically processed upon
                          confirmation.
                        </li>
                        <li className="flex items-start gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                            style={{ color: "var(--color-primary)" }}
                          >
                            3
                          </span>
                          Bundle is sent to{" "}
                          <strong>{normalizePhone(orderPhone)}</strong> within
                          minutes.
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                            style={{ color: "var(--color-primary)" }}
                          >
                            1
                          </span>
                          The store owner reviews your payment reference.
                        </li>
                        <li className="flex items-start gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                            style={{ color: "var(--color-primary)" }}
                          >
                            2
                          </span>
                          They approve and process the bundle order.
                        </li>
                        <li className="flex items-start gap-2">
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                            style={{ color: "var(--color-primary)" }}
                          >
                            3
                          </span>
                          Bundle is delivered to{" "}
                          <strong>{normalizePhone(orderPhone)}</strong>.
                        </li>
                      </>
                    )}
                  </ol>
                </div>

                {/* WhatsApp contact */}
                {storefrontContact?.whatsapp && (
                  <a
                    href={`https://wa.me/${normalizeWhatsappNumber(storefrontContact.whatsapp)}?text=${encodeURIComponent(`Hi, I just placed order #${orderResult.orderNumber} for ${bundle.name} on ${normalizePhone(orderPhone)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] rounded-xl font-bold text-sm hover:bg-[#20BD5C] transition active:scale-95"
                    style={{ color: "#fff" }}
                  >
                    <FaWhatsapp className="w-4 h-4" /> Message store on WhatsApp
                  </a>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <button
                onClick={closeOrderDialog}
                className="w-full py-3 rounded-xl font-bold active:scale-95 transition text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Done — Browse More Bundles
              </button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    );
  },
);

// Need to import getProviderColors here
import { getProviderColors } from "../../../utils/provider-colors";
