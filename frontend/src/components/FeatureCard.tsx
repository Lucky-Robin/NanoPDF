import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
}) => {
  return (
    <Link
      to={href}
      className="bg-white rounded-2xl flex flex-col items-center text-center card-shadow card-hover border border-gray-50 py-6 px-6"
    >
      <div className="w-16 h-16 flex items-center justify-center mb-6">
        <Icon className="text-[#0066FF] w-10 h-10" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
        <p className="text-[#666666] text-[14px]">{description}</p>
      </div>
    </Link>
  );
};
