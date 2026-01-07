// src/components/common/coming-soon.tsx
import { Rocket, Sparkles } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export const ComingSoon = ({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
}: ComingSoonProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-4">
        {/* Coming Soon Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
          style={{
            background:
              "linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-600))",
            color: "white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span>COMING SOON</span>
        </div>

        <div className="relative inline-block mb-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))",
            }}
          >
            <Rocket className="w-12 h-12 text-white" />
          </div>
          <div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
            style={{
              backgroundColor: "var(--color-secondary-400)",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        <h2
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--color-primary-600)" }}
        >
          {title}
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>Under Development</span>
        </div>

        <div className="flex items-center justify-center space-x-2 mt-8">
          <div
            className="w-3 h-3 rounded-full animate-bounce"
            style={{
              backgroundColor: "var(--color-primary-500)",
              animationDelay: "0ms",
            }}
          ></div>
          <div
            className="w-3 h-3 rounded-full animate-bounce"
            style={{
              backgroundColor: "var(--color-secondary-500)",
              animationDelay: "150ms",
            }}
          ></div>
          <div
            className="w-3 h-3 rounded-full animate-bounce"
            style={{
              backgroundColor: "var(--color-primary-500)",
              animationDelay: "300ms",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
