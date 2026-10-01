import type { CSSProperties, ReactNode } from 'react'
import './Story.css'

/* Building blocks shared by the pinned "story" sections (AWS, Harman):
   a copy column of steps on the left, a diagram on the right. */

export type Step = { eyebrow: string; title: string; body: string }
export type Counter = { value: string; label: string; tone?: 'warn' | 'accent' }

export function StoryCopy({
  index,
  label,
  titleId,
  steps,
  extra,
}: {
  index: string
  label: string
  titleId: string
  steps: Step[]
  extra?: (i: number) => ReactNode
}) {
  return (
    <div className="story-copy">
      <p className="eyebrow" id={titleId}>
        <span className="idx">{index}</span> {label}
      </p>
      <div className="story-dots" aria-hidden>
        {steps.map((s) => (
          <span key={s.title} className="story-dot" />
        ))}
      </div>
      <div className="story-steps">
        {steps.map((s, i) => (
          <div key={s.title} className="story-step">
            <p className="story-step-eyebrow">{s.eyebrow}</p>
            <h2 className="h3">{s.title}</h2>
            <p className="story-step-body">{s.body}</p>
            {extra?.(i)}
          </div>
        ))}
      </div>
    </div>
  )
}

export function StoryCounters({ items }: { items: Counter[] }) {
  return (
    <div className="story-count" aria-hidden>
      {items.map((c) => (
        <div key={c.label} className={`story-counter tone-${c.tone ?? 'accent'}`}>
          <span className="story-count-num" data-value={c.value}>
            {c.value}
          </span>
          <span className="story-count-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

/** Text running around a circle, with a dark band underneath so it reads over lines. */
export function BadgeRing({
  id,
  cx,
  cy,
  r,
  text,
  className = '',
}: {
  id: string
  cx: number
  cy: number
  r: number
  text: string
  className?: string
}) {
  const style = { transformOrigin: `${cx}px ${cy}px` } as CSSProperties
  return (
    <g className={`story-badge ${className}`}>
      <path id={id} d={`M ${cx - r} ${cy} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`} fill="none" />
      <circle cx={cx} cy={cy} r={r} className="story-badge-band" />
      <text className="story-badge-text" style={style}>
        <textPath href={`#${id}`} textLength={Math.round(2 * Math.PI * r) - 8} lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
    </g>
  )
}
