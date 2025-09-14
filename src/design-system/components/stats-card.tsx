import React from 'react';
import { Card, CardBody } from './card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  size = 'md',
  iconOnly = false,
}) => {
  const sizeClasses = {
    sm: {
      title: 'text-xs font-medium text-gray-300',
      value: 'text-base sm:text-lg font-bold text-white',
      subtitle: 'text-xs mt-0.5 sm:mt-1 text-gray-400',
      icon: 'text-xs sm:text-sm',
      iconContainer: 'p-1.5 sm:p-2',
      cardPadding: 'p-0 sm:p-3',
    },
    md: {
      title: 'text-xs sm:text-sm font-medium text-gray-300',
      value: 'text-lg sm:text-xl lg:text-2xl font-bold text-white',
      subtitle: 'text-xs sm:text-sm mt-0.5 sm:mt-1 text-gray-400',
      icon: 'text-sm sm:text-base lg:text-lg',
      iconContainer: 'p-2 sm:p-2.5 lg:p-3',
      cardPadding: 'p-0 sm:p-4 lg:p-5',
    },
    lg: {
      title: 'text-sm sm:text-base font-medium text-gray-300',
      value: 'text-xl sm:text-2xl lg:text-3xl font-bold text-white',
      subtitle: 'text-xs sm:text-sm mt-0.5 sm:mt-1 text-gray-400',
      icon: 'text-base sm:text-lg lg:text-xl',
      iconContainer: 'p-2 sm:p-3 lg:p-4',
      cardPadding: 'p-0 sm:p-5 lg:p-6',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
      <CardBody className={classes.cardPadding}>
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <p className={`${classes.title} mb-0.5 sm:mb-1 lg:mb-2 truncate`}>{title}</p>
            <p className={`${classes.value} leading-tight`}>{value}</p>
            {subtitle && (
              <p className={`${classes.subtitle} mt-0.5 sm:mt-1 lg:mt-2`}>
                {subtitle}
              </p>
            )}
          </div>
          {!iconOnly && (
            <div className={`${classes.iconContainer} bg-white/20 rounded-full flex-shrink-0 hidden sm:flex items-center justify-center`}>
              <div className={`${classes.icon} text-white`}>
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
  gap?: 'xs' | 'sm' | 'md' | 'lg';
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  gap = 'lg',
}) => {
  const gridClasses = {
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} w-full`}>
      {stats.map((stat, index) => (
        <StatCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
}; 