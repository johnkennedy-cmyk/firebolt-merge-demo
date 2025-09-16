# Firebolt MERGE Demo

> **Interactive demonstration of Firebolt's MERGE operations performance vs traditional database approaches**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./VERSION.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)

## 🚀 Overview

This demo application showcases the performance benefits of **Firebolt's MERGE operations** compared to traditional INSERT/UPDATE/DELETE approaches through real-time testing against a local Firebolt Core instance.

### ✨ Key Features

- **📊 Live Performance Testing** - Real-time comparison of MERGE vs Traditional approaches
- **💻 Dual View Interface** - Toggle between Performance Results and SQL Query Comparison
- **🔗 Real Firebolt Integration** - Direct connection to local Firebolt Core instance
- **📈 Interactive Charts** - Execution time comparisons and performance metrics
- **📝 Comprehensive Debugging** - Step-by-step execution logs with detailed operation statistics
- **⚖️ Enhanced Data Controls** - 6 scaling options (1x to 50x = 1K to 50K customers)
- **🛠️ Database Management** - Complete table recreation and data loading controls
- **🧹 Smart Formatting** - Intelligent bytes/KB/MB display instead of 0.00 MB
- **🔄 Transparent Testing** - Full visibility into database state for reproducible benchmarks

## 🏗️ Technical Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Build Tool**: Vite with HMR
- **Charts**: Recharts for data visualizations
- **Database**: Firebolt Core (localhost:3473)
- **Data**: 5,000+ customer records for realistic testing

## 🎯 Demo Scenario

**Customer Analytics MERGE Performance**
- Realistic e-commerce customer segmentation scenario
- MERGE approach: Single comprehensive operation
- Traditional approach: 5 separate DELETE/UPDATE/INSERT operations
- Real-time performance metrics and SQL query comparison

## 📋 Prerequisites

- **Firebolt Core** running on `localhost:3473`
- **Node.js** v16+ with npm
- **Database** pre-populated with ecommerce dataset
- **Tables**: `customer_profiles`, `customer_changes`, `ecommerce`

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/johnkennedy-cmyk/firebolt-merge-demo.git
cd firebolt-merge-demo
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Demo
Navigate to `http://localhost:5173` and click on **Customer Analytics MERGE**

### 4. Initialize Database
1. Click "Full Reset" to create tables and load 10K initial customers
2. Optionally add more data (+10K, +25K, +50K, +100K buttons)

### 5. Run Performance Tests
1. Choose data scale (1x to 50x for 1K to 50K customers)
2. Click "Start Performance Test"
3. Watch comprehensive execution logs with operation statistics
4. Toggle between Performance Results and SQL Query Comparison views

### 6. Database Management
- **Database Status**: Monitor live table row counts
- **Reset Options**: UI-only, recreate tables, load data, or full reset
- **Clear Controls**: Remove log entries or clear status displays

## 🎛️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 What You'll See

### Performance Results View
- **Metrics Cards**: Time improvement, efficiency gains, I/O reduction
- **Execution Charts**: Visual comparison of MERGE vs Traditional timing
- **Results Table**: Detailed breakdown of all performance metrics
- **Real-time Logs**: Step-by-step execution with emoji indicators

### SQL Query Comparison View  
- **Side-by-side SQL**: Actual MERGE vs Traditional queries
- **Syntax Highlighting**: Color-coded for easy reading
- **Educational Content**: Benefits comparison and technical insights
- **Operation Breakdown**: See exactly what each approach executes

## 🏆 Performance Benefits Demonstrated

- **🚀 Single Operation**: MERGE vs 5 traditional operations
- **🔒 Atomic Transactions**: Better concurrency and data consistency  
- **📉 Reduced I/O**: Lower resource consumption
- **🧩 Simplified Logic**: Easier to understand and maintain
- **⚡ Better Performance**: Measurable execution time improvements

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Firebolt Branding**: Orange and blue color scheme
- **Interactive Elements**: Hover states and smooth transitions
- **Loading States**: Progress indicators during test execution
- **Error Handling**: Graceful error display and recovery

## 🔧 Configuration

The app connects to Firebolt Core via a Vite proxy configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api/firebolt': {
      target: 'http://localhost:3473',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/firebolt/, ''),
    }
  }
}
```

## 📝 Version History

See [VERSION.md](./VERSION.md) for detailed release notes.

## 🤝 Contributing

This is a demonstration project. For production use cases, consider:
- Adding authentication for multi-user environments
- Implementing data export capabilities
- Adding more complex MERGE scenarios
- Extending to other Firebolt features

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ to showcase Firebolt's MERGE capabilities**