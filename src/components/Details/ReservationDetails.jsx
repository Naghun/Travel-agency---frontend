import React, { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient.jsx'
import './ReservationDetails.scss'

const statusLabel    = { pending: 'Na čekanju', confirmed: 'Potvrđena', cancelled: 'Otkazana', completed: 'Završena' }
const roomLabel      = { single: 'Jednokrevetna', double: 'Dvokrevetna', triple: 'Trokrevetna', quadruple: 'Četverokrevetna' }
const ticketLabel    = { not_purchased: 'Nije kupljena', purchased: 'Kupljena', not_applicable: 'Nije potrebna' }
const formatDate     = (iso) => iso ? new Date(iso).toLocaleDateString('bs-BA') : '—'
const dash           = (v) => v || '—'
const fmt            = (v) => v != null ? `${parseFloat(v).toFixed(2)} KM` : '—'

function ReservationDetails({ reservationId }) {
  const [res, setRes]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reservationId) return
    setLoading(true)
    apiClient.get(`/reservations/${reservationId}`)
      .then(r => setRes(r.data))
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false))
  }, [reservationId])

  if (loading) return <div className="rsd-loading">Učitavanje...</div>
  if (!res)    return <div className="rsd-loading">Rezervacija nije pronađena.</div>

  return (
    <div className="reservation-details">

      {/* Header */}
      <div className="rsd-header">
        <div>
          <h3>{res.first_name} {res.last_name}</h3>
          <span className="rsd-program">{res.program_name} · {res.destination}</span>
        </div>
        <span className={`rsd-status rsd-status--${res.status}`}>{statusLabel[res.status] || res.status}</span>
      </div>

      {/* Info grid */}
      <div className="rsd-grid">
        <div className="rsd-item"><span className="rsd-label">Datum putovanja</span><span>{formatDate(res.start_date)}</span></div>
        <div className="rsd-item"><span className="rsd-label">Email</span><span>{dash(res.email)}</span></div>
        <div className="rsd-item"><span className="rsd-label">Telefon</span><span>{dash(res.phone)}</span></div>
        <div className="rsd-item"><span className="rsd-label">Pasoš</span><span>{dash(res.passport_number)}</span></div>
        <div className="rsd-item"><span className="rsd-label">Tip sobe</span><span>{roomLabel[res.room_type] || dash(res.room_type)}</span></div>
        <div className="rsd-item"><span className="rsd-label">Broj sobe</span><span>{dash(res.room_number)}</span></div>
        <div className="rsd-item"><span className="rsd-label">Avionska karta</span><span>{ticketLabel[res.flight_ticket_status] || '—'}</span></div>
        <div className="rsd-item"><span className="rsd-label">Kreirao</span><span>{dash(res.creator_name)}</span></div>
      </div>

      {res.roommates && (
        <div className="rsd-section">
          <span className="rsd-label">Cimeri</span>
          <p>{res.roommates}</p>
        </div>
      )}

      {/* Finances */}
      <div className="rsd-finances">
        <h5>Finansije</h5>
        <div className="rsd-finance-row">
          <span>Ukupan iznos</span><strong>{fmt(res.total_amount)}</strong>
        </div>
        <div className="rsd-finance-row">
          <span>Uplaćeno</span><strong className="green">{fmt(res.total_paid)}</strong>
        </div>
        <div className="rsd-finance-row border-top">
          <span>Ostatak</span><strong className="orange">{fmt(res.remaining_amount)}</strong>
        </div>
      </div>

      {/* Services / doplate */}
      {res.services?.length > 0 && (
        <div className="rsd-services">
          <h5>Doplate</h5>
          {res.services.map((s, i) => (
            <div key={i} className="rsd-service-row">
              <span>{s.service_name} × {s.quantity}</span>
              <strong>{fmt(s.price * s.quantity)}</strong>
            </div>
          ))}
        </div>
      )}

      {/* Payments */}
      {res.payments?.length > 0 && (
        <div className="rsd-payments">
          <h5>Uplate</h5>
          {res.payments.map((p, i) => (
            <div key={i} className="rsd-payment-row">
              <div className="rsd-payment-info">
                <span>{formatDate(p.payment_date)}</span>
                <span className="rsd-method">{p.payment_method || '—'}</span>
                {p.reference_number && <span className="rsd-ref">Ref: {p.reference_number}</span>}
              </div>
              <strong className="green">{fmt(p.amount)}</strong>
            </div>
          ))}
        </div>
      )}

      {res.notes && (
        <div className="rsd-section">
          <span className="rsd-label">Napomene</span>
          <p>{res.notes}</p>
        </div>
      )}
    </div>
  )
}

export default ReservationDetails
