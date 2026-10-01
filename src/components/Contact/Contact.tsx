import { useRef, useState } from 'react'
import { profile } from '../../content'
import { MQ, gsap, useGSAP } from '../../lib/motion'
import { ArrowUpRight, Check, Copy, FileText, GitHub, LeetCode, LinkedIn, Mail } from '../Icons'
import './Contact.css'

const L = 110
const R = 690
const segs = [
  { from: L, to: R, y1: 92, y2: 142, label: 'SYN', detail: 'seq = 1000' },
  { from: R, to: L, y1: 164, y2: 214, label: 'SYN, ACK', detail: 'seq = 5000 · ack = 1001' },
  { from: L, to: R, y1: 236, y2: 286, label: 'ACK', detail: 'ack = 5001' },
]
const states = {
  left: ['CLOSED', 'SYN_SENT', 'ESTABLISHED'],
  right: ['LISTEN', 'SYN_RCVD', 'ESTABLISHED'],
}

function Arrow({ from, to, y1, y2, label, detail }: (typeof segs)[number]) {
  const dir = Math.sign(to - from)
  const ang = Math.atan2(y2 - y1, to - from)
  const head = [
    [to, y2],
    [to - Math.cos(ang - 0.42) * 14, y2 - Math.sin(ang - 0.42) * 14],
    [to - Math.cos(ang + 0.42) * 14, y2 - Math.sin(ang + 0.42) * 14],
  ]
  const mx = (from + to) / 2
  const my = (y1 + y2) / 2
  const deg = (Math.atan2(y2 - y1, to - from) * 180) / Math.PI
  const textDeg = dir > 0 ? deg : deg + 180
  return (
    <g className="hs-seg">
      <line className="hs-line" x1={from} y1={y1} x2={to} y2={y2} pathLength={1} />
      <polygon className="hs-head" points={head.map((p) => p.join(',')).join(' ')} />
      <g transform={`translate(${mx} ${my}) rotate(${textDeg})`} className="hs-label">
        <text y={-12} className="hs-flag">
          {label}
        </text>
        <text y={22} className="hs-detail">
          {detail}
        </text>
      </g>
    </g>
  )
}

export default function Contact() {
  const root = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useGSAP(
    () => {
      gsap.matchMedia().add(MQ.motion, () => {
        root.current!.classList.add('is-animated')
        const q = gsap.utils.selector(root)
        const segEls = q('.hs-seg')

        gsap.set(q('.hs-line'), { strokeDashoffset: 1 })
        gsap.set(q('.hs-head, .hs-label'), { autoAlpha: 0 })
        gsap.set(q('.hs-state:not(.s0)'), { autoAlpha: 0 })
        gsap.set(q('.contact-title .line > span'), { yPercent: 110 })
        gsap.set(q('.contact-after'), { autoAlpha: 0, y: 30 })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: root.current,
            pin: '.contact-pin',
            start: 'top top',
            end: '+=170%',
            scrub: 0.8,
          },
        })

        segEls.forEach((seg, i) => {
          const at = i * 1.1
          tl.to(seg.querySelector('.hs-line'), { strokeDashoffset: 0, duration: 0.8 }, at)
            .to(seg.querySelector('.hs-label'), { autoAlpha: 1, duration: 0.4 }, at + 0.2)
            .to(seg.querySelector('.hs-head'), { autoAlpha: 1, duration: 0.15 }, at + 0.7)
        })

        // each side changes TCP state as segments leave or arrive
        const transitions: ['left' | 'right', number, number][] = [
          ['left', 0, 0.05], // CLOSED → SYN_SENT
          ['right', 0, 0.85], // LISTEN → SYN_RCVD
          ['left', 1, 1.95], // SYN_SENT → ESTABLISHED
          ['right', 1, 3.05], // SYN_RCVD → ESTABLISHED
        ]
        for (const [side, from, at] of transitions) {
          tl.to(q(`.hs-${side} .s${from}`), { autoAlpha: 0, duration: 0.15 }, at).to(
            q(`.hs-${side} .s${from + 1}`),
            { autoAlpha: 1, duration: 0.15 },
            at + 0.05,
          )
        }

        tl.to(q('.hs'), { '--est': 1, duration: 0.4 }, '>')
          .to(
            q('.contact-title .line > span'),
            { yPercent: 0, stagger: 0.12, duration: 0.8, ease: 'expo.out' },
            '>-0.1',
          )
          .to(q('.contact-after'), { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'expo.out' }, '>-0.4')
          .to({}, { duration: 0.6 })

        return () => root.current?.classList.remove('is-animated')
      })
    },
    { scope: root },
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <section ref={root} id="contact" className="contact" aria-labelledby="contact-title">
      <div className="contact-pin">
        <div className="container contact-inner">
          <p className="eyebrow">
            <span className="idx">07</span> Contact
          </p>

          <svg
            className="hs"
            viewBox="0 0 800 340"
            role="img"
            aria-label="A TCP three-way handshake between you and me: SYN, SYN-ACK, ACK. Connection established."
          >
            {[
              { x: L, name: 'you', side: 'left' as const },
              { x: R, name: profile.handle, side: 'right' as const },
            ].map((end) => (
              <g key={end.side} className={`hs-end hs-${end.side}`}>
                <rect x={end.x - 74} y={14} width={148} height={40} rx={20} className="hs-pill" />
                <text x={end.x} y={39} className="hs-name">
                  {end.name}
                </text>
                <line x1={end.x} y1={62} x2={end.x} y2={300} className="hs-life" />
                {states[end.side].map((s, i) => (
                  <text key={s} x={end.x} y={330} className={`hs-state s${i}`}>
                    {s}
                  </text>
                ))}
              </g>
            ))}
            {segs.map((s) => (
              <Arrow key={s.label} {...s} />
            ))}
          </svg>

          <h2 id="contact-title" className="contact-title">
            <span className="line">
              <span>Connection</span>
            </span>{' '}
            <span className="line">
              <span className="grad">established.</span>
            </span>
          </h2>

          <p className="contact-lead contact-after">
            Networking, distributed systems, a role you think I’d love, or a good telescope recommendation: my inbox is
            open.
          </p>

          <div className="contact-actions contact-after">
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              <Mail /> Say hello
            </a>
            <button className="btn btn-ghost" onClick={copy} aria-live="polite">
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : profile.email}
            </button>
          </div>

          <div className="contact-links contact-after">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              <LinkedIn /> LinkedIn <ArrowUpRight className="ext" />
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              <GitHub /> GitHub <ArrowUpRight className="ext" />
            </a>
            <a href={profile.links.leetcode} target="_blank" rel="noreferrer">
              <LeetCode /> LeetCode <ArrowUpRight className="ext" />
            </a>
            <a href={profile.resume} target="_blank" rel="noreferrer">
              <FileText /> Résumé <ArrowUpRight className="ext" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
