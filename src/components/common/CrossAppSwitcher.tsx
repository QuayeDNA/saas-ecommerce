import { FaHome, FaServer } from "react-icons/fa";

interface ConnectedApp {
  appId: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
  connectedAt: string;
  lastTestedAt?: string;
}

interface CrossAppSwitcherProps {
  activeApp: string;
  onChange: (appId: string) => void;
  apps: ConnectedApp[];
  isAdmin: boolean;
  thisAppValue?: string;
  thisAppLabel?: string;
}

export function CrossAppSwitcher({
  activeApp,
  onChange,
  apps,
  isAdmin,
  thisAppValue = "this-app",
  thisAppLabel = "This App",
}: CrossAppSwitcherProps) {
  if (!isAdmin || apps.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64 bg-[var(--bg-surface)] border-t border-[var(--border-color)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <button
          onClick={() => onChange(thisAppValue)}
          className={`flex flex-col items-center gap-0.5 py-2.5 px-3 text-[11px] font-medium transition-colors ${
            activeApp === thisAppValue
              ? "text-[var(--color-secondary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <FaHome className="text-base" />
          {thisAppLabel}
        </button>
        {apps.map((app) => (
          <button
            key={app.appId}
            onClick={() => onChange(app.appId)}
            className={`flex flex-col items-center gap-0.5 py-2.5 px-3 text-[11px] font-medium transition-colors ${
              activeApp === app.appId
                ? "text-[var(--color-secondary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FaServer className="text-base" />
            {app.name}
          </button>
        ))}
      </div>
    </div>
  );
}