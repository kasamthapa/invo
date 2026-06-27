import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, Package, LayoutGrid, Check, X as XIcon } from 'lucide-react'

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">Invo</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-block text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
            Sign in
          </Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="bg-slate-800 rounded-xl p-3 shadow-2xl shadow-slate-900/30">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="flex-1 bg-slate-700 rounded h-5 ml-2 flex items-center px-2">
          <span className="text-slate-400 text-[10px]">invo-web.vercel.app/app</span>
        </div>
      </div>
      <div className="bg-slate-50 rounded-lg overflow-hidden flex text-left">
        <div className="w-36 bg-white border-r border-slate-200 p-3 flex-shrink-0 hidden sm:block">
          <div className="font-bold text-slate-900 text-sm mb-3">Invo</div>
          <div className="bg-blue-50 text-blue-600 rounded-md px-2 py-1 text-[11px] font-medium mb-1">Dashboard</div>
          <div className="text-slate-500 px-2 py-1 text-[11px]">Products</div>
          <div className="text-slate-500 px-2 py-1 text-[11px]">New Bill</div>
          <div className="text-slate-500 px-2 py-1 text-[11px]">Customers</div>
        </div>
        <div className="flex-1 p-4">
          <div className="text-xs font-semibold text-slate-900 mb-3">Good morning, Sapana 👋</div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              { label: 'TODAY', value: 'NPR 6,000' },
              { label: 'BILLS', value: '3' },
              { label: 'IN STOCK', value: '47' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-md p-2">
                <div className="text-[9px] text-slate-400 mb-0.5">{s.label}</div>
                <div className="text-xs font-bold text-slate-900">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="px-2.5 py-1.5 border-b border-slate-200 text-[10px] font-semibold text-slate-500">RECENT BILLS</div>
            <div className="px-2.5 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px]">
              <span className="text-slate-900">#4 · Priya Sharma</span>
              <span className="bg-green-50 text-green-700 rounded px-1.5 py-0.5 text-[9px] font-medium">PAID</span>
            </div>
            <div className="px-2.5 py-1.5 flex justify-between items-center text-[10px]">
              <span className="text-slate-900">#3 · Anita Rai</span>
              <span className="bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 text-[9px] font-medium">UNPAID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm font-medium mb-6">
            Built for Nepal's online sellers
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Run your store.{' '}
            <span className="text-slate-400">Not spreadsheets.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
            Invo handles billing, inventory, and sales tracking — so you can focus on selling.
            Built for Instagram and TikTok sellers in Nepal.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Start for free
            </Link>
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              See how it works ↓
            </a>
          </div>
          <p className="text-slate-400 text-sm">Free forever for small sellers. No credit card required.</p>
        </div>
        <div className="hidden md:block">
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}

// ── Pain points ───────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    emoji: '📱',
    title: '15 DMs asking the same thing',
    body: 'Is this available? What size? What\'s the price? You spend more time answering questions than actually selling.',
  },
  {
    emoji: '📦',
    title: 'You sold something you didn\'t have',
    body: 'Stock counts in your head, a notebook, and three WhatsApp messages. Sooner or later they don\'t match.',
  },
  {
    emoji: '🧾',
    title: 'Billing over voice notes',
    body: 'Screenshots, cash transfers, Khalti confirmations — scattered across apps with no record of who paid what.',
  },
  {
    emoji: '😰',
    title: 'Month-end means chaos',
    body: 'How much did you actually make? What\'s the profit after expenses? You don\'t know until you spend a Sunday finding out.',
  },
]

function PainPoints() {
  return (
    <section id="pain" className="bg-slate-50 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Every seller knows this feeling.</h2>
          <p className="text-slate-600 text-lg">Managing a growing online store shouldn't feel like this.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="bg-white border border-slate-200 rounded-xl p-6">
              <span className="text-2xl mb-3 block">{p.emoji}</span>
              <h3 className="text-slate-900 font-semibold mb-2">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────

function BillMockup() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900">New Bill</span>
        <span className="text-xs text-slate-400">Bill #5</span>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
        <div className="px-3 py-2 border-b border-slate-100 flex justify-between text-sm">
          <span className="text-slate-900">Floral Maxi · Red/M</span>
          <span className="text-slate-600">×2</span>
        </div>
        <div className="px-3 py-2 flex justify-between text-sm">
          <span className="text-slate-900">Silk Kurta · Pink/S</span>
          <span className="text-slate-600">×1</span>
        </div>
      </div>
      <div className="flex justify-between text-sm font-semibold text-slate-900 mb-3">
        <span>Total</span>
        <span>NPR 6,100</span>
      </div>
      <div className="bg-blue-600 text-white text-center text-sm font-medium py-2.5 rounded-lg">
        Confirm Bill
      </div>
    </div>
  )
}

