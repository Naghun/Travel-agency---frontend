import React from 'react'
import './HorizontalHeader.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMessage, faBell, faEarthAmericas, faGear } from '@fortawesome/free-solid-svg-icons';

function HorizontalHeader() {
  return (
    <div className='horizontal-header-container'>
      <div className="horizontal-header">
        <div className="filler">
          <input type="text" placeholder='Pretraži...'/>
        </div>
        <div className="content">
          <div className="languages">
            <FontAwesomeIcon icon={faEarthAmericas} />
          </div>
          <div className="options">
            <FontAwesomeIcon icon={faGear} />
          </div>
          <div className="messages">
            <FontAwesomeIcon icon={faMessage} />
          </div>
          <div className="notifications">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="user">
            <FontAwesomeIcon icon={faUser} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HorizontalHeader