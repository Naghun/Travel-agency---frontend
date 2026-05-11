import React, { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient.jsx'
import './ProgramDetails.scss'

const statusLabel = {
  planned: 'Planirano', active: 'Aktivno',
  completed: 'Završeno', postponed: 'Odgođeno', cancelled: 'Otkazano',
}

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('bs-BA') : '—'

function ProgramDetails({ programId }) {
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!programId) return
    setLoading(true)
    apiClient.get(`/programs/${programId}`)
      .then(res => setProgram(res.data))
      .catch(err => console.error('Error fetching program:', err))
      .finally(() => setLoading(false))
  }, [programId])

  if (loading) return <div className="pd-loading">Učitavanje...</div>
  if (!program) return <div className="pd-loading">Program nije pronađen.</div>

  return (
    <div className="program-details">
      <div className="pd-header">
        <h3>{program.name}</h3>
        <span className={`pd-status pd-status--${program.status}`}>
          {statusLabel[program.status] || program.status}
        </span>
      </div>

      <div className="pd-grid">
        <div className="pd-item">
          <span className="pd-label">Destinacija</span>
          <span className="pd-value">{program.destination}</span>
        </div>
        <div className="pd-item">
          <span className="pd-label">Datum</span>
          <span className="pd-value">{formatDate(program.start_date)} – {formatDate(program.end_date)}</span>
        </div>
        <div className="pd-item">
          <span className="pd-label">Cijena</span>
          <span className="pd-value">{program.base_price} {program.currency}</span>
        </div>
        <div className="pd-item">
          <span className="pd-label">Putnici</span>
          <span className="pd-value">{program.confirmed_reservations ?? 0} / {program.max_participants ?? '∞'}</span>
        </div>
        {program.meeting_point && (
          <div className="pd-item">
            <span className="pd-label">Mjesto polaska</span>
            <span className="pd-value">{program.meeting_point} {program.meeting_time ? `u ${program.meeting_time}` : ''}</span>
          </div>
        )}
      </div>

      {program.description && (
        <div className="pd-section">
          <span className="pd-label">Opis</span>
          <p>{program.description}</p>
        </div>
      )}

      {program.included_in_price && (
        <div className="pd-section">
          <span className="pd-label">Uključeno u cijenu</span>
          <p>{program.included_in_price}</p>
        </div>
      )}

      {program.not_included_in_price && (
        <div className="pd-section">
          <span className="pd-label">Nije uključeno</span>
          <p>{program.not_included_in_price}</p>
        </div>
      )}

      {program.itinerary && (
        <div className="pd-section">
          <span className="pd-label">Itinerer</span>
          <p>{program.itinerary}</p>
        </div>
      )}

      <div className="pd-finances">
        <h5>Finansije</h5>
        <div className="pd-finance-row">
          <span>Ukupni prihodi</span>
          <strong className="green">{program.total_revenue ?? 0} {program.currency}</strong>
        </div>
        <div className="pd-finance-row">
          <span>Ukupni rashodi</span>
          <strong className="red">{program.total_expenses ?? 0} {program.currency}</strong>
        </div>
        <div className="pd-finance-row">
          <span>Ukupan dug</span>
          <strong className="orange">{program.total_debt ?? 0} {program.currency}</strong>
        </div>
      </div>

      {program.supplements?.length > 0 && (
        <div className="pd-supplements">
          <h5>Doplate</h5>
          {program.supplements.map(s => (
            <div key={s.id} className="pd-supplement-row">
              <span>{s.name}</span>
              <strong>{s.price} {program.currency}</strong>
            </div>
          ))}
        </div>
      )}

      {program.notes && (
        <div className="pd-section">
          <span className="pd-label">Napomene</span>
          <p>{program.notes}</p>
        </div>
      )}
    </div>
  )
}

export default ProgramDetails
