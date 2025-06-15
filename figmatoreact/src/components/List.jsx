import React from 'react';

/** 
 * Simple bullet list 
 */
export function List({ items = [], className }) {
  return (
    <ul className={`list-disc pl-5 text-xs space-y-1 ${className}`}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
