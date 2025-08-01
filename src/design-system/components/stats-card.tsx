import React from 'react';
import { Card, CardBody } from './card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  subtitleColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  valueColor = 'text-gray-900',
  subtitleColor = 'text-green-600',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      title: 'text-xs font-medium text-gray-600',
      value: 'text-lg font-bold',
      subtitle: 'text-xs mt-1',
      icon: 'text-sm',
      iconContainer: 'p-2',
    },
    md: {
      title: 'text-sm font-medium text-gray-600',
      value: 'text-xl sm:text-2xl font-bold',
      subtitle: 'text-xs mt-1',
      icon: 'text-sm sm:text-xl',
      iconContainer: 'p-3',
    },
    lg: {
      title: 'text-base font-medium text-gray-600',
      value: 'text-2xl sm:text-3xl font-bold',
      subtitle: 'text-sm mt-1',
      icon: 'text-xl sm:text-2xl',
      iconContainer: 'p-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className={classes.title}>{title}</p>
            <p className={`${classes.value} ${valueColor}`}>{value}</p>
            {subtitle && (
              <p className={`${classes.subtitle} ${subtitleColor}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`${classes.iconContainer} ${iconBgColor} rounded-full`}>
            <div className={`${classes.icon} ${iconColor}`}>
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
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}; 