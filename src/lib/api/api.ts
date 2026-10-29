import axios from 'axios'
import { getEnvVariables } from '../helpers/getEnv'

const { VITE_API_URL } = getEnvVariables()

const api = axios.create({
  baseURL: VITE_API_URL
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api