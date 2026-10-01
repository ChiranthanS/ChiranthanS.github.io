import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { profile } from '../content'
import { ScrollTrigger, gsap, lockScroll, scrollToTarget, useGSAP } from '../lib/motion'
import { Close, FileText, HubMark, Menu } from './Icons'
import './Nav.css'

const LINKS: { id: string; label: string; until?: string }[] = [
  { id: 'aws', label: 'AWS', until: '.role-aws' },
  { id: 'harman', label: 'Harman', until: '.role-ci' },
  { id: 'journey', label: 'Journey' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        refreshPriority: -1,
        onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
      })

      for (const { id, until } of LINKS) {
        const section = document.getElementById(id)
        if (!section) continue
        ScrollTrigger.create({
          trigger: section,
          start: 'top 45%',
          // resolve here: selector strings would be scoped to the nav
          endTrigger: (until && document.querySelector(until)) || section,
          end: 'bottom 45%',
          // measured after every pinned section above it has added its spacing
          refreshPriority: -1,
          onToggle: (self) => self.isActive && setActive(id),
          onLeaveBack: () => id === LINKS[0].id && setActive(''),
        })
      }

      gsap.from(root.current, { y: -20, autoAlpha: 0, duration: 1, delay: 0.6, ease: 'power3.out' })
    },
    { scope: root },
  )

  useEffect(() => {
    lockScroll(open)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (e: MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    // let the sheet close (and scrolling unlock) before we travel
    requestAnimationFrame(() => scrollToTarget(id ? `#${id}` : 0))
  }

  return (
    <>
      <header ref={root} className={`nav ${open ? 'is-open' : ''}`}>
        <div className="nav-inner">
          <a href="#top" className="nav-logo" onClick={(e) => go(e, '')} aria-label="Back to top">
            <HubMark className="nav-mark" />
            <span>{profile.handle}</span>
          </a>

          <nav aria-label="Primary" className="nav-links">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => go(e, l.id)}
                className={active === l.id ? 'is-active' : ''}
                aria-current={active === l.id ? 'true' : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a className="nav-resume" href={profile.resume} target="_blank" rel="noreferrer">
            <FileText /> Résumé
          </a>

          <button
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>

        <div className="nav-progress" aria-hidden>
          <div ref={bar} className="nav-progress-bar" />
        </div>
      </header>

      {/* outside the header: its backdrop-filter would trap a fixed child */}
      <div id="nav-sheet" className="nav-sheet" hidden={!open}>
        <nav aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} style={{ ['--i' as string]: i }}>
              <span className="mono">0{i + 1}</span>
              {l.label}
            </a>
          ))}
          <a href={profile.resume} target="_blank" rel="noreferrer" style={{ ['--i' as string]: LINKS.length }}>
            <span className="mono">↗</span>
            Résumé
          </a>
        </nav>
      </div>
    </>
  )
}
