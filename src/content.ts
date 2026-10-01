/* ==========================================================================
   Every piece of copy on the site lives here.
   Search for "TODO" to find the spots that still need your input.
   ========================================================================== */

export const profile = {
  name: 'Chiranthan Shadaksharaswamy',
  firstName: 'Chiranthan',
  lastName: 'Shadaksharaswamy',
  handle: 'chiranthan.s',
  role: 'Software Engineer',
  team: 'AWS Transit Gateway',
  tagline:
    'I build cloud networking at Amazon Web Services, on the hub that connects VPCs, data centers and regions into one network.',
  email: 'chiranthan.s19@gmail.com',
  // Re-upload the PDF at this path and the site picks up the new version.
  resume: 'https://github.com/ChiranthanS/ChiranthanS/blob/main/Chiranthan_Shadaksharaswamy_resume.pdf',
  links: {
    linkedin: 'https://www.linkedin.com/in/chiranthan-shadaksharaswamy/',
    github: 'https://github.com/ChiranthanS',
    leetcode: 'https://leetcode.com/chiranthans/',
  },
  // TODO: add your city (e.g. 'Seattle, WA'). Leave empty to hide it.
  location: '',
  // TODO: drop a photo in /public (e.g. /me.jpg) and set it here. Empty shows initials.
  photo: '',
}

/* ---------- Organisations --------------------------------------------------
   Shown as monogram badges in our own type and colours. To use an official
   logo instead, drop an SVG into public/logos/ and set e.g. `logo: 'logos/aws.svg'`
   (only if you're comfortable with that company's trademark rules). */
export type OrgKey = 'aws' | 'harman' | 'iu' | 'jss'

export const orgs: Record<OrgKey, { name: string; mono: string; color: string; logo?: string }> = {
  aws: { name: 'Amazon Web Services', mono: 'AWS', color: '#ffb547' },
  harman: { name: 'Harman (Samsung)', mono: 'H', color: '#3ddc97' },
  iu: { name: 'Indiana University', mono: 'IU', color: '#f87171' },
  jss: { name: 'JSS S&T University', mono: 'JSS', color: '#a1a1a8' },
}

// the at-a-glance strip under the hero
export const heroOrgs: { org: OrgKey; href: string }[] = [
  { org: 'aws', href: '#aws' },
  { org: 'harman', href: '#harman' },
  { org: 'iu', href: '#journey' },
]

/* ---------- Statement (word-by-word scroll reveal) --------------------------
   Words wrapped in *asterisks* get the gradient highlight. */
export const statement =
  'The best networks are *invisible.* You only notice them when they fail. I work on the *hub* that ties AWS customers’ networks together, and on keeping it invisible.'

/* ---------- AWS: the Transit Gateway story (pinned diagram) --------------- */
export const tgwSteps = [
  {
    eyebrow: 'The problem',
    title: 'Connecting networks used to look like this.',
    body: 'Every VPC, data center and VPN peered to every other. Each new network multiplied the links to build, secure and keep in sync.',
  },
  {
    eyebrow: 'The hub',
    title: 'Transit Gateway turns it into this.',
    body: 'One regional hub. Every VPC, VPN and Direct Connect attaches once, and the hub takes care of the rest.',
  },
  {
    eyebrow: 'The routing',
    title: 'Routing, at cloud scale.',
    body: 'Route tables, propagation and segmentation decide where every packet goes, across accounts and across regions.',
  },
  {
    eyebrow: 'The team',
    title: 'This is where I work.',
    body: 'I’m a Software Engineer on the core team behind Transit Gateway and Cloud WAN, with end-to-end ownership from scaling and health to canaries, region builds and on-call.',
  },
]

export const tgwNodes = [
  { id: 'prod', label: 'VPC · prod', kind: 'vpc' },
  { id: 'dev', label: 'VPC · dev', kind: 'vpc' },
  { id: 'data', label: 'VPC · data', kind: 'vpc' },
  { id: 'shared', label: 'VPC · shared', kind: 'vpc' },
  { id: 'peer', label: 'Peer region', kind: 'peer' },
  { id: 'dx', label: 'Direct Connect', kind: 'dx' },
  { id: 'onprem', label: 'On-prem DC', kind: 'dc' },
  { id: 'vpn', label: 'Site-to-Site VPN', kind: 'vpn' },
] as const

