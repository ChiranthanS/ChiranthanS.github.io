import type { ReactNode } from 'react'

/* Round seals that sit beside each role's heading and turn as you scroll. */

function Seal({ id, text, children }: { id: string; text: string; children: ReactNode }) {
  return (
    <div className="role-badge role-reveal" aria-hidden>
      <svg viewBox="0 0 320 320">
        <path id={id} d="M 22 160 a 138 138 0 1 1 276 0 a 138 138 0 1 1 -276 0" fill="none" />
        <g className="role-badge-spin">
          <text className="role-badge-text">
            <textPath href={`#${id}`} textLength={862} lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </g>
        <circle className="role-badge-ring" cx="160" cy="160" r="114" />
        {children}
      </svg>
    </div>
  )
}

/** Hub and spokes: Transit Gateway. */
export function AwsSeal() {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    return { x: 160 + Math.cos(a) * 78, y: 160 + Math.sin(a) * 78 }
  })
  return (
    <Seal id="sealAws" text={'AMAZON WEB SERVICES ✦ TRANSIT GATEWAY ✦ '.repeat(2)}>
      {spokes.map((p, i) => (
        <g key={i}>
          <line className="role-badge-spoke" x1="160" y1="160" x2={p.x} y2={p.y} />
          <circle className="role-badge-node" cx={p.x} cy={p.y} r="7" />
        </g>
      ))}
      <defs>
        <radialGradient id="sealAwsHub" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffd38a" />
          <stop offset="60%" stopColor="#ff9f43" />
          <stop offset="100%" stopColor="#b85a1a" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="30" fill="url(#sealAwsHub)" />
    </Seal>
  )
}

/** A small DevOps loop with a build lapping it: Harman. */
export function CiSeal() {
  const loop =
    'M160 160 C140 128 106 118 80 128 C52 138 52 182 80 192 C106 202 140 192 160 160 ' +
    'C180 128 214 118 240 128 C268 138 268 182 240 192 C214 202 180 192 160 160'
  return (
    <Seal id="sealCi" text={'HARMAN · SAMSUNG ✦ BUILD & AUTOMATION ✦ '.repeat(2)}>
      <path d={loop} className="role-badge-loop" />
      <circle r="6" className="role-badge-token">
        <animateMotion dur="4s" repeatCount="indefinite" path={loop} />
      </circle>
      <circle cx="160" cy="160" r="9" className="role-badge-core" />
    </Seal>
  )
}
