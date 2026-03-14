import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  color = 'bg-[#0165ff]',
}) => {
  return (
    <Link
      to={href}
      className="block w-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 group"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={clsx('p-4 rounded-2xl text-white transition-transform duration-300 group-hover:scale-105', color)}>
          <Icon className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};
