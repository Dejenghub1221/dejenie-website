import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'

export default function Profile() {
  const { data: profile, loading, refetch } = useApi('/api/profile')
  const { register, handleSubmit, reset } = useForm()
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [cvFile, setCvFile] = useState(null)

  useEffect(() => { if (profile) reset(profile) }, [profile, reset])

  const onSave = async (data) => {
    setSaving(true)
    try {
      await axios.put('/api/profile', data)
      toast.success('Profile saved!')
      refetch()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const uploadPhoto = async () => {
    if (!photoFile) return
    const fd = new FormData()
    fd.append('photo', photoFile)
    try {
      await axios.post('/api/profile/photo', fd)
      toast.success('Photo uploaded!')
      setPhotoFile(null); setPhotoPreview(null)
      refetch()
    } catch { toast.error('Upload failed') }
  }

  const uploadCv = async () => {
    if (!cvFile) return
    const fd = new FormData()
    fd.append('cv', cvFile)
    try {
      await axios.post('/api/profile/cv', fd)
      toast.success('CV uploaded!')
      setCvFile(null); refetch()
    } catch { toast.error('Upload failed') }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Profile <small>Your public profile information</small></div>
        <button className="btn btn-primary" onClick={handleSubmit(onSave)} disabled={saving}>
          {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}></div> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>

        {/* Photo & CV card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 16, fontSize: '0.9rem' }}>Profile Photo</h3>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile?.photo
                    ? <img src={profile.photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="fas fa-user" style={{ fontSize: '3rem', color: 'var(--text-light)' }}></i>
                }
              </div>
              <input type="file" accept="image/*" id="photoInput" style={{ display: 'none' }}
                onChange={e => { setPhotoFile(e.target.files[0]); setPhotoPreview(URL.createObjectURL(e.target.files[0])) }} />
              <label htmlFor="photoInput" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', marginBottom: 8 }}>
                <i className="fas fa-image"></i> Choose Photo
              </label>
              {photoFile && <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={uploadPhoto}><i className="fas fa-upload"></i> Upload</button>}
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 12, fontSize: '0.9rem' }}>CV / Resume</h3>
            {profile?.cvFile && <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: 10 }}><i className="fas fa-check-circle"></i> CV uploaded</p>}
            <input type="file" accept=".pdf,.doc,.docx" id="cvInput" style={{ display: 'none' }}
              onChange={e => setCvFile(e.target.files[0])} />
            <label htmlFor="cvInput" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'block', marginBottom: 8 }}>
              <i className="fas fa-file"></i> {cvFile ? cvFile.name : 'Choose File'}
            </label>
            {cvFile && <button className="btn btn-primary btn-sm" onClick={uploadCv}><i className="fas fa-upload"></i> Upload CV</button>}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSave)}>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 20, fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Basic Info</h3>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input className="form-control" {...register('name')} /></div>
              <div className="form-group"><label>Title</label><input className="form-control" {...register('title')} /></div>
            </div>
            <div className="form-group"><label>Tagline (badge text)</label><input className="form-control" {...register('tagline')} /></div>
            <div className="form-group"><label>Headline (hero big text)</label><input className="form-control" {...register('headline')} /></div>
            <div className="form-group"><label>Short Bio (hero description)</label><textarea className="form-control" rows={3} {...register('bio')} /></div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 20, fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>About Section</h3>
            <div className="form-group"><label>Paragraph 1</label><textarea className="form-control" rows={3} {...register('about1')} /></div>
            <div className="form-group"><label>Paragraph 2</label><textarea className="form-control" rows={3} {...register('about2')} /></div>
            <div className="form-group"><label>Paragraph 3</label><textarea className="form-control" rows={3} {...register('about3')} /></div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 20, fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Contact Info</h3>
            <div className="form-row">
              <div className="form-group"><label>Location</label><input className="form-control" {...register('location')} /></div>
              <div className="form-group"><label>Email</label><input className="form-control" type="email" {...register('email')} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input className="form-control" {...register('phone')} /></div>
              <div className="form-group"><label>Availability</label><input className="form-control" {...register('availability')} /></div>
            </div>
          </div>

          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 20, fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Social Links</h3>
            <div className="form-row">
              <div className="form-group"><label>LinkedIn URL</label><input className="form-control" {...register('linkedin')} /></div>
              <div className="form-group"><label>GitHub URL</label><input className="form-control" {...register('github')} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Twitter URL</label><input className="form-control" {...register('twitter')} /></div>
              <div className="form-group"><label>Telegram URL</label><input className="form-control" {...register('telegram')} /></div>
            </div>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontWeight: 700, color: 'var(--dark)', marginBottom: 20, fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>Stats (Hero numbers)</h3>
            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="form-group"><label>Years Experience</label><input className="form-control" type="number" {...register('stats.experience')} /></div>
              <div className="form-group"><label>Projects Done</label><input className="form-control" type="number" {...register('stats.projects')} /></div>
              <div className="form-group"><label>Happy Clients</label><input className="form-control" type="number" {...register('stats.clients')} /></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
