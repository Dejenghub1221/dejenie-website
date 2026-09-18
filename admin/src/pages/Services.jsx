import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Services() {
  const { data: items, loading, refetch } = useApi('/api/services')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const openNew = () => { setEditing(null); reset({ title: '', description: '', icon: 'fas fa-cog', color: '#3b82f6' }); setModal(true) }
  const openEdit = (item) => { setEditing(item); reset(item); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) await axios.put(`/api/services/${editing.id}`, data)
      else await axios.post('/api/services', data)
      toast.success(editing ? 'Updated!' : 'Added!'); refetch(); closeModal()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    try { await axios.delete(`/api/services/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Services <small>{items?.length} services</small></div>
        <button className="btn btn-primary" onClick={openNew}><i className="fas fa-plus"></i> Add Service</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 20 }}>
        {items?.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><i className="fas fa-concierge-bell"></i><p>No services yet</p></div>}
        {items?.map(item => (
          <div className="card" key={item.id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: item.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: item.color }}>
                <i className={item.icon}></i>
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dark)' }}>{item.title}</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 14, lineHeight: 1.6 }}>{item.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}><i className="fas fa-edit"></i> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button className="btn btn-icon" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-group"><label>Title *</label><input className="form-control" {...register('title', { required: true })} /></div>
                <div className="form-group"><label>Description *</label><textarea className="form-control" rows={3} {...register('description', { required: true })} /></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Font Awesome Icon class</label>
                    <input className="form-control" {...register('icon')} placeholder="fas fa-headset" />
                    <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>e.g. fas fa-database</small>
                  </div>
                  <div className="form-group">
                    <label>Icon Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="color" {...register('color')} />
                      <input className="form-control" {...register('color')} placeholder="#3b82f6" style={{ flex: 1 }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
