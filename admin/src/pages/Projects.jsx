import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Projects() {
  const { data: items, loading, refetch } = useApi('/api/projects')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const openNew = () => { setEditing(null); setImgFile(null); setImgPreview(null); reset({ title: '', description: '', tags: '', link: '' }); setModal(true) }
  const openEdit = (item) => { setEditing(item); setImgFile(null); setImgPreview(item.image || null); reset({ ...item, tags: item.tags?.join(', ') }); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null); setImgFile(null); setImgPreview(null) }

  const onSubmit = async (data) => {
    setSaving(true)
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v))
    if (imgFile) fd.append('image', imgFile)
    try {
      if (editing) await axios.put(`/api/projects/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await axios.post('/api/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(editing ? 'Updated!' : 'Added!'); refetch(); closeModal()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try { await axios.delete(`/api/projects/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Projects <small>{items?.length} projects</small></div>
        <button className="btn btn-primary" onClick={openNew}><i className="fas fa-plus"></i> Add Project</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
        {items?.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><i className="fas fa-folder-open"></i><p>No projects yet</p></div>}
        {items?.map(item => (
          <div className="card" key={item.id} style={{ overflow: 'hidden' }}>
            <div style={{ height: 160, background: 'linear-gradient(135deg,#dbeafe,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {item.image
                ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#93c5fd' }}></i>}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {item.tags?.map(t => <span className="badge badge-blue" key={t}>{t}</span>)}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>{item.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 14, lineHeight: 1.6 }}>{item.description}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}><i className="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Project' : 'Add Project'}</h3>
              <button className="btn btn-icon" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                {/* Image upload */}
                <div className="form-group">
                  <label>Project Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', background: 'var(--bg)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {imgPreview ? <img src={imgPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-image" style={{ color: 'var(--text-light)' }}></i>}
                    </div>
                    <div>
                      <input type="file" accept="image/*" id="projImg" style={{ display: 'none' }}
                        onChange={e => { setImgFile(e.target.files[0]); setImgPreview(URL.createObjectURL(e.target.files[0])) }} />
                      <label htmlFor="projImg" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}><i className="fas fa-image"></i> Choose Image</label>
                    </div>
                  </div>
                </div>
                <div className="form-group"><label>Title *</label><input className="form-control" {...register('title', { required: true })} /></div>
                <div className="form-group"><label>Description *</label><textarea className="form-control" rows={3} {...register('description', { required: true })} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Tags (comma separated)</label><input className="form-control" {...register('tags')} placeholder="ERP, Odoo" /></div>
                  <div className="form-group"><label>Project Link</label><input className="form-control" {...register('link')} placeholder="https://..." /></div>
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
