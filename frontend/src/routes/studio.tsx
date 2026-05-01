import {
  AppleIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  CommandLineIcon,
  ComputerIcon,
  Download01Icon,
  GithubIcon,
  GlobalIcon,
  PackageIcon,
  Shield01Icon,
  WindowsNewIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/studio')({
  component: StudioPage,
})

// --- Constants & Data ---

const releasePageHref = 'https://github.com/striker561/Avnac-Studio/releases/latest'
const studioRepoHref = 'https://github.com/striker561/Avnac-Studio'
const studioBranchHref = 'https://github.com/striker561/Avnac-Studio/tree/studio'

const downloadLinks = [
  {
    id: 'windows',
    label: 'Windows',
    title: 'Windows installer',
    body: 'One-click installer for the latest desktop release.',
    href: 'https://github.com/striker561/Avnac-Studio/releases/latest/download/avnac-studio-windows-amd64-installer.exe',
    icon: WindowsNewIcon,
    badge: 'Latest',
  },
  {
    id: 'macos-arm',
    label: 'macOS',
    title: 'Arm64 DMG',
    body: 'Optimized for Apple Silicon Macs (M1/M2/M3).',
    href: 'https://github.com/striker561/Avnac-Studio/releases/latest/download/avnac-studio-macos-arm64.dmg',
    icon: AppleIcon,
    badge: 'Recommended',
  },
  {
    id: 'macos-intel',
    label: 'macOS Intel',
    title: 'Intel DMG',
    body: 'Native build for x86_64 Intel-based Macs.',
    href: 'https://github.com/striker561/Avnac-Studio/releases/latest/download/avnac-studio-macos-amd64.dmg',
    icon: AppleIcon,
    badge: 'Intel only',
  },
  {
    id: 'linux',
    label: 'Linux',
    title: 'amd64 binary',
    body: 'Portable binary for common Linux distributions.',
    href: 'https://github.com/striker561/Avnac-Studio/releases/latest/download/avnac-studio-linux-amd64',
    icon: CommandLineIcon,
    badge: 'Portable',
  },
] as const

const comparisonRows = [
  { label: 'Environment', studio: 'Native desktop app', web: 'Browser tab' },
  { label: 'Storage', studio: 'Local app folder', web: 'Browser IndexedDB' },
  { label: 'Offline Use', studio: 'Full support', web: 'Internet required' },
  { label: 'File Dialogs', studio: 'Native OS dialogs', web: 'Browser downloads' },
  {
    label: 'Best fit',
    studio: 'People who want a local desktop workflow',
    web: 'People who want instant browser access',
  },
] as const

const bentoFeatures = [
  {
    eyebrow: 'Projects',
    title: 'Keep your files on your computer.',
    description: 'Studio stores work in a local app folder, so your projects are not tied to browser storage alone.',
    icon: PackageIcon,
  },
  {
    eyebrow: 'Workflow',
    title: 'Use the familiar canvas.',
    description: 'You still get the Avnac editing flow, but with native open, save, and export behavior.',
    icon: ComputerIcon,
  },
  {
    eyebrow: 'Releases',
    title: 'Follow one fork for builds.',
    description: 'The Studio fork publishes releases and keeps desktop-specific work in one place.',
    icon: GithubIcon,
  },
  {
    eyebrow: 'Platform',
    title: 'One workflow, all devices.',
    description: 'Consistent experience across Windows, macOS (Intel & Arm), and Linux.',
    icon: CheckmarkCircle02Icon,
  },
]

const commandCards = [
  {
    step: '01',
    title: 'Environment Setup',
    body: 'Wails depends on Go. Install and verify your Go installation first.',
    command: 'brew install go # macOS\nwinget install GoLang.Go # Win\nsudo apt install golang-go # Linux',
    icon: PackageIcon,
  },
  {
    step: '02',
    title: 'Install Wails CLI',
    body: 'The Wails CLI is required to build and run the native desktop application.',
    command: 'go install github.com/wailsapp/wails/v2/cmd/wails@latest\nwails doctor',
    icon: CommandLineIcon,
  },
  {
    step: '03',
    title: 'Build & Run',
    body: 'Compile the frontend and start the desktop app with native bindings.',
    command: 'cd frontend && npm install\ncd .. && wails dev',
    icon: ComputerIcon,
  },
  {
    step: 'Optional',
    title: 'Frontend Sandbox',
    body: 'Run the UI independently if you don\'t need native desktop features.',
    command: 'cd frontend\nnpm install\nnpm run dev',
    icon: GlobalIcon,
  },
]

