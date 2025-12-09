/**
 * Firebolt MERGE Demo Application
 * Version: 2.0.0
 * 
 * Interactive demonstration of Firebolt's first-class MERGE support
 * for mixed OLTP/OLAP workloads.
 * 
 * Features:
 * - Attribution Updates: 50/50 insert/update workload pattern
 * - Fraud Detection: MERGE DELETE for removing fraudulent records
 * - Real-time Analytics: Sub-second queries on updating data
 * 
 * @version 2.0.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import Dashboard from './components/Dashboard';
import FireboltSetup from './components/FireboltSetup';
import AdPerformanceDemo from './components/AdPerformanceDemo';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<FireboltSetup />} />
            <Route path="/demo/ad-performance" element={<AdPerformanceDemo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
