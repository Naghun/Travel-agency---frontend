import React, { useState, useEffect, useCallback } from 'react'
import './Fakture.scss'
import PageHeader from '../../../features/PageHeader/PageHeader'
import Modal from '../../../components/Modal/Modal'
import apiClient from '../../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faFilePdf, faDownload, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

const ROOM_LABEL = { single: '1-KREVETNA', double: '2-KREVETNA', triple: '3-KREVETNA', quadruple: '4-KREVETNA' }

const INV_STATUS_LABEL = { unpaid: 'NEPLAĆENO', partial: 'DJELIMIČNO', paid: 'PLAĆENO', cancelled: 'OTKAZANO' }
const INV_STATUS_CLASS = { unpaid: 'inv--unpaid', partial: 'inv--partial', paid: 'inv--paid', cancelled: 'inv--cancelled' }
const INV_STATUS_OPTIONS = [
  { value: 'unpaid',    label: 'Neplaćeno' },
  { value: 'partial',   label: 'Djelimično' },
  { value: 'paid',      label: 'Plaćeno' },
  { value: 'cancelled', label: 'Otkazano' },
]

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const y  = d.getFullYear()
  return `${dd}. ${mm}. ${y}.`
}

const fmt = (n) => parseFloat(n || 0).toFixed(2)

