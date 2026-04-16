import React from 'react'
import './OneColumnSection.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function OneColumnSection( {children}) {
  return (
    <div className='one-column-section-container'>
        {children}
    </div>
  )
}

export default OneColumnSection