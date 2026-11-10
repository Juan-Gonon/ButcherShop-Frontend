export interface Preparation {
  id: string
  nombre: string
  descripcion: string
}

export interface PreparationsResponse {
  ok: true
  preparations: Preparation[]
}

export type PreparationsStatus =
  | 'idle'
  | 'loading'
  | 'error'
  | 'empty'
  | 'success'
