import React, { useState, useEffect, useRef } from 'react'
import './ReservationForm.scss'
import apiClient from '../../api/apiClient.jsx'

const roomTypeOptions = [
  { value: '', label: '— bez sobe —' },
  { value: 'single',     label: 'Jednokrevetna' },
  { value: 'double',     label: 'Dvokrevetna' },
  { value: 'triple',     label: 'Trokrevetna' },
  { value: 'quadruple',  label: 'Četverokrevetna' },
]

function ReservationForm({ onSuccess, onCancel }) {
  const [programs, setPrograms]           = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)

  // passenger autocomplete
  const [passengerQuery, setPassengerQuery] = useState('')
  const [passengerSuggestions, setPassengerSuggestions] = useState([])
  const [selectedPassenger, setSelectedPassenger] = useState(null)
  const debounceRef = useRef(null)

  const [form, setForm] = useState({
    program_id: '', passenger_id: '',
    status: 'pending', room_type: '', room_number: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    apiClient.get('/programs').then(res => setPrograms(res.data)).catch(() => {})
  }, [])

  const handlePassengerSearch = (val) => {
    setPassengerQuery(val)
    setSelectedPassenger(null)
    clearTimeout(debounceRef.current)
    if (val.length < 2) { setPassengerSuggestions([]); return }
    debounceRef.current = setTimeout(() => {
      apiClient.get('/passengers-autocomplete', { params: { q: val } })
        .then(res => setPassengerSuggestions(res.data))
        .catch(() => {})
    }, 300)
  }

  const selectPassenger = (p) => {
    setSelectedPassenger(p)
    setPassengerQuery(`${p.first_name} ${p.last_name}`)
    setPassengerSuggestions([])
    setForm(prev => ({ ...prev, passenger_id: p.id }))
  }

  const handleProgramChange = (e) => {
    const id = e.target.value
    const prog = programs.find(p => String(p.id) === id) || null
    setSelectedProgram(prog)
    setForm(prev => ({ ...prev, program_id: id }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.passenger_id) { setError('Odaberite putnika.'); return }
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/reservations', {
        program_id:   parseInt(form.program_id),
        passenger_id: parseInt(form.passenger_id),
        status:       form.status,
        room_type:    form.room_type || null,
        room_number:  form.room_number || null,
        notes:        form.notes || null,
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
    <form className="reservation-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h5>Program i putnik</h5>
        <div className="form-group required">
          <label>Program</label>
          <select name="program_id" value={form.program_id} onChange={handleProgramChange} required>
            <option value="">— odaberi program —</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({new Date(p.start_date).toLocaleDateString('bs-BA')})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group required">
          <label>Putnik</label>
          <div className="autocomplete-wrapper">
            <input
              value={passengerQuery}
              onChange={e => handlePassengerSearch(e.target.value)}
              placeholder="Upišite ime, prezime ili telefon..."
              autoComplete="off"
            />
            {passengerSuggestions.length > 0 && (
              <ul className="autocomplete-list">
                {passengerSuggestions.map(p => (
                  <li key={p.id} onClick={() => selectPassenger(p)}>
                    <strong>{p.first_name} {p.last_name}</strong>
                    {p.phone && <span>{p.phone}</span>}
                  </li>
                ))}
              </ul>
            )}
            {selectedPassenger && (
              <span className="autocomplete-selected">
                ✓ {selectedPassenger.first_name} {selectedPassenger.last_name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5>Detalji rezervacije</h5>
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
          <div className="form-group">
            <label>Broj sobe</label>
            <input name="room_number" value={form.room_number} onChange={handleChange} placeholder="npr. 204" />
          </div>
        </div>
        <div className="form-group">
          <label>Napomene</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Interne napomene..." />
        </div>
      </div>

      {selectedProgram && (
        <div className="reservation-program-info">
          <span>Cijena programa: <strong>{selectedProgram.base_price} {selectedProgram.currency || 'KM'}</strong></span>
          <span>{new Date(selectedProgram.start_date).toLocaleDateString('bs-BA')} – {new Date(selectedProgram.end_date).toLocaleDateString('bs-BA')}</span>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Snimanje...' : 'Kreiraj rezervaciju'}
        </button>
      </div>
    </form>
  )
}

export default ReservationForm
