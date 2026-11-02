import { useAuthStore } from '../store/hooks/useAuthStore'

interface NavigationMessagePageProps {
  title: string
  message: string
  showLogout?: boolean
}

export const NavigationMessagePage = ({
  title,
  message,
  showLogout = false
}: NavigationMessagePageProps) => {
  const { onLogOut } = useAuthStore()

  return (
    <main className='p-8'>
      <h1 className='text-2xl font-semibold'>{title}</h1>
      <p className='mt-2 text-stone-600'>{message}</p>
      {showLogout && (
        <button
          type='button'
          onClick={onLogOut}
          className='mt-4 rounded bg-stone-800 px-4 py-2 text-white'
        >
          Cerrar sesión
        </button>
      )}
    </main>
  )
}
