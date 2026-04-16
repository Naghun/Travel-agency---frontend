import React from 'react'
import './OneColumnData.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function OneColumnData({children}) {
  return (
    <div className='one-column-data-container'>
        {children}
    </div>
  )
}

export default OneColumnData