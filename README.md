# Portfolio v3: "Trace the route"

A scroll-driven portfolio themed as a packet's journey across a network. It ends at my current role on the AWS Transit Gateway team.

**Stack:** Vite · React 19 · TypeScript · GSAP ScrollTrigger · Lenis (smooth scroll) · Three.js

## Sections

| Section | What happens on scroll |
| --- | --- |
| Hero | A 3D network globe (Three.js) rises, then the camera flies into it |
| Statement | Words light up one by one (pinned) |
| **AWS · Transit Gateway** | A 28-link full mesh collapses into one hub. Packets route through it, a route table fills in, then "my team" (pinned) |
| AWS · the role | Bento grid of achievements, with count-up stats and mini visuals |
| **Harman · DevOps loop** | Eight broken hand-offs become one Jenkins pipeline. Builds lap the loop, a console run streams in, then "my team" (pinned) |
| Harman · the role | Bento grid of resume metrics |
| Journey | Career as `traceroute` hops. A packet travels down the line and lights each hop, with links back to the full stories |
| Projects | Horizontal gallery (pinned on desktop) with code-drawn illustrations |
| Stack | Exploded 3D layer view, walked through one layer at a time (pinned) |
| About | Orion is drawn as a network as you scroll past |
| Contact | TCP three-way handshake (SYN → SYN-ACK → ACK), then "Connection established." |

Every animation is built inside `gsap.matchMedia()`. With **reduced motion** turned on, the site shows a static, fully readable layout.

## Run it

```bash
nvm use --lts        # Node 20+
npm install
npm run dev          # http://localhost:5173
```

## Edit the content

All copy lives in **`src/content.ts`**. Search it for `TODO`:

- `profile.location` and `profile.photo` (drop an image into `public/`)

Roles (`awsRole`, `harmanRole`) are lists of `highlights`. Each takes an optional `stat`, a `size` (`lg`/`md`/`sm` sets its width in the bento grid) and an optional `visual` (`bars`, `chips`, `pipeline`, `fleet`).

Companies show as monogram badges (`orgs` in `content.ts`). To use an official logo, drop an SVG into `public/logos/` and set `logo: 'logos/aws.svg'`. Check the company's trademark rules first.

To show a screenshot instead of an illustration, give a project an `image: '/projects/foo.png'`.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds the site and publishes it on every push to `main`. `vite.config.ts` uses a relative `base`, so the same build works at `username.github.io` and at `username.github.io/repo/`.

One-time setup: in the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.

## Project layout

```
src/
  content.ts                 all copy and data
  lib/motion.ts              GSAP + ScrollTrigger + Lenis wiring
  components/
    Intro/                   hero, statement, globe.ts (Three.js, lazy-loaded)
    Story/                   shared pieces of the pinned stories (steps, counters, badge ring)
    TransitGateway/          the mesh → hub story (AWS)
    Harman/                  the DevOps loop story
    RoleDetail/              bento role sections + seals
    Journey/ Projects/ Stack/ About/ Contact/
```

`npm run lint` · `npm run format` · `npm run build`
