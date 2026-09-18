import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Certifications() {
  const { data: items, loading, refetch } = useApi('/api/certifications')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const openNew = () => { setEditing(null); reset({ title: '', issuer: '', year: '', category: '', icon: 'fas fa-certificate', color: '#3b82f6' }); setModal(true) }
  const openEdit = (item) => { setEditing(item); reset(item); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) await axios.put(`/api/certifications/${editing.id}`, data)
      else await axios.post('/api/certifications', data)
      toast.success(editing ? 'Updated!' : 'Added!'); refetch(); closeModal()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this certification?')) return
    try { await axios.delete(`/api/certifications/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Certifications <small>{items?.length} certs</small></div>
        <button className="btn btn-primary" onClick={openNew}><i className="fas fa-plus"></i> Add Certification</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Icon</th><th>Title</th><th>Issuer</th><th>Year</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
              {items?.length === 0 && <tr><td colSpan={6}><div className="empty-state"><i className="fas fa-certificate"></i><p>No certifications yet</p></div></td></tr>}
              {items?.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: item.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                      <i className={item.icon}></i>
                    </div>
                  </td>
                  <td><strong style={{ fontSize: '0.875rem' }}>{item.title}</strong></td>
                  <td>{item.issuer}</td>
                  <td><span className="badge badge-blue">{item.year}</span></td>
                  <td><span className="badge badge-gray">{item.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-icon" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
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
              <h3>{editing ? 'Edit Certification' : 'Add Certification'}</h3>
              <button className="btn btn-icon" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-group"><label>Certificate Title *</label><input className="form-control" {...register('title', { required: true })} placeholder="e.g. CCNA – Cisco Certified Network Associate" /></div>
                <div className="form-row">
                  <div className="form-group"><label>Issuing Organization *</label><input className="form-control" {...register('issuer', { required: true })} placeholder="e.g. Cisco" /></div>
                  <div className="form-group"><label>Year</label><input className="form-control" {...register('year')} placeholder="e.g. 2023" /></div>
                </div>
                <div className="form-group"><label>Category</label><input className="form-control" {...register('category')} placeholder="e.g. Networking, Cloud, Security" /></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Font Awesome Icon</label>
                    <input className="form-control" {...register('icon')} placeholder="fas fa-certificate" />
                  </div>
                  <div className="form-group">
                    <label>Icon Color</label>
                    <input type="color" {...register('color')} />
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
