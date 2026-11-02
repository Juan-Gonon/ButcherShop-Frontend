interface NavigationPlaceholderPageProps {
  title: string
}

export const NavigationPlaceholderPage = ({
  title
}: NavigationPlaceholderPageProps) => (
  <section className='p-6'>
    <h2 className='text-xl font-semibold'>{title}</h2>
    <p className='mt-2 text-stone-600'>Módulo pendiente de implementación.</p>
  </section>
)
