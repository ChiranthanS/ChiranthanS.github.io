import { useEffect } from 'react'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer'
import Harman from './components/Harman/Harman'
import Intro from './components/Intro/Intro'
import Journey from './components/Journey/Journey'
import Nav from './components/Nav'
import Projects from './components/Projects/Projects'
import RoleDetail from './components/RoleDetail/RoleDetail'
import { AwsSeal, CiSeal } from './components/RoleDetail/Seals'
import Stack from './components/Stack/Stack'
import TransitGateway from './components/TransitGateway/TransitGateway'
import { awsRole, harmanRole } from './content'
import { ScrollTrigger, initSmoothScroll } from './lib/motion'

export default function App() {
  useEffect(() => {
    const stop = initSmoothScroll()
    // web fonts change line wraps, which moves every trigger below them
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return stop
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Intro />
        <TransitGateway />
        <RoleDetail role={awsRole} index="01.1" variant="aws" seal={<AwsSeal />} />
        <Harman />
        <RoleDetail role={harmanRole} index="02.1" variant="ci" seal={<CiSeal />} />
        <Journey />
        <Projects />
        <Stack />
        <About />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden />
    </>
  )
}
