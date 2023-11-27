import Link from 'next/link';
import { GlobalNavItem } from './GlobalNavItem';

export const GlobalNav = () => {
  return (
    <header className='max-w-screen-xl w-full self-center'>
      <nav className=' m-4 flex justify-between font-medium text-zinc-500'>
        <Link href='/' className='hover:text-zinc-900'>
          George McCarron
        </Link>
        <ul className='flex gap-6 justify-end'>
          <GlobalNavItem href='/'>Home</GlobalNavItem>
          <GlobalNavItem href='/blog'>Blog</GlobalNavItem>
          <GlobalNavItem href='/speaking'>Speaking</GlobalNavItem>
        </ul>
      </nav>
    </header>
  );
};
