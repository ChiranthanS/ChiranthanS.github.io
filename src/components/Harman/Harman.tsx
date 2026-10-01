import { useRef } from 'react'
import { devopsStages, harmanCounters, harmanSteps, pipelineLog } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { BadgeRing, StoryCopy, StoryCounters } from '../Story/Story'
import { countUp, prepareStory, swapCounter, swapStep } from '../Story/storyTimeline'
import './Harman.css'

/* The DevOps loop: an infinity sign drawn as six cubic segments that cross at
   the centre. Dev (plan → test) is the left lobe, Ops (release → monitor) the right. */

type Pt = [number, number]
const CX = 400
const CY = 210
const SEGMENTS: [Pt, Pt, Pt, Pt][] = [
  [
    [CX, CY],
    [340, 75],
    [240, 30],
    [160, 75],
  ],
  [
    [160, 75],
    [80, 120],
    [80, 300],
    [160, 345],
  ],
  [
    [160, 345],
    [240, 390],
    [340, 345],
    [CX, CY],
  ],
  [
    [CX, CY],
    [460, 75],
    [560, 30],
    [640, 75],
  ],
  [
    [640, 75],
    [720, 120],
    [720, 300],
    [640, 345],
  ],
  [
    [640, 345],
    [560, 390],
    [460, 345],
    [CX, CY],
  ],
]
const LOOP = `M${CX} ${CY} ` + SEGMENTS.map(([, a, b, p]) => `C${a} ${b} ${p}`).join(' ')

function bezier([p0, p1, p2, p3]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t
  const f = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]
  return [f(0), f(1)]
}

type Side = 'top' | 'bottom' | 'left' | 'right'
// where each stage sits on the loop: [segment, t, label side]
const PLACES: [number, number, Side][] = [
  [0, 0.55, 'top'],
  [1, 0.2, 'left'],
  [1, 0.8, 'left'],
  [2, 0.5, 'bottom'],
  [3, 0.45, 'top'],
  [4, 0.2, 'right'],
  [4, 0.8, 'right'],
  [5, 0.5, 'bottom'],
]

type Anchor = 'start' | 'middle' | 'end'

const stages = devopsStages.map((s, i) => {
  const [seg, t, side] = PLACES[i]
  const [x, y] = bezier(SEGMENTS[seg], t)
  const label: { x: number; y: number; anchor: Anchor } =
    side === 'top'
      ? { x, y: y - 42, anchor: 'middle' }
      : side === 'bottom'
        ? { x, y: y + 40, anchor: 'middle' }
        : { x: side === 'left' ? x - 26 : x + 26, y: y - 2, anchor: side === 'left' ? 'end' : 'start' }
  // fraction of the whole loop, used to light each stage as the line reaches it
  return { ...s, x, y, side, label, at: (seg + t) / SEGMENTS.length }
})

const GUARDRAILS_STEP = 2

function PipelineLog() {
  return (
    <div className="story-panel ci-log" aria-label="Example Jenkins pipeline run">
      <div className="story-panel-head">
        <span>jenkins · infotainment-svc #1842</span>
        <span className="ok">● passing</span>
      </div>
      {pipelineLog.map((r) => (
        <div key={r.stage} className="ci-log-row">
          <span className="ci-log-tick">✓</span>
          <span className="ci-log-stage">{r.stage}</span>
          <span className="ci-log-detail">{r.detail}</span>
        </div>
      ))}
      <div className="ci-log-row ci-log-final">Finished: SUCCESS</div>
    </div>
  )
}

