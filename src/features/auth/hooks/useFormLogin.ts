// src/features/auth/hooks/useFormLogin.ts
import { useForm, type SubmitHandler } from 'react-hook-form'
import type { UserLogin } from '../types/interface'
import { useAuthStore } from '../../../store/hooks/useAuthStore'

export const useFormLogin = () => {
  const { starLogin, errorMessage, status } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserLogin>({
    defaultValues: {
      user: '',
      password: ''
    }
  })

  const onSubmit: SubmitHandler<UserLogin> = async (data) => {
    await starLogin(data)
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    errorMessage,
    status
  }
}