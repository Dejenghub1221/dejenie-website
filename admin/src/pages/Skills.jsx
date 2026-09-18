import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Skills() {
  const { data: items, loading, refetch } = useApi('/api/skills')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pct, setPct] = useState(80)
  const { register, handleSubmit, reset, watch } = useForm()

  const openNew = () => { setEditing(null); setPct(80); reset({ name: '', percentage: 80, category: 'Technical' }); setModal(true) }
  const openEdit = (item) => { setEditing(item); setPct(item.percentage); reset(item); setModal(true) }
  const closeModal = () => { setModal(false); setEditing(null) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) await axios.put(`/api/skills/${editing.id}`, { ...data, percentage: Number(data.percentage) })
      else await axios.post('/api/skills', { ...data, percentage: Number(data.percentage) })
      toast.success(editing ? 'Updated!' : 'Added!'); refetch(); closeModal()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this skill?')) return
    try { await axios.delete(`/api/skills/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Skills <small>{items?.length} skills</small></div>
        <button className="btn btn-primary" onClick={openNew}><i className="fas fa-plus"></i> Add Skill</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Skill Name</th><th>Category</th><th>Level</th><th style={{width:180}}>Progress</th><th>Actions</th></tr></thead>
            <tbody>
              {items?.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td><span className="badge badge-blue">{item.category}</span></td>
                  <td><strong>{item.percentage}%</strong></td>
                  <td>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.percentage}%`, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: 4 }}></div>
                    </div>
                  </td>
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
              <h3>{editing ? 'Edit Skill' : 'Add Skill'}</h3>
              <button className="btn btn-icon" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-group"><label>Skill Name *</label><input className="form-control" {...register('name', { required: true })} placeholder="e.g. Network Administration" /></div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" {...register('category')}>
                    <option value="Technical">Technical</option>
                    <option value="Tools">Tools</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Proficiency: <strong>{pct}%</strong></label>
                  <input type="range" min={1} max={100} {...register('percentage')}
                    onChange={e => setPct(e.target.value)} value={pct} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>
                    <span>Beginner</span><span>Intermediate</span><span>Expert</span>
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
