'use client';

import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export const GlobalNavItem = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  'use client';

  const path = usePathname();

  return (
    <li
      className={`hover:text-zinc-900 border-zinc-900 ${
        path === href || path.startsWith(`${href}/`)
          ? 'text-zinc-900 border-b-2'
          : ''
      }`}
    >
      <Link href={href}>{children}</Link>
    </li>
  );
};
