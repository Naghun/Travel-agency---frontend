import React, { useState, useEffect, useCallback } from 'react'
import './Troskovi.scss'
import Modal from '../../../components/Modal/Modal'
import apiClient from '../../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPen, faTrash, faPlus, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons'

const fmt     = (n) => parseFloat(n || 0).toFixed(2)
const fmtKM   = (n) => `KM ${fmt(n)}`

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}. ${String(d.getMonth()+1).padStart(2,'0')}. ${d.getFullYear()}.`
}

const thisMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
}

// ── Expense Form ──────────────────────────────────────────────────────────────
function ExpenseForm({ expense, programs, categories, onSuccess, onCancel }) {
  const isEdit = !!expense
  const [form, setForm] = useState({
    description:    expense?.description    ?? '',
    amount:         expense?.amount         ?? '',
    expense_date:   expense?.expense_date   ?? new Date().toISOString().slice(0,10),
    program_id:     expense?.program_id     ?? '',
    category_id:    expense?.category_id    ?? '',
    currency:       expense?.currency       ?? 'BAM',
    vendor:         expense?.vendor         ?? '',
    receipt_number: expense?.receipt_number ?? '',
    notes:          expense?.notes          ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.description || !form.amount || !form.expense_date) {
      setError('Opis, iznos i datum su obavezni.'); return
    }
    setLoading(true); setError(null)
    try {
      const body = {
        description:    form.description,
        amount:         parseFloat(form.amount),
        expense_date:   form.expense_date,
        currency:       form.currency || 'BAM',
        program_id:     form.program_id  ? parseInt(form.program_id)  : null,
        category_id:    form.category_id ? parseInt(form.category_id) : null,
        vendor:         form.vendor         || null,
        receipt_number: form.receipt_number || null,
        notes:          form.notes          || null,
      }
      if (isEdit) await apiClient.put(`/expenses/${expense.id}`, body)
      else        await apiClient.post('/expenses', body)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri snimanju.')
      setLoading(false)
    }
  }

  return (
    <div className="tr-form">
      {error && <div className="tr-error">{error}</div>}

      <div className="tr-form-group required">
        <label>Opis troška</label>
        <textarea value={form.description} onChange={set('description')} placeholder="Npr. Smještaj hotel Sarajevo..." />
      </div>

      <div className="tr-form-row">
        <div className="tr-form-group required">
          <label>Iznos</label>
          <input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
        </div>
        <div className="tr-form-group">
          <label>Valuta</label>
          <select value={form.currency} onChange={set('currency')}>
            <option value="BAM">BAM</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="tr-form-group required">
          <label>Datum troška</label>
          <input type="date" value={form.expense_date} onChange={set('expense_date')} />
        </div>
      </div>

      <div className="tr-form-row">
        <div className="tr-form-group">
          <label>Program</label>
          <select value={form.program_id} onChange={set('program_id')}>
            <option value="">— Bez programa —</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="tr-form-group">
          <label>Kategorija</label>
          <select value={form.category_id} onChange={set('category_id')}>
            <option value="">— Bez kategorije —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="tr-form-row">
        <div className="tr-form-group">
          <label>Dobavljač / Vendor</label>
          <input type="text" value={form.vendor} onChange={set('vendor')} placeholder="Naziv firme..." />
        </div>
        <div className="tr-form-group">
          <label>Broj računa</label>
          <input type="text" value={form.receipt_number} onChange={set('receipt_number')} placeholder="R-2026-001" />
        </div>
      </div>

      <div className="tr-form-group">
        <label>Napomena</label>
        <textarea value={form.notes} onChange={set('notes')} placeholder="Opcionalna napomena..." />
      </div>

      <div className="tr-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-save" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Snimanje...' : isEdit ? 'Sačuvaj izmjene' : 'Dodaj trošak'}
        </button>
      </div>
    </div>
  )
}

// ── Expense Detail ────────────────────────────────────────────────────────────
function ExpenseDetail({ expense, categories }) {
  const cat = categories.find(c => c.id === expense.category_id)
  return (
    <div className="tr-detail">
      <div className="tr-detail-grid">
        <div><span className="tr-label">DATUM</span><span>{formatDate(expense.expense_date)}</span></div>
        <div><span className="tr-label">IZNOS</span><span className="tr-amount-big">{fmtKM(expense.amount)} {expense.currency !== 'BAM' ? expense.currency : ''}</span></div>
        <div><span className="tr-label">KATEGORIJA</span>
          <span className="tr-cat-pill" style={{ backgroundColor: cat?.color ? `${cat.color}22` : '#f0f0f5', color: cat?.color || '#666' }}>
            {cat && <span className="tr-cat-dot" style={{ backgroundColor: cat.color }} />}
            {expense.category || cat?.name || '—'}
          </span>
        </div>
        <div><span className="tr-label">PROGRAM</span><span>{expense.program_name || '—'}</span></div>
        <div><span className="tr-label">DOBAVLJAČ</span><span>{expense.vendor || '—'}</span></div>
        <div><span className="tr-label">BROJ RAČUNA</span><span>{expense.receipt_number || '—'}</span></div>
      </div>
      <div className="tr-detail-row">
        <span className="tr-label">OPIS</span>
        <p>{expense.description}</p>
      </div>
      {expense.notes && (
        <div className="tr-detail-row">
          <span className="tr-label">NAPOMENA</span>
          <p>{expense.notes}</p>
        </div>
      )}
      <div className="tr-detail-meta">
        <span>Evidentirano: <strong>{formatDate(expense.created_at)}</strong></span>
      </div>
    </div>
  )
}

// ── Delete ────────────────────────────────────────────────────────────────────
function ExpenseDelete({ expense, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleDelete = async () => {
    setLoading(true); setError(null)
    try {
      await apiClient.delete(`/expenses/${expense.id}`)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri brisanju.')
      setLoading(false)
    }
  }

  return (
    <div className="tr-delete">
      <p>Da li ste sigurni da želite obrisati trošak <strong>"{expense.description}"</strong> od <strong>{fmtKM(expense.amount)}</strong>?</p>
      {error && <div className="tr-error">{error}</div>}
      <div className="tr-actions">
        <button className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button className="btn-delete" onClick={handleDelete} disabled={loading}>
          {loading ? 'Brisanje...' : 'Obriši trošak'}
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Troskovi() {
  const [troskovi, setTroskovi]     = useState([])
  const [programs, setPrograms]     = useState([])
  const [categories, setCategories] = useState([])

  const [filterProgram,  setFilterProgram]  = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterFrom,     setFilterFrom]     = useState('')
  const [filterTo,       setFilterTo]       = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [viewRow,    setViewRow]    = useState(null)
  const [editRow,    setEditRow]    = useState(null)
  const [deleteRow,  setDeleteRow]  = useState(null)

  const fetchTroskovi = useCallback(() => {
    const params = {}
    if (filterProgram)  params.program_id  = filterProgram
    if (filterCategory) params.category_id = filterCategory
    if (filterFrom)     params.from_date   = filterFrom
    if (filterTo)       params.to_date     = filterTo
    apiClient.get('/expenses', { params })
      .then(res => setTroskovi(res.data))
      .catch(err => console.error('Expenses error:', err))
  }, [filterProgram, filterCategory, filterFrom, filterTo])

  useEffect(() => {
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
    apiClient.get('/expense-categories').then(res => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchTroskovi() }, [fetchTroskovi])

  // Summary
  const totalAll = troskovi.reduce((s, t) => s + parseFloat(t.amount || 0), 0)

  // Top 3 categories by amount
  const categoryTotals = troskovi.reduce((acc, t) => {
    const catId   = t.category_id
    const catName = t.category || categories.find(c => c.id === catId)?.name || 'Ostalo'
    const catColor = categories.find(c => c.id === catId)?.color || '#9CA3AF'
    if (!acc[catName]) acc[catName] = { name: catName, total: 0, count: 0, color: catColor }
    acc[catName].total += parseFloat(t.amount || 0)
    acc[catName].count += 1
    return acc
  }, {})
  const top3 = Object.values(categoryTotals).sort((a, b) => b.total - a.total).slice(0, 3)

  const exportExcel = async () => {
    try {
      const res = await apiClient.get('/export/financial-report/excel', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a'); a.href = url; a.download = 'troskovi.xlsx'; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error('Excel export error:', err) }
  }

  return (
    <div className="troskovi-container">
      {/* Custom header */}
      <div className="tr-header">
        <h3 className="tr-title">Troškovi</h3>
        <div className="tr-header-actions">
          <button className="tr-action-btn tr-action-btn--pdf" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faFilePdf} />
            Pregled PDF
          </button>
          <button className="tr-action-btn tr-action-btn--excel" onClick={exportExcel}>
            <FontAwesomeIcon icon={faFileExcel} />
            Excel
          </button>
          <button className="tr-action-btn tr-action-btn--add" onClick={() => setShowCreate(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Dodaj trošak
          </button>
        </div>
      </div>

      {/* Summary: 1 total + top 3 categories */}
      <div className="tr-summary">
        <div className="tr-summary-card tr-summary--total">
          <span className="tr-summary-label">Ukupni troškovi</span>
          <span className="tr-summary-amount">{fmtKM(totalAll)}</span>
          <span className="tr-summary-sub">{troskovi.length} evidentirano</span>
        </div>
        {top3.length > 0 ? top3.map((cat, i) => (
          <div key={cat.name} className="tr-summary-card tr-summary--cat" style={{ borderLeftColor: cat.color }}>
            <span className="tr-summary-label" style={{ color: cat.color }}>
              <span className="tr-summary-dot" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </span>
            <span className="tr-summary-amount" style={{ color: cat.color }}>{fmtKM(cat.total)}</span>
            <span className="tr-summary-sub">{cat.count} {cat.count === 1 ? 'trošak' : 'troška'}</span>
          </div>
        )) : [1,2,3].map(i => (
          <div key={i} className="tr-summary-card tr-summary--cat tr-summary--empty">
            <span className="tr-summary-label">Kategorija {i}</span>
            <span className="tr-summary-amount">KM 0.00</span>
            <span className="tr-summary-sub">nema podataka</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="tr-filters">
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="">Svi programi</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Sve kategorije</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="tr-date-range">
          <label>Od</label>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          <label>Do</label>
          <input type="date" value={filterTo}   onChange={e => setFilterTo(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="tr-table-box">
        <table className="tr-table">
          <thead>
            <tr>
              <th>DATUM</th>
              <th>OPIS</th>
              <th>KATEGORIJA</th>
              <th>PROGRAM</th>
              <th>DOBAVLJAČ</th>
              <th>IZNOS</th>
              <th>BR. RAČUNA</th>
              <th>AKCIJE</th>
            </tr>
          </thead>
          <tbody>
            {troskovi.length === 0 ? (
              <tr><td colSpan={8} className="tr-empty">Nema troškova za prikaz.</td></tr>
            ) : troskovi.map(t => {
              const cat = categories.find(c => c.id === t.category_id)
              return (
                <tr key={t.id}>
                  <td>{formatDate(t.expense_date)}</td>
                  <td>
                    <span className="tr-desc">{t.description}</span>
                  </td>
                  <td>
                    {t.category || cat?.name ? (
                      <span className="tr-cat-pill" style={{
                        backgroundColor: cat?.color ? `${cat.color}22` : '#f0f0f5',
                        color: cat?.color || '#555'
                      }}>
                        <span className="tr-cat-dot" style={{ backgroundColor: cat?.color || '#999' }} />
                        {t.category || cat?.name}
                      </span>
                    ) : <span className="tr-none">—</span>}
                  </td>
                  <td>{t.program_name || '—'}</td>
                  <td><span className="tr-vendor">{t.vendor || '—'}</span></td>
                  <td><span className="tr-amount">{fmtKM(t.amount)} <span className="tr-currency">{t.currency !== 'BAM' ? t.currency : ''}</span></span></td>
                  <td><span className="tr-receipt">{t.receipt_number || '—'}</span></td>
                  <td>
                    <div className="tr-row-actions">
                      <button className="tr-btn tr-btn--view"   onClick={() => setViewRow(t)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="tr-btn tr-btn--edit"   onClick={() => setEditRow(t)}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button className="tr-btn tr-btn--delete" onClick={() => setDeleteRow(t)}>
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
        <Modal title="Novi trošak" onClose={() => setShowCreate(false)}>
          <ExpenseForm
            programs={programs} categories={categories}
            onSuccess={() => { setShowCreate(false); fetchTroskovi() }}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}
      {viewRow && (
        <Modal title="Detalji troška" onClose={() => setViewRow(null)}>
          <ExpenseDetail expense={viewRow} categories={categories} />
        </Modal>
      )}
      {editRow && (
        <Modal title="Uredi trošak" onClose={() => setEditRow(null)}>
          <ExpenseForm
            expense={editRow} programs={programs} categories={categories}
            onSuccess={() => { setEditRow(null); fetchTroskovi() }}
            onCancel={() => setEditRow(null)}
          />
        </Modal>
      )}
      {deleteRow && (
        <Modal title="Brisanje troška" onClose={() => setDeleteRow(null)}>
          <ExpenseDelete
            expense={deleteRow}
            onSuccess={() => { setDeleteRow(null); fetchTroskovi() }}
            onCancel={() => setDeleteRow(null)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Troskovi
