import { FiX, FiCode } from "react-icons/fi";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "../../design-system";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiMarketplaceInfoDialog = ({ isOpen, onClose }: Props) => (
  <Dialog isOpen={isOpen} onClose={onClose} size="md">
    <DialogHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <FiCode size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">API Marketplace</h2>
            <p className="text-sm text-[var(--text-secondary)]">Sell data bundles through your own tools</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>
      </div>
    </DialogHeader>

    <DialogBody>
      <div className="space-y-5 text-sm leading-relaxed text-[var(--text-secondary)]">
        <p>
          The <strong className="text-[var(--text-primary)]">API Marketplace</strong> lets you integrate
          BryteLinks directly into your own website, app, or software. Instead of logging into our dashboard
          every time, you can sell data bundles automatically from wherever you already work.
        </p>

        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4 space-y-3">
          <h3 className="font-semibold text-[var(--text-primary)]">What you can do</h3>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              <span>Generate an <strong className="text-[var(--text-primary)]">API key</strong> — a secret code that connects your app to our system</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              <span>Check prices, buy bundles, and track orders from your own code</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              <span>See how many requests your app has made and how much you've spent</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4 space-y-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Why use it</h3>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span><strong className="text-[var(--text-primary)]">Save time</strong> — no more switching tabs or manual recharges</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span><strong className="text-[var(--text-primary)]">Grow your business</strong> — offer data to your own customers without building the backend</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span><strong className="text-[var(--text-primary)]">Secure</strong> — every request is protected by your unique API key</span>
            </li>
          </ul>
        </div>

        <p className="italic text-[var(--text-muted)]">
          No coding experience? No problem. Share your API key with a developer and they can set it up for you in minutes.
        </p>
      </div>
    </DialogBody>

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Got it
      </Button>
    </DialogFooter>
  </Dialog>
);