export const routeTable = [
  { cidr: '10.0.0.0/16', target: 'vpc-prod', type: 'propagated' },
  { cidr: '10.1.0.0/16', target: 'vpc-dev', type: 'propagated' },
  { cidr: '10.2.0.0/16', target: 'vpc-data', type: 'propagated' },
  { cidr: '172.16.0.0/12', target: 'dxgw-onprem', type: 'propagated' },
  { cidr: '10.64.0.0/16', target: 'tgw-peer-usw2', type: 'static' },
  { cidr: '0.0.0.0/0', target: 'vpc-shared', type: 'static' },
]

/* ---------- Role detail (bento cards under each story) -------------------- */
export type HighlightVisual =
  | { kind: 'bars'; bars: { label: string; value: number; text: string }[] }
  | { kind: 'chips'; items: string[] }
  | { kind: 'pipeline'; items: string[] }
  | { kind: 'fleet'; label: string }
  | { kind: 'spark' }
  | {
      kind: 'migration'
      from: string
      to: string
      note: string
      /** the edge case: one signal, two very different meanings */
      edge: { when: string; ok: [string, string]; guard: [string, string] }
    }

export type Highlight = {
  title: string
  body: string
  stat?: string
  statLabel?: string
  /** bento width: lg = 2/3, md = 1/2, sm = 1/3 of a row */
  size?: 'lg' | 'md' | 'sm'
  visual?: HighlightVisual
}

export type Role = {
  company: string
  mark?: OrgKey
  title: string
  team: string
  start: string
  end: string
  duration?: string
  place?: string
  summary: string
  highlights: Highlight[]
  /** shown as highlighted chips above the day-to-day list */
  languages?: string[]
  stack: string[]
}

export const awsRole: Role = {
  company: 'Amazon Web Services',
  mark: 'aws',
  title: 'Software Engineer',
  team: 'Transit Gateway',
  start: 'Dec 2024',
  end: 'Present',
  place: profile.location,
  summary:
    'End-to-end ownership on the core team behind AWS Transit Gateway and Cloud WAN: the services that keep the fleet scaled and healthy, the canaries that test it, the regions it runs in, and the pager when something breaks.',
  highlights: [
    {
      size: 'lg',
      stat: '2 wks → 3 days',
      statLabel: 'to build a region',
      title: 'New regions, built in days',
      body: 'Built new Transit Gateway regions and automated zonal builds, cutting build time from two weeks to three days. Also retired regions and AZs safely.',
      visual: {
        kind: 'bars',
        bars: [
          { label: 'Before', value: 14, text: '14 days' },
          { label: 'Now', value: 3, text: '3 days' },
        ],
      },
    },
    {
      size: 'sm',
      title: 'On call',
      body: 'On the pager for Transit Gateway: resolving operational issues and improving tooling for the engineers who run it.',
      visual: { kind: 'pipeline', items: ['Alarm', 'Ack', 'Mitigate', 'Resolve'] },
    },
    {
      size: 'sm',
      title: 'Isolated regions',
      body: 'Debugging Transit Gateway in isolated regions, where partner engineers share only what’s strictly needed.',
      visual: { kind: 'pipeline', items: ['Ask', 'Narrow down', 'Fix'] },
    },
    {
      size: 'lg',
      title: 'Hardening a live migration',
      body: 'Hardened the migrator that moves customers to a new Amazon-built data plane with zero packet loss. Added a circuit breaker against false cold-scaling and fixed an autoscaler bug, a one-time $200K saving.',
      visual: {
        kind: 'migration',
        from: 'Legacy data plane',
        to: 'New data plane',
        note: 'live · no packet loss',
        edge: {
          when: 'traffic = 0',
          ok: ['metrics confirm idle', 'cold scale ✓'],
          guard: ['metrics missing', 'circuit breaker holds'],
        },
      },
    },
    {
      size: 'md',
      stat: '4+',
      statLabel: 'canaries built',
      title: 'Canaries that never sleep',
      body: 'A canary is an always-on test that uses the service like a customer would, so we catch breakage before customers do. Mine wire VPCs through every attachment type.',
      visual: {
        kind: 'chips',
        items: [
          'VPC attachments',
          'VPN attachments',
          'Direct Connect',
          'Appliance mode',
          'Long-running stacks',
          'Always-changing stacks',
        ],
      },
    },
    {
      size: 'md',
      title: 'Autoscaler & health decider',
      body: 'I work on the services that scale Transit Gateway’s fleet and make sure every part of it stays healthy.',
      visual: { kind: 'fleet', label: 'fleet · healthy · auto-scaling' },
    },
  ],
  languages: ['Scala', 'Python', 'C', 'TypeScript', 'Java'],
  stack: [
    'Transit Gateway',
    'Cloud WAN',
    'Autoscaling',
    'Health checks',
    'Canaries',
    'Live migrations',
    'Circuit breakers',
    'On-call',
    'Region builds',
    'Zonal automation',
    'VPC',
    'VPN',
    'Direct Connect',
    'Appliance mode',
  ],
}

