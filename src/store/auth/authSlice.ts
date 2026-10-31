import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AuthResponse,
  UserInfo
} from '../../features/auth/types/interface'

interface AuthState {
  status: 'checking' | 'authenticated' | 'not-authenticated'
  user: UserInfo | null
  token: string | null
  errorMessage: string | null
}

const initialState: AuthState = {
  status: 'not-authenticated',
  user: null,
  token: null,
  errorMessage: null
}

export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    onChecking: (state) => {
      state.status = 'checking'
      state.user = null
      state.errorMessage = null
    },
    onLogin: (state, { payload }: PayloadAction<AuthResponse>) => {
      state.status = 'authenticated'
      state.user = payload.user
      state.token = payload.token
      state.errorMessage = null
    },
    onLogOut: (state, { payload }: PayloadAction<string | undefined>) => {
      state.status = 'not-authenticated'
      state.user = null
      state.token = null
      state.errorMessage = payload || null
    },
    clearErrorMessage: (state) => {
      state.errorMessage = null
    }
  }
})

export const { onChecking, onLogin, onLogOut, clearErrorMessage } =
  authSlice.actions
