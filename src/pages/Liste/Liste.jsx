import React, { useState, useEffect } from 'react'
import './Liste.scss'
import apiClient from '../../api/apiClient.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers, faPassport, faBed, faClipboardCheck,
  faEye, faFilePdf, faFileExcel, faFileWord, faDownload
} from '@fortawesome/free-solid-svg-icons'

const TABS = [
  { key: 'passenger', label: 'Spisak putnika',  icon: faUsers },
  { key: 'passport',  label: 'Spisak pasoša',   icon: faPassport },
  { key: 'rooming',   label: 'Rooming lista',    icon: faBed },
  { key: 'checkin',   label: 'Check-in lista',   icon: faClipboardCheck },
]

const formatDate = (val) => {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('bs-BA')
}

const dash = (val) => val || '—'

function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

async function exportFile(url, filename) {
  try {
    const res = await apiClient.get(url, { responseType: 'blob' })
    downloadFile(res.data, filename)
  } catch (err) {
    console.error('Export error:', err)
    alert('Greška pri exportu.')
  }
}

function Liste() {
  const [programs, setPrograms]         = useState([])
  const [selectedId, setSelectedId]     = useState('')
  const [activeTab, setActiveTab]       = useState('passenger')
  const [listData, setListData]         = useState(null)
  const [program, setProgramInfo]       = useState(null)
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    apiClient.get('/programs')
      .then(res => {
        setPrograms(res.data)
        if (res.data.length > 0) setSelectedId(String(res.data[0].id))
      })
      .catch(err => console.error('Error fetching programs:', err))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetchList(selectedId, activeTab)
  }, [selectedId, activeTab])

  const fetchList = async (id, tab) => {
    setLoading(true)
    setListData(null)
    const endpointMap = {
      passenger: `/programs/${id}/passenger-list`,
      passport:  `/programs/${id}/passenger-list`,
      rooming:   `/programs/${id}/rooming-list`,
      checkin:   `/programs/${id}/check-in-list`,
    }
    try {
      const res = await apiClient.get(endpointMap[tab])
      setProgramInfo(res.data.program)
      setListData(res.data)
    } catch (err) {
      console.error('Error fetching list:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (type) => {
    if (!selectedId) return
    const id = selectedId
    const name = program?.name?.replace(/\s+/g, '_') || 'program'

    const exportMap = {
      passenger: {
        pdf:   [`/export/programs/${id}/passenger-list/pdf`,   `${name}_putnici.pdf`],
        excel: [`/export/programs/${id}/passenger-list/excel`, `${name}_putnici.xlsx`],
        word:  [`/export/programs/${id}/passport-list/word`,   `${name}_pasosi.docx`],
      },
      passport: {
        pdf:   [`/export/programs/${id}/passenger-list/pdf`,   `${name}_pasosi.pdf`],
        excel: [`/export/programs/${id}/passenger-list/excel`, `${name}_pasosi.xlsx`],
        word:  [`/export/programs/${id}/passport-list/word`,   `${name}_pasosi.docx`],
      },
      rooming: {
        pdf:   [`/export/programs/${id}/rooming-list/pdf`,     `${name}_rooming.pdf`],
        excel: [`/export/programs/${id}/rooming-list/excel`,   `${name}_rooming.xlsx`],
        word:  [`/export/programs/${id}/hotel-list/word`,      `${name}_hotel.docx`],
      },
      checkin: {
        pdf:   null,
        excel: [`/export/programs/${id}/check-in-list/excel`,  `${name}_checkin.xlsx`],
        word:  [`/export/programs/${id}/check-in-list/word`,   `${name}_checkin.docx`],
      },
    }

    const target = exportMap[activeTab]?.[type]
    if (!target) { alert('Export nije dostupan za ovu listu.'); return }
    exportFile(target[0], target[1])
  }

  const renderTable = () => {
    if (loading) return <div className="liste-loading">Učitavanje...</div>
    if (!listData) return null

    if (activeTab === 'passenger') {
      const rows = listData.passengerList || []
      return (
        <table className="liste-table">
          <thead>
            <tr>
              <th>RB.</th>
              <th>IME I PREZIME</th>
              <th>BROJ PASOŠA</th>
              <th>DATUM ROĐENJA</th>
              <th>TELEFON</th>
              <th>EMAIL</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={6} className="no-data">Nema putnika za ovaj program.</td></tr>
              : rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{dash(r.passport_number)}</td>
                  <td>{formatDate(r.date_of_birth)}</td>
                  <td>{dash(r.phone)}</td>
                  <td>{dash(r.email)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )
    }

    if (activeTab === 'passport') {
      const rows = listData.passengerList || []
      return (
        <table className="liste-table">
          <thead>
            <tr>
              <th>RB.</th>
              <th>IME I PREZIME</th>
              <th>BROJ PASOŠA</th>
              <th>ISTJEK PASOŠA</th>
              <th>DATUM ROĐENJA</th>
              <th>NACIONALNOST</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={6} className="no-data">Nema putnika za ovaj program.</td></tr>
              : rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{dash(r.passport_number)}</td>
                  <td>{formatDate(r.passport_expiry)}</td>
                  <td>{formatDate(r.date_of_birth)}</td>
                  <td>{dash(r.nationality)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )
    }

    if (activeTab === 'rooming') {
      const rows = listData.roomingList || []
      return (
        <table className="liste-table">
          <thead>
            <tr>
              <th>RB.</th>
              <th>IME I PREZIME</th>
              <th>TIP SOBE</th>
              <th>BROJ SOBE</th>
              <th>PASOŠ</th>
              <th>DATUM ROĐENJA</th>
              <th>SPOL</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={7} className="no-data">Nema podataka za rooming listu.</td></tr>
              : rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{dash(r.room_type)}</td>
                  <td>{dash(r.room_number)}</td>
                  <td>{dash(r.passport_number)}</td>
                  <td>{formatDate(r.date_of_birth)}</td>
                  <td>{dash(r.gender)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )
    }

    if (activeTab === 'checkin') {
      const rows = listData.checkinList || []
      return (
        <table className="liste-table">
          <thead>
            <tr>
              <th>RB.</th>
              <th>IME I PREZIME</th>
              <th>TELEFON</th>
              <th>BROJ PASOŠA</th>
              <th>STATUS</th>
              <th>CHECK-IN</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={6} className="no-data">Nema putnika za check-in.</td></tr>
              : rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{r.first_name} {r.last_name}</strong></td>
                  <td>{dash(r.phone)}</td>
                  <td>{dash(r.passport_number)}</td>
                  <td>{dash(r.status)}</td>
                  <td>
                    <span className={`checkin-badge ${r.checked_in ? 'done' : 'pending'}`}>
                      {r.checked_in ? 'Prijavljen' : 'Nije prijavljen'}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      )
    }
  }

  const activeTabLabel = TABS.find(t => t.key === activeTab)?.label || ''

  return (
    <div className="liste-container">
      <h2 className="liste-title">Liste i izvještaji</h2>

      {/* Program selector */}
      <div className="liste-selector-box">
        <label>ODABERI PROGRAM</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          {programs.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({new Date(p.start_date).toLocaleDateString('bs-BA')})
            </option>
          ))}
        </select>
      </div>

      {/* Tab buttons */}
      <div className="liste-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`liste-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <FontAwesomeIcon icon={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* List content */}
      {selectedId && (
        <div className="liste-content-box">
          <div className="liste-content-header">
            <h3>{activeTabLabel}{program ? ` — ${program.name}` : ''}</h3>
            <div className="liste-export-btns">
              <button className="export-btn active" onClick={() => {}}>
                <FontAwesomeIcon icon={faEye} /> Pregled
              </button>
              {activeTab !== 'checkin' && (
                <button className="export-btn" onClick={() => handleExport('pdf')}>
                  <FontAwesomeIcon icon={faFilePdf} /> PDF
                </button>
              )}
              <button className="export-btn" onClick={() => handleExport('excel')}>
                <FontAwesomeIcon icon={faFileExcel} /> Excel
              </button>
              <button className="export-btn" onClick={() => handleExport('word')}>
                <FontAwesomeIcon icon={faFileWord} /> Word
              </button>
            </div>
          </div>

          {renderTable()}
        </div>
      )}
    </div>
  )
}

export default Liste
