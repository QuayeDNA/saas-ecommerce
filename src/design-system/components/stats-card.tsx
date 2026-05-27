import React from "react";
import { Card, CardBody } from "./card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  trend?: string | null;
  trendLabel?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  size = "md",
  iconOnly = false,
  trend,
  trendLabel,
  trendUp,
}) => {
  const sizeClasses = {
    sm: {
      title: "text-xs font-medium",
      value: "text-base sm:text-lg font-bold",
      subtitle: "text-xs mt-0.5 sm:mt-1",
      icon: "text-xs sm:text-sm",
      iconContainer: "p-1.5 sm:p-2",
    },
    md: {
      title: "text-xs sm:text-sm font-medium",
      value: "text-lg sm:text-xl lg:text-2xl font-bold",
      subtitle: "text-xs sm:text-sm mt-0.5 sm:mt-1",
      icon: "text-sm sm:text-base lg:text-lg",
      iconContainer: "p-2 sm:p-2.5 lg:p-3",
    },
    lg: {
      title: "text-sm sm:text-base font-medium",
      value: "text-xl sm:text-2xl lg:text-3xl font-bold",
      subtitle: "text-xs sm:text-sm mt-0.5 sm:mt-1",
      icon: "text-base sm:text-lg lg:text-xl",
      iconContainer: "p-2 sm:p-3 lg:p-4",
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card
      className="h-full"
      style={{ background: "var(--gradient-brand-dark)" }}
    >
      <CardBody className="h-full">
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <p
              className={`${classes.title} mb-0.5 sm:mb-1 lg:mb-2 truncate opacity-70`}
              style={{ color: "var(--text-inverse)" }}
            >
              {title}
            </p>
            <p
              className={`${classes.value} leading-tight`}
              style={{ color: "var(--text-inverse)" }}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className={`${classes.subtitle}`}
                style={{ color: "var(--text-inverse)", opacity: 0.5 }}
              >
                {subtitle}
              </p>
            )}
            {(trend || trendLabel) && (
              <p
                className={`text-xs sm:text-sm mt-1 flex items-center gap-1 ${trendUp !== undefined
                    ? trendUp
                      ? "text-[var(--success)]"
                      : "text-[var(--error)]"
                    : ""
                  }`}
              >
                {trend && <span>{trend}</span>}
                {trendLabel && (
                  <span style={{ color: "var(--text-inverse)", opacity: 0.5 }}>
                    {trendLabel}
                  </span>
                )}
              </p>
            )}
          </div>
          {!iconOnly && (
            <div
              className={`${classes.iconContainer} rounded-full flex-shrink-0 hidden sm:flex items-center justify-center`}
              style={{ backgroundColor: "color-mix(in srgb, var(--text-inverse) 20%, transparent)" }}
            >
              <div
                className={`${classes.icon}`}
                style={{ color: "var(--text-inverse)" }}
              >
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4 | 6;
  gap?: "xs" | "sm" | "md" | "lg";
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  gap = "lg",
}) => {
  // Adjust columns based on number of items for better layout
  const effectiveColumns =
    stats.length === 1 ? 1 : Math.min(columns, stats.length);

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2 sm:grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  };

  const gapClasses = {
    xs: "gap-2 sm:gap-3",
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-5",
    lg: "gap-4 sm:gap-6 lg:gap-8",
  };

  return (
    <div
      className={`grid ${gridClasses[effectiveColumns as keyof typeof gridClasses]
        } ${gapClasses[gap]} w-full`}
    >
      {stats.map((stat, index) => (
        <StatCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
};
