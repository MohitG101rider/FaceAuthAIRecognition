import { LandingPage } from './components/LandingPage';
import { DataCollection } from './components/DataCollection';
import { ModelTraining } from './components/ModelTraining';
import { FaceRecognition } from './components/FaceRecognition';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'data':
        return <DataCollection />;
      case 'train':
        return <ModelTraining />;
      case 'recognize':
        return <FaceRecognition />;
      case 'dashboard':
        return <Dashboard />;
      case 'workspace':
        return <Workspace />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
