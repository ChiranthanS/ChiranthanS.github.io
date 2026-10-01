import { useRef } from 'react'
import { about, profile } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import Highlight from '../Highlight'
import './About.css'

// Orion, roughly as it sits in the sky (x, y in a 400×500 box)
const ORION = {
  stars: [
    { id: 'Meissa', x: 196, y: 52, m: 3 },
    { id: 'Betelgeuse', x: 118, y: 120, m: 7, c: '#ffb38a' },
    { id: 'Bellatrix', x: 262, y: 134, m: 4.5 },
    { id: 'Alnitak', x: 168, y: 262, m: 4.2 },
    { id: 'Alnilam', x: 199, y: 250, m: 4.6 },
    { id: 'Mintaka', x: 230, y: 236, m: 4 },
    { id: 'Saiph', x: 150, y: 408, m: 4 },
    { id: 'Rigel', x: 290, y: 396, m: 6.5, c: '#bcd8ff' },
  ],
  links: [
    ['Meissa', 'Betelgeuse'],
    ['Meissa', 'Bellatrix'],
    ['Betelgeuse', 'Alnitak'],
    ['Bellatrix', 'Mintaka'],
    ['Alnitak', 'Alnilam'],
    ['Alnilam', 'Mintaka'],
    ['Alnitak', 'Saiph'],
    ['Mintaka', 'Rigel'],
  ],
}

/** A fixed, seeded scatter of background stars. */
const FIELD = (() => {
  let seed = 11
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  return Array.from({ length: 140 }, () => ({ x: r() * 100, y: r() * 100, s: r() * r() * 2 + 0.4, d: r() * 4 }))
})()

export default function About() {
  const root = useRef<HTMLElement>(null)
  const byId = Object.fromEntries(ORION.stars.map((s) => [s.id, s]))
  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        const q = gsap.utils.selector(root)

        gsap.from('.about-reveal', {
          y: 44,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.about-copy', start: 'top 78%' },
        })

        // the constellation joins up as you scroll past it
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.about-sky', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
        })
        tl.from(q('.orion-star'), { scale: 0, transformOrigin: '50% 50%', stagger: 0.08, duration: 0.4 }, 0)
          .from(q('.orion-link'), { strokeDashoffset: 1, stagger: 0.12, duration: 0.5, ease: 'none' }, 0.4)
          .from(q('.orion-name'), { autoAlpha: 0, duration: 0.4 }, '>-0.2')

        gsap.to('.about-field', {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className="about section" aria-labelledby="about-title">
      <div className="about-field" aria-hidden>
        {FIELD.map((st, i) => (
          <i
            key={i}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.s,
              height: st.s,
              animationDelay: `${st.d}s`,
            }}
          />
        ))}
      </div>

      <div className="container about-grid">
        <div className="about-copy">
          <div className="about-id about-reveal">
            <div className="about-avatar">
              {profile.photo ? <img src={profile.photo} alt={profile.name} /> : <span>{initials}</span>}
            </div>
            <p className="eyebrow">
              <span className="idx">06</span> About
            </p>
          </div>
          <h2 id="about-title" className="h2 about-reveal">
            <Highlight text={about.title} />
          </h2>
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="about-p about-reveal">
              {p}
            </p>
          ))}
          <dl className="about-facts about-reveal">
            {about.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="about-sky">
          <svg viewBox="0 0 400 500" role="img" aria-label="The constellation Orion drawn as a network of eight stars">
            {ORION.links.map(([a, b]) => (
              <line
                key={a + b}
                className="orion-link"
                x1={byId[a].x}
                y1={byId[a].y}
                x2={byId[b].x}
                y2={byId[b].y}
                pathLength={1}
              />
            ))}
            {ORION.stars.map((s) => (
              <g key={s.id} className="orion-star">
                <circle cx={s.x} cy={s.y} r={s.m * 2.6} className="orion-halo" fill={s.c ?? '#dfe9ff'} />
                <circle cx={s.x} cy={s.y} r={s.m * 0.75} fill={s.c ?? '#f4f8ff'} />
              </g>
            ))}
            {ORION.stars
              .filter((s) => s.id === 'Betelgeuse' || s.id === 'Rigel')
              .map((s) => (
                <text
                  key={s.id}
                  x={s.x + (s.id === 'Rigel' ? 16 : -16)}
                  y={s.y + 4}
                  className="orion-name"
                  textAnchor={s.id === 'Rigel' ? 'start' : 'end'}
                >
                  {s.id}
                </text>
              ))}
          </svg>
          <figcaption>
            <span>ORION</span> 8 nodes · 8 links · 250–2,000 ly away
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
