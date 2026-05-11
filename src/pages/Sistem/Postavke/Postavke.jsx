import React, { useState } from 'react'
import './Postavke.scss'
import PageHeader from '../../../features/PageHeader/PageHeader'

function Postavke() {
  const [settings, setSettings] = useState({
    nazivAgencije: '',
    email: '',
    telefon: '',
    adresa: '',
    valuta: 'BAM',
    jezik: 'Bosanski',
  })

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    console.log('Saved settings:', settings)
  }

  return (
    <div className="postavke-container">
      <PageHeader title="Postavke" singular="postavku" />
      <div className="settings-body">
        <div className="settings-section">
          <h4>Opće postavke</h4>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Naziv agencije</label>
              <input name="nazivAgencije" value={settings.nazivAgencije} onChange={handleChange} placeholder="Naziv agencije" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={settings.email} onChange={handleChange} placeholder="email@agencija.ba" />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input name="telefon" value={settings.telefon} onChange={handleChange} placeholder="+387 61 000 000" />
            </div>
            <div className="form-group">
              <label>Adresa</label>
              <input name="adresa" value={settings.adresa} onChange={handleChange} placeholder="Ul. primjer br. 1, Sarajevo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Valuta</label>
                <select name="valuta" value={settings.valuta} onChange={handleChange}>
                  <option value="BAM">BAM (KM)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jezik</label>
                <select name="jezik" value={settings.jezik} onChange={handleChange}>
                  <option value="Bosanski">Bosanski</option>
                  <option value="Hrvatski">Hrvatski</option>
                  <option value="Srpski">Srpski</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>
            <button type="submit" className="save-btn">Sačuvaj postavke</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Postavke
