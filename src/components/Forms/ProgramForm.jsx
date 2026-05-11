import React, { useState } from 'react'
import './ProgramForm.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../api/apiClient.jsx'

const emptyForm = {
  name: '', destination: '', description: '',
  start_date: '', end_date: '', base_price: '',
  currency: 'BAM', max_participants: '',
  status: 'planned',
  included_in_price: '', not_included_in_price: '',
  itinerary: '', additional_info: '',
  meeting_point: '', meeting_time: '', notes: '',
}

function ProgramForm({ initialData, onSuccess, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!initialData) return emptyForm
    return {
      name: initialData.naziv || initialData.name || '',
      destination: initialData.destinacija || initialData.destination || '',
      description: initialData.description || '',
      start_date: initialData.start_date?.split('T')[0] || '',
      end_date: initialData.end_date?.split('T')[0] || '',
      base_price: initialData.base_price || '',
      currency: initialData.currency || 'BAM',
      max_participants: initialData.max_participants || '',
      status: initialData.status_raw || initialData.status || 'planned',
      included_in_price: initialData.included_in_price || '',
      not_included_in_price: initialData.not_included_in_price || '',
      itinerary: initialData.itinerary || '',
      additional_info: initialData.additional_info || '',
      meeting_point: initialData.meeting_point || '',
      meeting_time: initialData.meeting_time || '',
      notes: initialData.notes || '',
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = !!initialData?.id

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      base_price: parseFloat(form.base_price),
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
    }

    try {
      if (isEdit) {
        await apiClient.put(`/programs/${initialData.id}`, payload)
      } else {
        await apiClient.post('/programs', payload)
      }
      onSuccess()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Greška pri snimanju.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="program-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h5>Osnovne informacije</h5>
        <div className="form-row">
          <div className="form-group required">
            <label>Naziv programa</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Ljetovanje Turska 2026" />
          </div>
          <div className="form-group required">
            <label>Destinacija</label>
            <input name="destination" value={form.destination} onChange={handleChange} required placeholder="Antalya, Turska" />
          </div>
        </div>
        <div className="form-group">
          <label>Opis</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="7 noćenja, all inclusive..." />
        </div>
      </div>

      <div className="form-section">
        <h5>Termini i cijena</h5>
        <div className="form-row">
          <div className="form-group required">
            <label>Datum polaska</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
          </div>
          <div className="form-group required">
            <label>Datum povratka</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group required">
            <label>Cijena po osobi</label>
            <input type="number" name="base_price" value={form.base_price} onChange={handleChange} required min="0" step="0.01" placeholder="850.00" />
          </div>
          <div className="form-group">
            <label>Valuta</label>
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option value="BAM">BAM (KM)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Maks. putnika</label>
            <input type="number" name="max_participants" value={form.max_participants} onChange={handleChange} min="1" placeholder="50" />
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="planned">Planirano</option>
            <option value="active">Aktivno</option>
            <option value="completed">Završeno</option>
            <option value="postponed">Odgođeno</option>
            <option value="cancelled">Otkazano</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h5>Detalji putovanja</h5>
        <div className="form-group">
          <label>Uključeno u cijenu</label>
          <textarea name="included_in_price" value={form.included_in_price} onChange={handleChange} rows={2} placeholder="Transfer, smještaj, all inclusive..." />
        </div>
        <div className="form-group">
          <label>Nije uključeno u cijenu</label>
          <textarea name="not_included_in_price" value={form.not_included_in_price} onChange={handleChange} rows={2} placeholder="Putno osiguranje, izleti..." />
        </div>
        <div className="form-group">
          <label>Itinerer</label>
          <textarea name="itinerary" value={form.itinerary} onChange={handleChange} rows={3} placeholder="Dan 1: Dolazak..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Mjesto polaska</label>
            <input name="meeting_point" value={form.meeting_point} onChange={handleChange} placeholder="Autobuska stanica Sarajevo" />
          </div>
          <div className="form-group">
            <label>Vrijeme polaska</label>
            <input type="time" name="meeting_time" value={form.meeting_time} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Napomene</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Interne napomene..." />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Snimanje...' : isEdit ? 'Sačuvaj izmjene' : 'Dodaj program'}
        </button>
      </div>
    </form>
  )
}

export default ProgramForm
