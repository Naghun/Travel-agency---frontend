import React from 'react'
import './RecentUpcoming.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function RecentUpcoming({ title, children, showButton = false, buttonLink = "/" }) {
  return (
    <div className="recent-upcoming">
      <div className="top-container">
        <h6 className='title'>{title}</h6>
        {showButton && (
          <Link to={buttonLink} className="button-container">
            <span>Vidi sve</span>
            <FontAwesomeIcon icon={faAngleRight} />
          </Link>
        )}
      </div>
      <div className="bottom-container">
        {children}
      </div>
    </div>
  )
}

export default RecentUpcoming
