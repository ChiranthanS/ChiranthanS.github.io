import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  Float32BufferAttribute,
  Group,
  LineSegments,
  MathUtils,
  PerspectiveCamera,
  Points,
  QuadraticBezierCurve3,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'

/* A planet-sized network: a dotted shell, a few dozen nodes, arcs between them
   and packets riding those arcs. One node is the "hub" — the arcs that reach it
   glow amber, a quiet nod to Transit Gateway. */

const R = 2.2
const FOV = 40

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // fade whatever sits on the far side of the globe
    vec3 center = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float facing = normalize(mv.xyz - center).z;
    float fade = smoothstep(-0.65, 0.35, facing) * 0.86 + 0.14;
    gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);
    vColor = aColor;
    vAlpha = aAlpha * fade;
  }
`

const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
  }
`

const LINE_VERT = /* glsl */ `
  attribute float aAlpha;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 center = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float facing = normalize(mv.xyz - center).z;
    vAlpha = aAlpha * (smoothstep(-0.7, 0.3, facing) * 0.9 + 0.1);
    vColor = aColor;
  }
`

const LINE_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha * uOpacity);
  }
`

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio;
    vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aPhase) + aPhase * 40.0));
    vAlpha *= clamp(aSize / 2.4, 0.25, 1.0);
  }
`

const STAR_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.86, 0.9, 1.0), a * vAlpha);
  }
