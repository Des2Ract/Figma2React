import React from 'react';
import cn from 'clsx';

export default function Checkbox({ checked, onChange, className, ...props }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn(
        'form-checkbox h-4 w-4 text-indigo-500 border-gray-300 rounded',
        className
      )}
      {...props}
    />
  );
}
