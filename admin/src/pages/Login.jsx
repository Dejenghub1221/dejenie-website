import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <span className="login-logo-icon"><i className="fas fa-bolt"></i></span>
          <h1>Portfolio Admin</h1>
          <p>Manage your portfolio content from one place. Update your profile, projects, skills, and more.</p>
        </div>
        <div className="login-features">
          {['Manage all sections', 'Upload photos & files', 'View contact messages', 'Real-time updates'].map(f => (
            <div className="login-feature" key={f}>
              <i className="fas fa-check-circle"></i> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign In</h2>
            <p>Enter your admin credentials</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <div className="input-icon-wrap">
                <i className="fas fa-user input-icon"></i>
                <input
                  className="form-control"
                  type="text"
                  placeholder="admin"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <i className="fas fa-lock input-icon"></i>
                <input
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <div className="login-hint">
              <i className="fas fa-info-circle"></i> Default: <code>admin</code> / <code>admin123</code>
            </div>

            <button className="btn btn-primary btn-login" type="submit" disabled={loading}>
              {loading ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}></div> Signing in...</> : <><i className="fas fa-sign-in-alt"></i> Sign In</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
