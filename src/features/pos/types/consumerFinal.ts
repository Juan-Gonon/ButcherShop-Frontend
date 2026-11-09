export interface ConsumerFinal {
  id: string
  uuid: string
  nombre: string
  telefono: string | null
  direccion_defecto: string
  es_generico: boolean
  fecha_registro: string
}

export interface ConsumerFinalResponse {
  ok: true
  data: ConsumerFinal
}
