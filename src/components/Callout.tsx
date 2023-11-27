import { ReactNode } from 'react';

export const Callout = ({ children }: { children: ReactNode }) => {
  return (
    <div className='bg-blue-100 p-2 [&>*]:m-0 border-l-4 border-blue-500 [&>*>a]:!text-blue-500 [&>*>a]:font-semibold text-blue-500 font-medium rounded-r-lg'>
      {children}
    </div>
  );
};
