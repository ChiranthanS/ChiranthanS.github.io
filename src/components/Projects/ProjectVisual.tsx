import type { ReactNode } from 'react'
import type { Project } from '../../content'

/* Small, code-drawn illustrations — one per project — so the gallery feels
   like one system instead of five unrelated screenshots. */

const W = 480
const H = 300

function Frame({ children, hue }: { children: ReactNode; hue: string }) {
  const id = hue.slice(1)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="pv"
      style={{ ['--hue' as string]: hue }}
      aria-hidden
    >
      <defs>
        <pattern id={`grid-${id}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.045)" />
        </pattern>
        <radialGradient id={`glow-${id}`} cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor={hue} stopOpacity=".28" />
          <stop offset="100%" stopColor={hue} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#07090f" />
      <rect width={W} height={H} fill={`url(#grid-${id})`} />
      <rect width={W} height={H} fill={`url(#glow-${id})`} />
      {children}
    </svg>
  )
}

function Monitor() {
  const bars = [38, 52, 44, 70, 58, 82, 64, 90, 72, 56, 66, 48, 60, 78]
  return (
    <Frame hue="#4fd8ff">
      <g transform="translate(36 40)">
        <text className="pv-mono" x="0" y="0">
          cpu_utilization · eks/cloudsight
        </text>
        <text className="pv-big" x="0" y="44">
          62<tspan className="pv-unit">%</tspan>
        </text>
        <path
          className="pv-spark"
          pathLength={1}
          d="M0 120 C30 110 50 80 80 92 S130 60 160 70 210 40 240 52 290 20 320 30 380 18 408 10"
          fill="none"
        />
        {bars.map((h, i) => (
          <rect
            key={i}
            className="pv-bar"
            x={i * 29}
            y={220 - h}
            width="18"
            height={h}
            rx="3"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}
      </g>
      <g transform="translate(330 40)">
        {Array.from({ length: 9 }).map((_, i) => (
          <rect
            key={i}
            className="pv-pod"
            x={(i % 3) * 40}
            y={Math.floor(i / 3) * 34}
            width="30"
            height="24"
            rx="5"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
        <text className="pv-mono" x="0" y="116">
          hpa: 3 → 9 pods
        </text>
      </g>
    </Frame>
  )
}

function Protocols() {
  const lines = [
    ['$', 'dig example.com A', 'cmd'],
    ['', ';; ANSWER SECTION', 'dim'],
    ['', 'example.com.  300  IN  A  203.0.113.7', 'out'],
    ['$', 'curl -I http://203.0.113.7', 'cmd'],
    ['', 'HTTP/1.1 200 OK', 'ok'],
    ['$', 'nc -v smtp.local 25', 'cmd'],
    ['', '250 smtp.local Hello netster', 'ok'],
  ]
  return (
    <Frame hue="#8b7bff">
      <g transform="translate(28 34)">
        <circle cx="6" cy="0" r="5" fill="#ff5f57" />
        <circle cx="24" cy="0" r="5" fill="#febc2e" />
        <circle cx="42" cy="0" r="5" fill="#28c840" />
        {lines.map(([p, t, k], i) => (
          <text key={i} className={`pv-term pv-${k}`} x="0" y={36 + i * 30} style={{ animationDelay: `${i * 0.45}s` }}>
            {p && <tspan className="pv-prompt">{p} </tspan>}
            {t}
          </text>
        ))}
      </g>
    </Frame>
  )
}

function Logistics() {
  const route = 'M60 210 C140 60 260 260 330 120 S420 60 430 80'
  return (
    <Frame hue="#3ddc97">
      <path d={route} className="pv-route" fill="none" />
      <path d={route} className="pv-route-live" fill="none" pathLength={1} />
      <circle r="7" className="pv-parcel">
        <animateMotion dur="5s" repeatCount="indefinite" path={route} rotate="auto" />
      </circle>
      {[
        [60, 210],
        [330, 120],
        [430, 80],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="12" className="pv-stop-ring" />
          <circle cx={x} cy={y} r="5" className="pv-stop" />
        </g>
      ))}
      <g transform="translate(36 36)" className="pv-mono">
        <text x="0" y="0">
          SHIPMENT 1Z·9X2·44
        </text>
        <text x="0" y="22" className="pv-dim">
          FedEx $24.10 · UPS <tspan className="pv-ok">$22.80 ✓</tspan>
        </text>
      </g>
    </Frame>
  )
}

function Travel() {
  const pins = [
    [80, 200, 'Lisbon'],
    [190, 120, 'Porto'],
    [300, 180, 'Madrid'],
    [400, 100, 'Paris'],
  ] as const
  const d = pins.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
  return (
    <Frame hue="#a3e635">
      <path d={d} className="pv-trip" fill="none" />
      {pins.map(([x, y, name], i) => (
        <g key={name} className="pv-pin" style={{ animationDelay: `${i * 0.5}s` }}>
          <path d={`M${x} ${y} c-12 -16 -14 -22 -14 -28 a14 14 0 0 1 28 0 c0 6 -2 12 -14 28z`} />
          <circle cx={x} cy={y - 28} r="5" fill="#07090f" />
          <text x={x} y={y + 22} className="pv-mono" textAnchor="middle">
            {name}
          </text>
        </g>
      ))}
      <g transform="translate(36 40)" className="pv-mono">
        <text x="0" y="0">
          itinerary · 4 stops · by rail
        </text>
        <text x="0" y="22" className="pv-ok">
          ✓ low-carbon route
        </text>
      </g>
    </Frame>
  )
}

function Charts() {
  const bars = [120, 160, 96, 190, 140, 210, 170]
  const nodes = [
    [330, 90],
    [400, 70],
    [430, 140],
    [360, 170],
    [300, 150],
    [390, 220],
  ]
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
    [3, 5],
    [0, 3],
    [1, 3],
  ]
  return (
    <Frame hue="#f472b6">
      <g transform="translate(36 40)">
        <text className="pv-mono" x="0" y="0">
          avg salary · data science
        </text>
        {bars.map((h, i) => (
          <rect
            key={i}
            className="pv-col"
            x={i * 32}
            y={232 - h}
            width="22"
            height={h}
            rx="3"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </g>
      <g className="pv-graph">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 3 ? 9 : 6} style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </g>
    </Frame>
  )
}

export default function ProjectVisual({ project }: { project: Project }) {
  if (project.image) return <img src={project.image} alt="" className="pv" loading="lazy" />
  switch (project.visual) {
    case 'monitor':
      return <Monitor />
    case 'protocols':
      return <Protocols />
    case 'logistics':
      return <Logistics />
    case 'travel':
      return <Travel />
    case 'charts':
      return <Charts />
  }
}
