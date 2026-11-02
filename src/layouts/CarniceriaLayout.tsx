import { Outlet } from 'react-router-dom'

export const CarniceriaLayout = () => (
  <div>
    <h1 className='p-6 text-2xl font-semibold'>Carnicería</h1>
    <Outlet />
  </div>
)
