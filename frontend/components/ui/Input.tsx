import React from 'react'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`border rounded-md px-3 py-2 text-sm bg-white ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
