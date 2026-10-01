import { useRef } from 'react'
import { profile, projects } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import { ArrowUpRight, GitHub } from '../Icons'
import ProjectVisual from './ProjectVisual'
import './Projects.css'

export default function Projects() {
  const root = useRef<HTMLElement>(null)
  const count = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        gsap.from('.proj-reveal', {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%' },
        })
      })

      // desktop: the gallery scrolls sideways while the section is pinned
      mm.add(MQ.desktop, () => {
        root.current!.classList.add('is-horizontal')
        const track = q('.proj-track')[0] as HTMLElement
        const cards = q('.proj')
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            pin: '.proj-pin',
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const i = Math.min(projects.length, Math.round(self.progress * (cards.length - 1)) + 1)
              if (count.current) count.current.textContent = String(Math.min(i, projects.length)).padStart(2, '0')
            },
          },
        })

        // each card's artwork drifts against the direction of travel
        cards.forEach((card) => {
          const art = card.querySelector('.proj-art')
          if (!art) return
          gsap.fromTo(
            art,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: slide,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
        })

        return () => root.current?.classList.remove('is-horizontal')
      })

      mm.add(MQ.mobile, () => {
        q('.proj').forEach((card) => {
          gsap.from(card, {
            y: 70,
            autoAlpha: 0,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 88%' },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="projects" className="projects" aria-labelledby="projects-title">
      <div className="proj-pin">
        <div className="container proj-head">
          <div>
            <p className="eyebrow proj-reveal">
              <span className="idx">04</span> Projects
            </p>
            <h2 id="projects-title" className="h2 proj-reveal">
              Things I’ve <span className="grad">built.</span>
            </h2>
          </div>
          <div className="proj-head-side proj-reveal">
            <p>Side projects across cloud infrastructure, networking and data.</p>
            <p className="proj-count" aria-hidden>
              <span ref={count}>01</span> / {String(projects.length).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="proj-viewport">
          <ul className="proj-track">
            {projects.map((p, i) => (
              <li key={p.name} className="proj">
                <div className="proj-visual">
                  <div className="proj-art">
                    <ProjectVisual project={p} />
                  </div>
                  <span className="proj-num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="proj-body">
                  <p className="proj-kicker">{p.kicker}</p>
                  <h3 className="proj-name">{p.name}</h3>
                  <p className="proj-desc">{p.description}</p>
                  <div className="chips">
                    {p.tags.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="proj-links">
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noreferrer">
                        <GitHub /> Code
                      </a>
                    )}
                    {p.demo && (
                      <a href={p.demo} target="_blank" rel="noreferrer">
                        <ArrowUpRight /> Live
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
            <li className="proj proj-more">
              <a href={profile.links.github} target="_blank" rel="noreferrer">
                <GitHub width={40} height={40} />
                <span>More on GitHub</span>
                <span className="proj-more-cta">
                  github.com/ChiranthanS <ArrowUpRight />
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
