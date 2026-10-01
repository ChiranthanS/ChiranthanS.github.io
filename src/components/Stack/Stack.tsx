import { useRef } from 'react'
import { stackLayers } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import './Stack.css'

export default function Stack() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        root.current!.classList.add('is-animated')
        const q = gsap.utils.selector(root)
        const slabs = q('.slab')
        const panels = q('.stack-layer')
        const n = slabs.length
        // slab 0 is the top layer, so it sits highest
        const height = (i: number) => n - 1 - i

        gsap.set(slabs, { '--k': (i: number) => height(i) * 0.14, '--lift': 0 })
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 24 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            pin: '.stack-pin',
            start: 'top top',
            end: '+=380%',
            scrub: 0.8,
          },
        })

        // explode the stack…
        tl.to(slabs, { '--k': (i: number) => height(i), duration: 1.4, stagger: 0.04 }, 0)

        // …then walk down it one layer at a time
        slabs.forEach((slab, i) => {
          const at = 1.2 + i * 1.1
          tl.to(slab, { '--lift': 1, duration: 0.5 }, at).to(
            slabs,
            { opacity: (j: number) => (j === i ? 1 : 0.32), duration: 0.5 },
            at,
          )
          if (i > 0) {
            tl.to(slabs[i - 1], { '--lift': 0, duration: 0.5 }, at)
              .to(panels[i - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, at)
              .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.25)
          }
          tl.to(q('.stack-tick')[i], { '--on': 1, duration: 0.3 }, at)
        })

        // finish on the whole picture
        tl.to(slabs, { opacity: 1, '--lift': 0, duration: 0.6 }, '+=0.5').to({}, { duration: 0.4 })

        return () => root.current?.classList.remove('is-animated')
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="stack" className="stack" aria-labelledby="stack-title">
      <div className="stack-pin">
        <div className="container stack-grid">
          <div className="stack-scene" aria-hidden>
            <div className="stack-3d">
              {stackLayers.map((l) => (
                <div key={l.id} className="slab" style={{ ['--c' as string]: l.color }}>
                  <span className="slab-label">
                    {l.id} · {l.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="stack-copy">
            <p className="eyebrow">
              <span className="idx">05</span> Stack
            </p>
            <h2 id="stack-title" className="h2">
              Full stack, all the way <span className="grad">down.</span>
            </h2>
            <p className="stack-lead">From the interface you click to the network your packets cross.</p>

            <div className="stack-ticks" aria-hidden>
              {stackLayers.map((l) => (
                <span key={l.id} className="stack-tick" style={{ ['--c' as string]: l.color }} />
              ))}
            </div>

            <ol className="stack-layers">
              {stackLayers.map((l) => (
                <li
                  key={l.id}
                  className={`stack-layer ${l.featured ? 'is-featured' : ''}`}
                  style={{ ['--c' as string]: l.color }}
                >
                  <p className="stack-layer-id">
                    {l.id} <span>{l.name}</span>
                  </p>
                  <div className="chips">
                    {l.items.map((it) => (
                      <span key={it} className="chip">
                        {it}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
