import React, { useState } from 'react'
import './Table.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPencilAlt, faTrash, faTimes, faPen } from '@fortawesome/free-solid-svg-icons'
import ProgramDetails from '../Details/ProgramDetails'

function Table({ content, renderView, renderEdit, renderDelete }) {
  const [activeAction, setActiveAction] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  if (!content || content.length === 0) {
    return <div className="standard-wide-table">Nema podataka za prikaz.</div>
  }

  const headers = Object.keys(content[0])

  const handleActionClick = (action, row) => {
    if (activeAction === action && selectedRow === row) {
      setActiveAction(null)
      setSelectedRow(null)
    } else {
      setActiveAction(action)
      setSelectedRow(row)
    }
  }

  const closePopup = () => {
    setActiveAction(null)
    setSelectedRow(null)
  }

  return (
    <div className="standard-wide-table">
      <table>
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {content.map((row, index) => (
            <tr key={index}>
              {headers.map((header, i) => (
                <td key={i}>{row[header]}</td>
              ))}
              <td>
                <div className="tr-row-actions">
                  <button
                    className="tr-btn tr-btn--view"
                    onClick={() => handleActionClick('view', row)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className="tr-btn tr-btn--edit"
                    onClick={() => handleActionClick('edit', row)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    className="tr-btn tr-btn--delete"
                    onClick={() => handleActionClick('delete', row)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* View */}
      <div className={`action-pop-up-container action-view ${activeAction === 'view' ? 'active' : ''}`}>
        <div className="popup-content">
          <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={closePopup} />
          <h4>Pregled</h4>
          {selectedRow && (
            renderView
              ? renderView(selectedRow, closePopup)
              : <ProgramDetails programId={selectedRow.id} />
          )}
        </div>
      </div>

      {/* Edit */}
      <div className={`action-pop-up-container action-edit ${activeAction === 'edit' ? 'active' : ''}`}>
        <div className="popup-content">
          <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={closePopup} />
          <h4>Uredi</h4>
          {selectedRow && (
            renderEdit
              ? renderEdit(selectedRow, closePopup)
              : <pre>{JSON.stringify(selectedRow, null, 2)}</pre>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className={`action-pop-up-container action-delete ${activeAction === 'delete' ? 'active' : ''}`}>
        <div className="popup-content">
          <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={closePopup} />
          <h4>Brisanje</h4>
          {selectedRow && (
            renderDelete
              ? renderDelete(selectedRow, closePopup)
              : <pre>{JSON.stringify(selectedRow, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default Table