export default function Harman() {
  const root = useRef<HTMLElement>(null)
  const compact = useMediaQuery('(max-width: 899px)')

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        root.current!.classList.add('is-animated')
        const q = gsap.utils.selector(root)
        const path = root.current!.querySelector<SVGPathElement>('.ci-live')!

        // builds lap the loop on their own clock; scroll decides whether you see them.
        // Each starts at the hub (the path's start) and leaves two seconds after the last.
        const builds = gsap.timeline({ paused: true })
        q('.ci-token').forEach((el, i) => {
          builds.to(
            el,
            {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
              duration: 6,
              ease: 'none',
              repeat: -1,
              immediateRender: true,
            },
            i * 2,
          )
        })

        prepareStory(q)
        gsap.set(q('.ci-stage'), { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(q('.ci-stage-ok'), { autoAlpha: 0 })
        gsap.set(q('.ci-live'), { strokeDashoffset: 1 })
        gsap.set(q('.ci-broken'), { opacity: 0 })
        gsap.set(q('.ci-tokens, .ci-tag'), { autoAlpha: 0 })
        gsap.set(q('.ci-log-row'), { autoAlpha: 0.25 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=400%',
            pin: '.story-pin',
            scrub: 0.8,
            onToggle: (self) => (self.isActive ? builds.play() : builds.pause()),
          },
        })

        // 1. eight stages, all hand-offs
        tl.to(q('.story-dot')[0], { '--fill': 1, duration: 0.3 }, 0)
          .to(q('.ci-broken'), { opacity: 1, duration: 0.6 }, 0)
          .to(q('.ci-stage'), { scale: 1, stagger: 0.12, duration: 0.5, ease: 'back.out(2)' }, 0.1)
        countUp(tl, q('.story-count-num')[0], 0.1, 1.34).to({}, { duration: 0.8 })

        // 2. one pipeline: the line runs the loop and every stage goes green as it arrives
        const DRAW = 1.6
        swapStep(tl, q, 0, 1, 2.4)
        swapCounter(tl, q, 0, 1, 2.6)
        tl.to(q('.ci-broken'), { opacity: 0, duration: 0.5 }, 2.5).to(
          q('.ci-live'),
          { strokeDashoffset: 0, duration: DRAW, ease: 'none' },
          2.7,
        )
        stages.forEach((s, i) => {
          tl.to(q('.ci-stage-ok')[i], { autoAlpha: 1, duration: 0.15 }, 2.7 + s.at * DRAW)
        })
        tl.to(q('.ci-tokens'), { autoAlpha: 1, duration: 0.5 }, 4.2).to({}, { duration: 0.6 })

        // 3. guardrails
        swapStep(tl, q, 1, 2, 5.2)
        tl.to(q('.ci-log-row'), { autoAlpha: 1, stagger: 0.15, duration: 0.25 }, 5.7).to({}, { duration: 0.6 })

        // 4. that's my team
        swapStep(tl, q, 2, 3, 7.6)
        tl.to(q('.story-count'), { autoAlpha: 0, duration: 0.5 }, 7.6)
          .to(q('.story-diagram'), { scale: 1.05, duration: 1.2 }, 7.7)
          .to(q('.ci-tag'), { autoAlpha: 1, duration: 0.5 }, 8.1)
          .to(root.current, { '--glow': 1, duration: 0.8 }, 8)
          .to({}, { duration: 0.8 })

        return () => {
          builds.kill()
          root.current?.classList.remove('is-animated')
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="harman" className="story ci" aria-labelledby="ci-title">
      <div className="story-pin">
        <div className="container story-grid">
          <StoryCopy
            index="02"
            label="Before · Harman International (Samsung)"
            titleId="ci-title"
            steps={harmanSteps}
            extra={(i) => i === GUARDRAILS_STEP && <PipelineLog />}
          />

          <div className="story-visual">
            <StoryCounters items={harmanCounters} />

            <svg
              className="story-diagram ci-diagram"
              viewBox={compact ? '-20 -12 840 434' : '-30 -12 860 434'}
              role="img"
              aria-label="Diagram: the DevOps loop. Eight stages, from plan, code, build and test to release, deploy, operate and monitor, joined into one continuous Jenkins pipeline."
            >
              <defs>
                <linearGradient id="ciGrad" x1="80" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3ddc97" />
                  <stop offset="100%" stopColor="#4fd8ff" />
                </linearGradient>
                <radialGradient id="ciHub" cx="50%" cy="40%" r="65%">
                  <stop offset="0%" stopColor="#9ff5cf" />
                  <stop offset="60%" stopColor="#3ddc97" />
                  <stop offset="100%" stopColor="#1a7a52" />
                </radialGradient>
              </defs>

              <path d={LOOP} className="ci-track" />
              <text x={250} y={CY + 9} className="ci-lobe">
                DEV
              </text>
              <text x={550} y={CY + 9} className="ci-lobe">
                OPS
              </text>
              <path d={LOOP} className="ci-broken" />
              <path d={LOOP} className="ci-live" pathLength={1} />

              <g className="ci-tokens">
                {[0, 1, 2].map((i) => (
                  <circle key={i} className="ci-token" r={5.5} />
                ))}
              </g>

              <BadgeRing
                id="ciRing"
                className="ci-tag"
                cx={CX}
                cy={CY}
                r={64}
                text={'MY TEAM ✦ BUILD & AUTOMATION ✦ '}
              />

              <g className="ci-hub">
                <circle cx={CX} cy={CY} r={33} fill="url(#ciHub)" />
                <text x={CX} y={CY + 1} className="ci-hub-code">
                  CI/CD
                </text>
                <text x={CX} y={CY + 16} className="ci-hub-sub">
                  jenkins
                </text>
              </g>

              {stages.map((s) => (
                <g key={s.name} className={`ci-stage side-${s.side}`}>
                  <circle cx={s.x} cy={s.y} r={15} className="ci-stage-ring" />
                  <path
                    className="ci-stage-fail"
                    d={`M${s.x - 4.5} ${s.y - 4.5} L${s.x + 4.5} ${s.y + 4.5} M${s.x + 4.5} ${s.y - 4.5} L${s.x - 4.5} ${s.y + 4.5}`}
                  />
                  <g className="ci-stage-ok">
                    <circle cx={s.x} cy={s.y} r={15} />
                    <path d={`M${s.x - 6} ${s.y} L${s.x - 1.5} ${s.y + 4.5} L${s.x + 6} ${s.y - 5}`} />
                  </g>
                  <text x={s.label.x} y={s.label.y} textAnchor={s.label.anchor} className="ci-stage-name">
                    {s.name}
                  </text>
                  <text x={s.label.x} y={s.label.y + 16} textAnchor={s.label.anchor} className="ci-stage-tool">
                    {s.tool}
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
