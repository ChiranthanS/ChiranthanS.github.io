import { gsap } from '../../lib/motion'

type Q = (selector: string) => Element[]

/** Initial state for a pinned story: only the first step and first counter showing. */
export function prepareStory(q: Q) {
  gsap.set(q('.story-step').slice(1), { autoAlpha: 0, y: 30 })
  gsap.set(q('.story-counter').slice(1), { autoAlpha: 0, y: 10 })
}

/** Cross-fade step `from` → `to` and fill its progress dot. */
export function swapStep(tl: gsap.core.Timeline, q: Q, from: number, to: number, at: number) {
  const steps = q('.story-step')
  return tl
    .to(steps[from], { autoAlpha: 0, y: -30, duration: 0.6 }, at)
    .to(steps[to], { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.35)
    .to(q('.story-dot')[to], { '--fill': 1, duration: 0.4 }, at + 0.35)
}

export function swapCounter(tl: gsap.core.Timeline, q: Q, from: number, to: number, at: number) {
  const counters = q('.story-counter')
  return tl
    .to(counters[from], { autoAlpha: 0, y: -10, duration: 0.4 }, at)
    .to(counters[to], { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.4)
}

/** Count a counter's number up from zero, keeping any prefix/suffix (e.g. "−30%"). */
export function countUp(tl: gsap.core.Timeline, el: Element, at: number, duration: number) {
  // read the target from markup, not from text a previous run may have rewritten
  const text = (el as HTMLElement).dataset.value ?? el.textContent ?? ''
  const m = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return tl
  const [, pre, num, post] = m
  const decimals = num.split('.')[1]?.length ?? 0
  const v = { n: 0 }
  return tl.to(
    v,
    {
      n: Number(num),
      duration,
      ease: 'none',
      onUpdate: () => (el.textContent = pre + v.n.toFixed(decimals) + post),
    },
    at,
  )
}
