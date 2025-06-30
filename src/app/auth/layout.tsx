import React from 'react'

const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <section className="w-full">
        <div className="flex items-center justify-center min-h-screen py-20">
            {children}
        </div>
    </section>
  )
}

export default AuthLayout