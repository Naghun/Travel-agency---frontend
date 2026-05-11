import React, { useState, useEffect, useCallback } from 'react'
import './Placanja.scss'
import PageHeader from '../../../features/PageHeader/PageHeader'
import Modal from '../../../components/Modal/Modal'
import apiClient from '../../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const METHOD_LABEL = { cash: 'Gotovina', bank_transfer: 'Bankovna uplata', card: 'Kartica', other: 'Ostalo' }
const METHOD_OPTIONS = [
  { value: 'cash',          label: 'Gotovina' },
  { value: 'bank_transfer', label: 'Bankovna uplata' },
  { value: 'card',          label: 'Kartica' },
  { value: 'other',         label: 'Ostalo' },
]

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const y  = d.getFullYear()
  return `${dd}. ${mm}. ${y}.`
}

// ── Payment Form (create / edit) ─────────────────────────────────────────────
function PaymentForm({ payment, invoices, onSuccess, onCancel }) {
  const isEdit = !!payment
  const [form, setForm] = useState({
    invoice_id:     payment?.invoice_id    ?? '',
    amount:         payment?.amount        ?? '',
    payment_date:   payment?.payment_date  ?? new Date().toISOString().slice(0, 10),
    payment_method: payment?.payment_method ?? 'cash',
    reference_number: payment?.reference_number ?? '',
    notes:          payment?.notes         ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.invoice_id || !form.amount || !form.payment_date) {
      setError('Faktura, iznos i datum su obavezni.'); return
    }
    setLoading(true); setError(null)
    try {
      const body = {
        invoice_id:     parseInt(form.invoice_id),
        amount:         parseFloat(form.amount),
        payment_date:   form.payment_date,
        payment_method: form.payment_method || 'cash',
        reference_number: form.reference_number || null,
        notes:          form.notes || null,
      }
      if (isEdit) {
        const { invoice_id, ...editBody } = body
        await apiClient.put(`/payments/${payment.id}`, editBody)
      } else {
        await apiClient.post('/payments', body)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri snimanju.')
      setLoading(false)
    }
  }

  return (
    <div className="pl-form">
      {error && <div className="pl-error">{error}</div>}

      {!isEdit && (
        <div className="pl-form-group required">
          <label>Faktura</label>
          <select value={form.invoice_id} onChange={set('invoice_id')}>
            <option value="">— Odaberi fakturu —</option>
            {invoices.map(inv => (
              <option key={inv.id} value={inv.id}>
                #{inv.invoice_number} – {inv.first_name} {inv.last_name} – {inv.program_name} ({inv.remaining_amount} KM preostalo)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="pl-form-row">
        <div className="pl-form-group required">
          <label>Iznos (KM)</label>
          <input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
        </div>
        <div className="pl-form-group required">
          <label>Datum uplate</label>
          <input type="date" value={form.payment_date} onChange={set('payment_date')} />
        </div>
      </div>

      <div className="pl-form-row">
        <div className="pl-form-group">
          <label>Metoda plaćanja</label>
          <select value={form.payment_method} onChange={set('payment_method')}>
            {METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="pl-form-group">
          <label>Referentni broj</label>
          <input type="text" value={form.reference_number} onChange={set('reference_number')} placeholder="UPL-2026-001" />
        </div>
      </div>

      <div className="pl-form-group">
        <label>Napomena</label>
        <textarea value={form.notes} onChange={set('notes')} placeholder="Opcionalna napomena..." />
      </div>

      <div className="pl-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-save" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Snimanje...' : isEdit ? 'Sačuvaj izmjene' : 'Evidentiraj uplatu'}
        </button>
      </div>
    </div>
  )
}

// ── Payment Detail ────────────────────────────────────────────────────────────
function PaymentDetail({ payment }) {
  const inv = payment.invoice || {}
  return (
    <div className="pl-detail">
      <div className="pl-detail-grid">
        <div>
          <span className="pl-label">PUTNIK</span>
          <span>{inv.first_name} {inv.last_name}</span>
        </div>
        <div>
          <span className="pl-label">PROGRAM</span>
          <span>{inv.program_name || '—'}</span>
        </div>
        <div>
          <span className="pl-label">FAKTURA #</span>
          <span>{inv.invoice_number || '—'}</span>
        </div>
        <div>
          <span className="pl-label">STATUS FAKTURE</span>
          <span className={`pl-inv-badge ${INV_STATUS_CLASS[inv.status]}`}>
            {INV_STATUS_LABEL[inv.status] || inv.status || '—'}
          </span>
        </div>
        <div>
          <span className="pl-label">IZNOS UPLATE</span>
          <span className="pl-amount-big">KM {parseFloat(payment.amount || 0).toFixed(2)}</span>
        </div>
        <div>
          <span className="pl-label">DATUM UPLATE</span>
          <span>{formatDate(payment.payment_date)}</span>
        </div>
        <div>
          <span className="pl-label">METODA</span>
          <span>{METHOD_LABEL[payment.payment_method] || payment.payment_method || '—'}</span>
        </div>
        <div>
          <span className="pl-label">REFERENTNI BROJ</span>
          <span>{payment.reference_number || '—'}</span>
        </div>
        <div>
          <span className="pl-label">UKUPNO FAKTURA</span>
          <span>KM {parseFloat(inv.total_amount || 0).toFixed(2)}</span>
        </div>
        <div>
          <span className="pl-label">PREOSTALO</span>
          <span>KM {parseFloat(inv.remaining_amount || 0).toFixed(2)}</span>
        </div>
      </div>
      {payment.notes && (
        <div className="pl-detail-row">
          <span className="pl-label">NAPOMENA</span>
          <p>{payment.notes}</p>
        </div>
      )}
      <div className="pl-detail-meta">
        <span>Kreirao: <strong>{payment.creator?.name || '—'}</strong></span>
        <span>Evidentirano: <strong>{formatDate(payment.created_at)}</strong></span>
      </div>
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function PaymentDelete({ payment, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const inv = payment.invoice || {}

  const handleDelete = async () => {
    setLoading(true); setError(null)
    try {
      await apiClient.delete(`/payments/${payment.id}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju.')
      setLoading(false)
    }
  }

  return (
    <div className="pl-delete">
      <p>Da li ste sigurni da želite obrisati uplatu od <strong>KM {parseFloat(payment.amount || 0).toFixed(2)}</strong> za fakturu <strong>#{inv.invoice_number}</strong>?</p>
      <p className="pl-delete-warning">Brisanjem uplate automatski će se ažurirati status fakture.</p>
      {error && <div className="pl-error">{error}</div>}
      <div className="pl-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-delete" onClick={handleDelete} disabled={loading}>
          {loading ? 'Brisanje...' : 'Obriši uplatu'}
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Placanja() {
  const [placanja, setPlacanja]         = useState([])
  const [programs, setPrograms]         = useState([])
  const [invoices, setInvoices]         = useState([])
  const [filterProgram, setFilterProgram] = useState('')
  const [filterMethod, setFilterMethod]   = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteRow, setDeleteRow]   = useState(null)

  const fetchPlacanja = useCallback(() => {
    apiClient.get('/payments')
      .then(res => setPlacanja(res.data))
      .catch(err => console.error('Payments error:', err))
  }, [])

  useEffect(() => {
    fetchPlacanja()
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
    apiClient.get('/invoices').then(res => setInvoices(res.data)).catch(() => {})
  }, [fetchPlacanja])

  const filtered = placanja.filter(p => {
    const inv = p.invoice || {}
    if (filterProgram && String(inv.program_id) !== filterProgram) return false
    if (filterMethod  && p.payment_method !== filterMethod)          return false
    return true
  })

  return (
    <div className="placanja-container">
      <PageHeader title="Plaćanja" singular="uplatu" onAdd={() => setShowCreate(true)} />

      <div className="pl-filters">
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="">Svi programi</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
          <option value="">Sve metode</option>
          {METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="pl-table-box">
        <table className="pl-table">
          <thead>
            <tr>
              <th>DATUM</th>
              <th>PUTNIK</th>
              <th>PROGRAM</th>
              <th>FAKTURA</th>
              <th>IZNOS</th>
              <th>NAČIN</th>
              <th>EVIDENTIRAO</th>
              <th>AKCIJE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="pl-empty">Nema plaćanja za prikaz.</td></tr>
            ) : filtered.map(p => {
              const inv       = p.invoice || {}
              const passenger = inv.reservation?.passenger || {}
              const program   = inv.reservation?.program   || {}
              return (
                <tr key={p.id}>
                  <td>{formatDate(p.payment_date)}</td>
                  <td>
                    <span className="pl-putnik">{passenger.first_name} {passenger.last_name}</span>
                  </td>
                  <td>{program.name || '—'}</td>
                  <td>
                    <span className="pl-inv-num">#{inv.invoice_number || p.invoice_id}</span>
                  </td>
                  <td>
                    <span className="pl-amount">KM {parseFloat(p.amount || 0).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="pl-method-badge">{METHOD_LABEL[p.payment_method] || p.payment_method || '—'}</span>
                  </td>
                  <td>
                    <span className="pl-creator">{p.creator?.name || '—'}</span>
                  </td>
                  <td>
                    <div className="pl-row-actions">
                      <button className="pl-btn pl-btn--delete" onClick={() => setDeleteRow(p)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal title="Nova uplata" onClose={() => setShowCreate(false)}>
          <PaymentForm
            invoices={invoices}
            onSuccess={() => { setShowCreate(false); fetchPlacanja() }}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {deleteRow && (
        <Modal title="Brisanje uplate" onClose={() => setDeleteRow(null)}>
          <PaymentDelete
            payment={deleteRow}
            onSuccess={() => { setDeleteRow(null); fetchPlacanja() }}
            onCancel={() => setDeleteRow(null)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Placanja
