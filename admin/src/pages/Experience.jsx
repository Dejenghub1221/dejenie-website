import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Experience() {
  const { data: items, loading, refetch } = useApi('/api/experience')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const openNew = () => { setEditing(null); reset({ title: '', company: '', period: '', description: '', tags: '' }); setModal(true) }
  const openEdit = (item) => { setEditing(item); reset({ ...item, tags: item.tags?.join(', ') }); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const onSubmit = async (data) => {
    setSaving(true)
    const payload = { ...data, tags: data.tags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      if (editing) await axios.put(`/api/experience/${editing.id}`, payload)
      else await axios.post('/api/experience', payload)
      toast.success(editing ? 'Updated!' : 'Added!'); refetch(); closeModal()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this experience?')) return
    try { await axios.delete(`/api/experience/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Experience <small>{items?.length} entries</small></div>
        <button className="btn btn-primary" onClick={openNew}><i className="fas fa-plus"></i> Add Experience</button>
      </div>

      <div className="card">
        {items?.length === 0 && <div className="empty-state"><i className="fas fa-briefcase"></i><p>No experience added yet</p></div>}
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Title</th><th>Company</th><th>Period</th><th>Tags</th><th>Actions</th></tr></thead>
            <tbody>
              {items?.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-light)', width: 40 }}>{i + 1}</td>
                  <td><strong>{item.title}</strong></td>
                  <td>{item.company}</td>
                  <td><span className="badge badge-blue">{item.period}</span></td>
                  <td>{item.tags?.map(t => <span key={t} className="badge badge-gray" style={{ marginRight: 4 }}>{t}</span>)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon btn" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
                      <button className="btn btn-danger btn-icon" onClick={() => onDelete(item.id)}><i className="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Experience' : 'Add Experience'}</h3>
              <button className="btn-icon btn" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Job Title *</label><input className="form-control" {...register('title', { required: true })} placeholder="e.g. IT Manager" /></div>
                  <div className="form-group"><label>Company *</label><input className="form-control" {...register('company', { required: true })} placeholder="e.g. ABC Corp" /></div>
                </div>
                <div className="form-group"><label>Period *</label><input className="form-control" {...register('period', { required: true })} placeholder="e.g. 2022 – Present" /></div>
                <div className="form-group"><label>Description *</label><textarea className="form-control" rows={4} {...register('description', { required: true })} placeholder="Describe your responsibilities..." /></div>
                <div className="form-group"><label>Tags (comma separated)</label><input className="form-control" {...register('tags')} placeholder="ERP, Networking, Cloud" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
