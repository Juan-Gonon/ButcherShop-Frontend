import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AuthSuccess,
  UserInfo
} from '../../features/auth/types/interface'

interface AuthState {
  status: 'checking' | 'authenticated' | 'not-authenticated'
  user: UserInfo | null
  token: string | null
  errorMessage: string | null
  verificationErrorKind: 'temporary' | 'unexpected' | null
}

const initialState: AuthState = {
  status: 'checking',
  user: null,
  token: null,
  errorMessage: null,
  verificationErrorKind: null
}

export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    onChecking: (state) => {
      state.status = 'checking'
      state.user = null
      state.token = null
      state.errorMessage = null
      state.verificationErrorKind = null
    },
    onLogin: (state, { payload }: PayloadAction<AuthSuccess>) => {
      state.status = 'authenticated'
      state.user = payload.user
      state.token = payload.token
      state.errorMessage = null
      state.verificationErrorKind = null
    },
    onLogOut: (state, { payload }: PayloadAction<string | undefined>) => {
      state.status = 'not-authenticated'
      state.user = null
      state.token = null
      state.errorMessage = payload || null
      state.verificationErrorKind = null
    },
    onVerificationError: (
      state,
      {
        payload
      }: PayloadAction<{
        message: string
        kind: 'temporary' | 'unexpected'
      }>
    ) => {
      state.status = 'not-authenticated'
      state.user = null
      state.token = null
      state.errorMessage = payload.message
      state.verificationErrorKind = payload.kind
    },
    clearErrorMessage: (state) => {
      state.errorMessage = null
    }
  }
})

export const {
  onChecking,
  onLogin,
  onLogOut,
  onVerificationError,
  clearErrorMessage
} =
  authSlice.actions
