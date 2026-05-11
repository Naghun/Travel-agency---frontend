import React, { useState, useEffect, useCallback } from 'react'
import './OnlinePrijave.scss'
import apiClient from '../../../api/apiClient.jsx'
import Modal from '../../../components/Modal/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLink, faClipboard, faToggleOn, faToggleOff, faTrash,
  faEye, faCheck, faTimes, faPlus, faChevronDown
} from '@fortawesome/free-solid-svg-icons'

const STATUS_LABEL = { pending: 'Na čekanju', approved: 'Odobrena', rejected: 'Odbijena' }
const STATUS_CLASS = { pending: 'badge--pending', approved: 'badge--approved', rejected: 'badge--rejected' }
const ROOM_OPTIONS = [
  { value: '', label: '— bez sobe —' },
  { value: 'single', label: 'Jednokrevetna' },
  { value: 'double', label: 'Dvokrevetna' },
  { value: 'triple', label: 'Trokrevetna' },
  { value: 'quadruple', label: 'Četverokrevetna' },
]
const formatDate  = (iso) => iso ? new Date(iso).toLocaleDateString('bs-BA') : '—'
const dash        = (v)   => v || '—'

// ─── Approve modal ───────────────────────────────────────────────
function ApproveModal({ registration, onSuccess, onClose }) {
  const [roomType, setRoomType] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const fd = registration.form_data || {}

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post(`/public-registrations/${registration.id}/approve`, {
        room_type: roomType || undefined,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri odobravanju.')
      setLoading(false)
    }
  }

  return (
    <div className="op-approve-modal">
      <div className="op-reg-summary">
        <strong>{fd.first_name} {fd.last_name}</strong>
        <span>{fd.email}</span>
        <span>{fd.phone}</span>
      </div>
      <p className="op-approve-note">
        Odobravanjem prijave automatski se kreira putnik, rezervacija i faktura.
      </p>
      <div className="op-form-group">
        <label>Tip sobe (opcionalno)</label>
        <select value={roomType} onChange={e => setRoomType(e.target.value)}>
          {ROOM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {error && <div className="op-error">{error}</div>}
      <div className="op-actions">
        <button className="btn-cancel" onClick={onClose}>Odustani</button>
        <button className="btn-approve" onClick={handleApprove} disabled={loading}>
          {loading ? 'Odobravanje...' : 'Odobri prijavu'}
        </button>
      </div>
    </div>
  )
}

// ─── Reject modal ────────────────────────────────────────────────
function RejectModal({ registration, onSuccess, onClose }) {
  const [reason, setReason]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const fd = registration.form_data || {}

  const handleReject = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post(`/public-registrations/${registration.id}/reject`, { reason })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri odbijanju.')
      setLoading(false)
    }
  }

  return (
    <div className="op-approve-modal">
      <p>Odbijanje prijave za <strong>{fd.first_name} {fd.last_name}</strong>.</p>
      <div className="op-form-group">
        <label>Razlog odbijanja (opcionalno)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Npr. program je popunjen..." />
      </div>
      {error && <div className="op-error">{error}</div>}
      <div className="op-actions">
        <button className="btn-cancel" onClick={onClose}>Odustani</button>
        <button className="btn-reject" onClick={handleReject} disabled={loading}>
          {loading ? 'Odbijanje...' : 'Odbij prijavu'}
        </button>
      </div>
    </div>
  )
}

// ─── Registration detail modal ───────────────────────────────────
function RegistrationDetail({ registration }) {
  const fd = registration.form_data || {}
  return (
    <div className="op-detail">
      <div className="op-detail-grid">
        <div><span className="op-label">Ime</span><span>{dash(fd.first_name)}</span></div>
        <div><span className="op-label">Prezime</span><span>{dash(fd.last_name)}</span></div>
        <div><span className="op-label">Email</span><span>{dash(fd.email)}</span></div>
        <div><span className="op-label">Telefon</span><span>{dash(fd.phone)}</span></div>
        <div><span className="op-label">Pasoš</span><span>{dash(fd.passport_number)}</span></div>
        <div><span className="op-label">Datum rođenja</span><span>{formatDate(fd.date_of_birth)}</span></div>
        <div><span className="op-label">Spol</span><span>{dash(fd.gender)}</span></div>
        <div><span className="op-label">Tip sobe</span><span>{dash(fd.room_type)}</span></div>
        <div><span className="op-label">Grad</span><span>{dash(fd.city)}</span></div>
        <div><span className="op-label">Država</span><span>{dash(fd.country)}</span></div>
      </div>
      {fd.room_preference && (
        <div className="op-detail-row"><span className="op-label">Preferencija sobe</span><p>{fd.room_preference}</p></div>
      )}
      {fd.notes && (
        <div className="op-detail-row"><span className="op-label">Napomene</span><p>{fd.notes}</p></div>
      )}
      <div className="op-detail-meta">
        <span>Datum prijave: {formatDate(registration.created_at)}</span>
        <span>IP: {registration.ip_address || '—'}</span>
        {registration.processed_at && <span>Obrađena: {formatDate(registration.processed_at)}</span>}
      </div>
    </div>
  )
}

