export interface ClientSearchResult {
  id: string
  uuid: string
  nombre: string
  telefono: string | null
  direccion_defecto: string | null
  es_generico: boolean
}

export interface ClientSearchResponse {
  ok: true
  clients: ClientSearchResult[]
}
