/**
 * Firebolt MERGE Demo Application
 * Version: 1.0.0
 * 
 * Interactive demonstration of Firebolt's MERGE operations performance
 * against traditional database approaches.
 * 
 * @version 1.0.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import Dashboard from './components/Dashboard';
import FireboltSetup from './components/FireboltSetup';
import CustomerAnalytics from './components/CustomerAnalytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<FireboltSetup />} />
            <Route path="/demo/customer-analytics" element={<CustomerAnalytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
