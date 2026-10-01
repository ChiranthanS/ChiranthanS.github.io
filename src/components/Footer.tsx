import { profile } from '../content'
import { scrollToTarget } from '../lib/motion'
import { ArrowUp } from './Icons'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {YEAR} {profile.name}
        </p>
        <p className="footer-mono">Built with React, GSAP &amp; Three.js · TTL 64</p>
        <button className="footer-top" onClick={() => scrollToTarget(0)}>
          Back to top <ArrowUp />
        </button>
      </div>
    </footer>
  )
}
