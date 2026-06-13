import React from 'react'

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white rounded-md shadow-sm p-4 ${className}`}>
      {children}
    </div>
  )
}

export default Card
