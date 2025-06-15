import React from 'react';
import cn from 'clsx';

export default function Card({ className, style, children }) {
  // translucent white with rounded corners + shadow
  const base = 'bg-white bg-opacity-40 rounded-xl shadow-lg p-8';
  return (
    <div className={cn(base, className)} style={style}>
      {children}
    </div>
  );
}
