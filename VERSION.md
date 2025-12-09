# Firebolt MERGE Demo - Version History

## Version 2.0.0 - Firebolt Cloud Edition (2025-12-09) 🔥

### Complete AdTech MERGE Demo with Cloud Support

This release transforms the demo into an **AdTech application** showcasing Firebolt's first-class MERGE support for mixed OLTP/OLAP workloads.

**🎯 Demo Scenario: Ad Performance Tracking**
- Handles the "oil and water" challenge: 50% inserts, 50% updates
- Late-arriving attribution data merged atomically
- Fraud detection with MERGE DELETE
- Sub-second analytics on continuously updating data

**✨ Key Features:**

**1. Attribution Updates MERGE (50/50 Workload)**
- ✅ Single atomic operation handles both UPDATE and INSERT
- ✅ Simulates late-arriving conversion data
- ✅ Comparison with traditional 3-operation approach

**2. Fraud Detection MERGE DELETE**
- ✅ Remove fraudulent records atomically with MERGE...WHEN MATCHED THEN DELETE
- ✅ Comparison with traditional SELECT → DELETE pattern

**3. Firebolt Cloud Integration**
- ✅ Backend API server for OAuth2 authentication
- ✅ Secure service account credential handling
- ✅ Real-time connection status monitoring

**📊 Database Schema:**
```sql
-- Main fact table
CREATE FACT TABLE ad_performance (
  click_id TEXT,
  campaign_id INT,
  ad_group_id INT,
  keyword_id INT,
  product_id TEXT,
  click_time TIMESTAMP,
  conversion_value DECIMAL(10,2),
  attributed_at TIMESTAMP,
  spend DECIMAL(10,2),
  impressions INT,
  clicks INT,
  orders INT,
  sales DECIMAL(10,2),
  date DATE,
  last_updated TIMESTAMP
) PRIMARY INDEX click_id;

-- Attribution updates staging
CREATE FACT TABLE attribution_updates (...) PRIMARY INDEX click_id;

-- Fraud detection
CREATE FACT TABLE detected_fraud (...) PRIMARY INDEX click_id;
```

**🏗️ Technical Changes:**
- ✅ New `AdPerformanceDemo.tsx` component with full MERGE implementation
- ✅ Express.js backend server for Firebolt Cloud authentication
- ✅ Updated types for AdTech domain
- ✅ New navigation and dashboard
- ✅ Updated Vite config for API proxying

**📝 Files Changed:**
- `src/components/AdPerformanceDemo.tsx` - New main demo component
- `src/components/Dashboard.tsx` - Redesigned dashboard
- `src/components/common/Navigation.tsx` - Updated routes
- `src/components/FireboltSetup.tsx` - Firebolt Cloud support
- `src/types/index.ts` - AdTech type definitions
- `src/App.tsx` - New route structure
- `server/index.js` - Backend API server
- `server/package.json` - Server dependencies
- `vite.config.ts` - API proxy configuration
- `README.md` - Complete documentation rewrite

---

## Version 1.0.0 (2024-09-16) 

### Original Customer Analytics Demo

**🎯 Core Demo Features:**
- ✅ Customer Analytics MERGE performance comparison
- ✅ Firebolt Core (localhost) connection
- ✅ MERGE vs 5 traditional operations

**Note:** This version has been superseded by v2.0.0.

---

### 🚀 Quick Start (v2.0.0):

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Configure Firebolt Cloud credentials:**
   Create `server/.env` with your service account details

3. **Start servers:**
   ```bash
   # Terminal 1: API Server
   cd server && npm start
   
   # Terminal 2: Frontend
   npm run dev
   ```

4. **Open demo:** http://localhost:5173

**Built with 🔥 by Firebolt**
