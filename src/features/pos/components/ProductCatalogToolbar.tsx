import { LuBeef, LuBird, LuFilter, LuHam } from 'react-icons/lu'
import type { ProductCategoryFilter } from '../types/productCatalog'

interface ProductCatalogToolbarProps {
  selectedCategory: ProductCategoryFilter
  onCategoryChange: (category: ProductCategoryFilter) => void
}

const categories: {
  label: ProductCategoryFilter
  icon: typeof LuFilter
}[] = [
  { label: 'all', icon: LuFilter },
  { label: 'Res', icon: LuBeef },
  { label: 'Cerdo', icon: LuHam },
  { label: 'Aves', icon: LuBird },
  { label: 'Embutidos & Especiales', icon: LuHam },
  { label: 'Madurados', icon: LuFilter }
]

const labels: Record<ProductCategoryFilter, string> = {
  all: 'Todos',
  Res: 'Res',
  Cerdo: 'Cerdo',
  Aves: 'Aves',
  'Embutidos & Especiales': 'Embutidos & Especiales',
  Madurados: 'Madurados'
}

export const ProductCatalogToolbar = ({
  selectedCategory,
  onCategoryChange
}: ProductCatalogToolbarProps) => (
  <div className='-mx-1 flex gap-2 overflow-x-auto px-1 pb-2' role='group' aria-label='Filtrar productos por categoría'>
    {categories.map(({ label, icon: Icon }) => {
      const isSelected = selectedCategory === label

      return (
        <button
          key={label}
          type='button'
          aria-pressed={isSelected}
          onClick={() => onCategoryChange(label)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
            isSelected
              ? 'bg-primary text-white shadow-sm'
              : 'border border-stone-100 bg-white text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Icon aria-hidden='true' className='h-4 w-4' />
          {labels[label]}
        </button>
      )
    })}
  </div>
)
