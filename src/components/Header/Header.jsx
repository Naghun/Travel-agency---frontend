import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse, faMap, faUsers, faClipboardList, faCalendarCheck,
  faUserGroup, faGear, faFilePdf, faChartLine, faFileSignature,
  faEnvelope, faMoneyBill, faFileInvoice, faCreditCard, faReceipt
} from '@fortawesome/free-solid-svg-icons';
import logoIcon from '../../assets/icons/holiday-trip.png';

const navItems = [
  // glavne stranice (bez sekcije)
  { to: "/", icon: faHouse, label: "Početna stranica" },
  { to: "/programi", icon: faMap, label: "Programi" },
  { to: "/baza-putnika", icon: faUsers, label: "Baza putnika" },
  { to: "/liste", icon: faClipboardList, label: "Liste" },
  { to: "/rezervacije", icon: faCalendarCheck, label: "Rezervacije" },

  // sekcija Finansije
  { type: "section", label: "Finansije" },
  { to: "/placanja", icon: faCreditCard, label: "Plaćanja" },
  { to: "/fakture", icon: faFileInvoice, label: "Fakture" },
  { to: "/dugovanja", icon: faMoneyBill, label: "Dugovanja" },
  { to: "/troskovi", icon: faReceipt, label: "Troškovi" },

  // sekcija Alati
  { type: "section", label: "Alati" },
  { to: "/online-prijave", icon: faFileSignature, label: "Online prijave" },
  { to: "/poruke", icon: faEnvelope, label: "Poruke" },
  { to: "/izvjestaji", icon: faChartLine, label: "Izvještaji" },

  // sekcija Sistem
  { type: "section", label: "Sistem" },
  { to: "/dizajn-pdfova", icon: faFilePdf, label: "Dizajn PDFova" },
  { to: "/tim", icon: faUserGroup, label: "Tim" },
  { to: "/postavke", icon: faGear, label: "Postavke" },
];

function Header() {
  return (
    <div className="header">
      <h2 className="logo">
        <img src={logoIcon} alt="logo" />
        <span>Traveller</span>
      </h2>
      <nav>
        <ul className="nav-list">
          {navItems.map((item, idx) => {
            if (item.type === "section") {
              return (
                <li key={idx} className="nav-section">
                  <span>{item.label}</span>
                </li>
              );
            }
            return (
              <li key={idx} className="list-item">
                <NavLink to={item.to} className={({ isActive }) => isActive ? "active" : ""}>
                  <div className="selected-indicator"></div>
                  <div className="list-content">
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default Header;
