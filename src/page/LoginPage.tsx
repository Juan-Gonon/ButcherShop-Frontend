import { LoginView } from '../view/auth/LoginView'

export const LoginPage = () => {
  return (
    <div className='min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 antialiased text-stone-800 bg-tertiary selection:bg-primary selection:text-white relative overflow-hidden'>
      {/* Background Ambient Glow Accents */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden z-0'>
        <div className='absolute -top-32 -left-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl' />
      </div>

      {/* Login Card Container */}
      <LoginView />
    </div>
  )
}
