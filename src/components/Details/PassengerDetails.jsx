import React, { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient.jsx'
import './PassengerDetails.scss'

const genderLabel = { male: 'Muški', female: 'Ženski', other: 'Ostalo' }
const statusLabel  = { pending: 'Na čekanju', confirmed: 'Potvrđena', cancelled: 'Otkazana', completed: 'Završena' }
const formatDate   = (iso) => iso ? new Date(iso).toLocaleDateString('bs-BA') : '—'
const dash         = (v)   => v || '—'

function PassengerDetails({ passengerId }) {
  const [passenger, setPassenger] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!passengerId) return
    setLoading(true)
    apiClient.get(`/passengers/${passengerId}`)
      .then(res => setPassenger(res.data))
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false))
  }, [passengerId])

  if (loading)   return <div className="psd-loading">Učitavanje...</div>
  if (!passenger) return <div className="psd-loading">Putnik nije pronađen.</div>

  return (
    <div className="passenger-details">
      <div className="psd-header">
        <h3>{passenger.first_name} {passenger.last_name}</h3>
        <span className="psd-trips">{passenger.total_trips ?? 0} putovanja</span>
      </div>

      <div className="psd-grid">
        <div className="psd-item"><span className="psd-label">Email</span><span>{dash(passenger.email)}</span></div>
        <div className="psd-item"><span className="psd-label">Telefon</span><span>{dash(passenger.phone)}</span></div>
        <div className="psd-item"><span className="psd-label">Telefon 2</span><span>{dash(passenger.phone_secondary)}</span></div>
        <div className="psd-item"><span className="psd-label">Datum rođenja</span><span>{formatDate(passenger.date_of_birth)}</span></div>
        <div className="psd-item"><span className="psd-label">Spol</span><span>{genderLabel[passenger.gender] || dash(passenger.gender)}</span></div>
        <div className="psd-item"><span className="psd-label">Nacionalnost</span><span>{dash(passenger.nationality)}</span></div>
        <div className="psd-item"><span className="psd-label">Broj pasoša</span><span>{dash(passenger.passport_number)}</span></div>
        <div className="psd-item"><span className="psd-label">Istjek pasoša</span><span>{formatDate(passenger.passport_expiry)}</span></div>
        <div className="psd-item"><span className="psd-label">Lična karta</span><span>{dash(passenger.id_card_number)}</span></div>
        <div className="psd-item"><span className="psd-label">Adresa</span><span>{dash(passenger.address)}</span></div>
        <div className="psd-item"><span className="psd-label">Grad</span><span>{dash(passenger.city)}</span></div>
        <div className="psd-item"><span className="psd-label">Država</span><span>{dash(passenger.country)}</span></div>
      </div>

      {(passenger.emergency_contact_name || passenger.emergency_contact_phone) && (
        <div className="psd-section">
          <span className="psd-label">Hitni kontakt</span>
          <p>{dash(passenger.emergency_contact_name)} — {dash(passenger.emergency_contact_phone)}</p>
        </div>
      )}

      {passenger.notes && (
        <div className="psd-section">
          <span className="psd-label">Napomene</span>
          <p>{passenger.notes}</p>
        </div>
      )}

      {passenger.travelHistory?.length > 0 && (
        <div className="psd-history">
          <h5>Historija putovanja</h5>
          {passenger.travelHistory.map((t, i) => (
            <div key={i} className="psd-trip-row">
              <div className="psd-trip-info">
                <strong>{t.program_name}</strong>
                <span>{t.destination} · {formatDate(t.start_date)} – {formatDate(t.end_date)}</span>
                <span className={`psd-status psd-status--${t.status}`}>{statusLabel[t.status] || t.status}</span>
              </div>
              <div className="psd-trip-finance">
                <span>Ukupno: <strong>{t.total_amount} KM</strong></span>
                <span>Plaćeno: <strong className="green">{t.total_paid} KM</strong></span>
                <span>Ostatak: <strong className="orange">{t.remaining} KM</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PassengerDetails
