import React from 'react';
import cn from 'clsx';

export default {
  /** for titles like “Sign in” */
  Heading: ({ size = 'xl', className, children, ...props }) => {
    const sizes = {
      xl: 'text-3xl',
      lg: 'text-2xl',
      md: 'text-xl'
    };
    return (
      <h1
        className={cn('font-mono font-semibold tracking-tight', sizes[size], className)}
        {...props}
      >
        {children}
      </h1>
    );
  },

  /** for paragraphs/links */
  Text: ({ size = 'base', className, children, ...props }) => {
    const sizes = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg'
    };
    return (
      <p className={cn('font-mono', sizes[size], className)} {...props}>
        {children}
      </p>
    );
  }
};
