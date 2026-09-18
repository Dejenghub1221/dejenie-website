import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useApi } from '../hooks/useApi'
import './Chatbot.css'

export default function Chatbot() {
  const { data: config, loading, refetch } = useApi('/api/chatbot')
  const [saving, setSaving]     = useState(false)
  const [faqModal, setFaqModal] = useState(false)
  const [editFaq, setEditFaq]   = useState(null)
  const [faqSaving, setFaqSaving] = useState(false)
  const [quickInput, setQuickInput] = useState('')
  const [quickReplies, setQuickReplies] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewMsgs, setPreviewMsgs] = useState([])
  const [previewInput, setPreviewInput] = useState('')
  const [previewTyping, setPreviewTyping] = useState(false)

  const { register, handleSubmit, reset } = useForm()
  const { register: faqReg, handleSubmit: faqSubmit, reset: faqReset } = useForm()

  // Populate form when config loads
  useEffect(() => {
    if (config) {
      reset({
        botName:     config.botName     || '',
        greeting:    config.greeting    || '',
        placeholder: config.placeholder || '',
        color:       config.color       || '#3b82f6',
        enabled:     config.enabled     !== false
      })
      setQuickReplies(config.quickReplies || [])
    }
  }, [config, reset])

  /* ── Save general settings ── */
  const onSave = async (data) => {
    setSaving(true)
    try {
      await axios.put('/api/chatbot', { ...data, quickReplies, enabled: data.enabled === true || data.enabled === 'true' })
      toast.success('Chatbot settings saved!')
      refetch()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  /* ── Quick replies ── */
  const addQuick = () => {
    const val = quickInput.trim()
    if (!val) return
    if (quickReplies.includes(val)) { toast.error('Already exists'); return }
    setQuickReplies([...quickReplies, val])
    setQuickInput('')
  }
  const removeQuick = (i) => setQuickReplies(quickReplies.filter((_, idx) => idx !== i))

  /* ── FAQ modal ── */
  const openFaqNew  = () => { setEditFaq(null); faqReset({ keywords: '', answer: '' }); setFaqModal(true) }
  const openFaqEdit = (faq) => { setEditFaq(faq); faqReset({ keywords: faq.keywords.join(', '), answer: faq.answer }); setFaqModal(true) }
  const closeFaqModal = () => { setFaqModal(false); setEditFaq(null) }

  const onFaqSave = async (data) => {
    setFaqSaving(true)
    try {
      if (editFaq) {
        await axios.put(`/api/chatbot/faqs/${editFaq.id}`, data)
        toast.success('FAQ updated!')
      } else {
        await axios.post('/api/chatbot/faqs', data)
        toast.success('FAQ added!')
      }
      refetch(); closeFaqModal()
    } catch { toast.error('Failed to save FAQ') }
    finally { setFaqSaving(false) }
  }

  const deleteFaq = async (id) => {
    if (!confirm('Delete this FAQ?')) return
    try { await axios.delete(`/api/chatbot/faqs/${id}`); toast.success('Deleted'); refetch() }
    catch { toast.error('Delete failed') }
  }

  /* ── Live preview ── */
  const sendPreview = async () => {
    const msg = previewInput.trim()
    if (!msg || previewTyping) return
    setPreviewMsgs(prev => [...prev, { role: 'user', text: msg }])
    setPreviewInput('')
    setPreviewTyping(true)
    try {
      const res = await axios.post('/api/chatbot/message', { message: msg })
      setTimeout(() => {
        setPreviewTyping(false)
        setPreviewMsgs(prev => [...prev, { role: 'bot', text: res.data.reply }])
      }, 600)
    } catch {
      setPreviewTyping(false)
      setPreviewMsgs(prev => [...prev, { role: 'bot', text: '⚠️ Error connecting to chatbot.' }])
    }
  }

  const openPreview = () => {
    setPreviewOpen(true)
    if (previewMsgs.length === 0) {
      setPreviewMsgs([{ role: 'bot', text: config?.greeting || 'Hi! How can I help you?' }])
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          Chatbot <small>Configure your portfolio assistant</small>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={openPreview}>
            <i className="fas fa-play"></i> Test Chatbot
          </button>
          <button className="btn btn-primary" onClick={handleSubmit(onSave)} disabled={saving}>
            {saving
              ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div> Saving...</>
              : <><i className="fas fa-save"></i> Save Settings</>}
          </button>
        </div>
      </div>

      <div className="chatbot-admin-grid">

        {/* ── LEFT: Settings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* General settings */}
          <div className="card" style={{ padding: 24 }}>
            <h3 className="chatbot-section-title"><i className="fas fa-cog"></i> General Settings</h3>

            <div className="form-group">
              <label>Bot Status</label>
              <label className="toggle-switch">
                <input type="checkbox" {...register('enabled')} />
                <span className="toggle-track">
                  <span className="toggle-thumb"></span>
                </span>
                <span className="toggle-label">Chatbot is active on portfolio</span>
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bot Name</label>
                <input className="form-control" {...register('botName')} placeholder="e.g. Dejenie Bot" />
              </div>
              <div className="form-group">
                <label>Chat Bubble Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" {...register('color')} style={{ width: 44, height: 36, padding: 2, border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer' }} />
                  <input className="form-control" {...register('color')} placeholder="#3b82f6" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Greeting Message</label>
              <textarea className="form-control" rows={3} {...register('greeting')}
                placeholder="Hi there! 👋 I'm the assistant. Ask me anything!" />
              <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                This is the first message visitors see when they open the chat.
              </small>
            </div>

            <div className="form-group">
              <label>Input Placeholder Text</label>
              <input className="form-control" {...register('placeholder')} placeholder="Type a message..." />
            </div>
          </div>

          {/* Quick replies */}
          <div className="card" style={{ padding: 24 }}>
            <h3 className="chatbot-section-title"><i className="fas fa-bolt"></i> Quick Reply Buttons</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: 16 }}>
              These appear as clickable chips in the chat window for fast responses.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                className="form-control"
                placeholder="e.g. What are your skills?"
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addQuick()}
              />
              <button className="btn btn-primary btn-sm" onClick={addQuick}>
                <i className="fas fa-plus"></i> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {quickReplies.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>No quick replies yet.</p>
              )}
              {quickReplies.map((q, i) => (
                <div key={i} className="quick-chip">
                  <span>{q}</span>
                  <button onClick={() => removeQuick(i)}><i className="fas fa-times"></i></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: FAQs ── */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="chatbot-section-title" style={{ margin: 0 }}>
                <i className="fas fa-comments"></i> FAQ Responses
                <span className="badge badge-blue" style={{ marginLeft: 8 }}>{config?.faqs?.length || 0}</span>
              </h3>
              <button className="btn btn-primary btn-sm" onClick={openFaqNew}>
                <i className="fas fa-plus"></i> Add FAQ
              </button>
            </div>

            <p style={{ padding: '10px 20px', fontSize: '0.8rem', color: 'var(--text-light)', borderBottom: '1px solid var(--border)' }}>
              When a visitor types a message, the bot searches these keywords and replies with the matching answer.
            </p>

            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {(!config?.faqs || config.faqs.length === 0) && (
                <div className="empty-state"><i className="fas fa-comments"></i><p>No FAQs yet</p></div>
              )}
              {config?.faqs?.map((faq, i) => (
                <div key={faq.id} className="faq-row">
                  <div className="faq-number">{i + 1}</div>
                  <div className="faq-content">
                    <div className="faq-keywords">
                      {faq.keywords.map(k => (
                        <span key={k} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{k}</span>
                      ))}
                    </div>
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                  <div className="faq-actions">
                    <button className="btn btn-icon btn-sm" onClick={() => openFaqEdit(faq)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteFaq(faq.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ Modal ── */}
      {faqModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeFaqModal()}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>{editFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <button className="btn btn-icon" onClick={closeFaqModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={faqSubmit(onFaqSave)}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Keywords (comma separated) *</label>
                  <input className="form-control" {...faqReg('keywords', { required: true })}
                    placeholder="skill, skills, expertise, tech, good at" />
                  <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                    If the visitor's message contains ANY of these words, this answer is shown.
                  </small>
                </div>
                <div className="form-group">
                  <label>Answer *</label>
                  <textarea className="form-control" rows={4} {...faqReg('answer', { required: true })}
                    placeholder="Type the reply the bot will send..." />
                  <small style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                    You can use basic HTML like &lt;a href="..."&gt;link&lt;/a&gt; in the answer.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeFaqModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={faqSaving}>
                  {faqSaving ? 'Saving...' : editFaq ? 'Update FAQ' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Live Preview Panel ── */}
      {previewOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreviewOpen(false)}>
          <div className="modal" style={{ maxWidth: 400, padding: 0, overflow: 'hidden' }}>
            {/* Preview header */}
            <div style={{ background: config?.color || 'var(--gradient)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{config?.botName || 'Dejenie Bot'}</div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Live Preview</div>
                </div>
              </div>
              <button onClick={() => setPreviewOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Messages */}
            <div style={{ padding: 16, minHeight: 260, maxHeight: 320, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {previewMsgs.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '9px 14px', borderRadius: 14, fontSize: '0.875rem', lineHeight: 1.55,
                    background: m.role === 'user' ? (config?.color || '#3b82f6') : '#fff',
                    color: m.role === 'user' ? '#fff' : 'var(--dark)',
                    border: m.role === 'bot' ? '1px solid var(--border)' : 'none',
                    borderBottomLeftRadius: m.role === 'bot' ? 4 : 14,
                    borderBottomRightRadius: m.role === 'user' ? 4 : 14,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.07)'
                  }}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                  />
                </div>
              ))}
              {previewTyping && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: '#fff', borderRadius: 14, width: 'fit-content', border: '1px solid var(--border)' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, background: '#94a3b8', borderRadius: '50%', display: 'inline-block', animation: `typingBounce 1.2s ${i*0.2}s infinite` }}></span>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderTop: '1px solid var(--border)', background: '#fff' }}>
              <input
                className="form-control"
                style={{ borderRadius: 50, flex: 1, fontSize: '0.875rem' }}
                placeholder={config?.placeholder || 'Type a message...'}
                value={previewInput}
                onChange={e => setPreviewInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendPreview()}
              />
              <button
                onClick={sendPreview}
                style={{ width: 38, height: 38, background: config?.color || '#3b82f6', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-light)', padding: '6px', borderTop: '1px solid var(--border)' }}>
              This is a live preview — messages are processed by the real bot
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