// ─── Create link modal ───────────────────────────────────────────
function CreateLinkModal({ programs, onSuccess, onClose }) {
  const [form, setForm] = useState({
    program_id: '', title: '', description: '',
    expires_at: '', max_registrations: '',
    require_passport: false, require_id_card: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/registration-links', {
        program_id:        parseInt(form.program_id),
        title:             form.title || undefined,
        description:       form.description || undefined,
        expires_at:        form.expires_at || undefined,
        max_registrations: form.max_registrations ? parseInt(form.max_registrations) : undefined,
        require_passport:  form.require_passport,
        require_id_card:   form.require_id_card,
      })
      onSuccess()
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(', ') : err.response?.data?.message || 'Greška.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="op-create-link-form" onSubmit={handleSubmit}>
      {error && <div className="op-error">{error}</div>}
      <div className="op-form-group required">
        <label>Program *</label>
        <select name="program_id" value={form.program_id} onChange={handleChange} required>
          <option value="">— odaberi program —</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="op-form-group">
        <label>Naziv linka (opcionalno)</label>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Automatski iz naziva programa" />
      </div>
      <div className="op-form-group">
        <label>Opis</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Kratki opis za putnike..." />
      </div>
      <div className="op-form-row">
        <div className="op-form-group">
          <label>Istjek linka</label>
          <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={handleChange} />
        </div>
        <div className="op-form-group">
          <label>Maks. prijava</label>
          <input type="number" name="max_registrations" value={form.max_registrations} onChange={handleChange} min="1" placeholder="Neograničeno" />
        </div>
      </div>
      <div className="op-checkboxes">
        <label><input type="checkbox" name="require_passport" checked={form.require_passport} onChange={handleChange} /> Zahtijeva broj pasoša</label>
        <label><input type="checkbox" name="require_id_card" checked={form.require_id_card} onChange={handleChange} /> Zahtijeva broj lične karte</label>
      </div>
      <div className="op-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Odustani</button>
        <button type="submit" className="btn-approve" disabled={loading}>
          {loading ? 'Kreiranje...' : 'Kreiraj link'}
        </button>
      </div>
    </form>
  )
}

