import React, { useState } from 'react'
import apiClient from '../../api/apiClient.jsx'
import './ReservationDetails.scss'
import './ReservationEdit.scss'

const roomTypeOptions = [
  { value: '',           label: '— bez sobe —' },
  { value: 'single',     label: 'Jednokrevetna' },
  { value: 'double',     label: 'Dvokrevetna' },
  { value: 'triple',     label: 'Trokrevetna' },
  { value: 'quadruple',  label: 'Četverokrevetna' },
]

function ReservationEdit({ reservation, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    status:      reservation.status      || 'pending',
    room_type:   reservation.room_type   || '',
    room_number: reservation.room_number || '',
    room_group:  reservation.room_group  || '',
    notes:       reservation.notes       || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiClient.put(`/reservations/${reservation.id}`, {
        status:      form.status,
        room_type:   form.room_type || null,
        room_number: form.room_number || null,
        room_group:  form.room_group || null,
        notes:       form.notes || null,
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
    <form className="reservation-edit-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="re-info-banner">
        <strong>{reservation.first_name} {reservation.last_name}</strong>
        <span>{reservation.program_name}</span>
      </div>

      <div className="form-section">
        <h5>Uredi rezervaciju</h5>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Na čekanju</option>
              <option value="confirmed">Potvrđena</option>
              <option value="cancelled">Otkazana</option>
              <option value="completed">Završena</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tip sobe</label>
            <select name="room_type" value={form.room_type} onChange={handleChange}>
              {roomTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Broj sobe</label>
            <input name="room_number" value={form.room_number} onChange={handleChange} placeholder="npr. 204" />
          </div>
          <div className="form-group">
            <label>Grupa sobe</label>
            <input name="room_group" value={form.room_group} onChange={handleChange} placeholder="npr. A1" />
          </div>
        </div>
        <div className="form-group">
          <label>Napomene</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Interne napomene..." />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Snimanje...' : 'Sačuvaj izmjene'}
        </button>
      </div>
    </form>
  )
}

export default ReservationEdit
