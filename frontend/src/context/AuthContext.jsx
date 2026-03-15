import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  })

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  const register = async (name, email, password, currency) => {
    const res = await api.post('/auth/register', { name, email, password, currency })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data))
    setUser(res.data)
    return res.data
  }

  const logout = () => { localStorage.clear(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
