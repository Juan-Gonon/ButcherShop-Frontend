import React, { useState } from 'react'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login intentado con:', { username, password })
  }
  
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Clic en recuperar contraseña')
  }
 
  return   <form className='space-y-4' onSubmit={handleSubmit}>
    {/* User Input */}
    <Input
      id='username'
      name='username'
      label='Usuario o Correo'
      value={username}
      placeholder='usuario'
      onChange={(e) => setUsername(e.target.value)}
      required
      icon={
        <svg
          className='w-4 h-4 text-stone-400'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'
          />
          <circle cx='12' cy='7' r='4' />
        </svg>
      }
    />

    {/* Password Input */}
    <Input
      id='password'
      name='password'
      label='Contraseña'
      isPassword
      placeholder='password'
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      icon={
        <svg
          className='w-4 h-4 text-stone-400'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <rect height='11' rx='2' ry='2' width='18' x='3' y='11' />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M7 11V7a5 5 0 0 1 10 0v4'
          />
        </svg>
      }
      rightAction={
        <a
          href='#recuperar'
          onClick={handleForgotPassword}
          className='text-xs font-medium text-primary hover:text-stone-900 hover:underline transition'
        >
                ¿Olvidaste?
        </a>
      }
    />

    {/* Submit Button */}
    <div className='pt-2'>
      <Button type='submit' icon='→'>
              Ingresar al Sistema
      </Button>
    </div>
  </form>
}
