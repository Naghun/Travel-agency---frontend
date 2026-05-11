import React, { useState, useEffect, useCallback } from 'react'
import './Rezervacije.scss'
import PageHeader from '../../features/PageHeader/PageHeader'
import Modal from '../../components/Modal/Modal'
import ReservationForm from '../../components/Forms/ReservationForm'
import ReservationDetails from '../../components/Details/ReservationDetails'
import ReservationDelete from '../../components/Details/ReservationDelete'
import apiClient from '../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faTrash, faChevronDown } from '@fortawesome/free-solid-svg-icons'

const STATUS_OPTIONS = ['Svi statusi', 'Na čekanju', 'Potvrđena', 'Otkazana', 'Završena']
const STATUS_API     = { 'Na čekanju': 'pending', 'Potvrđena': 'confirmed', 'Otkazana': 'cancelled', 'Završena': 'completed' }
const STATUS_LABEL   = { pending: 'POTVRĐENO', confirmed: 'POTVRĐENO', cancelled: 'OTKAZANO', completed: 'ZAVRŠENO', na_cekanju: 'NA ČEKANJU' }
const STATUS_DISPLAY = { pending: 'NA ČEKANJU', confirmed: 'POTVRĐENO', cancelled: 'OTKAZANO', completed: 'ZAVRŠENO' }
const STATUS_CLASS   = { pending: 'status--pending', confirmed: 'status--confirmed', cancelled: 'status--cancelled', completed: 'status--completed' }
const ROOM_LABEL     = { single: '1-KREVETNA', double: '2-KREVETNA', triple: '3-KREVETNA', quadruple: '4-KREVETNA' }
const formatDate     = (iso) => iso ? new Date(iso).toLocaleDateString('bs-BA') : '—'

function PaymentBar({ paid, total }) {
  const paidNum  = parseFloat(paid)  || 0
  const totalNum = parseFloat(total) || 0
  const pct      = totalNum > 0 ? Math.min((paidNum / totalNum) * 100, 100) : 0
  const color    = pct >= 100 ? '#1a8a3a' : pct > 0 ? '#e6a817' : '#ddd'

  return (
    <div className="payment-cell">
      <div className="payment-amounts">
        <span className="paid">KM {paidNum.toFixed(2)}</span>
        <span className="sep"> / </span>
        <span className="total">KM {totalNum.toFixed(2)}</span>
      </div>
      <div className="payment-bar">
        <div className="payment-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function StatusDropdown({ reservation, onRefresh }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)

  const changeStatus = async (newStatus) => {
    setOpen(false)
    if (newStatus === reservation.status) return
    setLoading(true)
    try {
      await apiClient.put(`/reservations/${reservation.id}/status`, { status: newStatus })
      onRefresh()
    } catch (err) {
      console.error('Status change error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="status-dropdown-wrapper" onClick={e => e.stopPropagation()}>
      <button
        className={`status-badge ${STATUS_CLASS[reservation.status]}`}
        onClick={() => setOpen(o => !o)}
        disabled={loading}
      >
        {STATUS_DISPLAY[reservation.status] || reservation.status}
        <FontAwesomeIcon icon={faChevronDown} className="status-arrow" />
      </button>
      {open && (
        <ul className="status-dropdown-list">
          {Object.entries(STATUS_API).map(([label, val]) => (
            <li
              key={val}
              className={reservation.status === val ? 'active' : ''}
              onClick={() => changeStatus(val)}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Rezervacije() {
  const [rezervacije, setRezervacije]         = useState([])
  const [programs, setPrograms]               = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedStatus, setSelectedStatus]   = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewId, setViewId]                   = useState(null)
  const [deleteRow, setDeleteRow]             = useState(null)

  const fetchRezervacije = useCallback(() => {
    const params = {}
    if (selectedProgram) params.program_id = selectedProgram
    if (selectedStatus)  params.status     = selectedStatus
    apiClient.get('/reservations', { params })
      .then(res => setRezervacije(res.data))
      .catch(err => console.error('Error:', err))
  }, [selectedProgram, selectedStatus])

  useEffect(() => {
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchRezervacije() }, [fetchRezervacije])

  return (
    <div className="rezervacije-container">
      <PageHeader title="Rezervacije" singular="rezervaciju" onAdd={() => setShowCreateModal(true)} />

      {/* Filters */}
      <div className="rez-filters">
        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)}>
          <option value="">Svi programi</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
          <option value="">Svi statusi</option>
          {Object.entries(STATUS_API).map(([label, val]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Custom Table */}
      <div className="rez-table-box">
        <table className="rez-table">
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
            {rezervacije.length === 0 ? (
              <tr>
                <td colSpan={8} className="rez-empty">Nema rezervacija za prikaz.</td>
              </tr>
            ) : (
              rezervacije.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="rez-putnik-name">
                      {r.first_name} {r.last_name}
                    </span>
                  </td>
                  <td>
                    <div className="rez-program-cell">
                      <span className="rez-program-name">{r.program_name}</span>
                      <span className="rez-destination">{r.destination}</span>
                    </div>
                  </td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>
                    {r.room_type
                      ? <span className="rez-room-badge">{ROOM_LABEL[r.room_type] || r.room_type}</span>
                      : <span className="rez-no-room">—</span>
                    }
                  </td>
                  <td>
                    <StatusDropdown reservation={r} onRefresh={fetchRezervacije} />
                  </td>
                  <td>
                    <PaymentBar paid={r.total_paid} total={r.total_amount} />
                  </td>
                  <td>
                    <span className="rez-creator">{r.creator_name || '—'}</span>
                  </td>
                  <td>
                    <div className="rez-actions">
                      <button className="rez-btn-view" onClick={() => setViewId(r.id)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className="rez-btn-delete" onClick={() => setDeleteRow(r)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {viewId && (
        <Modal title="Detalji rezervacije" onClose={() => setViewId(null)}>
          <ReservationDetails reservationId={viewId} />
        </Modal>
      )}

      {/* Delete modal */}
      {deleteRow && (
        <Modal title="Brisanje rezervacije" onClose={() => setDeleteRow(null)}>
          <ReservationDelete
            reservation={deleteRow}
            onSuccess={() => { setDeleteRow(null); fetchRezervacije() }}
            onCancel={() => setDeleteRow(null)}
          />
        </Modal>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <Modal title="Nova rezervacija" onClose={() => setShowCreateModal(false)}>
          <ReservationForm
            onSuccess={() => { setShowCreateModal(false); fetchRezervacije() }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default Rezervacije
