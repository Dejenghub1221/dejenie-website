import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Messages() {
  const { data: items, loading, refetch } = useApi('/api/messages')
  const [selected, setSelected] = useState(null)

  const markRead = async (id) => {
    try { await axios.patch(`/api/messages/${id}/read`); refetch() }
    catch { toast.error('Failed') }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await axios.delete(`/api/messages/${id}`)
      toast.success('Deleted')
      if (selected?.id === id) setSelected(null)
      refetch()
    } catch { toast.error('Failed') }
  }

  const openMessage = (msg) => {
    setSelected(msg)
    if (!msg.read) markRead(msg.id)
  }

  const unread = items?.filter(m => !m.read).length ?? 0

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          Messages
          <small>
            {items?.length} total
            {unread > 0 && <span className="badge badge-red" style={{ marginLeft: 8 }}>{unread} unread</span>}
          </small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, height: 'calc(100vh - 180px)' }}>

        {/* Message list */}
        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--dark)' }}>
            Inbox ({items?.length ?? 0})
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {items?.length === 0 && <div className="empty-state"><i className="fas fa-inbox"></i><p>No messages yet</p></div>}
            {items?.map(msg => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selected?.id === msg.id ? 'var(--primary-light)' : !msg.read ? '#f0f7ff' : 'transparent',
                  transition: 'background 0.15s',
                  borderLeft: selected?.id === msg.id ? '3px solid var(--primary)' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontWeight: !msg.read ? 700 : 600, fontSize: '0.875rem', color: 'var(--dark)' }}>{msg.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', flexShrink: 0 }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: 3, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.subject}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</div>
                {!msg.read && <span className="badge badge-blue" style={{ marginTop: 6, fontSize: '0.65rem' }}>New</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Message detail */}
        <div className="card" style={{ padding: 32, overflowY: 'auto' }}>
          {!selected
            ? <div className="empty-state"><i className="fas fa-envelope-open"></i><p>Select a message to read</p></div>
            : <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--dark)', marginBottom: 6 }}>{selected.subject}</h2>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      <span><i className="fas fa-user" style={{ marginRight: 6, color: 'var(--primary)' }}></i>{selected.name}</span>
                      <span><i className="fas fa-envelope" style={{ marginRight: 6, color: 'var(--primary)' }}></i><a href={`mailto:${selected.email}`} style={{ color: 'var(--primary)' }}>{selected.email}</a></span>
                      <span><i className="fas fa-clock" style={{ marginRight: 6 }}></i>{new Date(selected.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn-success btn-sm">
                      <i className="fas fa-reply"></i> Reply
                    </a>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(selected.id)}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '24px 28px',
                  fontSize: '0.925rem',
                  color: 'var(--dark-3)',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selected.message}
                </div>
              </>
          }
        </div>
      </div>
    </div>
  )
}