// ── Payment progress bar ──────────────────────────────────────────────────────
function PaymentBar({ paid, total }) {
  const paidNum  = parseFloat(paid)  || 0
  const totalNum = parseFloat(total) || 0
  const pct      = totalNum > 0 ? Math.min((paidNum / totalNum) * 100, 100) : 0
  const color    = pct >= 100 ? '#1a8a3a' : pct > 0 ? '#e6a817' : '#ddd'

  return (
    <div className="fak-payment-cell">
      <div className="fak-payment-amounts">
        <span className="paid">KM {paidNum.toFixed(2)}</span>
        <span className="sep"> / </span>
        <span className="total">KM {totalNum.toFixed(2)}</span>
      </div>
      <div className="fak-payment-bar">
        <div className="fak-payment-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ── Invoice detail modal ──────────────────────────────────────────────────────
function InvoiceDetail({ invoice }) {
  const res  = invoice.reservation || {}
  const prog = res.program          || {}

  const [pdfUrl,      setPdfUrl]      = useState(null)
  const [pdfLoading,  setPdfLoading]  = useState(false)
  const [pdfVisible,  setPdfVisible]  = useState(false)

  const loadPdf = async () => {
    if (pdfUrl) { setPdfVisible(v => !v); return }
    setPdfLoading(true)
    try {
      const res = await apiClient.get(`/export/invoices/${invoice.id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      setPdfUrl(url)
      setPdfVisible(true)
    } catch (err) {
      console.error('PDF load error:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `${invoice.invoice_number || `faktura-${invoice.id}`}.pdf`
      a.click()
      return
    }
    setPdfLoading(true)
    try {
      const res = await apiClient.get(`/export/invoices/${invoice.id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      setPdfUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.invoice_number || `faktura-${invoice.id}`}.pdf`
      a.click()
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="fak-detail">
      <div className="fak-detail-grid">
        <div><span className="fak-label">FAKTURA #</span><span>{invoice.invoice_number}</span></div>
        <div><span className="fak-label">STATUS</span>
          <span className={`fak-inv-badge ${INV_STATUS_CLASS[invoice.status]}`}>
            {INV_STATUS_LABEL[invoice.status] || invoice.status}
          </span>
        </div>
        <div><span className="fak-label">PUTNIK</span><span>{invoice.first_name} {invoice.last_name}</span></div>
        <div><span className="fak-label">PROGRAM</span><span>{invoice.program_name || prog.name || '—'}</span></div>
        <div><span className="fak-label">UKUPNO</span><span className="fak-amount-big">KM {fmt(invoice.total_amount)}</span></div>
        <div><span className="fak-label">PLAĆENO</span><span>KM {fmt(invoice.paid_amount)}</span></div>
        <div><span className="fak-label">PREOSTALO</span><span>KM {fmt(invoice.remaining_amount)}</span></div>
        <div><span className="fak-label">ROK PLAĆANJA</span><span>{formatDate(invoice.due_date)}</span></div>
        {invoice.paid_at && (
          <div><span className="fak-label">DATUM PLAĆANJA</span><span>{formatDate(invoice.paid_at)}</span></div>
        )}
        <div><span className="fak-label">VALUTA</span><span>{invoice.currency || 'BAM'}</span></div>
      </div>

      {invoice.payments?.length > 0 && (
        <div className="fak-payments-list">
          <span className="fak-label">UPLATE</span>
          {invoice.payments.map(p => (
            <div key={p.id} className="fak-payment-row">
              <span>{formatDate(p.payment_date)}</span>
              <span className="fak-pay-amount">KM {fmt(p.amount)}</span>
              <span className="fak-pay-method">{p.payment_method}</span>
              {p.reference_number && <span className="fak-pay-ref">#{p.reference_number}</span>}
            </div>
          ))}
        </div>
      )}

      {invoice.notes && (
        <div className="fak-detail-row">
          <span className="fak-label">NAPOMENA</span>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="fak-detail-meta">
        <span>Kreirao: <strong>{invoice.creator?.name || '—'}</strong></span>
        <span>Datum: <strong>{formatDate(invoice.created_at)}</strong></span>
      </div>

      {/* PDF actions */}
      <div className="fak-pdf-actions">
        <button className="fak-pdf-btn fak-pdf-btn--preview" onClick={loadPdf} disabled={pdfLoading}>
          <FontAwesomeIcon icon={pdfVisible ? faChevronUp : faChevronDown} />
          {pdfLoading ? 'Učitavanje...' : pdfVisible ? 'Sakrij pregled' : 'Pregledaj PDF'}
        </button>
        <button className="fak-pdf-btn fak-pdf-btn--download" onClick={downloadPdf} disabled={pdfLoading}>
          <FontAwesomeIcon icon={faDownload} />
          Preuzmi PDF
        </button>
      </div>

      {pdfVisible && pdfUrl && (
        <div className="fak-pdf-preview">
          <iframe src={pdfUrl} title="Faktura PDF" />
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Fakture() {
  const [fakture, setFakture]         = useState([])
  const [programs, setPrograms]       = useState([])
  const [filterProgram, setFilterProgram] = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [viewRow, setViewRow]         = useState(null)
  const [pdfLoading, setPdfLoading]   = useState(null)

  const fetchFakture = useCallback(() => {
    const params = {}
    if (filterProgram) params.program_id = filterProgram
    if (filterStatus)  params.status     = filterStatus
    apiClient.get('/invoices', { params })
      .then(res => setFakture(res.data))
      .catch(err => console.error('Invoices error:', err))
  }, [filterProgram, filterStatus])

  useEffect(() => {
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchFakture() }, [fetchFakture])

  const exportPdf = async (id, invoiceNumber) => {
    setPdfLoading(id)
    try {
      const res = await apiClient.get(`/export/invoices/${id}/pdf`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href    = url
      a.download = `${invoiceNumber || `faktura-${id}`}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally {
      setPdfLoading(null)
    }
  }

  // Summary totals from current filtered list
  const totalPaid      = fakture.reduce((s, f) => s + parseFloat(f.paid_amount      || 0), 0)
  const totalRemaining = fakture.reduce((s, f) => s + parseFloat(f.remaining_amount || 0), 0)
  const totalAmount    = fakture.reduce((s, f) => s + parseFloat(f.total_amount     || 0), 0)

  return (
    <div className="fakture-container">
      <PageHeader title="Fakture" singular="fakturu" />

      {/* Summary cards */}
      <div className="fak-summary">
        <div className="fak-summary-card fak-summary--paid">
          <span className="fak-summary-label">Ukupno plaćeno</span>
          <span className="fak-summary-amount">KM {totalPaid.toFixed(2)}</span>
          <span className="fak-summary-sub">{fakture.filter(f => f.status === 'paid').length} faktura</span>
        </div>
        <div className="fak-summary-card fak-summary--unpaid">
          <span className="fak-summary-label">Neplaćeno</span>
          <span className="fak-summary-amount">KM {fakture.filter(f => f.status === 'unpaid').reduce((s,f) => s + parseFloat(f.total_amount||0), 0).toFixed(2)}</span>
          <span className="fak-summary-sub">{fakture.filter(f => f.status === 'unpaid').length} faktura</span>
        </div>
        <div className="fak-summary-card fak-summary--remaining">
          <span className="fak-summary-label">Za platiti</span>
          <span className="fak-summary-amount">KM {totalRemaining.toFixed(2)}</span>
          <span className="fak-summary-sub">od ukupno KM {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="fak-filters">
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="">Svi programi</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Svi statusi</option>
          {INV_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="fak-table-box">
        <table className="fak-table">
          <thead>
            <tr>
              <th>PUTNIK</th>
              <th>PROGRAM</th>
              <th>DATUM POLASKA</th>
              <th>SOBA</th>
              <th>STATUS</th>
              <th>PLAĆANJE</th>
              <th>KREIRAO</th>
              <th>AKCIJE</th>
            </tr>
          </thead>
          <tbody>
            {fakture.length === 0 ? (
              <tr><td colSpan={8} className="fak-empty">Nema faktura za prikaz.</td></tr>
            ) : fakture.map(f => {
              const res  = f.reservation || {}
              const prog = res.program    || {}
              const room = res.room_type
              return (
                <tr key={f.id}>
                  <td>
                    <span className="fak-putnik">{f.first_name} {f.last_name}</span>
                  </td>
                  <td>
                    <div className="fak-program-cell">
                      <span className="fak-program-name">{f.program_name || prog.name || '—'}</span>
                      <span className="fak-destination">{prog.destination || '—'}</span>
                    </div>
                  </td>
                  <td>{formatDate(prog.start_date)}</td>
                  <td>
                    {room
                      ? <span className="fak-room-badge">{ROOM_LABEL[room] || room}</span>
                      : <span className="fak-no-room">—</span>
                    }
                  </td>
                  <td>
                    <span className={`fak-inv-badge ${INV_STATUS_CLASS[f.status]}`}>
                      {INV_STATUS_LABEL[f.status] || f.status}
                    </span>
                  </td>
                  <td>
                    <PaymentBar paid={f.paid_amount} total={f.total_amount} />
                  </td>
                  <td>
                    <span className="fak-creator">{f.creator?.name || '—'}</span>
                  </td>
                  <td>
                    <div className="fak-row-actions">
                      <button className="fak-btn fak-btn--view" onClick={() => setViewRow(f)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        className="fak-btn fak-btn--pdf"
                        onClick={() => exportPdf(f.id, f.invoice_number)}
                        disabled={pdfLoading === f.id}
                      >
                        <FontAwesomeIcon icon={faFilePdf} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {viewRow && (
        <Modal title={`Faktura #${viewRow.invoice_number}`} onClose={() => setViewRow(null)}>
          <InvoiceDetail invoice={viewRow} />
        </Modal>
      )}
    </div>
  )
}

export default Fakture
