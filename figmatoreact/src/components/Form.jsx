import React from 'react';

export default function Form({ onSubmit, className, children, ...props }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 bg-white bg-opacity-60 p-6 rounded-lg ${className}`}
      {...props}
    >
      {children}
    </form>
  );
}
