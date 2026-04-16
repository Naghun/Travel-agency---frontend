import React from 'react'
import './Table.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";

function Table({ content }) {
  if (!content || content.length === 0) {
    return <div className='standard-wide-table'>Nema podataka za prikaz.</div>;
  }

  // uzmi ključeve iz prvog objekta
  const headers = Object.keys(content[0]);

  return (
    <div className='standard-wide-table'>
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
              <td className="actions">
                <FontAwesomeIcon icon={faEye} />
                <FontAwesomeIcon icon={faPencilAlt} />
                <FontAwesomeIcon icon={faTrash} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table;
