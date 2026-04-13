import React from 'react'
import './RecentUpcoming.scss'
import RecentUpcomingTable from '../../components/Table/RecentUpcomingTable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";


function RecentUpcoming({ title }) {
  return (
    <div className="recent-upcoming">
        <div className="top-container">
            <h6 className='title'>{title}</h6>
            <div className="button-container">
                <span>Vidi sve</span>
                <FontAwesomeIcon icon={faAngleRight} />
            </div>
        </div>
        <div className="bottom-container">
            <RecentUpcomingTable />
        </div>
    </div>
  )
}

export default RecentUpcoming
