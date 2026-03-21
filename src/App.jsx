import { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Stocks from './pages/Stocks'
import Quiz from './pages/Quiz'
import Chat from './pages/Chat'
import Portfolio from './pages/Portfolio'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import Navbar from './components/Navbar'

export default function App() {
  const API = '/api'
  const [page, setPage] = useState('landing')
  const [pageKey, setPageKey] = useState(0)
  const [token, setToken] = useState(localStorage.getItem('finsight_token') || '')
  const [currentUser, setCurrentUser] = useState(null)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    const boot = async () => {
      if (!token) return
      try {
        const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const me = await meRes.json()
        if (!meRes.ok) throw new Error('Session expired')
        setCurrentUser(me.user)
        const profileRes = await fetch(`${API}/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
        const profileData = await profileRes.json()
        setProfileReady(Boolean(profileData.profile))
      } catch {
        localStorage.removeItem('finsight_token')
        setToken('')
        setCurrentUser(null)
        setProfileReady(false)
      }
    }
    boot()
  }, [token])

  const navigate = (p) => {
    const protectedPages = ['dashboard', 'portfolio', 'stocks', 'quiz', 'chat']
    if (!token && protectedPages.includes(p)) {
      setPage('auth')
      setPageKey(k => k + 1)
      window.scrollTo(0, 0)
      return
    }
    if (token && !profileReady && protectedPages.includes(p)) {
      setPage('onboarding')
      setPageKey(k => k + 1)
      window.scrollTo(0, 0)
      return
    }
    setPage(p)
    setPageKey(k => k + 1)
    window.scrollTo(0, 0)
  }

  const startOnboarding = () => navigate('onboarding')

  const onAuthSuccess = (newToken, user) => {
    localStorage.setItem('finsight_token', newToken)
    setToken(newToken)
    setCurrentUser(user)
    setProfileReady(false)
    setPage('onboarding')
    setPageKey(k => k + 1)
  }

  const completeOnboarding = () => {
    setProfileReady(true)
    setPage('dashboard')
    setPageKey(k => k + 1)
    window.scrollTo(0, 0)
  }

  const logout = () => {
    localStorage.removeItem('finsight_token')
    setToken('')
    setCurrentUser(null)
    setProfileReady(false)
    setPage('landing')
    setPageKey(k => k + 1)
  }

  const isLanding = page === 'landing' || page === 'onboarding' || page === 'auth'

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {!isLanding && <Navbar page={page} navigate={navigate} user={currentUser} startOnboarding={startOnboarding} logout={logout} />}
      <main key={pageKey} style={{ paddingTop: isLanding ? 0 : '72px' }}>
        {page === 'landing' && <Landing navigate={navigate} />}
        {page === 'auth' && <Auth onAuthSuccess={onAuthSuccess} />}
        {page === 'onboarding' && <Onboarding onComplete={completeOnboarding} token={token} />}
        {page === 'dashboard' && <Dashboard navigate={navigate} user={currentUser} token={token} startOnboarding={startOnboarding} />}
        {page === 'stocks' && <Stocks />}
        {page === 'quiz' && <Quiz />}
        {page === 'chat' && <Chat />}
        {page === 'portfolio' && <Portfolio user={currentUser} token={token} navigate={navigate} />}
      </main>
    </div>
  )
}