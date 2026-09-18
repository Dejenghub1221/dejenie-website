import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

const NAV = [
  { to: '/',               icon: 'fa-gauge',          label: 'Dashboard'      },
  { to: '/profile',        icon: 'fa-user',           label: 'Profile'        },
  { to: '/experience',     icon: 'fa-briefcase',      label: 'Experience'     },
  { to: '/skills',         icon: 'fa-chart-bar',      label: 'Skills'         },
  { to: '/projects',       icon: 'fa-folder-open',    label: 'Projects'       },
  { to: '/services',       icon: 'fa-concierge-bell', label: 'Services'       },
  { to: '/certifications', icon: 'fa-certificate',    label: 'Certifications' },
  { to: '/gallery',        icon: 'fa-images',         label: 'Gallery'        },
  { to: '/messages',       icon: 'fa-envelope',       label: 'Messages'       },
  { to: '/chatbot',        icon: 'fa-robot',          label: 'Chatbot',  badge: 'NEW' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon"><i className="fas fa-bolt"></i></span>
            {!collapsed && <span className="logo-text">Admin Panel</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : ''}
            >
              <i className={`fas ${icon} nav-icon`}></i>
              {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
              {!collapsed && badge && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, background: '#3b82f6',
                  color: '#fff', padding: '2px 6px', borderRadius: 50,
                  letterSpacing: '0.5px', lineHeight: 1.4
                }}>{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
            <i className="fas fa-sign-out-alt nav-icon"></i>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="main-wrap">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            <i className="fas fa-bars"></i>
          </button>
          <span className="topbar-title">Portfolio Admin</span>
          <div className="topbar-right">
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
              <i className="fas fa-external-link-alt"></i> View Site
            </a>
            <div className="user-chip">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
              <span>{user?.username}</span>
            </div>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