/* ---------- Harman: the DevOps loop story (pinned diagram) ----------------- */
export const harmanSteps = [
  {
    eyebrow: 'The problem',
    title: 'Shipping software used to be a relay race.',
    body: 'Hand-run builds, tests on whichever machine was free, releases waiting on a hand-off. Every manual step was a chance for something to break.',
  },
  {
    eyebrow: 'The pipeline',
    title: 'Jenkins turns it into a loop.',
    body: 'Every commit takes the same path: build, test, quality gate, publish to Artifactory, deploy to Kubernetes. No hand-offs, no surprises.',
  },
  {
    eyebrow: 'The guardrails',
    title: 'Quality gates in. Dashboards out.',
    body: 'SonarQube stopped bad code before it shipped. Prometheus and Grafana watched everything after it did, and so did I.',
  },
  {
    eyebrow: 'The team',
    title: 'Where I learned to ship.',
    body: '1 year 9 months on Harman’s Build & Automation Engineering team, the DevOps crew behind next-gen infotainment software for Audi and Porsche.',
  },
]

export const devopsStages = [
  { name: 'Plan', tool: 'Agile' },
  { name: 'Code', tool: 'Git · Java' },
  { name: 'Build', tool: 'Maven · Gradle' },
  { name: 'Test', tool: 'SonarQube' },
  { name: 'Release', tool: 'JFrog' },
  { name: 'Deploy', tool: 'Docker · K8s' },
  { name: 'Operate', tool: 'Terraform · AWS' },
  { name: 'Monitor', tool: 'Prometheus · Grafana' },
]

export const harmanCounters = [
  { value: '8', label: 'manual hand-offs', tone: 'warn' as const },
  { value: '1', label: 'pipeline for every commit' },
]

// an illustrative Jenkins run for the "guardrails" step
export const pipelineLog = [
  { stage: 'checkout', detail: 'git · 3s' },
  { stage: 'build', detail: 'mvn package · 2m 14s' },
  { stage: 'unit tests', detail: '412 passed' },
  { stage: 'quality gate', detail: 'SonarQube · passed' },
  { stage: 'publish', detail: 'jfrog · infotainment:4.2.1' },
  { stage: 'deploy', detail: 'k8s · rollout complete' },
]

export const harmanRole: Role = {
  company: 'Harman International (Samsung)',
  mark: 'harman',
  title: 'Software Engineer',
  team: 'Build & Automation',
  start: 'Sep 2020',
  end: 'Jul 2022',
  duration: '1 yr 9 mos',
  place: 'Bangalore, India',
  summary:
    'DevOps on Harman’s Build & Automation Engineering team, behind next-gen infotainment software for Audi and Porsche. I set up Jenkins pipelines and jobs of every shape, kept the builds green and kept an eye on the dashboards.',
  highlights: [
    {
      size: 'lg',
      stat: '10M+',
      statLabel: 'users receiving updates',
      title: 'CI/CD with Jenkins & JFrog',
      body: 'Led pipeline improvements with Jenkins and JFrog Artifactory for build images, making deploys about 30% faster.',
      visual: { kind: 'pipeline', items: ['Checkout', 'Build', 'Test', 'Quality gate', 'Publish', 'Deploy'] },
    },
    {
      size: 'sm',
      title: 'Pipelines of every shape',
      body: 'Set up and configured Jenkins pipelines and jobs of every type, and kept watch over the build dashboards.',
      visual: { kind: 'fleet', label: 'build history · kept green' },
    },
    {
      size: 'md',
      title: 'Quality gates',
      body: 'Automated code-quality checks and testing with SonarQube, Python and Bash, so defects were caught before they reached production.',
      visual: { kind: 'chips', items: ['✓ Bugs', '✓ Vulnerabilities', '✓ Code smells', '✓ Coverage'] },
    },
    {
      size: 'md',
      title: 'Monitoring',
      body: 'Prometheus and Grafana dashboards that surfaced problems early, before they turned into downtime.',
      visual: { kind: 'spark' },
    },
    {
      size: 'md',
      title: 'Infotainment microservices',
      body: 'Built and tuned microservices for Audi and Porsche’s next-gen infotainment systems, running on Docker and Kubernetes.',
    },
    {
      size: 'md',
      title: 'Infrastructure as code',
      body: 'Managed AWS infrastructure with Terraform and Kubernetes, so environments were repeatable instead of hand-built.',
    },
  ],
  stack: [
    'Jenkins',
    'JFrog Artifactory',
    'Maven',
    'Docker',
    'Kubernetes',
    'Terraform',
    'SonarQube',
    'Prometheus',
    'Grafana',
    'Bash',
    'Python',
    'AWS',
  ],
}

