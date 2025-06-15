// src/GlobalStyles.jsx
import React from 'react';

export default function GlobalStyles() {
  return (
    <style>{`
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f0f2f5;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      /* add any other resets or global CSS you want */
    `}</style>
  );
}
