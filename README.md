# Firebolt MERGE Demo

> **Interactive demonstration of Firebolt's first-class MERGE support for mixed OLTP/OLAP workloads**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./VERSION.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)

## 🎯 Overview

This demo showcases how **Firebolt eliminates the OLTP vs OLAP trade-off** through first-class MERGE operations. Traditional databases force you to choose between fast analytics OR efficient updates — Firebolt delivers both.

### The Challenge

Many real-world workloads are **50% inserts and 50% updates**:
- Late-arriving attribution data (click today → conversion next week)
- Fraud detection requiring immediate removal of bad data
- Real-time analytics on continuously updating datasets

Previous solutions (PostgreSQL, ClickHouse, Snowflake) force impossible trade-offs. Firebolt's native MERGE support changes the game.

## ✨ Demo Features

### 1. Attribution Updates MERGE (50/50 Workload)
```sql
-- Single atomic operation handles both updates AND inserts
MERGE INTO ad_performance AS target
USING attribution_updates AS source
ON target.click_id = source.click_id
WHEN MATCHED AND source.conversion_value IS NOT NULL THEN
    UPDATE SET conversion_value = source.conversion_value, ...
WHEN NOT MATCHED THEN
    INSERT (click_id, campaign_id, ...) VALUES (...);
```

### 2. Fraud Detection MERGE (DELETE Pattern)
```sql
-- Remove fraudulent records atomically
MERGE INTO ad_performance AS target
USING detected_fraud AS source
ON target.click_id = source.click_id
WHEN MATCHED THEN DELETE;
```

### 3. Performance Comparison
- Side-by-side comparison of MERGE vs Traditional multi-statement approaches
- Real-time metrics: execution time, rows processed, bytes scanned
- Visual demonstration of I/O reduction and simplification

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│                    http://localhost:5173                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ /api/*
┌──────────────────────────▼──────────────────────────────────┐
│                  Express API Server                          │
│                  http://localhost:3001                       │
│  • OAuth2 Authentication                                     │
│  • Query Execution                                          │
│  • Connection Management                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                    Firebolt Cloud                            │
│  • Secure service account authentication                     │
│  • First-class MERGE operations                              │
│  • Sub-second query performance                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **Firebolt Cloud** account with service account credentials
- **npm** or **yarn**

### 1. Clone and Install

```bash
git clone https://github.com/firebolt-db/merge-demo.git
cd merge-demo/firebolt-merge-demo

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure Firebolt Credentials

Create `server/.env` file with your credentials:

```bash
cd server
touch .env
```

Add the following (replace with your actual values):

```env
# Firebolt Account Name
FIREBOLT_ACCOUNT=your-account-name

# Service Account Credentials (from Firebolt Console > Configure > Service Accounts)
FIREBOLT_CLIENT_ID=your-service-account-client-id
FIREBOLT_CLIENT_SECRET=your-service-account-client-secret

# Database and Engine
FIREBOLT_DATABASE=your-database-name
FIREBOLT_ENGINE=your-engine-name
```

> ⚠️ **Security Note:** The `.env` file is excluded from git via `.gitignore`. Never commit credentials to version control!

### 3. Start the Servers

**Terminal 1 - API Server:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Open the Demo

Navigate to `http://localhost:5173`

### 5. Initialize Database

1. Go to **Ad Performance MERGE** demo
2. Click **Full Reset** to create tables and load sample data
3. Run performance tests comparing MERGE vs Traditional approaches

## 📊 Database Schema

```sql
-- Main fact table: Ad performance data
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

-- Staging table: Late-arriving attribution data
CREATE FACT TABLE attribution_updates (...) PRIMARY INDEX click_id;

-- Fraud detection table
CREATE FACT TABLE detected_fraud (...) PRIMARY INDEX click_id;
```

## 🎛️ Available Scripts

### Frontend
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (in `server/` directory)
- `npm start` - Start API server (port 3001)
- `npm run dev` - Start with auto-reload

## 🏆 What You'll See

### Performance Metrics
| Metric | Description |
|--------|-------------|
| Time Improvement | % faster with MERGE vs Traditional |
| Efficiency Gain | Reduction in rows processed |
| I/O Reduction | Reduction in bytes scanned |
| Simplification | N operations → 1 operation |

### SQL Comparison View
- Side-by-side MERGE vs Traditional SQL
- Syntax highlighting
- Educational benefits breakdown

## 💡 Why First-Class MERGE Matters

| Traditional Approach | Firebolt MERGE |
|---------------------|----------------|
| Multiple round trips | Single atomic operation |
| Race conditions between ops | ACID compliant |
| Complex transaction management | Single optimized query plan |
| Multiple table scans | Single scan |
| Inconsistent data windows | Immediate consistency |

## 🔧 Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Express.js |
| Database | Firebolt Cloud |
| Auth | OAuth2 (Service Account) |

## 📝 Version History

### v2.0.0 - Firebolt Cloud Edition
- ✅ Firebolt Cloud connection support
- ✅ Attribution Updates MERGE (50/50 workload)
- ✅ Fraud Detection MERGE DELETE pattern
- ✅ Backend API server for secure authentication
- ✅ Redesigned UI

### v1.0.0 - Firebolt Core Edition
- Initial release with Firebolt Core (localhost) support
- Customer segmentation MERGE demo

## 🔗 Learn More

- **[Implementing Firebolt MERGE Statement](https://www.firebolt.io/blog/implementing-firebolt-merge-statement)** - Technical deep dive
- **[Firebolt Documentation](https://docs.firebolt.io/)** - Full MERGE syntax reference
- **[Start Free Trial](https://firebolt.io/signup)** - Get $200 in credits

## 🤝 Contributing

Contributions welcome! Ideas for enhancement:
- Additional MERGE patterns (CDC, SCD Type 2)
- ShadowTraffic integration for realistic data generation
- Benchmark automation and reporting

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with 🔥 by Firebolt to demonstrate first-class MERGE capabilities**