/* ---------- Journey: rendered as traceroute hops ------------------------- */
export type Hop = {
  org: string
  mark?: OrgKey
  role: string
  start: string
  end: string
  place: string
  kind: 'edu' | 'work'
  points?: string[]
  stats?: { value: string; label: string }[]
  tags?: string[]
  destination?: boolean
  /** section with the full story, e.g. '#aws' */
  deepLink?: string
}

export const journey: Hop[] = [
  {
    org: 'JSS Science & Technology University',
    mark: 'jss',
    role: 'B.E. Computer Science',
    start: '2016',
    end: '2020',
    place: 'Mysore, India',
    kind: 'edu',
    points: ['Data structures, algorithms, operating systems and system design. CGPA 8.9/10.'],
  },
  {
    org: 'Harman International (Samsung)',
    mark: 'harman',
    role: 'Software Engineer · Build & Automation',
    start: 'Sep 2020',
    end: 'Jul 2022',
    place: 'Bangalore, India',
    kind: 'work',
    points: ['DevOps: Jenkins pipelines, quality gates and monitoring for Audi and Porsche infotainment software.'],
    tags: ['Jenkins', 'JFrog', 'Kubernetes', 'Docker', 'Terraform', 'SonarQube', 'Prometheus'],
    deepLink: '#harman',
  },
  {
    org: 'Indiana University Bloomington',
    mark: 'iu',
    role: 'M.S. Computer Science',
    start: 'Aug 2022',
    end: 'May 2024',
    place: 'Bloomington, IN',
    kind: 'edu',
    points: ['Computer networks, cloud technologies, enterprise software platforms and machine learning. CGPA 3.7/4.'],
  },
  {
    org: 'IU School of Education',
    mark: 'iu',
    role: 'Research Assistant',
    start: 'Sep 2023',
    end: 'Aug 2024',
    place: 'Bloomington, IN',
    kind: 'work',
    points: [
      'Built and launched an AR learning app (Unity, ARKit, ARCore) used in three schools.',
      'Integrated Whisper + pyannote speech-to-text with speaker diarization and sensitive-data masking.',
      'Built predictive models with NumPy and scikit-learn.',
    ],
    tags: ['Unity', 'C#', 'Python', 'Whisper', 'scikit-learn'],
  },
  {
    org: 'Amazon Web Services',
    mark: 'aws',
    role: 'Software Engineer, Transit Gateway',
    start: 'Dec 2024',
    end: 'Present',
    place: profile.location,
    kind: 'work',
    points: [
      'Core team behind Transit Gateway and Cloud WAN: autoscaling, health, canaries, live migrations, region builds and on-call.',
    ],
    tags: ['Scala', 'Python', 'C', 'TypeScript', 'Java'],
    destination: true,
    deepLink: '#aws',
  },
]

/* ---------- Projects -------------------------------------------------------
   `visual` picks the animated illustration. Set `image: '/projects/x.png'`
   to use a screenshot instead. */
export type Project = {
  name: string
  kicker: string
  description: string
  tags: string[]
  github?: string
  demo?: string
  visual: 'monitor' | 'protocols' | 'logistics' | 'travel' | 'charts'
  image?: string
}

