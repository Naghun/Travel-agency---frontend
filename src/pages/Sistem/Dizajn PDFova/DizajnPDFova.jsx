import React, { useState } from 'react'
import './DizajnPDFova.scss'
import PageHeader from '../../../features/PageHeader/PageHeader'

const templateTypes = ["Lista putnika", "Faktura", "Potvrda rezervacije", "Ugovor"]

function DizajnPDFova() {
  const [selectedTemplate, setSelectedTemplate] = useState("Lista putnika")
  const [template, setTemplate] = useState({
    logo: true,
    zaglavlje: 'Traveller d.o.o.',
    podnaslov: 'Putnička agencija',
    adresa: 'Ul. primjer br. 1, Sarajevo',
    boja: '#4346D8',
    footer: 'Hvala na povjerenju!',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setTemplate(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <div className="dizajn-pdf-container">
      <PageHeader title="Dizajn PDFova" singular="predložak" />
      <div className="pdf-body">
        <div className="pdf-sidebar">
          <h5>Vrsta dokumenta</h5>
          <ul>
            {templateTypes.map(t => (
              <li
                key={t}
                className={selectedTemplate === t ? 'active' : ''}
                onClick={() => setSelectedTemplate(t)}
              >
                {t}
              </li>
            ))}
          </ul>
          <div className="template-form">
            <h5>Postavke predloška</h5>
            <div className="form-group">
              <label>Naziv agencije</label>
              <input name="zaglavlje" value={template.zaglavlje} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Podnaslov</label>
              <input name="podnaslov" value={template.podnaslov} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Adresa</label>
              <input name="adresa" value={template.adresa} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Boja naslova</label>
              <input type="color" name="boja" value={template.boja} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Footer tekst</label>
              <input name="footer" value={template.footer} onChange={handleChange} />
            </div>
            <div className="form-group checkbox-group">
              <input type="checkbox" name="logo" id="logo" checked={template.logo} onChange={handleChange} />
              <label htmlFor="logo">Prikaži logo</label>
            </div>
            <button className="save-btn">Sačuvaj predložak</button>
          </div>
        </div>

        <div className="pdf-preview">
          <h5>Pregled — {selectedTemplate}</h5>
          <div className="pdf-page">
            {template.logo && (
              <div className="pdf-logo-placeholder">LOGO</div>
            )}
            <div className="pdf-header" style={{ color: template.boja }}>
              <strong>{template.zaglavlje}</strong>
              <span>{template.podnaslov}</span>
              <span>{template.adresa}</span>
            </div>
            <hr />
            <div className="pdf-title" style={{ borderLeftColor: template.boja }}>
              {selectedTemplate}
            </div>
            <div className="pdf-content-placeholder">
              <div className="placeholder-row" />
              <div className="placeholder-row short" />
              <div className="placeholder-row" />
              <div className="placeholder-row short" />
              <div className="placeholder-row" />
            </div>
            <div className="pdf-footer">{template.footer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DizajnPDFova
