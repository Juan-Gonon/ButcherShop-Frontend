import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'checking', // 'authenticated', 'not-authenticated'
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
    onLogin: (state, { payload }) => {
      state.status = 'authenticated'
      state.user = payload.user
      state.token = payload.token
      state.errorMessage = null
    },
    onLogOut: (state, { payload }) => {
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

export const {onChecking, onLogin, onLogOut, clearErrorMessage} = authSlice.actions
