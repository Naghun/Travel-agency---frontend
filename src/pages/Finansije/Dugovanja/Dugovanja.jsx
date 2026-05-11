import React, { useState, useEffect, useCallback } from 'react'
import './Dugovanja.scss'
import apiClient from '../../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExcel, faFilePdf, faEye, faSearch } from '@fortawesome/free-solid-svg-icons'

const INV_STATUS_LABEL = { unpaid: 'Neplaćeno', partial: 'Djelimično', paid: 'Plaćeno', cancelled: 'Otkazano' }
const INV_STATUS_CLASS  = { unpaid: 'dug--unpaid', partial: 'dug--partial', paid: 'dug--paid', cancelled: 'dug--cancelled' }

const fmt   = (n) => parseFloat(n || 0).toFixed(2)
const fmtKM = (n) => `KM ${fmt(n)}`

// ── Naplata progress bar ──────────────────────────────────────────────────────
function NaplataBar({ paid, total }) {
  const p   = parseFloat(paid)  || 0
  const t   = parseFloat(total) || 0
  const pct = t > 0 ? Math.min((p / t) * 100, 100) : 0
  const col = pct >= 100 ? '#1a8a3a' : pct > 0 ? '#e6a817' : '#e8e8f0'

  return (
    <div className="dug-bar-cell">
      <span className="dug-bar-pct">{Math.round(pct)}%</span>
      <div className="dug-bar-track">
        <div className="dug-bar-fill" style={{ width: `${pct}%`, backgroundColor: col }} />
      </div>
    </div>
  )
}

