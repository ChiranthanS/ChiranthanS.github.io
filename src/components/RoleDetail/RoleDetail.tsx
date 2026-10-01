import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import type { HighlightVisual, Role } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import OrgMark from '../OrgMark'
import './RoleDetail.css'

/** Cards get a soft spotlight that follows the pointer. */
function spotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function Visual({ v }: { v: HighlightVisual }) {
  switch (v.kind) {
    case 'bars': {
      const max = Math.max(...v.bars.map((b) => b.value))
      return (
        <div className="rv-bars">
          {v.bars.map((b) => (
            <div key={b.label} className="rv-bar-row">
              <span className="rv-bar-lbl">{b.label}</span>
              <div className="rv-bar-track">
                <div className="rv-bar" style={{ '--w': b.value / max } as CSSProperties} />
              </div>
              <span className="rv-bar-val">{b.text}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'chips':
      return (
        <div className="chips rv-chips">
          {v.items.map((it) => (
            <span key={it} className="chip">
              {it}
            </span>
          ))}
        </div>
      )
    case 'pipeline':
      return (
        <ol className="rv-pipe">
          {v.items.map((it) => (
            <li key={it}>
              <span className="rv-pipe-tick">✓</span>
              {it}
            </li>
          ))}
        </ol>
      )
    case 'spark': {
      const line =
        'M0 57.5 C36 55 52 37.5 88 42.5 S140 60 176 50 232 22.5 268 30 320 55 356 45 412 17.5 452 25 508 42.5 544 32.5 580 26 600 27.5'
      return (
        <svg className="rv-spark" viewBox="0 0 600 80" aria-hidden>
          <defs>
            <linearGradient id="rvSparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="rv-spark-area" d={`${line} L600 80 L0 80 Z`} fill="url(#rvSparkFill)" />
          <path className="rv-spark-line" d={line} pathLength={1} />
        </svg>
      )
    }
    case 'migration':
      return (
        <div className="rv-mig">
          <div className="rv-mig-move">
            <span className="rv-mig-box">{v.from}</span>
            <span className="rv-mig-wire" aria-hidden>
              <i />
            </span>
            <span className="rv-mig-box is-new">{v.to}</span>
            <span className="rv-mig-note">{v.note}</span>
          </div>
          <div className="rv-mig-edge">
            <span className="rv-mig-when">{v.edge.when}</span>
            <div className="rv-mig-branches">
              <div className="rv-mig-branch is-ok">
                <span>{v.edge.ok[0]}</span>
                <span className="rv-mig-out">{v.edge.ok[1]}</span>
              </div>
              <div className="rv-mig-branch is-guard">
                <span>{v.edge.guard[0]}</span>
                <span className="rv-mig-out">{v.edge.guard[1]}</span>
              </div>
            </div>
          </div>
        </div>
      )
    case 'fleet':
      return (
        <div className="rv-fleet">
          {Array.from({ length: 30 }, (_, i) => (
            <i key={i} className={i === 7 || i === 22 ? 'is-flaky' : ''} style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
          <span className="rv-fleet-lbl">{v.label}</span>
        </div>
      )
  }
}

export default function RoleDetail({
  role,
  index,
  variant,
  seal,
}: {
  role: Role
  index: string
  variant: 'aws' | 'ci'
  seal: ReactNode
}) {
  const root = useRef<HTMLElement>(null)
  const grad = variant === 'aws' ? 'grad-amber' : 'grad-ci'
  const current = role.end === 'Present'

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        const q = gsap.utils.selector(root)

        gsap.from(q('.role-reveal'), {
          y: 50,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.role-head')[0], start: 'top 80%' },
        })
        gsap.to(q('.role-badge-spin'), {
          rotation: 140,
          svgOrigin: '160 160',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })

        q('.role-card').forEach((card) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%' } })
          tl.from(card, { y: 80, autoAlpha: 0, scale: 0.95, duration: 1.2, ease: 'expo.out' })

          // stats count up from zero; anything with two numbers in it is left alone
          const num = card.querySelector<HTMLElement>('.role-card-num')
          const m = num?.dataset.value?.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/)
          if (num && m) {
            const [, pre, value, post] = m
            const decimals = value.split('.')[1]?.length ?? 0
            const v = { n: 0 }
            tl.to(
              v,
              {
                n: Number(value),
                duration: 1.4,
                ease: 'power3.out',
                onUpdate: () => (num.textContent = pre + v.n.toFixed(decimals) + post),
              },
              0.15,
            )
          }

          // each card animates only the visual it has
          const part = (sel: string, vars: gsap.TweenVars) => {
            const els = card.querySelectorAll(sel)
            if (els.length) tl.from(els, vars, 0.3)
          }
          part('.rv-bar', { scaleX: 0, duration: 1.2, stagger: 0.25, ease: 'expo.out' })
          part('.rv-chips .chip', { y: 12, autoAlpha: 0, stagger: 0.05, duration: 0.5 })
          part('.rv-pipe li', { autoAlpha: 0.2, stagger: 0.18, duration: 0.3, ease: 'none' })
          part('.rv-spark-line', { strokeDashoffset: 1, duration: 1.6, ease: 'power2.inOut' })
          part('.rv-spark-area', { autoAlpha: 0, duration: 1.2 })
          part('.rv-mig-move > *, .rv-mig-when, .rv-mig-branch', {
            y: 12,
            autoAlpha: 0,
            stagger: 0.12,
            duration: 0.6,
            ease: 'expo.out',
          })
        })

        gsap.from(q('.role-stack'), {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: q('.role-stack')[0], start: 'top 92%' },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className={`role role-${variant} section`} aria-labelledby={`role-title-${variant}`}>
      <div className="container">
        <div className="role-top">
          <div className="role-head">
            <p className="eyebrow role-reveal">
              <span className="idx">{index}</span> The role
            </p>
            <h2 id={`role-title-${variant}`} className="h2 role-reveal">
              {role.title},<br />
              <span className={grad}>{role.team}.</span>
            </h2>
            <div className="role-meta role-reveal">
              <span className={`chip ${current ? 'chip-live' : ''}`}>
                {current && <span className="pulse" aria-hidden />} {role.start} – {role.end}
              </span>
              {role.duration && <span className="chip">{role.duration}</span>}
              <span className="chip chip-org">
                {role.mark && <OrgMark org={role.mark} size={20} />}
                {role.company}
              </span>
              {role.place && <span className="chip">{role.place}</span>}
            </div>
            <p className="lead role-reveal">{role.summary}</p>
          </div>
          {seal}
        </div>

        <div className="role-cards">
          {role.highlights.map((h, i) => (
            <article
              key={h.title}
              className={`role-card size-${h.size ?? 'sm'} ${h.stat || h.visual ? '' : 'is-plain'}`}
              onPointerMove={spotlight}
            >
              <span className="role-card-idx">{String(i + 1).padStart(2, '0')}</span>
              {h.stat && (
                <p className="role-card-stat">
                  <span className={`role-card-num ${grad}`} data-value={h.stat}>
                    {h.stat}
                  </span>
                  {h.statLabel && <span className="role-card-statlbl">{h.statLabel}</span>}
                </p>
              )}
              {h.visual && <Visual v={h.visual} />}
              <h3>{h.title}</h3>
              <p className="role-card-body">{h.body}</p>
            </article>
          ))}
        </div>

        {role.languages && (
          <div className="role-stack">
            <span className="role-stack-lbl">Languages</span>
            <div className="chips">
              {role.languages.map((l) => (
                <span key={l} className="chip chip-accent">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="role-stack">
          <span className="role-stack-lbl">Day to day</span>
          <div className="chips">
            {role.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
