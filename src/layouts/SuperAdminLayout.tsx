import { Outlet } from 'react-router-dom'

export const SuperAdminLayout = () => (
  <div>
    <h1 className='p-6 text-2xl font-semibold'>Superadministración</h1>
    <Outlet />
  </div>
)
