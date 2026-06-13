import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium'
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    ghost: 'bg-transparent text-slate-700 border border-slate-200'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export default Button
