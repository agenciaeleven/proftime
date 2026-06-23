import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react'
import { db, isStaticMode } from '@/api/client'
import type { AppPublicSettings, AuthContextValue, AuthError, User } from '@/types'

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const [appPublicSettings, setAppPublicSettings] = useState<AppPublicSettings | null>(null)

  useEffect(() => {
    void checkAppState()
  }, [])

  const checkAppState = async () => {
    if (isStaticMode) {
      const currentUser = await db.auth.me()
      setUser(currentUser)
      setIsAuthenticated(true)
      setIsLoadingAuth(false)
      setIsLoadingPublicSettings(false)
      return
    }
    try {
      setAuthError(null)
      setIsLoadingAuth(true)

      const currentUser = await db.auth.me()
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      setAuthError({
        type: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to load auth state',
      })
    } finally {
      setIsLoadingAuth(false)
      setIsLoadingPublicSettings(false)
    }
  }

  const logout = (shouldRedirect = true) => {
    setUser(null)
    setIsAuthenticated(false)
    db.auth.logout(shouldRedirect ? window.location.href : undefined)
  }

  const navigateToLogin = () => {
    db.auth.redirectToLogin(window.location.href)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
