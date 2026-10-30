// src/features/auth/components/LoginForm.tsx
import React from 'react'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { useFormLogin } from '../hooks/useFormLogin'

export const LoginForm = () => {
  const { register, handleSubmit, errors, errorMessage, status } = useFormLogin()

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Clic en recuperar contraseña')
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {/* Mensaje de error global del servidor o de validación */}
      {errorMessage && (
        <div className='p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg'>
          {errorMessage}
        </div>
      )}

      {/* User Input */}
      <Input
        id='user'
        label='Usuario o Correo'
        placeholder='usuario'
        required
        // Conectamos react-hook-form con validaciones básicas
        {...register('user', { required: 'El usuario es requerido' })}
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
      {errors.user && (
        <span className='text-xs text-red-500'>{errors.user.message}</span>
      )}

      {/* Password Input */}
      <Input
        id='password'
        label='Contraseña'
        isPassword
        placeholder='password'
        required
        {...register('password', { required: 'La contraseña es requerida' })}
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
      {errors.password && (
        <span className='text-xs text-red-500'>{errors.password.message}</span>
      )}

      {/* Submit Button */}
      <div className='pt-2'>
        <Button 
          type='submit' 
          icon='→'
          disabled={status === 'checking'} // Deshabilitamos si está cargando
        >
          {status === 'checking' ? 'Validando...' : 'Ingresar al Sistema'}
        </Button>
      </div>
    </form>
  )
}