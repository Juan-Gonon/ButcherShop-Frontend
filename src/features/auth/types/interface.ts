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

export interface AuthSuccess {
  ok: true
  user: UserInfo
  token: string
}

export interface AuthError {
  ok: false
  error: string
}

export type AuthResponse = AuthSuccess | AuthError