function InventoryMockup() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-900">Products</span>
        <span className="text-xs text-slate-400 ml-2">3 products</span>
      </div>
      {[
        { name: 'Floral Maxi Dress', code: 'DRS-1042', stock: 23, price: 'NPR 1,800' },
        { name: 'Silk Kurta Set', code: 'KRT-0001', stock: 8, price: 'NPR 2,500' },
        { name: 'Cotton Tee', code: 'TEE-0055', stock: 2, price: 'NPR 600', low: true },
      ].map((p) => (
        <div key={p.code} className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-sm">
          <div>
            <span className="text-slate-900 font-medium">{p.name}</span>
            <span className="text-slate-400 text-xs ml-2">{p.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${p.low ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>
              {p.stock} in stock
            </span>
            <span className="text-slate-600 text-xs">{p.price}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function CatalogMockup() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white text-sm font-semibold">Sapana Closet</span>
        <span className="text-slate-500 text-[10px]">/shop/sapana-closet</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['Floral Maxi', 'Silk Kurta', 'Cotton Tee', 'Denim Jacket'].map((name) => (
          <div key={name} className="bg-slate-800 rounded-lg p-2.5">
            <div className="bg-slate-700 rounded h-16 mb-2 flex items-center justify-center">
              <Package size={16} className="text-slate-500" />
            </div>
            <div className="text-white text-xs font-medium">{name}</div>
            <div className="text-slate-400 text-[10px]">NPR 1,800</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: Receipt,
    title: 'Bill in seconds, not minutes.',
    body: 'Search a product by code, pick the size and color, confirm the sale. Stock updates automatically. Share the bill link straight to their DM. Your customer gets a clean receipt — you get a record that doesn\'t live only in your memory.',
    mockup: <BillMockup />,
  },
  {
    icon: Package,
    title: 'Always know what you have.',
    body: 'Every sale reduces your stock. Every restock adds to it. One view shows you what\'s running low before it runs out. No spreadsheets, no notebook, no guessing.',
    mockup: <InventoryMockup />,
    reverse: true,
  },
  {
    icon: LayoutGrid,
    title: 'Your store, shareable in one link.',
    body: 'Every product you add gets a public catalog page at /shop/yourstore. Put it in your Instagram bio. Customers browse, DM you to order. No separate website needed.',
    mockup: <CatalogMockup />,
  },
]

function Features() {
  return (
    <section id="features" className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Everything you need. Nothing you don't.</h2>
        <div className="space-y-20">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`grid md:grid-cols-2 gap-10 items-center ${f.reverse ? 'md:[direction:rtl]' : ''}`}
              >
                <div className={f.reverse ? 'md:[direction:ltr]' : ''}>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.body}</p>
                </div>
                <div className={f.reverse ? 'md:[direction:ltr]' : ''}>
                  {f.mockup}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────

function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="bg-slate-50 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Simple pricing. No surprises.</h2>
          <p className="text-slate-600 text-lg mb-6">Start free. Upgrade when you're ready.</p>
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !yearly ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                yearly ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly <span className="text-green-600 text-xs font-medium">save 2 months</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Free</h3>
            <div className="mb-1">
              <span className="text-4xl font-bold text-slate-900">NPR 0</span>
              <span className="text-slate-500 text-sm"> / month</span>
            </div>
            <p className="text-slate-500 text-sm mb-6">For small sellers just getting started.</p>
            <ul className="space-y-3 mb-8">
              {[
                { text: 'Up to 30 bills/month', ok: true },
                { text: 'Up to 30 products', ok: true },
                { text: 'Public catalog page', ok: true },
                { text: 'Bill sharing links', ok: true },
                { text: 'Purchase tracking', ok: false },
                { text: 'Expense tracking', ok: false },
                { text: 'Profit dashboard', ok: false },
              ].map((f) => (
                <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.ok ? 'text-slate-700' : 'text-slate-400'}`}>
                  {f.ok ? <Check size={16} className="text-green-600 flex-shrink-0" /> : <XIcon size={16} className="text-slate-300 flex-shrink-0" />}
                  {f.text}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block text-center border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-blue-600 rounded-2xl p-6 md:p-8 relative">
            <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Most popular
            </span>
            <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
            <div className="mb-1">
              <span className="text-4xl font-bold text-white">
                NPR {yearly ? '9,999' : '999'}
              </span>
              <span className="text-blue-200 text-sm"> / {yearly ? 'year' : 'month'}</span>
            </div>
            <p className="text-blue-200 text-sm mb-6">For sellers running a real business.</p>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited bills',
                'Unlimited products',
                'Public catalog page',
                'Bill sharing links',
                'Purchase & supplier tracking',
                'Expense tracking',
                'Profit dashboard',
                'Multiple staff logins',
                'Priority support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                  <Check size={16} className="text-blue-200 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block text-center bg-white text-blue-600 font-medium py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Pro free for 14 days
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to run your store properly?</h2>
        <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto">
          Join sellers across Nepal who've stopped managing inventory in their head.
        </p>
        <Link
          to="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 text-lg font-medium transition-colors"
        >
          Create your free store →
        </Link>
        <p className="text-slate-400 text-sm mt-4">Free forever for small sellers. No credit card required.</p>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">I</span>
          </div>
          <span className="text-slate-500 text-sm">© 2026 Invo. Made for Nepal 🇳🇵</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <span className="hover:text-slate-700 cursor-pointer">Privacy</span>
          <span className="hover:text-slate-700 cursor-pointer">Terms</span>
          <span className="hover:text-slate-700 cursor-pointer">Contact</span>
        </div>
      </div>
    </footer>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen" style={{ color: '#0f172a' }}>
      <Navbar />
      <Hero />
      <PainPoints />
      <Features />
      <Pricing />
      <CtaSection />
      <Footer />
    </div>
  )
}
