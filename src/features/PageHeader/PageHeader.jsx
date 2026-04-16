import React from 'react'
import './PageHeader.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function PageHeader({title, singular}) {
  return (
    <div className='page-header'>
        <h3 className='page-title'>
            {title}
        </h3>
        <div className="button-container">
            <span>Dodaj {singular}</span>
            <FontAwesomeIcon icon={faPlus} />
        </div>
    </div>
  )
}

export default PageHeader