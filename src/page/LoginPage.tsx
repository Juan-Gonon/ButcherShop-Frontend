import React, { useState } from 'react';

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('corte.mostrador@cortedeoro.com');
  const [password, setPassword] = useState('CorteOro2024Secure!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login intentado con:', { username, password });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
    console.log('Alternar visibilidad de contraseña');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Clic en recuperar contraseña');
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Clic en soporte técnico');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 antialiased text-stone-800 bg-[var(--color-tertiary)] selection:bg-[var(--color-primary)] selection:text-white relative overflow-hidden">
      
      {/* Fondo con Blobs / Ambient Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto bg-white rounded-3xl sm:rounded-[32px] shadow-[0_20px_40px_-15px_rgba(112,24,36,0.08),0_35px_65px_-10px_rgba(77,42,0,0.06),0_0_1px_1px_rgba(139,30,46,0.04)] border border-[#eedccb]/70 overflow-hidden my-auto transition-all">
        
        {/* Organic Fluid Shape Top-Right */}
        <div className="absolute -top-20 -right-20 w-64 h-64 pointer-events-none opacity-80 select-none z-0">
          <svg className="w-full h-full filter blur-[1px]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blobGradTop" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.32"></stop>
                <stop offset="50%" stop-color="#d97706" stop-opacity="0.22"></stop>
                <stop offset="100%" stop-color="#8b1e2e" stop-opacity="0.28"></stop>
              </linearGradient>
            </defs>
            <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C86.9,14.6,81.2,29.1,72.8,41.9C64.4,54.7,53.2,65.8,40.1,72.7C26.9,79.5,13.5,82.2,-0.2,82.6C-13.9,82.9,-27.7,81,-40.5,74.5C-53.2,68,-64.8,57,-73.4,43.7C-82,30.4,-87.6,15.2,-86.6,0.6C-85.5,-14,-77.9,-28,-68.6,-39.9C-59.2,-51.7,-48.1,-61.4,-35.6,-69.4C-23.1,-77.4,-11.6,-83.7,1.8,-86.8C15.2,-89.9,30.5,-83.6,44.7,-76.4Z" fill="url(#blobGradTop)" transform="translate(100 100)"></path>
          </svg>
        </div>

        {/* Card Content Layer */}
        <div className="relative z-10 p-7 sm:p-10 flex flex-col justify-between">
          
          {/* Top Section: Identity & Welcome */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] via-[#701824] to-[#540c17] border border-amber-400/30 flex items-center justify-center shadow-md shadow-[var(--color-primary)]/10 text-white">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19.5 4.5l-8 8m-4.5 4.5L3 21m1-8l5-5c1-1 2.5-1 3.5 0l4.5 4.5c1 1 1 2.5 0 3.5l-5 5c-1 1-2.5 1-3.5 0L4 16.5"></path>
                    <circle cx="8" cy="9" fill="currentColor" r="1.2"></circle>
                  </svg>
                </div>
                <div>
                  <span className="text-base font-bold font-serif tracking-tight text-stone-900 block leading-tight">El Corte de Oro</span>
                  <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--color-primary)]/80">Punto de Venta & Gestión</span>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-[#ecdccb] text-[11px] font-medium text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Conectado</span>
              </div>
            </div>

            {/* Greeting Header */}
            <div className="space-y-1.5 mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                Bienvenido
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-normal">
                Ingresa tus credenciales para continuar al panel operativo.
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Field 1: Usuario / Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5" htmlFor="username">
                  Usuario o Correo
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm text-stone-900 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] placeholder-stone-400 transition outline-none" 
                    id="username" 
                    name="username" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {/* Field 2: Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider" htmlFor="password">
                    Contraseña
                  </label>
                  <a className="text-xs font-medium text-[var(--color-primary)] hover:text-stone-900 hover:underline transition" href="#recuperar" onClick={handleForgotPassword}>
                    ¿Olvidaste?
                  </a>
                </div>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-11 py-2.5 sm:py-3 text-sm text-stone-900 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] placeholder-stone-400 transition font-[var(--font-label)] outline-none" 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  
                  {/* Password Toggle Button */}
                  <button 
                    aria-label="Alternar visualización de la contraseña" 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none" 
                    id="toggle-password" 
                    type="button"
                    onClick={handleTogglePassword}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button 
                  className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl sm:rounded-2xl shadow-lg shadow-[var(--color-primary)]/20 text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-[var(--color-primary)] to-[#701824] hover:opacity-95 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition duration-150 group cursor-pointer" 
                  type="submit"
                >
                  <span>Ingresar al Sistema</span>
                  <span className="transition-transform transform group-hover:translate-x-1">→</span>
                </button>
              </div>

            </form>
          </div>

          {/* Footer Inside Card */}
          <footer className="mt-8 pt-5 border-t border-stone-100 flex flex-col items-center justify-center gap-1.5 text-center text-xs text-stone-400">
            <div className="flex items-center gap-1.5 text-stone-500 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>v2.4.0 • Sistema Seguro Multi-tenant</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-400">
              <span>Cifrado bancario activo</span>
              <span>•</span>
              <a className="hover:text-[var(--color-primary)] transition" href="#soporte" onClick={handleSupportClick}>
                Soporte Técnico
              </a>
            </div>
          </footer>

        </div>
      </main>

    </div>
  );
};