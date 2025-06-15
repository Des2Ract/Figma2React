import React from 'react';

export default function Label({ htmlFor, className, children, ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-mono font-semibold text-black ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
