import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'checking', // 'authenticated', 'not-authenticated'
  user: {},
  errorMessage: undefined
}

export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    onChecking: (state) => {
      state.status = 'checking'
      state.user = {}
      state.errorMessage = undefined
    },
    onLogin: (state) => {
      state.status = 'authenticated'
      state.user = {}
      state.errorMessage = undefined
    },
    onLogOut: (state) => {
      state.status = 'not-authenticated'
      state.user = {}
      state.errorMessage = undefined
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined
    }
  }
})

export const {onChecking, onLogin, onLogOut, clearErrorMessage} = authSlice.actions
