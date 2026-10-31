// src/page/HomePage.tsx
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../store/hooks/useAuthStore'

export const HomePage = () => {
  const { uuid } = useParams()
  const { user, onLogOut } = useAuthStore()

  return (
    <div className='p-8 space-y-4'>
      <h1 className='text-2xl font-bold'>Home Page - Carnicería</h1>
      <p className='text-stone-600'>Bienvenido, {user?.nombre}</p>
      <p className='text-xs text-stone-400'>UUID actual en URL: {uuid}</p>

      <button
        onClick={onLogOut}
        className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'
      >
        Cerrar Sesión
      </button>
    </div>
  )
}
