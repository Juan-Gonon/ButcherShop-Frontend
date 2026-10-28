import React, { useState } from 'react'
import { Card } from '../../components/Card'
import { Header } from '../../components/Header'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

export const LoginView = () => {

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

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Clic en soporte técnico')
  }
  return  <Card>
    {/* Header Section */}
    <Header
      brandName='El Corte de Oro'
      brandTagline='Punto de Venta & Gestión'
      title='Bienvenido'
      subtitle='Ingresa tus credenciales para continuar al panel operativo.'
      brandIcon={
        <svg
          className='w-5 h-5 text-amber-400'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19.5 4.5l-8 8m-4.5 4.5L3 21m1-8l5-5c1-1 2.5-1 3.5 0l4.5 4.5c1 1 1 2.5 0 3.5l-5 5c-1 1-2.5 1-3.5 0L4 16.5'
          />
          <circle cx='8' cy='9' fill='currentColor' r='1.2' />
        </svg>
      }
    />

    {/* Form */}
    <form className='space-y-4' onSubmit={handleSubmit}>
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

    {/* Card Footer */}
    <footer className='mt-8 pt-5 border-t border-stone-100 flex flex-col items-center justify-center gap-1.5 text-center text-xs text-stone-400'>
      <div className='flex items-center gap-1.5 text-stone-500 font-medium text-[11px]'>
        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
        <span>v2.4.0 • Sistema Seguro Multi-tenant</span>
      </div>
      <div className='flex items-center gap-2 text-[11px] text-stone-400'>
        <span>Cifrado bancario activo</span>
        <span>•</span>
        <a
          href='#soporte'
          onClick={handleSupportClick}
          className='hover:text-primary transition'
        >
              Soporte Técnico
        </a>
      </div>
    </footer>
  </Card>
}