`

/** Deterministic random, so the network looks the same on every visit. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function fibonacciSphere(n: number, radius: number) {
  const pts: Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    pts.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius))
  }
  return pts
}

export type Globe = {
  setProgress(p: number): void
  setPointer(x: number, y: number): void
  start(): void
  stop(): void
  dispose(): void
}

export function createGlobe(canvas: HTMLCanvasElement, opts: { reduced: boolean }): Globe | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }

  const small = window.innerWidth < 700
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 200)
  const random = rng(7)

  const globe = new Group()
  scene.add(globe)

  const cyan = new Color('#6fe3ff')
  const indigo = new Color('#5b5cf0')
  const amber = new Color('#ffb547')
  const white = new Color('#eaf6ff')

  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(d: T) => (disposables.push(d), d)

  /* ---------- dotted shell ---------- */
  const shellPts = fibonacciSphere(small ? 1100 : 1700, R)
  {
    const pos = new Float32Array(shellPts.length * 3)
    const col = new Float32Array(shellPts.length * 3)
    const size = new Float32Array(shellPts.length)
    const alpha = new Float32Array(shellPts.length)
    const c = new Color()
    shellPts.forEach((p, i) => {
      p.toArray(pos, i * 3)
      c.copy(indigo).lerp(cyan, 0.5 + p.y / (R * 2))
      c.toArray(col, i * 3)
      size[i] = 1.3 + random() * 0.8
      alpha[i] = 0.5 + random() * 0.4
    })
    const geo = track(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new BufferAttribute(col, 3))
    geo.setAttribute('aSize', new BufferAttribute(size, 1))
    geo.setAttribute('aAlpha', new BufferAttribute(alpha, 1))
    globe.add(new Points(geo, pointMaterial()))
  }

  /* ---------- nodes ---------- */
  const NODE_COUNT = 42
  const nodes: Vector3[] = []
  while (nodes.length < NODE_COUNT) {
    const p = shellPts[Math.floor(random() * shellPts.length)]
    if (nodes.every((n) => n.distanceTo(p) > 0.55)) nodes.push(p.clone())
  }
  const hub = nodes[0]

  /* ---------- arcs ---------- */
  type Arc = { curve: QuadraticBezierCurve3; toHub: boolean; speed: number; offset: number; dir: 1 | -1 }
  const arcs: Arc[] = []
  const makeArc = (a: Vector3, b: Vector3, toHub: boolean) => {
    const d = a.distanceTo(b)
    const mid = a
      .clone()
      .add(b)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(R + d * 0.42)
    arcs.push({
      curve: new QuadraticBezierCurve3(a, mid, b),
      toHub,
      speed: 0.12 + random() * 0.16,
      offset: random(),
      dir: random() > 0.5 ? 1 : -1,
    })
  }
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i]
    const d = a.distanceTo(hub)
    if (d < R * 1.45 && random() > 0.35) makeArc(a, hub, true)
    const others = nodes
      .slice(1)
      .filter((n) => n !== a && n.distanceTo(a) > 0.7 && n.distanceTo(a) < R * 1.2)
      .sort(() => random() - 0.5)
      .slice(0, 1 + Math.floor(random() * 1.6))
    for (const b of others) makeArc(a, b, false)
  }

  {
    const SEG = 48
    const pos: number[] = []
    const col: number[] = []
    const alpha: number[] = []
    for (const arc of arcs) {
      const pts = arc.curve.getPoints(SEG)
      const c = arc.toHub ? amber : cyan
      for (let i = 0; i < SEG; i++) {
        for (const k of [i, i + 1]) {
          pts[k].toArray(pos, pos.length)
          c.toArray(col, col.length)
          alpha.push((arc.toHub ? 0.55 : 0.36) * (0.35 + 0.65 * Math.sin((Math.PI * k) / SEG)))
        }
      }
    }
    const geo = track(new BufferGeometry())
    geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new Float32BufferAttribute(col, 3))
    geo.setAttribute('aAlpha', new Float32BufferAttribute(alpha, 1))
    const mat = track(
      new ShaderMaterial({
        vertexShader: LINE_VERT,
        fragmentShader: LINE_FRAG,
        uniforms: { uOpacity: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    globe.add(new LineSegments(geo, mat))
  }

  /* ---------- node markers ---------- */
  {
    const pos = new Float32Array(nodes.length * 3)
    const col = new Float32Array(nodes.length * 3)
    const size = new Float32Array(nodes.length)
    const alpha = new Float32Array(nodes.length)
    nodes.forEach((p, i) => {
      p.clone()
        .multiplyScalar(1.004)
        .toArray(pos, i * 3)
      ;(i === 0 ? amber : white).toArray(col, i * 3)
      size[i] = i === 0 ? 11 : 3.6
      alpha[i] = i === 0 ? 1 : 0.9
    })
    const geo = track(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aColor', new BufferAttribute(col, 3))
    geo.setAttribute('aSize', new BufferAttribute(size, 1))
    geo.setAttribute('aAlpha', new BufferAttribute(alpha, 1))
    globe.add(new Points(geo, pointMaterial()))
  }

  /* ---------- packets (each with a short comet tail) ---------- */
  const TAIL = 9
  const packetCount = arcs.length * TAIL
  const pPos = new Float32Array(packetCount * 3)
  const pAlpha = new Float32Array(packetCount)
  const packetGeo = track(new BufferGeometry())
  {
    const col = new Float32Array(packetCount * 3)
    const size = new Float32Array(packetCount)
    arcs.forEach((arc, a) => {
      for (let k = 0; k < TAIL; k++) {
        const i = a * TAIL + k
        ;(arc.toHub ? amber : white).toArray(col, i * 3)
        size[i] = 5.2 * (1 - (k / TAIL) * 0.7)
      }
    })
    packetGeo.setAttribute('position', new BufferAttribute(pPos, 3))
    packetGeo.setAttribute('aColor', new BufferAttribute(col, 3))
    packetGeo.setAttribute('aSize', new BufferAttribute(size, 1))
    packetGeo.setAttribute('aAlpha', new BufferAttribute(pAlpha, 1))
    globe.add(new Points(packetGeo, pointMaterial()))
  }
  const tmp = new Vector3()
  function updatePackets(time: number) {
    arcs.forEach((arc, a) => {
      const head = (time * arc.speed + arc.offset) % 1.35 // a pause between trips
      for (let k = 0; k < TAIL; k++) {
        const i = a * TAIL + k
        const t = head - k * 0.018
        if (t < 0 || t > 1) {
          pAlpha[i] = 0
          continue
        }
        arc.curve.getPoint(arc.dir === 1 ? t : 1 - t, tmp)
        tmp.toArray(pPos, i * 3)
        pAlpha[i] = Math.pow(1 - k / TAIL, 1.6) * Math.sin(Math.PI * Math.min(1, t * 1.15))
      }
    })
    packetGeo.attributes.position.needsUpdate = true
    packetGeo.attributes.aAlpha.needsUpdate = true
  }

  /* ---------- atmosphere ---------- */
  {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(128, 128, 60, 128, 128, 128)
    grd.addColorStop(0, 'rgba(70,140,255,0.0)')
    grd.addColorStop(0.42, 'rgba(70,150,255,0.22)')
    grd.addColorStop(0.5, 'rgba(90,200,255,0.12)')
    grd.addColorStop(1, 'rgba(60,90,255,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 256, 256)
    const tex = track(new CanvasTexture(c))
    const mat = track(
      new SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: AdditiveBlending }),
    )
    const glow = new Sprite(mat)
    glow.scale.setScalar(R * 4.3)
    scene.add(glow)
    globe.userData.glow = glow
  }

  /* ---------- stars ---------- */
  const starUniforms = { uPixelRatio: { value: pixelRatio }, uTime: { value: 0 } }
  const stars = new Group()
  {
    const n = small ? 700 : 1400
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const phase = new Float32Array(n)
    const v = new Vector3()
    for (let i = 0; i < n; i++) {
      v.set(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1)
        .normalize()
        .multiplyScalar(30 + random() * 40)
      v.toArray(pos, i * 3)
      size[i] = Math.pow(random(), 3) * 2.6 + 0.7
      phase[i] = random()
    }
    const geo = track(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new BufferAttribute(size, 1))
    geo.setAttribute('aPhase', new BufferAttribute(phase, 1))
    const mat = track(
      new ShaderMaterial({
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        uniforms: starUniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
    stars.add(new Points(geo, mat))
    scene.add(stars)
  }

  function pointMaterial() {
    return track(
      new ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: { uPixelRatio: { value: pixelRatio } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    )
  }

  /* ---------- framing ---------- */
  let fitZ = 8
  let halfH = 3
  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const t = Math.tan(MathUtils.degToRad(FOV / 2))
    // globe radius ≈ 70% of the shorter half-extent of the screen
    fitZ = R / 0.7 / (t * Math.min(1, camera.aspect))
    halfH = t * fitZ
    camera.updateProjectionMatrix()
    render(lastTime)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  /* ---------- state ---------- */
  let progress = 0
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  let raf = 0
  let running = false
  let lastTime = 0
  const clock = new Clock()
  let spin = 0.6

  const ease = (t: number) => 1 - Math.pow(1 - t, 3)

  function render(time: number) {
    const p = ease(progress)
    pointer.sx += (pointer.x - pointer.sx) * 0.04
    pointer.sy += (pointer.y - pointer.sy) * 0.04

    // rise from below the fold, then fly in toward the surface
    camera.position.set(0, 0, fitZ * (1 - 0.58 * p))
    camera.lookAt(0, 0, 0)
    globe.position.y = -halfH * 0.62 * (1 - Math.min(1, progress * 2.2))
    globe.rotation.x = 0.42 - 0.25 * p + pointer.sy * 0.12
    globe.rotation.y = spin + p * 1.4 + pointer.sx * 0.25
    const glow = globe.userData.glow as Sprite
    glow.position.copy(globe.position)

    stars.rotation.y = time * 0.004 + pointer.sx * 0.03
    stars.rotation.x = pointer.sy * 0.02 - p * 0.15
    starUniforms.uTime.value = time

    updatePackets(time)
    renderer.render(scene, camera)
  }

  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05)
    if (!opts.reduced) {
      lastTime += dt
      spin += dt * 0.05
    }
    render(lastTime)
    raf = requestAnimationFrame(loop)
  }

  resize()
  // reduced motion still gets a composed frame with packets mid-flight
  if (opts.reduced) lastTime = 2.4
  render(lastTime)

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p))
      if (!running) render(lastTime)
    },
    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
    },
    start() {
      if (running) return
      running = true
      clock.getDelta()
      raf = requestAnimationFrame(loop)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    dispose() {
      this.stop()
      ro.disconnect()
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
    },
  }
}
