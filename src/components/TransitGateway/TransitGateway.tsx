import { useRef } from 'react'
import { routeTable, tgwNodes, tgwSteps } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { BadgeRing, StoryCopy, StoryCounters } from '../Story/Story'
import { countUp, prepareStory, swapCounter, swapStep } from '../Story/storyTimeline'
import './TransitGateway.css'

const SIZE = 640
const C = SIZE / 2
const RING = 236

const SHORT: Record<string, string> = { vpc: 'VPC', peer: 'PEER', dx: 'DX', dc: 'DC', vpn: 'VPN' }

const nodes = tgwNodes.map((n, i) => {
  const a = (-90 + i * (360 / tgwNodes.length)) * (Math.PI / 180)
  const [, sub] = n.label.split(' · ')
  return {
    ...n,
    x: C + Math.cos(a) * RING,
    y: C + Math.sin(a) * RING,
    // full label sits just outside the ring
    lx: C + Math.cos(a) * (RING + 58),
    ly: C + Math.sin(a) * (RING + 58),
    anchor: (Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end') as 'middle' | 'start' | 'end',
    code: SHORT[n.kind],
    sub: n.kind === 'vpc' ? sub : undefined,
  }
})

const mesh: [number, number][] = []
for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) mesh.push([i, j])

// packets ride node → hub → node
const routes: [number, number][] = [
  [0, 4],
  [5, 1],
  [2, 6],
  [7, 3],
  [1, 5],
  [6, 0],
  [3, 7],
  [4, 2],
]

const ROUTING_STEP = 2

const COUNTERS = [
  { value: String(mesh.length), label: 'point-to-point links', tone: 'warn' as const },
  { value: String(nodes.length), label: 'attachments · 1 hub' },
]

function RouteTable() {
  return (
    <div className="story-panel tgw-rt" aria-label="Example Transit Gateway route table">
      <div className="story-panel-head">
        <span>tgw-rtb · prod</span>
        <span className="ok">● active</span>
      </div>
      <div className="tgw-rt-cols">
        <span>Destination</span>
        <span>Attachment</span>
        <span>Type</span>
      </div>
      {routeTable.map((r) => (
        <div key={r.cidr} className="tgw-rt-row">
          <span>{r.cidr}</span>
          <span>{r.target}</span>
          <span className={r.type === 'static' ? 'st' : ''}>{r.type}</span>
        </div>
      ))}
    </div>
  )
}

