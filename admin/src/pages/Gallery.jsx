import { useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Gallery() {
  const { data: items, loading, refetch } = useApi('/api/gallery')
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const upload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('image', file)
        fd.append('caption', caption)
        await axios.post('/api/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      toast.success(`${files.length} photo(s) uploaded!`)
      setCaption('')
      refetch()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this photo?')) return
    try { await axios.delete(`/api/gallery/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Gallery <small>{items?.length} photos</small></div>
      </div>

      {/* Upload zone */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 16, fontSize: '0.9rem' }}>Upload Photos</h3>
        <div
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '40px 20px',
            textAlign: 'center',
            background: dragOver ? 'var(--primary-light)' : 'var(--bg)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 14
          }}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files) }}
        >
          <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: 10, display: 'block' }}></i>
          <p style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>Drop photos here or click to browse</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>PNG, JPG, WEBP — max 5MB each — multiple files supported</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => upload(e.target.files)} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input className="form-control" placeholder="Optional caption for all uploaded photos"
            value={caption} onChange={e => setCaption(e.target.value)} style={{ maxWidth: 360 }} />
          {uploading && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.875rem' }}><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Uploading...</div>}
        </div>
      </div>

      {/* Grid */}
      {items?.length === 0
        ? <div className="empty-state card" style={{ padding: 60 }}><i className="fas fa-images"></i><p>No photos yet — upload some above</p></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--border)', boxShadow: 'var(--shadow)' }}
                className="gallery-admin-item">
                <img src={item.url} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(15,23,42,0.6)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                  gap: 8
                }} className="gallery-hover-overlay">
                  {item.caption && <p style={{ color: 'white', fontSize: '0.8rem', padding: '0 12px', textAlign: 'center' }}>{item.caption}</p>}
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
      }

      <style>{`
        .gallery-admin-item:hover .gallery-hover-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
