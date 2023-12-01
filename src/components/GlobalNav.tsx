import Link from 'next/link';
import { GlobalNavItem } from './GlobalNavItem';

export const GlobalNav = () => {
  return (
    <div className='bg-zinc-100 flex justify-center sticky top-0 z-10'>
      <header className='max-w-screen-xl w-full self-center'>
        <nav className=' m-4 flex justify-between font-medium text-zinc-500'>
          <Link href='/' className='text-zinc-900'>
            George McCarron
          </Link>
          <ul className='flex gap-6 justify-end'>
            <GlobalNavItem href='/'>Home</GlobalNavItem>
            <GlobalNavItem href='/blog'>Blog</GlobalNavItem>
            <GlobalNavItem href='/speaking'>Speaking</GlobalNavItem>
          </ul>
        </nav>
      </header>
    </div>
  );
};
