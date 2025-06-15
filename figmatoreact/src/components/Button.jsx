import React from 'react';
import cn from 'clsx';

/** 
 * @param {'primary'|'ghost'} variant 
 * @param {'sm'|'md'|'lg'} size
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const base = 'rounded-lg font-mono font-semibold focus:outline-none focus:ring-2';
  const variants = {
    primary: 'bg-indigo-300 text-black hover:bg-indigo-400',
    ghost:   'bg-white text-black border border-gray-300 hover:bg-gray-100'
  };
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