export default function TransitGateway() {
  const root = useRef<HTMLElement>(null)
  // node labels are hidden on small screens, so drop the margin they need
  const compact = useMediaQuery('(max-width: 899px)')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        root.current!.classList.add('is-animated')
        const q = gsap.utils.selector(root)

        // packets loop on their own clock; scroll only decides whether you see them
        const packets = gsap.timeline({ repeat: -1, paused: true })
        q('.tgw-packet').forEach((el, i) => {
          const [a, b] = routes[i]
          packets.fromTo(
            el,
            { attr: { cx: nodes[a].x, cy: nodes[a].y } },
            {
              keyframes: [
                { attr: { cx: C, cy: C }, duration: 0.9, ease: 'power1.in' },
                { attr: { cx: nodes[b].x, cy: nodes[b].y }, duration: 0.9, ease: 'power1.out' },
              ],
            },
            i * 0.45,
          )
        })

        prepareStory(q)
        gsap.set(q('.tgw-node'), { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(q('.tgw-mesh line'), { strokeDashoffset: 1 })
        gsap.set(q('.tgw-spoke'), { strokeDashoffset: 1 })
        gsap.set(q('.tgw-hub'), { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(q('.tgw-packets, .tgw-tag'), { autoAlpha: 0 })
        gsap.set(q('.tgw-rt-row'), { autoAlpha: 0.25 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=420%',
            pin: '.story-pin',
            scrub: 0.8,
            onToggle: (self) => (self.isActive ? packets.play() : packets.pause()),
          },
        })

        tl.to(q('.story-dot')[0], { '--fill': 1, duration: 0.3 }, 0)
          // 1. a mesh of point-to-point links
          .to(q('.tgw-node'), { scale: 1, stagger: 0.06, duration: 0.5, ease: 'back.out(2)' }, 0)
          .to(q('.tgw-mesh line'), { strokeDashoffset: 0, stagger: 0.05, duration: 0.6 }, 0.4)
        countUp(tl, q('.story-count-num')[0], 0.4, 1.95).to({}, { duration: 0.6 })

        // 2. one hub
        swapStep(tl, q, 0, 1, 3)
        swapCounter(tl, q, 0, 1, 3.4)
        tl.to(q('.tgw-mesh'), { opacity: 0, duration: 0.8 }, 3.1)
          .to(q('.tgw-hub'), { scale: 1, duration: 0.8, ease: 'back.out(1.6)' }, 3.4)
          .to(q('.tgw-spoke'), { strokeDashoffset: 0, stagger: 0.06, duration: 0.6 }, 3.7)
          .to({}, { duration: 0.6 })

        // 3. routing
        swapStep(tl, q, 1, 2, 5.6)
        tl.to(q('.tgw-packets'), { autoAlpha: 1, duration: 0.6 }, 5.8)
          .to(q('.tgw-rt-row'), { autoAlpha: 1, stagger: 0.18, duration: 0.3 }, 6.1)
          .to({}, { duration: 0.6 })

        // 4. that's my team
        swapStep(tl, q, 2, 3, 8.2)
        tl.to(q('.story-count'), { autoAlpha: 0, duration: 0.5 }, 8.2)
          .to(q('.story-diagram'), { scale: 1.06, duration: 1.2 }, 8.3)
          .to(q('.tgw-tag'), { autoAlpha: 1, duration: 0.5 }, 8.7)
          .to(root.current, { '--glow': 1, duration: 0.8 }, 8.6)
          .to({}, { duration: 0.8 })

        return () => {
          packets.kill()
          root.current?.classList.remove('is-animated')
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="aws" className="story tgw" aria-labelledby="tgw-title">
      <div className="story-pin">
        <div className="container story-grid">
          <StoryCopy
            index="01"
            label="Now · Amazon Web Services"
            titleId="tgw-title"
            steps={tgwSteps}
            extra={(i) => i === ROUTING_STEP && <RouteTable />}
          />

          <div className="story-visual">
            <StoryCounters items={COUNTERS} />

            <svg
              className="story-diagram tgw-diagram"
              viewBox={compact ? `36 36 ${SIZE - 72} ${SIZE - 72}` : `-90 -40 ${SIZE + 180} ${SIZE + 80}`}
              role="img"
              aria-label="Diagram: eight networks wired to each other in a full mesh of 28 links are replaced by a single Transit Gateway hub with eight attachments."
            >
              <defs>
                <radialGradient id="hubFill" cx="50%" cy="40%" r="65%">
                  <stop offset="0%" stopColor="#ffd38a" />
                  <stop offset="55%" stopColor="#ff9f43" />
                  <stop offset="100%" stopColor="#b85a1a" />
                </radialGradient>
                <radialGradient id="hubHalo">
                  <stop offset="0%" stopColor="rgba(255,181,71,.55)" />
                  <stop offset="100%" stopColor="rgba(255,181,71,0)" />
                </radialGradient>
              </defs>

              <g className="tgw-mesh">
                {mesh.map(([a, b]) => (
                  <line
                    key={`${a}-${b}`}
                    x1={nodes[a].x}
                    y1={nodes[a].y}
                    x2={nodes[b].x}
                    y2={nodes[b].y}
                    pathLength={1}
                  />
                ))}
              </g>

              <g className="tgw-spokes">
                {nodes.map((n) => (
                  <line key={n.id} className="tgw-spoke" x1={C} y1={C} x2={n.x} y2={n.y} pathLength={1} />
                ))}
              </g>

              <g className="tgw-packets">
                {routes.map(([a], i) => (
                  <circle key={i} className="tgw-packet" r={6} cx={nodes[a].x} cy={nodes[a].y} />
                ))}
              </g>

              <g className="tgw-hub">
                <circle className="tgw-hub-halo" cx={C} cy={C} r={120} fill="url(#hubHalo)" />
                <circle className="tgw-hub-ring" cx={C} cy={C} r={62} />
                <circle className="tgw-hub-ring r2" cx={C} cy={C} r={62} />
                <circle cx={C} cy={C} r={58} fill="url(#hubFill)" />
                <text x={C} y={C + 2} className="tgw-hub-code">
                  TGW
                </text>
                <text x={C} y={C + 24} className="tgw-hub-sub">
                  transit gateway
                </text>
              </g>

              <BadgeRing id="tgwRing" className="tgw-tag" cx={C} cy={C} r={86} text={'MY TEAM ✦ '.repeat(4)} />

              {nodes.map((n) => (
                <g key={n.id} className={`tgw-node kind-${n.kind}`}>
                  <circle cx={n.x} cy={n.y} r={36} />
                  <text x={n.x} y={n.sub ? n.y - 3 : n.y + 5} className="tgw-node-code">
                    {n.code}
                  </text>
                  {n.sub && (
                    <text x={n.x} y={n.y + 15} className="tgw-node-sub">
                      {n.sub}
                    </text>
                  )}
                  <text x={n.lx} y={n.ly + 5} textAnchor={n.anchor} className="tgw-node-label">
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
