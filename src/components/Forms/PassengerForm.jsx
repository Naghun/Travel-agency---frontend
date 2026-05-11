import React, { useState } from 'react'
import './PassengerForm.scss'
import apiClient from '../../api/apiClient.jsx'

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '', phone_secondary: '',
  passport_number: '', passport_expiry: '', id_card_number: '',
  date_of_birth: '', gender: '', nationality: '',
  address: '', city: '', country: '',
  emergency_contact_name: '', emergency_contact_phone: '',
  notes: '',
}

function PassengerForm({ initialData, onSuccess, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!initialData) return emptyForm
    return {
      first_name:               initialData.first_name || '',
      last_name:                initialData.last_name || '',
      email:                    initialData.email || '',
      phone:                    initialData.phone || '',
      phone_secondary:          initialData.phone_secondary || '',
      passport_number:          initialData.passport_number || '',
      passport_expiry:          initialData.passport_expiry?.split('T')[0] || '',
      id_card_number:           initialData.id_card_number || '',
      date_of_birth:            initialData.date_of_birth?.split('T')[0] || '',
      gender:                   initialData.gender || '',
      nationality:              initialData.nationality || '',
      address:                  initialData.address || '',
      city:                     initialData.city || '',
      country:                  initialData.country || '',
      emergency_contact_name:   initialData.emergency_contact_name || '',
      emergency_contact_phone:  initialData.emergency_contact_phone || '',
      notes:                    initialData.notes || '',
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const isEdit = !!initialData?.id

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    try {
      if (isEdit) {
        await apiClient.put(`/passengers/${initialData.id}`, payload)
      } else {
        await apiClient.post('/passengers', payload)
      }
      onSuccess()
    } catch (err) {
      const errors = err.response?.data?.errors
      const msg = errors
        ? Object.values(errors).flat().join(', ')
        : err.response?.data?.message || 'Greška pri snimanju.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="passenger-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h5>Osnovni podaci</h5>
        <div className="form-row">
          <div className="form-group required">
            <label>Ime</label>
            <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="Amir" />
          </div>
          <div className="form-group required">
            <label>Prezime</label>
            <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Hodžić" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="amir@example.com" />
          </div>
          <div className="form-group">
            <label>Telefon</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+38761123456" />
          </div>
          <div className="form-group">
            <label>Telefon 2</label>
            <input name="phone_secondary" value={form.phone_secondary} onChange={handleChange} placeholder="+38762..." />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Datum rođenja</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Spol</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">— odaberi —</option>
              <option value="male">Muški</option>
              <option value="female">Ženski</option>
              <option value="other">Ostalo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nacionalnost</label>
            <input name="nationality" value={form.nationality} onChange={handleChange} placeholder="BIH" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5>Dokumenti</h5>
        <div className="form-row">
          <div className="form-group">
            <label>Broj pasoša</label>
            <input name="passport_number" value={form.passport_number} onChange={handleChange} placeholder="A1234567" />
          </div>
          <div className="form-group">
            <label>Istjek pasoša</label>
            <input type="date" name="passport_expiry" value={form.passport_expiry} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Broj lične karte</label>
            <input name="id_card_number" value={form.id_card_number} onChange={handleChange} placeholder="0123456789" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5>Adresa</h5>
        <div className="form-row">
          <div className="form-group">
            <label>Adresa</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Ul. primjer br. 1" />
          </div>
          <div className="form-group">
            <label>Grad</label>
            <input name="city" value={form.city} onChange={handleChange} placeholder="Sarajevo" />
          </div>
          <div className="form-group">
            <label>Država</label>
            <input name="country" value={form.country} onChange={handleChange} placeholder="Bosna i Hercegovina" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5>Kontakt u hitnim slučajevima</h5>
        <div className="form-row">
          <div className="form-group">
            <label>Ime i prezime</label>
            <input name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} placeholder="Fatima Hodžić" />
          </div>
          <div className="form-group">
            <label>Telefon</label>
            <input name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} placeholder="+38761..." />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h5>Napomene</h5>
        <div className="form-group">
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Interne napomene o putniku..." />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Odustani</button>
        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Snimanje...' : isEdit ? 'Sačuvaj izmjene' : 'Dodaj putnika'}
        </button>
      </div>
    </form>
  )
}

export default PassengerForm
