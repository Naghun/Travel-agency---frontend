import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

function Header() {
  return (
    <div className="header">
      <h2 className="logo">Travel Agency</h2>
      <nav>
        <ul className="nav-list">
          {/* glavne stranice */}
          <li><Link to="/">Početna</Link></li>
          <li><Link to="/programi">Programi</Link></li>
          <li><Link to="/baza-putnika">Baza putnika</Link></li>
          <li><Link to="/liste">Liste</Link></li>
          <li><Link to="/rezervacije">Rezervacije</Link></li>

          {/* sistem */}
          <li><Link to="/tim">Tim</Link></li>
          <li><Link to="/postavke">Postavke</Link></li>
          <li><Link to="/dizajn-pdfova">Dizajn PDFova</Link></li>

          {/* alati */}
          <li><Link to="/izvjestaji">Izvještaji</Link></li>
          <li><Link to="/online-prijave">Online prijave</Link></li>
          <li><Link to="/poruke">Poruke</Link></li>

          {/* finansije */}
          <li><Link to="/dugovanja">Dugovanja</Link></li>
          <li><Link to="/fakture">Fakture</Link></li>
          <li><Link to="/placanja">Plaćanja</Link></li>
          <li><Link to="/troskovi">Troškovi</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Header;
