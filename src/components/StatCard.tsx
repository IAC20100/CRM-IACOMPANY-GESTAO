import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'red' | 'blue' | 'emerald' | 'orange' | 'indigo';
  subtitle?: string;
}

const colorStyles = {
  red: 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400',
};

const iconBgStyles = {
  red: 'bg-black dark:bg-white',
  blue: 'bg-zinc-800 dark:bg-zinc-200',
  emerald: 'bg-zinc-700 dark:bg-zinc-300',
  orange: 'bg-zinc-600 dark:bg-zinc-400',
  indigo: 'bg-zinc-500 dark:bg-zinc-500',
};

const subtitleColorStyles = {
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-zinc-500 dark:text-zinc-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  orange: 'text-orange-600 dark:text-orange-400',
  indigo: 'text-zinc-500 dark:text-zinc-400',
};

export function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-100 dark:border-zinc-800 card-shadow flex flex-col gap-6 transition-all hover:translate-y-[-4px]">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBgStyles[color]} shadow-lg shadow-black/10`}>
        <Icon className="w-7 h-7 text-white dark:text-black" />
      </div>
      <div>
        <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">{value}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold leading-tight">{title}</p>
        {subtitle && (
          <p className={`text-[10px] font-black uppercase tracking-widest ${subtitleColorStyles[color]} mt-3 flex items-center gap-1`}>
            <span className="w-1 h-1 rounded-full bg-current"></span>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