// ─── Main page ───────────────────────────────────────────────────
function OnlinePrijave() {
  const [activeTab, setActiveTab]     = useState('prijave')
  const [programs, setPrograms]       = useState([])

  // Prijave state
  const [prijave, setPrijave]         = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [viewReg, setViewReg]         = useState(null)
  const [approveReg, setApproveReg]   = useState(null)
  const [rejectReg, setRejectReg]     = useState(null)

  // Linkovi state
  const [linkovi, setLinkovi]         = useState([])
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [copied, setCopied]           = useState(null)

  useEffect(() => {
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
  }, [])

  const fetchPrijave = useCallback(() => {
    const params = {}
    if (filterStatus)  params.status     = filterStatus
    if (filterProgram) params.program_id = filterProgram
    apiClient.get('/public-registrations', { params })
      .then(res => setPrijave(res.data))
      .catch(() => {})
  }, [filterStatus, filterProgram])

  const fetchLinkovi = useCallback(() => {
    apiClient.get('/registration-links')
      .then(res => setLinkovi(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => { fetchPrijave() }, [fetchPrijave])
  useEffect(() => { fetchLinkovi() }, [fetchLinkovi])

  const handleToggleLink = async (id) => {
    await apiClient.put(`/registration-links/${id}/toggle`).catch(() => {})
    fetchLinkovi()
  }

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Obrisati link?')) return
    await apiClient.delete(`/registration-links/${id}`).catch(() => {})
    fetchLinkovi()
  }

  const copyUrl = (token) => {
    const url = `${window.location.origin}/api/public/register/${token}`
    navigator.clipboard.writeText(`https://api.spahic.dev/api/public/register/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="online-prijave-container">
      <div className="op-page-header">
        <h2>Online prijave</h2>
      </div>

      {/* Tabs */}
      <div className="op-tabs">
        <button className={activeTab === 'prijave' ? 'active' : ''} onClick={() => setActiveTab('prijave')}>
          Prijave
          {prijave.filter(p => p.status === 'pending').length > 0 && (
            <span className="op-badge">{prijave.filter(p => p.status === 'pending').length}</span>
          )}
        </button>
        <button className={activeTab === 'linkovi' ? 'active' : ''} onClick={() => setActiveTab('linkovi')}>
          Linkovi za prijavu
        </button>
      </div>

      {/* ── Prijave tab ── */}
      {activeTab === 'prijave' && (
        <div className="op-section">
          <div className="op-filters">
            <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
              <option value="">Svi programi</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Svi statusi</option>
              <option value="pending">Na čekanju</option>
              <option value="approved">Odobrena</option>
              <option value="rejected">Odbijena</option>
            </select>
          </div>

          <div className="op-table-box">
            <table className="op-table">
              <thead>
                <tr>
                  <th>PUTNIK</th>
                  <th>EMAIL / TELEFON</th>
                  <th>PROGRAM</th>
                  <th>DATUM PRIJAVE</th>
                  <th>STATUS</th>
                  <th>AKCIJE</th>
                </tr>
              </thead>
              <tbody>
                {prijave.length === 0 ? (
                  <tr><td colSpan={6} className="op-empty">Nema prijava.</td></tr>
                ) : prijave.map(r => {
                  const fd = r.form_data || {}
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{fd.first_name} {fd.last_name}</strong>
                      </td>
                      <td>
                        <div className="op-contact">
                          <span>{dash(fd.email)}</span>
                          <span className="op-phone">{dash(fd.phone)}</span>
                        </div>
                      </td>
                      <td>{r.registration_link?.program?.name || '—'}</td>
                      <td>{formatDate(r.created_at)}</td>
                      <td>
                        <span className={`op-status-badge ${STATUS_CLASS[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td>
                        <div className="op-row-actions">
                          <button className="op-btn op-btn--view" onClick={() => setViewReg(r)} title="Pregled">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          {r.status === 'pending' && (
                            <>
                              <button className="op-btn op-btn--approve" onClick={() => setApproveReg(r)} title="Odobri">
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button className="op-btn op-btn--reject" onClick={() => setRejectReg(r)} title="Odbij">
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Linkovi tab ── */}
      {activeTab === 'linkovi' && (
        <div className="op-section">
          <div className="op-linkovi-header">
            <p className="op-linkovi-desc">Kreirajte javne linkove koje možete podijeliti s putnicima za online prijavu na program.</p>
            <button className="op-create-btn" onClick={() => setShowCreateLink(true)}>
              <FontAwesomeIcon icon={faPlus} /> Novi link
            </button>
          </div>

          <div className="op-table-box">
            <table className="op-table">
              <thead>
                <tr>
                  <th>NAZIV</th>
                  <th>PROGRAM</th>
                  <th>STATUS</th>
                  <th>ISTJEK</th>
                  <th>MAKS.</th>
                  <th>JAVNI URL</th>
                  <th>AKCIJE</th>
                </tr>
              </thead>
              <tbody>
                {linkovi.length === 0 ? (
                  <tr><td colSpan={7} className="op-empty">Nema kreiranih linkova.</td></tr>
                ) : linkovi.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.title}</strong></td>
                    <td>{l.program?.name || '—'}</td>
                    <td>
                      <span className={`op-status-badge ${l.is_active ? 'badge--approved' : 'badge--rejected'}`}>
                        {l.is_active ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </td>
                    <td>{formatDate(l.expires_at)}</td>
                    <td>{l.max_registrations ?? '∞'}</td>
                    <td>
                      <button
                        className={`op-copy-btn ${copied === l.token ? 'copied' : ''}`}
                        onClick={() => copyUrl(l.token)}
                      >
                        <FontAwesomeIcon icon={faClipboard} />
                        {copied === l.token ? 'Kopirano!' : 'Kopiraj URL'}
                      </button>
                    </td>
                    <td>
                      <div className="op-row-actions">
                        <button
                          className={`op-btn ${l.is_active ? 'op-btn--toggle-on' : 'op-btn--toggle-off'}`}
                          onClick={() => handleToggleLink(l.id)}
                          title={l.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                        >
                          <FontAwesomeIcon icon={l.is_active ? faToggleOn : faToggleOff} />
                        </button>
                        <button className="op-btn op-btn--reject" onClick={() => handleDeleteLink(l.id)} title="Obriši">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewReg && (
        <Modal title="Detalji prijave" onClose={() => setViewReg(null)}>
          <RegistrationDetail registration={viewReg} />
        </Modal>
      )}
      {approveReg && (
        <Modal title="Odobri prijavu" onClose={() => setApproveReg(null)}>
          <ApproveModal
            registration={approveReg}
            onSuccess={() => { setApproveReg(null); fetchPrijave() }}
            onClose={() => setApproveReg(null)}
          />
        </Modal>
      )}
      {rejectReg && (
        <Modal title="Odbij prijavu" onClose={() => setRejectReg(null)}>
          <RejectModal
            registration={rejectReg}
            onSuccess={() => { setRejectReg(null); fetchPrijave() }}
            onClose={() => setRejectReg(null)}
          />
        </Modal>
      )}
      {showCreateLink && (
        <Modal title="Kreiraj link za prijavu" onClose={() => setShowCreateLink(false)}>
          <CreateLinkModal
            programs={programs}
            onSuccess={() => { setShowCreateLink(false); fetchLinkovi() }}
            onClose={() => setShowCreateLink(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default OnlinePrijave