// ── Program status badges ─────────────────────────────────────────────────────
function ProgramStatus({ invoices }) {
  const counts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="dug-status-group">
      {Object.entries(counts).map(([status, count]) => (
        <span key={status} className={`dug-status-badge ${INV_STATUS_CLASS[status]}`}>
          {count} {INV_STATUS_LABEL[status]}
        </span>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Dugovanja() {
  const [data, setData]                       = useState(null)
  const [programs, setPrograms]               = useState([])
  const [filterProgram, setFilterProgram]     = useState('')
  const [searchPassenger, setSearchPassenger] = useState('')
  const [activeTab, setActiveTab]             = useState('programi')
  const [exporting, setExporting]             = useState(null)

  const fetchData = useCallback(() => {
    const params = {}
    if (filterProgram) params.program_id = filterProgram
    apiClient.get('/debts', { params })
      .then(res => setData(res.data))
      .catch(err => console.error('Debts error:', err))
  }, [filterProgram])

  useEffect(() => {
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const debts     = data?.debts      || []
  const byProgram = data?.by_program || []

  const totalFakt  = debts.reduce((s, d) => s + parseFloat(d.total_amount || 0), 0)
  const totalUplac = debts.reduce((s, d) => s + parseFloat(d.paid_amount  || 0), 0)
  const totalDug   = data?.total_debt || 0

  const filteredDebts = debts.filter(d => {
    if (!searchPassenger) return true
    const name = `${d.first_name} ${d.last_name}`.toLowerCase()
    return name.includes(searchPassenger.toLowerCase())
  })

  const exportExcel = async () => {
    setExporting('excel')
    try {
      const res = await apiClient.get('/export/financial-report/excel', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href = url; a.download = 'finansijski-izvjestaj.xlsx'; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error('Excel export error:', err) }
    finally { setExporting(null) }
  }

  return (
    <div className="dugovanja-container">

      {/* Custom header */}
      <div className="dug-header">
        <h3 className="dug-title">Dugovanja</h3>
        <div className="dug-header-actions">
          <button className="dug-action-btn dug-action-btn--preview" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faEye} />
            Pregled
          </button>
          <button className="dug-action-btn dug-action-btn--pdf" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faFilePdf} />
            PDF
          </button>
          <button
            className="dug-action-btn dug-action-btn--excel"
            onClick={exportExcel}
            disabled={exporting === 'excel'}
          >
            <FontAwesomeIcon icon={faFileExcel} />
            {exporting === 'excel' ? 'Izvoz...' : 'Excel'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="dug-summary">
        <div className="dug-summary-card dug-summary--total">
          <span className="dug-summary-label">Ukupno fakturisano</span>
          <span className="dug-summary-amount">{fmtKM(totalFakt)}</span>
          <span className="dug-summary-sub">{debts.length} faktura</span>
        </div>
        <div className="dug-summary-card dug-summary--paid">
          <span className="dug-summary-label">Ukupno uplaćeno</span>
          <span className="dug-summary-amount">{fmtKM(totalUplac)}</span>
          <span className="dug-summary-sub">{debts.filter(d => d.status === 'paid').length} potpuno plaćeno</span>
        </div>
        <div className="dug-summary-card dug-summary--debt">
          <span className="dug-summary-label">Ukupno dugovanje</span>
          <span className="dug-summary-amount">{fmtKM(totalDug)}</span>
          <span className="dug-summary-sub">{debts.filter(d => parseFloat(d.remaining) > 0).length} sa dugom</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="dug-tabs">
        <button className={activeTab === 'programi' ? 'active' : ''} onClick={() => setActiveTab('programi')}>
          Po programima
        </button>
        <button className={activeTab === 'putnici' ? 'active' : ''} onClick={() => setActiveTab('putnici')}>
          Po putnicima
        </button>
      </div>

      {/* Filters */}
      <div className="dug-filters">
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="">Svi programi</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {activeTab === 'putnici' && (
          <div className="dug-search">
            <FontAwesomeIcon icon={faSearch} className="dug-search-icon" />
            <input
              type="text"
              placeholder="Pretraga putnika..."
              value={searchPassenger}
              onChange={e => setSearchPassenger(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Po programima */}
      {activeTab === 'programi' && (
        <div className="dug-table-box">
          <table className="dug-table">
            <thead>
              <tr>
                <th>PROGRAM</th>
                <th>FAKTURISANO</th>
                <th>UPLAĆENO</th>
                <th>DUGOVANJE</th>
                <th>NAPLATA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {byProgram.length === 0 ? (
                <tr><td colSpan={6} className="dug-empty">Nema dugovanja za prikaz.</td></tr>
              ) : byProgram.map((item, i) => {
                const prog     = item.program  || {}
                const invoices = item.invoices || []
                const faktur   = invoices.reduce((s, inv) => s + parseFloat(inv.total_amount || 0), 0)
                const uplac    = invoices.reduce((s, inv) =>
                  s + (inv.payments || []).reduce((ps, p) => ps + parseFloat(p.amount || 0), 0), 0)
                return (
                  <tr key={prog.id || i}>
                    <td>
                      <div className="dug-program-cell">
                        <span className="dug-program-name">{prog.name}</span>
                        <span className="dug-destination">{prog.destination}</span>
                      </div>
                    </td>
                    <td><span className="dug-amount">{fmtKM(faktur)}</span></td>
                    <td><span className="dug-paid">{fmtKM(uplac)}</span></td>
                    <td><span className="dug-debt">{fmtKM(item.total_debt)}</span></td>
                    <td><NaplataBar paid={uplac} total={faktur} /></td>
                    <td><ProgramStatus invoices={invoices} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Po putnicima */}
      {activeTab === 'putnici' && (
        <div className="dug-table-box">
          <table className="dug-table">
            <thead>
              <tr>
                <th>PUTNIK</th>
                <th>PROGRAM</th>
                <th>EMAIL</th>
                <th>TELEFON</th>
                <th>UKUPNO</th>
                <th>UPLAĆENO</th>
                <th>DUGUJE</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.length === 0 ? (
                <tr><td colSpan={7} className="dug-empty">Nema dugovanja za prikaz.</td></tr>
              ) : filteredDebts.map(d => (
                <tr key={d.id}>
                  <td><span className="dug-putnik">{d.first_name} {d.last_name}</span></td>
                  <td>{d.program_name || '—'}</td>
                  <td><span className="dug-contact">{d.email || '—'}</span></td>
                  <td><span className="dug-contact">{d.phone || '—'}</span></td>
                  <td><span className="dug-amount">{fmtKM(d.total_amount)}</span></td>
                  <td><span className="dug-paid">{fmtKM(d.paid_amount)}</span></td>
                  <td>
                    <span className={`dug-owes ${parseFloat(d.remaining) > 0 ? 'dug-owes--has' : 'dug-owes--clear'}`}>
                      {fmtKM(d.remaining)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default Dugovanja
