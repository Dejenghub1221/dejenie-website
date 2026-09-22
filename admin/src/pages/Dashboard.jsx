import { useApi } from '../hooks/useApi'
import { Link } from 'react-router-dom'
import './Dashboard.css'

const SECTIONS = [
  { label: 'Experience',      path: '/experience',     icon: 'fa-briefcase',      color: '#3b82f6', key: 'experience'      },
  { label: 'Skills',          path: '/skills',         icon: 'fa-chart-bar',      color: '#6366f1', key: 'skills'          },
  { label: 'Projects',        path: '/projects',       icon: 'fa-folder-open',    color: '#10b981', key: 'projects'        },
  { label: 'Services',        path: '/services',       icon: 'fa-concierge-bell', color: '#f59e0b', key: 'services'        },
  { label: 'Certifications',  path: '/certifications', icon: 'fa-certificate',    color: '#ef4444', key: 'certifications'  },
  { label: 'Gallery',         path: '/gallery',        icon: 'fa-images',         color: '#8b5cf6', key: 'gallery'         },
]

export default function Dashboard() {
  const { data: exp }   = useApi('/api/experience')
  const { data: skills} = useApi('/api/skills')
  const { data: proj }  = useApi('/api/projects')
  const { data: svc }   = useApi('/api/services')
  const { data: certs } = useApi('/api/certifications')
  const { data: gal }   = useApi('/api/gallery')
  const { data: msgs }  = useApi('/api/messages')

  const counts = {
    experience: exp?.length ?? '—',
    skills: skills?.length ?? '—',
    projects: proj?.length ?? '—',
    services: svc?.length ?? '—',
    certifications: certs?.length ?? '—',
    gallery: gal?.length ?? '—',
  }

  const unread = msgs?.filter(m => !m.read).length ?? 0

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard <small>Welcome back! Here's your portfolio overview.</small></div>
        <a href="/portfolio" target="_blank" rel="noreferrer" className="btn btn-secondary">
          <i className="fas fa-external-link-alt"></i> View Portfolio
        </a>
      </div>

      {/* Stats row */}
      <div className="dash-stats">
        {SECTIONS.map(s => (
          <Link to={s.path} key={s.key} className="dash-stat-card card">
            <div className="dash-stat-icon" style={{ background: s.color + '1a', color: s.color }}>
              <i className={`fas ${s.icon}`}></i>
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{counts[s.key]}</span>
              <span className="dash-stat-label">{s.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-bottom">
        {/* Recent Messages */}
        <div className="card dash-messages">
          <div className="dash-card-header">
            <h3><i className="fas fa-envelope"></i> Recent Messages</h3>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {unread > 0 && <span className="badge badge-red">{unread} unread</span>}
              <Link to="/messages" className="btn btn-secondary btn-sm">View All</Link>
            </div>
          </div>
          <div className="dash-msgs-list">
            {!msgs && <div className="loading"><div className="spinner"></div></div>}
            {msgs?.length === 0 && <div className="empty-state"><i className="fas fa-inbox"></i><p>No messages yet</p></div>}
            {msgs?.slice(0, 5).map(m => (
              <div className={`dash-msg-item ${!m.read ? 'unread' : ''}`} key={m.id}>
                <div className="dash-msg-avatar">{m.name[0].toUpperCase()}</div>
                <div className="dash-msg-body">
                  <div className="dash-msg-name">{m.name} <span className="dash-msg-email">{m.email}</span></div>
                  <div className="dash-msg-subject">{m.subject}</div>
                </div>
                <div className="dash-msg-time">{new Date(m.created_at || m.createdAt || Date.now()).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="card dash-quick">
          <div className="dash-card-header"><h3><i className="fas fa-bolt"></i> Quick Actions</h3></div>
          <div className="dash-quick-list">
            <Link to="/profile"        className="dash-quick-item"><i className="fas fa-user"></i> Edit Profile</Link>
            <Link to="/projects"       className="dash-quick-item"><i className="fas fa-plus"></i> Add Project</Link>
            <Link to="/experience"     className="dash-quick-item"><i className="fas fa-plus"></i> Add Experience</Link>
            <Link to="/gallery"        className="dash-quick-item"><i className="fas fa-upload"></i> Upload Photos</Link>
            <Link to="/certifications" className="dash-quick-item"><i className="fas fa-plus"></i> Add Certification</Link>
            <Link to="/messages"       className="dash-quick-item"><i className="fas fa-envelope"></i> Check Messages</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
