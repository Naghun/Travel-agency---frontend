import React from 'react'
import './FilterSelector.scss'

function FilterSelector({ filterWord, statusOptions, selectedStatus, setSelectedStatus, counts }) {
  return (
    <div className='filter-selector-container'>
      <span>
        Pretraži po {filterWord}
      </span>
      <div className="filters">
        {statusOptions.map(status => (
          <button
            key={status}
            className={selectedStatus === status ? "active filter-button" : "filter-button"}
            onClick={() => setSelectedStatus(status)}
          >
            {status} ({counts[status] || 0})
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterSelector
