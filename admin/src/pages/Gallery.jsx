import { useState, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Gallery() {
  const { data: items, loading, error, refetch } = useApi('/api/gallery')
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
        await axios.post('/api/gallery', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      toast.success(`${files.length} photo(s) uploaded!`)
      setCaption('')
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this photo?')) return
    try {
      await axios.delete(`/api/gallery/${id}`)
      toast.success('Deleted')
      refetch()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to delete')
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div> Loading gallery...
      </div>
    )
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title">Gallery</div>
        </div>
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#ef4444',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
          <p style={{ fontWeight: 600 }}>Failed to load gallery</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={refetch}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      </div>
    )
  }

  /* ── Safe list — always an array ── */
  const list = Array.isArray(items) ? items : []

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          Gallery <small>{list.length} photo{list.length !== 1 ? 's' : ''}</small>
        </div>
      </div>

      {/* ── Upload zone ── */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3
          style={{
            fontWeight: 700,
            color: 'var(--dark)',
            marginBottom: 16,
            fontSize: '0.9rem',
          }}
        >
          Upload Photos
        </h3>

        {/* Drop zone */}
        <div
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            padding: '40px 20px',
            textAlign: 'center',
            background: dragOver ? '#eff6ff' : 'var(--bg)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: 14,
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            upload(e.dataTransfer.files)
          }}
        >
          <i
            className="fas fa-cloud-upload-alt"
            style={{
              fontSize: '2.5rem',
              color: 'var(--primary)',
              marginBottom: 10,
              display: 'block',
            }}
          ></i>
          <p style={{ fontWeight: 600, color: 'var(--dark)', marginBottom: 4 }}>
            Drop photos here or click to browse
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            PNG, JPG, WEBP — max 10 MB each — multiple files supported
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => upload(e.target.files)}
        />

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="form-control"
            placeholder="Optional caption for uploaded photos"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{ maxWidth: 360, flex: 1 }}
          />
          {uploading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--primary)',
                fontSize: '0.875rem',
              }}
            >
              <div
                className="spinner"
                style={{ width: 16, height: 16, borderWidth: 2 }}
              ></div>
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* ── Gallery grid or empty state ── */}
      {list.length === 0 ? (
        <div className="empty-state card" style={{ padding: 60 }}>
          <i className="fas fa-images"></i>
          <p>No photos yet — upload some above</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {list.map(item => (
            <div
              key={item.id}
              className="gallery-admin-item"
              style={{
                position: 'relative',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: '#f8fafc',
                boxShadow: 'var(--shadow)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Image — full image visible, no cropping */}
              <img
                src={item.url}
                alt={item.caption || 'Gallery photo'}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  maxHeight: '320px',
                  objectFit: 'contain',
                  background: '#f8fafc',
                }}
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
                }}
              />
              {/* Fallback placeholder */}
              <div
                style={{
                  display: 'none',
                  height: 160,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8,
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                }}
              >
                <i className="fas fa-image" style={{ fontSize: '2rem' }}></i>
                <span>Image not found</span>
              </div>

              {/* Caption + delete bar — always visible at the bottom */}
              <div
                className="gallery-hover-overlay"
                style={{
                  padding: '10px 12px',
                  background: 'rgba(15,23,42,0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  flexWrap: 'wrap',
                }}
              >
                <p
                  style={{
                    color: 'white',
                    fontSize: '0.78rem',
                    flex: 1,
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {item.caption || ''}
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ flexShrink: 0 }}
                  onClick={() => onDelete(item.id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .gallery-admin-item:hover .gallery-hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