// --- Components ---

function PlatformIcon({ icon: Icon, className }: { icon: any; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-black/5 p-2.5 text-black ${className}`}
    >
      <HugeiconsIcon icon={Icon} size={20} strokeWidth={2} />
    </div>
  )
}

function BentoCard({ feature, delay, className }: { feature: (typeof bentoFeatures)[0]; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className={`glass-card apple-shadow-hover flex flex-col h-full p-8 ${className}`}
    >
      <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-black/5 text-black">
        <HugeiconsIcon icon={feature.icon} size={20} />
      </div>
      <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
        {feature.eyebrow}
      </span>
      <h3 className="mb-2 text-xl font-bold tracking-tight">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-(--text-muted)">
        {feature.description}
      </p>
    </motion.div>
  )
}

function StudioPage() {
  const [detectedOS, setDetectedOS] = useState<string | null>(null)
  const [showAllPlatforms, setShowAllPlatforms] = useState(false)
  const [showSecurityNotice, setShowSecurityNotice] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    if (ua.includes('win')) setDetectedOS('windows')
    else if (ua.includes('mac')) setDetectedOS('macos-arm')
    else if (ua.includes('linux')) setDetectedOS('linux')
  }, [])

  const recommendedBuild = downloadLinks.find(link => link.id === detectedOS) || downloadLinks[1]

  return (
    <main className="landing-page min-h-screen overflow-x-hidden pt-32 pb-32">
      {/* Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] size-[500px] rounded-full bg-pink-100/30 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          className="absolute -right-[10%] bottom-[10%] size-[600px] rounded-full bg-blue-100/20 blur-[120px]"
        />
      </div>

      <div className="landing-container relative z-10 px-6">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="display-title mb-12 max-w-5xl text-5xl font-bold tracking-tight text-balance sm:text-7xl lg:text-8xl"
          >
            Download Avnac Studio.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-20 max-w-3xl text-xl leading-relaxed text-(--text-muted) sm:text-2xl"
          >
            Avnac Studio is the desktop fork of Avnac. It packages the editor as a native app for
            Windows, macOS, and Linux, with local files and native save dialogs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-lg">
              <a
                href={recommendedBuild.href}
                className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-3xl bg-black px-10 py-5 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/15 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <HugeiconsIcon icon={Download01Icon} size={24} />
                Download for {recommendedBuild.label}
              </a>
              <button
                onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                className="flex items-center gap-2 text-xs font-semibold text-(--text-muted) transition-colors hover:text-black"
              >
                {showAllPlatforms ? 'Collapse options' : 'Show all platforms'}
                <motion.div animate={{ rotate: showAllPlatforms ? 180 : 0 }}>
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                </motion.div>
              </button>
            </div>

            <AnimatePresence>
              {showAllPlatforms && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {downloadLinks.map(link => (
                    <a
                      key={link.id}
                      href={link.href}
                      className={`glass-card flex flex-col items-start p-8 text-left transition-all hover:bg-white hover:shadow-2xl group ${link.id === recommendedBuild.id ? 'ring-2 ring-black/5' : ''}`}
                    >
                      <PlatformIcon
                        icon={link.icon}
                        className="mb-6 group-hover:scale-110 transition-transform"
                      />
                      <span className="text-lg font-bold mb-2">{link.label}</span>
                      <p className="text-xs text-(--text-muted) leading-relaxed mb-4">
                        {link.body}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-40">
                        {link.badge}
                        <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                      </span>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </section>

        {/* Bento Grid Features */}
        <section className="mt-64">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="display-title mb-6 text-3xl sm:text-5xl">Desktop native features.</h2>
            <p className="max-w-2xl text-base text-(--text-muted)">
              Everything you expect from a professional tool, built for your operating system.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:grid-rows-[1fr_1fr_auto]">
            {/* Left: Large Card */}
            <BentoCard 
              feature={bentoFeatures[0]} 
              delay={0.1} 
              className="md:col-span-2 md:row-span-2 justify-center"
            />
            {/* Right: Stacked small cards */}
            <BentoCard feature={bentoFeatures[1]} delay={0.2} />
            <BentoCard feature={bentoFeatures[2]} delay={0.3} />
            {/* Bottom: Spanning card */}
            <BentoCard 
              feature={bentoFeatures[3]} 
              delay={0.4} 
              className="md:col-span-3"
            />
          </div>
        </section>

        {/* Comparison Section */}
        <section className="mt-32">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="display-title mb-6 text-3xl sm:text-5xl">Studio or Web.</h2>
            <p className="max-w-2xl text-base text-(--text-muted)">
              Choose the environment that fits your creative workflow.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* Studio Card (Dark/Premium) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card flex flex-col bg-black p-10 text-white shadow-2xl transition-transform hover:scale-[1.01]"
            >
              <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                <HugeiconsIcon icon={ComputerIcon} size={28} />
              </div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight">Avnac Studio</h3>
              <p className="mb-10 text-lg leading-relaxed text-white/60">
                The desktop native powerhouse. Optimized for local storage, offline work, and professional file management.
              </p>
              
              <div className="mt-auto space-y-6">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">{row.label}</span>
                    <span className="text-sm font-semibold">{row.studio}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Web Card (Light/Minimal) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card flex flex-col border border-black/5 bg-white/60 p-10 text-black shadow-xl backdrop-blur-3xl transition-transform hover:scale-[1.01]"
            >
              <div className="mb-8 flex size-14 items-center justify-center rounded-2xl bg-black/5 text-black">
                <HugeiconsIcon icon={GlobalIcon} size={28} />
              </div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight">Avnac Web</h3>
              <p className="mb-10 text-lg leading-relaxed text-black/50">
                Zero friction, anywhere access. The same powerful editor running directly in your browser.
              </p>

              <div className="mt-auto space-y-6">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-black/5 pb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-black/20">{row.label}</span>
                    <span className="text-sm font-semibold">{row.web}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* macOS Security Notice */}
        <section className="mt-20 flex justify-center">
          <div className="w-full max-w-4xl">
            <button
              onClick={() => setShowSecurityNotice(!showSecurityNotice)}
              className="glass-card flex w-full items-center justify-between p-8 text-left transition-all hover:bg-white active:scale-[0.99]"
            >
              <div className="flex items-center gap-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-black/5">
                  <HugeiconsIcon icon={Shield01Icon} size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">macOS Security Notice</h3>
                  <p className="text-sm text-(--text-muted)">
                    Instructions for first-time launch on macOS.
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: showSecurityNotice ? 180 : 0 }}>
                <HugeiconsIcon icon={ArrowDown01Icon} size={24} />
              </motion.div>
            </button>

            <AnimatePresence>
              {showSecurityNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 p-10 bg-white/40 border-x border-b border-black/5 rounded-b-[24px]">
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-bold text-black flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-black text-white text-[10px]">
                            1
                          </span>
                          Recommended Method
                        </h4>
                        <ol className="space-y-3 text-sm text-(--text-muted) list-decimal pl-5">
                          <li>Locate Avnac.app in Finder</li>
                          <li>Right-click the app</li>
                          <li>Click Open, then confirm in the dialog</li>
                        </ol>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-black flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-black text-white text-[10px]">
                            2
                          </span>
                          Alternative Method
                        </h4>
                        <p className="text-sm text-(--text-muted)">
                          Go to System Settings &gt; Privacy &amp; Security &gt; Security and click
                          "Allow Anyway" next to Avnac Studio.
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-black/5">
                      <h4 className="font-bold text-black mb-3 text-sm">Advanced (Terminal)</h4>
                      <div className="rounded-xl bg-black p-4 font-mono text-xs text-white/80">
                        xattr -rd com.apple.quarantine /Applications/Avnac.app
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Developer Section */}
        <section className="mt-20">
          <div className="mb-12 text-center">
            <h2 className="display-title mb-6 text-3xl sm:text-5xl">Open for builders.</h2>
            <p className="max-w-2xl mx-auto text-base text-(--text-muted)">
              Avnac Studio is completely open-source. Clone the repository and start building your
              own features.
            </p>
          </div>

          <div className="mx-auto max-w-5xl space-y-12">
            {commandCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative grid gap-8 md:grid-cols-[1fr_2fr] items-start"
              >
                {/* Step Info */}
                <div className="relative pt-2">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-black px-4 text-white text-xs font-bold">
                      {card.step}
                    </div>
                    <div className="h-px flex-1 bg-black/5" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-(--text-muted)">
                    {card.body}
                  </p>
                </div>

                {/* Terminal Block */}
                <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-zinc-950 p-1 shadow-2xl transition-transform hover:scale-[1.01]">
                  <div className="flex items-center gap-1.5 px-6 py-4 border-b border-white/5">
                    <div className="size-2.5 rounded-full bg-white/10" />
                    <div className="size-2.5 rounded-full bg-white/10" />
                    <div className="size-2.5 rounded-full bg-white/10" />
                    <span className="ml-4 text-[10px] font-bold uppercase tracking-widest text-white/20">terminal</span>
                  </div>
                  <div className="p-6 font-mono text-[13px] leading-relaxed text-white/90">
                    {card.command.split('\n').map((line, lidx) => (
                      <div key={lidx} className="flex gap-4">
                        <span className="w-4 shrink-0 text-white/20 text-right select-none">{lidx + 1}</span>
                        <span className="break-all whitespace-pre-wrap">
                          {line.split(' ').map((word, widx) => {
                            if (word.startsWith('#')) return <span key={widx} className="text-white/30">{word} </span>
                            if (word === 'brew' || word === 'winget' || word === 'sudo' || word === 'npm' || word === 'go' || word === 'wails') 
                              return <span key={widx} className="text-blue-400">{word} </span>
                            if (word === 'install' || word === 'run' || word === 'dev') 
                              return <span key={widx} className="text-purple-400">{word} </span>
                            return <span key={widx}>{word} </span>
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Subtle Glow */}
                  <div className="absolute -right-20 -top-20 size-40 bg-white/5 blur-[50px] pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-16 flex flex-col items-center gap-6"
          >
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={studioRepoHref}
                target="_blank"
                rel="noreferrer"
                className="glass-card flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all hover:bg-white"
              >
                <HugeiconsIcon icon={GithubIcon} size={18} />
                View Repository
              </a>
              <a
                href={studioBranchHref}
                target="_blank"
                rel="noreferrer"
                className="glass-card flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all hover:bg-white"
              >
                <HugeiconsIcon icon={CommandLineIcon} size={18} />
                Explore Source
              </a>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="mt-32 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative inline-block"
          >
            <div className="absolute -inset-20 bg-gradient-to-r from-blue-500/20 via-pink-500/20 to-purple-500/20 blur-[100px] opacity-50" />
            <h2 className="display-title relative mb-12 text-4xl sm:text-6xl lg:text-7xl tracking-tighter">
              Start creating.
            </h2>

            <div className="relative flex flex-wrap justify-center gap-6">
              <a
                href={recommendedBuild.href}
                className="rounded-[2rem] bg-black px-14 py-7 text-xl font-bold text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                Download Now
              </a>
              <a
                href={releasePageHref}
                className="glass-card flex items-center gap-3 px-12 py-7 text-xl font-bold transition-all hover:bg-white active:scale-[0.98]"
              >
                Browse Releases
                <HugeiconsIcon icon={ArrowRight01Icon} size={22} />
              </a>
            </div>
          </motion.div>
        </section>

        {/* Footer Fork Notice */}
        <footer className="mt-40 border-t border-black/5 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl rounded-3xl border border-black/5 bg-black/5 p-8 text-center backdrop-blur-sm"
          >
            <p className="text-sm leading-relaxed text-(--text-muted)">
              Avnac Studio is independently maintained by{' '}
              <a
                href="https://github.com/striker561"
                target="_blank"
                rel="noreferrer"
                className="text-black font-semibold underline underline-offset-4"
              >
                striker561
              </a>{' '}
              and{' '}
              <a
                href="https://github.com/d3uceY"
                target="_blank"
                rel="noreferrer"
                className="text-black font-semibold underline underline-offset-4"
              >
                d3uceY
              </a>
              . It lives in the{' '}
              <a
                href={studioRepoHref}
                target="_blank"
                rel="noreferrer"
                className="text-black font-semibold underline underline-offset-4"
              >
                Avnac Studio fork
              </a>{' '}
              and is not maintained by the upstream Avnac project.
            </p>
            <div className="mt-6 flex justify-center gap-6">
              <a href="https://x.com/insigdev" target="_blank" rel="noreferrer" className="text-xs font-bold text-black/60 hover:text-black transition-colors">𝕏 @insigdev</a>
              <a href="https://x.com/d3uc3y" target="_blank" rel="noreferrer" className="text-xs font-bold text-black/60 hover:text-black transition-colors">𝕏 @d3uc3y</a>
            </div>
          </motion.div>
          <div className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-20">
            Avnac Studio &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </main>
  )
}
