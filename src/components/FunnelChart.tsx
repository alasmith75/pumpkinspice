import React, { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import './FunnelChart.css'

export interface FunnelStage {
  id: string
  label: string
  value: number
  color: string
}

interface FunnelChartProps {
  stages: FunnelStage[]
  onChange: (stages: FunnelStage[]) => void
}

const PALETTE = [
  '#FF6B6B', '#FF8E53', '#FFC14E', '#A8E063',
  '#43C6AC', '#4FC3F7', '#7986CB', '#CE93D8',
]

export default function FunnelChart({ stages, onChange }: FunnelChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const sorted = [...stages].sort((a, b) => b.value - a.value)
  const max = sorted[0]?.value || 1

  function update(id: string, field: keyof FunnelStage, value: string | number) {
    onChange(
      stages.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    )
  }

  function addStage() {
    const newStage: FunnelStage = {
      id: crypto.randomUUID(),
      label: `Stage ${stages.length + 1}`,
      value: Math.max(1, Math.round((sorted[sorted.length - 1]?.value || 100) / 2)),
      color: PALETTE[stages.length % PALETTE.length],
    }
    onChange([...stages, newStage])
  }

  function removeStage(id: string) {
    if (stages.length <= 1) return
    onChange(stages.filter((s) => s.id !== id))
  }

  async function downloadPng() {
    if (!chartRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        backgroundColor: '#f0f2f5',
        pixelRatio: 2,
        style: { padding: '32px' },
      })
      const link = document.createElement('a')
      link.download = 'funnel-chart.png'
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="funnel-wrapper">
      {/* Capture area */}
      <div ref={chartRef} className="funnel-chart-capture">
        <div className="funnel-chart">
          {sorted.map((stage, i) => {
            const widthPct = (stage.value / max) * 100
            const dropPct = i > 0 ? Math.round((1 - stage.value / sorted[i - 1].value) * 100) : null
            return (
              <div key={stage.id} className="funnel-row">
                {dropPct !== null && (
                  <div className="funnel-drop-label">▼ {dropPct}% drop</div>
                )}
                <div className="funnel-bar-container">
                  <div
                    className="funnel-bar"
                    style={{
                      width: `${widthPct}%`,
                      background: stage.color,
                    }}
                  >
                    <span className="funnel-bar-label">{stage.label}</span>
                    <span className="funnel-bar-value">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        className="download-btn"
        onClick={downloadPng}
        disabled={downloading}
      >
        {downloading ? 'Generating…' : '↓ Download PNG'}
      </button>

      <div className="funnel-editor">
        <h2 className="editor-title">Edit Stages</h2>
        <div className="editor-rows">
          {stages.map((stage) => (
            <div key={stage.id} className="editor-row">
              <div
                className="color-swatch-wrapper"
                title="Pick a color"
              >
                <div
                  className="color-swatch"
                  style={{ background: stage.color }}
                />
                <input
                  type="color"
                  className="color-input"
                  value={stage.color}
                  onChange={(e) => update(stage.id, 'color', e.target.value)}
                />
              </div>

              <input
                type="text"
                className="label-input"
                value={stage.label}
                placeholder="Stage name"
                onChange={(e) => update(stage.id, 'label', e.target.value)}
              />

              <input
                type="number"
                className="value-input"
                value={stage.value}
                min={0}
                onChange={(e) => update(stage.id, 'value', Math.max(0, Number(e.target.value)))}
              />

              <button
                className="remove-btn"
                onClick={() => removeStage(stage.id)}
                disabled={stages.length <= 1}
                title="Remove stage"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button className="add-btn" onClick={addStage}>
          + Add Stage
        </button>
      </div>
    </div>
  )
}
