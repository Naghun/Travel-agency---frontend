// Card.jsx
import './Card.scss'

const Card = ({ title, value, icon, className }) => {
  return (
    <div className="card">
      <div className={`card-top ${className}`}>
        <h4 className="card-title">{title}</h4>
        <div className="card-icon">{icon}</div>
      </div>
      <div className="card-content">
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default Card;
