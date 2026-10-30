export interface UserLogin {
  user: string
  password: string
}

export interface UserInfo {
  id_carniceria: string
  nombre: string
  email: string
  activo: boolean
  fecha_creacion: string
  id_rol: string
  usuario: string
  uuid: string
}

export interface AuthResponse {
  ok: boolean
  user: UserInfo
  token: string
}
