"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { getCurrentUser, login, logout as apiLogout, changePassword as apiChangePassword, type User } from "@/lib/api/auth"
import { useTheme } from 'next-themes';

interface UserContextType {
  user: User | null
  loading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => Promise<boolean>
  changePassword: (current: string, next: string) => Promise<boolean>
  fetchUser: () => Promise<void>
}

export const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { setTheme } = useTheme()

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      const userData = await getCurrentUser()
      setUser(userData)

      // Load profile image from localStorage if available
      const userTheme = userData?.preferences?.theme
      if (userTheme) setTheme(userTheme)
      if (userData && localStorage.getItem("profileImage")) {
        // We don't need to do anything here as the Avatar component will handle this
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user"))
    } finally {
      setLoading(false)
    }
}, [setTheme])
  

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const loginUser = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const userData = await login({ email, password })
      setUser(userData)
      setPrefs(userData?.preferences);
      if (userData?.preferences?.theme) {
        setTheme(userData.preferences.theme);
      }
      return userData
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"))
      return null
    } finally {
      setLoading(false)
    }
  }

  const logoutUser = async () => {
    setLoading(true)
    try {
      const success = await apiLogout()
      if (success) {
        setUser(null)
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout failed"))
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User> & {preferences?: User['preferences']}) => {
    if (!user) return false

    setLoading(true)
    try {
      // In a real app, you would call an API endpoint here
      // For now, we'll just update the local state
      setUser({ ...user, ...userData })

      if (userData.preferences?.theme) {
        setTheme(userData.preferences.theme)
      }

      // Store in localStorage for persistence
      localStorage.setItem("userData", JSON.stringify({ ...user, ...userData }))

      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Update failed"))
      return false
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (current: string, next: string) => {
    setLoading(true)
    try {
      return await apiChangePassword(current, next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login: loginUser,
        logout: logoutUser,
        updateUser,
        changePassword,
        fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
function setPrefs(preferences?: {
  defaultCurrency: string
  theme: "light" | "dark" | "system"
  emailNotifications: {
    marketUpdates: boolean
    securityAlerts: boolean
    transactionNotifications: boolean
    newsletter: boolean
  }
}) {
  if (!preferences) return

  try {
    localStorage.setItem("userPrefs", JSON.stringify(preferences))
  } catch (e) {
    console.error("Failed to save preferences to localStorage:", e)
  }
}
