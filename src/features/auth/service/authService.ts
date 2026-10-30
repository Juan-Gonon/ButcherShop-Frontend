import api from '../../../lib/api/api'
import type { userLogin } from '../types/interface'

export const authService = async ({ user, password }: userLogin) => {
  try {
    const res = await api.post('/auth/', {
      usuario: user,
      password: password
    })

    // console.log(res)

    return res
  } catch (error) {
    console.log(error)
  }
}