import React from 'react';

export function IsleLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="40 40 198 198" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M139 160V229" stroke="currentColor" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M139.5 136C147.508 136 154 129.508 154 121.5C154 113.492 147.508 107 139.5 107C131.492 107 125 113.492 125 121.5C125 129.508 131.492 136 139.5 136Z" fill="currentColor"/>
      <path d="M105.753 214C95.5678 209.344 86.3477 203.852 78.6668 194.996C64.1685 178.28 56.4089 156.254 57.0352 133.594C57.6615 110.934 66.6243 89.4235 82.0211 73.6292C97.4179 57.8349 118.037 49 139.5 49C160.963 49 181.582 57.8349 196.979 73.6292C212.376 89.4235 221.339 110.934 221.965 133.594C222.591 156.254 214.832 178.28 200.333 194.996C192.756 203.733 183.545 208.964 173.5 213.47" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
