import { useRef, type MouseEvent } from 'react'
import { heroOrgs, orgs, profile, statement } from '../../content'
import { MQ, ScrollTrigger, gsap, prefersReducedMotion, scrollToTarget, useGSAP } from '../../lib/motion'
import { ArrowDown } from '../Icons'
import OrgMark from '../OrgMark'
import type { Globe } from './globe'
import './Intro.css'

/** Splits "*word*" markers into highlighted spans, one span per word. */
function Words({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  let key = 0
  return (
    <>
      {parts.flatMap((part) => {
        const hot = part.startsWith('*')
        const words = (hot ? part.slice(1, -1) : part).split(/(\s+)/)
        return words.map((w) =>
          /^\s+$/.test(w) || !w ? (
            w
          ) : (
            <span key={key++} className={`w ${hot ? 'w-hot grad' : ''}`}>
              {w}
            </span>
          ),
        )
      })}
    </>
  )
}

export default function Intro() {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useGSAP(
    () => {
      const reduced = prefersReducedMotion()
      let globe: Globe | null = null
      let disposed = false

      const onMove = (e: PointerEvent) =>
        globe?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
      if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })

      // render only while the intro is on screen
      const visible = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (reduced) return
          if (self.isActive) globe?.start()
          else globe?.stop()
        },
      })
      const travel = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => globe?.setProgress(self.progress),
      })

      // three.js is the heaviest thing on the page, so it arrives on its own
      import('./globe').then(({ createGlobe }) => {
        if (disposed) return
        globe = createGlobe(canvas.current!, { reduced })
        if (!globe) {
          root.current?.classList.add('no-webgl')
          return
        }
        globe.setProgress(travel.progress)
        if (visible.isActive && !reduced) globe.start()
      })

      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        // entrance
        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 } })
        tl.from('.intro-canvas', { autoAlpha: 0, scale: 1.08, duration: 2.6, ease: 'power2.out' }, 0)
          .from('.hero-status', { y: 16, autoAlpha: 0 }, 0.25)
          .from('.hero-title .line > span', { yPercent: 110, stagger: 0.09 }, 0.35)
          .from('.hero-tagline', { y: 24, autoAlpha: 0 }, 0.7)
          .from('.hero-ctas > *', { y: 20, autoAlpha: 0, stagger: 0.08 }, 0.8)
          .from('.hero-orgs > *', { y: 14, autoAlpha: 0, stagger: 0.07 }, 0.95)
          .from('.hero-foot', { autoAlpha: 0, duration: 1 }, 1.1)

        // hero text drifts up and away as the globe takes over
        gsap.to('.hero-inner', {
          yPercent: -18,
          autoAlpha: 0,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 15%', scrub: true },
        })
        gsap.to('.hero-foot', {
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '25% top', scrub: true },
        })

        // dim the globe behind the statement, then let it go
        gsap.to('.intro-stage', {
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: { trigger: '.statement', start: 'top bottom', end: 'top top', scrub: true },
        })
        gsap.to('.intro-stage', {
          opacity: 0,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: root.current, start: 'bottom 170%', end: 'bottom 100%', scrub: true },
        })

        // the statement lights up word by word
        gsap.fromTo(
          '.statement .w',
          { opacity: 0.13 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: {
              trigger: '.statement',
              start: 'top top',
              end: '+=160%',
              pin: true,
              scrub: 0.6,
            },
          },
        )
        gsap.from('.statement-eyebrow', {
          autoAlpha: 0,
          y: 12,
          scrollTrigger: { trigger: '.statement', start: 'top 70%', toggleActions: 'play none none reverse' },
        })
      })

      return () => {
        disposed = true
        window.removeEventListener('pointermove', onMove)
        globe?.dispose()
      }
    },
    { scope: root },
  )

  const go = (e: MouseEvent, target: string) => {
    e.preventDefault()
    scrollToTarget(target)
  }

  return (
    <div ref={root} className="intro">
      <div className="intro-stage" aria-hidden>
        <canvas ref={canvas} className="intro-canvas" />
        <div className="intro-fallback" />
        <div className="intro-vignette" />
      </div>

      <section className="hero" id="top" aria-label="Introduction">
        <div className="hero-inner container">
          <p className="hero-status">
            <span className="pulse" aria-hidden />
            <span>
              Now · {profile.role}, <strong>{profile.team}</strong>
            </span>
          </p>
          <h1 className="hero-title">
            <span className="line">
              <span>{profile.firstName}</span>
            </span>
            <span className="line">
              <span className="grad">{profile.lastName}</span>
            </span>
          </h1>
          <p className="hero-tagline">{profile.tagline}</p>
          <div className="hero-ctas">
            <a className="btn btn-primary" href="#aws" onClick={(e) => go(e, '#aws')}>
              What I do at AWS <ArrowDown />
            </a>
            <a className="btn btn-ghost" href="#contact" onClick={(e) => go(e, '#contact')}>
              Get in touch
            </a>
          </div>
          <div className="hero-orgs">
            <span className="hero-orgs-lbl">Experience</span>
            {heroOrgs.map(({ org, href }) => (
              <a key={org} className="hero-org" href={href} onClick={(e) => go(e, href)}>
                <OrgMark org={org} size={26} />
                {orgs[org].name}
              </a>
            ))}
          </div>
        </div>

        <div className="hero-foot container" aria-hidden>
          <span>$ traceroute {profile.handle}</span>
          <span className="scroll-cue">
            Scroll <i />
          </span>
        </div>
      </section>

      <section className="statement" aria-label="Statement">
        <div className="container">
          <p className="eyebrow statement-eyebrow">
            <span className="idx">//</span> Hello, world
          </p>
          <p className="statement-text">
            <Words text={statement} />
          </p>
        </div>
      </section>
    </div>
  )
}
