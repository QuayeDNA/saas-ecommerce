import React from 'react';
import { Card, CardBody } from './card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      title: 'text-xs font-medium text-gray-300',
      value: 'text-lg font-bold text-white',
      subtitle: 'text-xs mt-1 text-gray-400',
      icon: 'text-sm',
      iconContainer: 'p-2 sm:p-2.5',
      cardPadding: 'p-3 sm:p-4',
    },
    md: {
      title: 'text-sm font-medium text-gray-300',
      value: 'text-xl sm:text-2xl lg:text-3xl font-bold text-white',
      subtitle: 'text-xs sm:text-sm mt-1 text-gray-400',
      icon: 'text-sm sm:text-lg lg:text-xl',
      iconContainer: 'p-2.5 sm:p-3 lg:p-4',
      cardPadding: 'p-4 sm:p-5 lg:p-6',
    },
    lg: {
      title: 'text-base font-medium text-gray-300',
      value: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-white',
      subtitle: 'text-sm sm:text-base mt-1 text-gray-400',
      icon: 'text-xl sm:text-2xl lg:text-3xl',
      iconContainer: 'p-3 sm:p-4 lg:p-5',
      cardPadding: 'p-5 sm:p-6 lg:p-8',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
      <CardBody className={classes.cardPadding}>
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className={`${classes.title} mb-1 sm:mb-2 truncate`}>{title}</p>
            <p className={`${classes.value} leading-tight`}>{value}</p>
            {subtitle && (
              <p className={`${classes.subtitle} mt-1 sm:mt-2`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`${classes.iconContainer} bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center`}>
            <div className={`${classes.icon} text-white`}>
              {icon}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  gap = 'lg',
}) => {
  const gridClasses = {
    2: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-5',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} w-full`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}; 