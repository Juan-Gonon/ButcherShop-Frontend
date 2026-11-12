import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from '../features/pos/store/cartSlice'
import { authSlice } from './auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
