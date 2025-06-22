import { Routes, Route } from 'react-router-dom';

import Sidebar from './Sidebar';
import HomePage from '../../pages/HomePage';
import EnergyDemandPage from '../../pages/EnergyDemandPage';
import FaultPredictionPage from '../../pages/FaultPredictionPage';
import FastSearchPage from '../../pages/FastSearchPage';

const AppLayout = () => {
  // const [activeView, setActiveView] = useState('home');

  // This function determines which page component to render
  // based on the state of 'activeView'.
  // const renderContent = () => {
  //   switch (activeView) {
  //     case 'home':
  //       return <HomePage setActiveView={setActiveView} />;
  //     case 'demand':
  //       return <EnergyDemandPage />;
  //     case 'fault':
  //       return <FaultPredictionPage />;
  //     case 'search':
  //       return <FastSearchPage />;
  //     default:
  //       return <HomePage setActiveView={setActiveView} />;
  //   }
  // };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      {/* Sidebar for navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
          <div className="p-6 md:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/demand" element={<EnergyDemandPage />} />
              <Route path="/fault" element={<FaultPredictionPage />} />
              <Route path="/search" element={<FastSearchPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
