import './App.css'
import './styles/main.scss'
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom'

// glavne stranice
import PocetnaStranica from './pages/PocetnaStranica/PocetnaStranica';
import Programi from './pages/Programi/Programi'
import BazaPutnika from './pages/BazaPutnika/BazaPutnika';
import Liste from './pages/Liste/Liste';
import Rezervacije from './pages/Rezervacije/Rezervacije';

// sistem stranice
import Tim from './pages/Sistem/Tim/Tim';
import DizajnPDFova from './pages/Sistem/Dizajn PDFova/DizajnPDFova';
import Postavke from './pages/Sistem/Postavke/Postavke';

// alati stranice
import Izvjestaji from './pages/Alati/Izvještaji/Izvjestaji';
import Poruke from './pages/Alati/Poruke/Poruke';
import OnlinePrijave from './pages/Alati/OnlinePrijave/OnlinePrijave';

// finansije stranice
import Dugovanja from './pages/Finansije/Dugovanja/Dugovanja';
import Fakture from './pages/Finansije/Fakture/Fakture';
import Placanja from './pages/Finansije/Placanja/Placanja';
import Troskovi from './pages/Finansije/Troskovi/Troskovi';

import Header from './components/Header/Header';

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import HorizontalHeader from './components/HorizontalHeader/HorizontalHeader';



function App() {
  	return (
		<div className="App">
			<Router>
        <div className="app-layout">
          <Header />
          <div className="content-area">
            <HorizontalHeader />
            <div className="main-content">
              <Routes>
                <Route path='/' element= {<PocetnaStranica />} />
                <Route path='/programi' element= {<Programi />} />
                <Route path='/baza-putnika' element= {<BazaPutnika />} />
                <Route path='/liste' element= {<Liste />} />
                <Route path='/rezervacije' element= {<Rezervacije />} />

                <Route path='/tim' element= {<Tim />} />
                <Route path='/postavke' element= {<Postavke />} />
                <Route path='/dizajn-pdfova' element= {<DizajnPDFova />} />

                <Route path='/izvjestaji' element= {<Izvjestaji />} />
                <Route path='/online-prijave' element= {<OnlinePrijave />} />
                <Route path='/poruke' element= {<Poruke />} />

                <Route path='/dugovanja' element= {<Dugovanja />} />
                <Route path='/fakture' element= {<Fakture />} />
                <Route path='/placanja' element= {<Placanja />} />
                <Route path='/troskovi' element= {<Troskovi />} />
              </Routes>
            </div>
          </div>
        </div>
			</Router>
		</div>
  );
}

export default App;