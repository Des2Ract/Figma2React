import React from 'react';
import Button from './Button';
import Typography from './Typography';

export default function Navbar({ brand, items = [], cta }) {
  return (
    <nav className="bg-black text-white flex items-center justify-between px-6 py-2">
      <Typography.Heading size="lg" className="font-permanent-marker">
        {brand}
      </Typography.Heading>
      <ul className="flex gap-8">
        {items.map((label, i) => (
          <li key={i}>
            <Typography.Text className="font-permanent-marker">
              {label}
            </Typography.Text>
          </li>
        ))}
      </ul>
      {cta && <Button variant="ghost" size="sm">{cta}</Button>}
    </nav>
  );
}
