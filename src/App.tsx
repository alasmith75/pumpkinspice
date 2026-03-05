import { useState } from 'react'
import FunnelChart, { FunnelStage } from './components/FunnelChart'
import './App.css'

const INITIAL_STAGES: FunnelStage[] = [
  { id: '1', label: 'Visitors',   value: 10000, color: '#6366f1' },
  { id: '2', label: 'Leads',      value: 4200,  color: '#06b6d4' },
  { id: '3', label: 'Prospects',  value: 1800,  color: '#10b981' },
  { id: '4', label: 'Customers',  value: 540,   color: '#f59e0b' },
]

export default function App() {
  const [stages, setStages] = useState<FunnelStage[]>(INITIAL_STAGES)

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Funnel Chart</h1>
        <p className="app-subtitle">Edit labels, values, and colors below</p>
      </header>
      <main className="app-main">
        <FunnelChart stages={stages} onChange={setStages} />
      </main>
    </div>
  )
}