export const projects: Project[] = [
  {
    name: 'CloudSight',
    kicker: 'Kubernetes monitoring',
    description:
      'A Python monitoring service containerized into ECR and deployed on Amazon EKS with boto3. It autoscales with HPA behind a load balancer and is observed with Prometheus and Nagios.',
    tags: ['Python', 'Docker', 'EKS', 'ECR', 'HPA', 'Prometheus', 'Nagios'],
    github: 'https://github.com/ChiranthanS/CloudMonitoring',
    visual: 'monitor',
  },
  {
    name: 'Netster',
    kicker: 'Protocols from scratch',
    description:
      'Hands-on implementations of the protocols the internet runs on (DNS, HTTP and SMTP), plus Netster, a custom client/server networking app over raw sockets.',
    tags: ['Python', 'C', 'Sockets', 'TCP/UDP', 'DNS', 'HTTP', 'SMTP'],
    github: 'https://github.com/ChiranthanS/Networks',
    visual: 'protocols',
  },
  {
    name: 'LogisticsX',
    kicker: 'Global shipping platform',
    description:
      'Carrier price comparison and live shipment tracking across FedEx and UPS APIs, with two-factor auth, deployed on GCP for high availability.',
    tags: ['React', 'Flask', 'MySQL', 'REST', 'GCP', '2FA'],
    github: 'https://github.com/ChiranthanS/knock',
    visual: 'logistics',
  },
  {
    name: 'Sproute',
    kicker: 'AI travel planner',
    description:
      'An AI-powered, sustainability-minded travel agent that builds personalized itineraries around your preferences and budget. Built at a hackathon.',
    tags: ['React', 'LLM APIs', 'SQL', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/ChiranthanS/sproute',
    demo: 'https://devpost.com/software/sproute-1tmyjq',
    visual: 'travel',
  },
  {
    name: 'DataInsights',
    kicker: 'Data storytelling',
    description:
      'Interactive Power BI reports on global data-science salaries and Indiana crime data, with NLP and Gephi network analysis.',
    tags: ['Power BI', 'NLP', 'Gephi'],
    github: 'https://github.com/ChiranthanS/Visualisation',
    demo: 'https://app.powerbi.com/view?r=eyJrIjoiYTUwMDQ0ZDItMzEwNC00NWVjLWJmY2EtMTdiZDlhNzZmZjk0IiwidCI6IjExMTNiZTM0LWFlZDEtNGQwMC1hYjRiLWNkZDAyNTEwYmU5MSIsImMiOjN9',
    visual: 'charts',
  },
]

/* ---------- Stack: exploded layer view (top → bottom) -------------------- */
export const stackLayers: { id: string; name: string; color: string; featured?: boolean; items: string[] }[] = [
  {
    id: 'L5',
    name: 'Interfaces',
    color: '#c084fc',
    items: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'HTML / CSS'],
  },
  {
    id: 'L4',
    name: 'Services',
    color: '#818cf8',
    items: ['Scala', 'Java', 'Python', 'C / C++', 'Spring Boot', 'Django', 'Flask', '.NET Core'],
  },
  {
    id: 'L3',
    name: 'Data',
    color: '#38bdf8',
    items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Power BI'],
  },
  {
    id: 'L2',
    name: 'Delivery',
    color: '#2dd4bf',
    items: [
      'Docker',
      'Kubernetes',
      'Jenkins',
      'Terraform',
      'Ansible',
      'SonarQube',
      'JFrog',
      'Prometheus',
      'Grafana',
      'Linux',
      'Bash',
    ],
  },
  {
    id: 'L1',
    name: 'AWS & Networking',
    color: '#fbbf24',
    // the day job: chips in this layer get the layer's colour
    featured: true,
    items: [
      'Transit Gateway',
      'VPC',
      'VPN',
      'EC2',
      'Lambda',
      'S3',
      'DynamoDB',
      'CloudWatch',
      'CloudFormation',
      'SNS',
      'Deployment pipelines',
      'EKS / ECS',
      'TCP/IP',
      'DNS',
      'GCP',
    ],
  },
]

/* ---------- About --------------------------------------------------------- */
export const about = {
  title: 'Networks of a different *kind.*',
  paragraphs: [
    'I’m Chiranthan, a software engineer who likes the layers most people never see. I started out automating CI/CD pipelines and running Kubernetes for automotive infotainment, moved to the U.S. for a master’s at Indiana University, and now work on cloud networking at AWS.',
    'Off the clock I’m an amateur astronomer and aspiring astrophotographer. It turns out that’s mostly waiting on packets of light that left their source centuries ago.',
  ],
  facts: [
    { label: 'Education', value: 'M.S. CS, Indiana University' },
    { label: 'Before that', value: 'B.E. CS, JSS S&T University' },
    { label: 'Ask me about', value: 'Networking, CI/CD, Kubernetes' },
    { label: 'Off the clock', value: 'Stargazing & astrophotography' },
  ],
}
