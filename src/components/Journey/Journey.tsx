import { useRef } from 'react'
import { journey } from '../../content'
import { MQ, ScrollTrigger, gsap, scrollToTarget, useGSAP } from '../../lib/motion'
import { ArrowUp } from '../Icons'
import OrgMark from '../OrgMark'
import './Journey.css'

export default function Journey() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)

      // the line runs from the first hop's node to the last one's
      const line = q('.hops-line')[0] as HTMLElement
      const measure = () => {
        const nodes = q('.hop-node')
        const top = nodes[0].getBoundingClientRect().top
        const bottom = nodes[nodes.length - 1].getBoundingClientRect().top
        line.style.height = `${bottom - top}px`
      }
      measure()
      ScrollTrigger.addEventListener('refreshInit', measure)

      // nodes light up as the packet passes, in both directions
      q('.hop').forEach((hop) => {
        ScrollTrigger.create({
          trigger: hop,
          start: 'top 62%',
          toggleClass: { targets: hop, className: 'is-on' },
        })
      })

      gsap.matchMedia().add(MQ.motion, () => {
        gsap.from('.journey-reveal', {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.journey-head', start: 'top 80%' },
        })

        gsap.fromTo(
          '.hops-fill',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.hops-line', start: 'top 62%', end: 'bottom 62%', scrub: true },
          },
        )
        gsap.fromTo(
          '.hops-packet',
          { top: '0%' },
          {
            top: '100%',
            ease: 'none',
            scrollTrigger: { trigger: '.hops-line', start: 'top 62%', end: 'bottom 62%', scrub: true },
          },
        )

        q('.hop').forEach((hop) => {
          gsap.from(hop.querySelectorAll('.hop-anim'), {
            y: 36,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.07,
            ease: 'expo.out',
            scrollTrigger: { trigger: hop, start: 'top 78%' },
          })
        })

        gsap.from('.journey-done', {
          autoAlpha: 0,
          y: 16,
          scrollTrigger: { trigger: '.journey-done', start: 'top 90%' },
        })
      })

      return () => ScrollTrigger.removeEventListener('refreshInit', measure)
    },
    { scope: root },
  )

  return (
    <section ref={root} id="journey" className="journey section" aria-labelledby="journey-title">
      <div className="container">
        <header className="journey-head">
          <p className="eyebrow journey-reveal">
            <span className="idx">03</span> Journey
          </p>
          <h2 id="journey-title" className="h2 journey-reveal">
            The route <span className="grad">here.</span>
          </h2>
          <pre className="journey-cmd journey-reveal" aria-hidden>
            <span className="prompt">$</span> traceroute --from=2016 chiranthan.s{'\n'}
            <span className="dim">traceroute to aws.transit-gateway, {journey.length} hops max</span>
          </pre>
        </header>

        <div className="hops">
          <div className="hops-line" aria-hidden>
            <div className="hops-fill" />
            <div className="hops-packet" />
          </div>
          <ol>
            {journey.map((h, i) => (
              <li key={h.org + h.role} className={`hop ${h.destination ? 'is-dest' : ''}`}>
                <div className="hop-when hop-anim">
                  <span>
                    {h.start} – {h.end}
                  </span>
                  {h.place && <span className="dim">{h.place}</span>}
                </div>
                <div className="hop-node" aria-hidden>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="hop-body">
                  <p className="hop-kind hop-anim">
                    {h.destination ? '★ destination' : h.kind === 'edu' ? 'education' : 'experience'}
                  </p>
                  <h3 className="hop-org hop-anim">
                    {h.mark && <OrgMark org={h.mark} />}
                    <span>{h.org}</span>
                  </h3>
                  <p className="hop-role hop-anim">{h.role}</p>
                  <p className="hop-when-inline hop-anim">
                    {h.start} – {h.end}
                    {h.place && ` · ${h.place}`}
                  </p>
                  {h.stats && (
                    <dl className="hop-stats hop-anim">
                      {h.stats.map((s) => (
                        <div key={s.label}>
                          <dt>{s.label}</dt>
                          <dd className={h.destination ? 'grad-amber' : 'grad'}>{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {h.points && (
                    <ul className="hop-points hop-anim">
                      {h.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                  {h.deepLink && (
                    <a
                      className="hop-deep hop-anim"
                      href={h.deepLink}
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToTarget(h.deepLink!)
                      }}
                    >
                      The full story <ArrowUp />
                    </a>
                  )}
                  {h.tags && (
                    <div className="chips hop-anim">
                      {h.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="journey-done">
          <span className="ok">✓</span> destination reached · 0% packet loss · still routing
        </p>
      </div>
    </section>
  )
}
