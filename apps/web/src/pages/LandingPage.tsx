import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  CircleSlash,
  ClipboardList,
  LayoutGrid,
  MessageSquareText,
  Package,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  WifiOff,
} from "lucide-react";

const TRUST_STATS = [
  { label: "Average billing time", value: "38 sec" },
  { label: "Monthly bills included", value: "30" },
  { label: "Currency support", value: "NPR" },
];

const PAIN_POINTS = [
  {
    icon: MessageSquareText,
    title: "Customers ask before they buy",
    body: "Sizes, colors, availability, delivery price, payment status. The same answers get repeated across DMs all day.",
  },
  {
    icon: Package,
    title: "Stock moves faster than notes",
    body: "A sale, a return, and a restock can happen before the notebook or spreadsheet catches up.",
  },
  {
    icon: ReceiptText,
    title: "Billing lives in screenshots",
    body: "Voice notes, transfer confirmations, and product photos become the only record of who paid what.",
  },
  {
    icon: BarChart3,
    title: "Profit is hard to see clearly",
    body: "Sales look good, but cost, delivery, purchase, and expense records are scattered until month end.",
  },
];

const FEATURES = [
  {
    icon: ReceiptText,
    eyebrow: "Billing",
    title: "Create a bill while the customer is still in the chat.",
    body: "Search product codes, choose variants, add customer details, mark payment status, and share a clean bill link in one flow.",
    mockup: <BillMockup />,
  },
  {
    icon: Package,
    eyebrow: "Inventory",
    title: "Know exactly what is available before you promise it.",
    body: "Stock updates from sales and purchases. Low-stock items surface early, and every movement stays traceable.",
    mockup: <InventoryMockup />,
    reverse: true,
  },
  {
    icon: LayoutGrid,
    eyebrow: "Catalog",
    title: "Turn products into a public store link without building a website.",
    body: "Publish a mobile-first catalog for Instagram, TikTok, or Daraz customers to browse before they message you.",
    mockup: <CatalogMockup />,
  },
];

const PRICING_FREE = [
  { text: "Up to 30 bills/month", ok: true },
  { text: "Up to 30 products", ok: true },
  { text: "Public catalog page", ok: true },
  { text: "Bill sharing links", ok: true },
  { text: "Purchase tracking", ok: false },
  { text: "Expense tracking", ok: false },
  { text: "Profit dashboard", ok: false },
];

const PRICING_PRO = [
  "Unlimited bills",
  "Unlimited products",
  "Public catalog page",
  "Bill sharing links",
  "Purchase and supplier tracking",
  "Expense tracking",
  "Profit dashboard",
  "Multiple staff logins",
  "Priority support",
];

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`${small ? "h-7 w-7" : "h-8 w-8"} grid place-items-center rounded-md bg-blue-600 shadow-sm shadow-blue-600/20`}
    >
      <ReceiptText
        size={small ? 15 : 17}
        strokeWidth={2.4}
        className="text-white"
      />
    </div>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Invo home">
          <LogoMark small />
          <span className="text-lg font-semibold text-slate-950">Invo</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-950">
            Product
          </a>
          <a href="#pricing" className="transition hover:text-slate-950">
            Pricing
          </a>
          <a href="#security" className="transition hover:text-slate-950">
            Trust
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="group premium-lift inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Start free
            <ArrowRight
              size={16}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-[620px]">
      <div className="motion-float absolute -left-5 top-10 hidden h-24 w-24 rounded-lg border border-blue-100 bg-blue-50/80 blur-2xl md:block" />
      <div className="motion-float-late absolute -right-4 bottom-8 hidden h-28 w-28 rounded-lg border border-slate-100 bg-slate-100/80 blur-2xl md:block" />

      <div className="motion-rise-slow motion-delay-2 premium-shine relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-900/20">
        <div className="flex items-center gap-2 border-b border-white/10 px-2 pb-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          </div>
          <div className="ml-2 flex h-7 flex-1 items-center rounded-md bg-white/8 px-3 text-[11px] text-slate-400">
            invo.app/workspace/sapana-closet
          </div>
        </div>

        <div className="grid min-h-[430px] overflow-hidden rounded-md bg-slate-50 text-left sm:grid-cols-[150px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-white p-4 sm:block">
            <div className="mb-6 flex items-center gap-2">
              <LogoMark small />
              <span className="text-sm font-semibold text-slate-950">Invo</span>
            </div>
            {["Dashboard", "Products", "New bill", "Customers", "Expenses"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`mb-1 rounded-md px-3 py-2 text-xs font-medium transition ${
                    index === 0
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </aside>

          <main className="p-4 sm:p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">
                  Today in Kathmandu
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  Sapana Closet
                </h2>
              </div>
              <div className="premium-lift inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white">
                <ReceiptText size={14} />
                New bill
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Revenue", value: "NPR 16,800", tone: "blue" },
                { label: "Bills", value: "12", tone: "slate" },
                { label: "Low stock", value: "4", tone: "amber" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="premium-lift rounded-md border border-slate-200 bg-white p-3"
                >
                  <p className="text-[10px] font-semibold uppercase text-slate-400">
                    {stat.label}
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      stat.tone === "blue"
                        ? "text-blue-700"
                        : stat.tone === "amber"
                          ? "text-amber-700"
                          : "text-slate-950"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-md border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                  <span className="text-xs font-semibold text-slate-950">
                    Recent bills
                  </span>
                  <span className="text-[11px] font-medium text-blue-700">
                    View all
                  </span>
                </div>
                {[
                  ["#1208", "Priya Sharma", "Paid", "NPR 4,600"],
                  ["#1207", "Maya Gurung", "Unpaid", "NPR 2,250"],
                  ["#1206", "Anita Rai", "Paid", "NPR 7,800"],
                ].map(([id, name, status, amount]) => (
                  <div
                    key={id}
                    className="grid grid-cols-[46px_1fr_auto] items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0"
                  >
                    <span className="text-xs font-semibold text-slate-500">
                      {id}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-950">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-400">{status}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">
                      {amount}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-950">
                    Stock health
                  </span>
                  <span className="motion-pulse rounded bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    LIVE
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    ["Floral Maxi", "72%"],
                    ["Silk Kurta", "48%"],
                    ["Cotton Tee", "18%"],
                  ].map(([name, value]) => (
                    <div key={name}>
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span className="font-medium text-slate-600">{name}</span>
                        <span className="text-slate-400">{value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="motion-progress h-2 rounded-full bg-blue-600"
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_72%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-6 md:pb-20 md:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="motion-rise mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <Store size={16} />
            Built for Nepali social sellers
          </div>
          <h1 className="motion-rise motion-delay-1 max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
            Run your store.{" "}
            <span className="text-slate-400">Not spreadsheets.</span>
          </h1>
          <p className="motion-rise motion-delay-2 mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Invo helps Instagram, TikTok, and Daraz sellers replace scattered
            spreadsheets with fast billing, accurate inventory, and a shareable
            catalog that works beautifully on mobile data.
          </p>

          <div className="motion-rise motion-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="group premium-lift inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Create free store
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="premium-lift inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              See product flow
            </a>
          </div>

          <div className="motion-rise motion-delay-3 mt-8 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="premium-lift p-4">
                <p className="text-lg font-semibold text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <DashboardMockup />
      </div>
    </section>
  );
}

function PainPoints() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">
              The daily friction
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Built around how Nepali online sellers actually work.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Customers arrive from social channels. Orders move quickly. Invo
              keeps the business record clean without slowing the seller down.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAIN_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="motion-rise premium-lift rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Icon size={19} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-950">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {point.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function BillMockup() {
  return (
    <div className="premium-lift rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Bill #1209
          </p>
          <h4 className="mt-1 text-base font-semibold text-slate-950">
            New customer sale
          </h4>
        </div>
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Draft
        </span>
      </div>

      <div className="mb-4 rounded-md border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-sm text-slate-500">
          <Search size={15} />
          Search by product code
        </div>
        {[
          ["DRS-1042", "Floral Maxi", "Red / M", "NPR 3,600"],
          ["KRT-0001", "Silk Kurta", "Pink / S", "NPR 2,500"],
        ].map(([code, name, variant, price]) => (
          <div
            key={code}
            className="grid grid-cols-[68px_1fr_auto] items-center gap-3 border-b border-slate-100 px-3 py-3 transition hover:bg-slate-50 last:border-b-0"
          >
            <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {code}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{name}</p>
              <p className="text-xs text-slate-500">{variant}</p>
            </div>
            <span className="text-sm font-semibold text-slate-900">{price}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-400">
            Customer
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            Rachana Thapa
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-400">
            Total
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            NPR 6,100
          </p>
        </div>
      </div>

      <div className="group flex items-center justify-between rounded-md bg-slate-950 px-4 py-3 text-white transition hover:bg-blue-600">
        <span className="text-sm font-semibold">Confirm and share bill</span>
        <ArrowRight size={17} className="transition group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function InventoryMockup() {
  return (
    <div className="premium-lift rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Inventory
          </p>
          <h4 className="mt-1 text-base font-semibold text-slate-950">
            Product variants
          </h4>
        </div>
        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          4 low
        </span>
      </div>

      {[
        ["Floral Maxi Dress", "DRS-1042", "Red / M", "23", "NPR 1,800"],
        ["Silk Kurta Set", "KRT-0001", "Pink / S", "8", "NPR 2,500"],
        ["Cotton Tee", "TEE-0055", "White / L", "2", "NPR 600"],
      ].map(([name, code, variant, stock, price], index) => (
        <div
          key={code}
          className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 last:border-b-0 sm:grid-cols-[1fr_84px_92px]"
        >
          <div>
            <p className="text-sm font-semibold text-slate-950">{name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {code} / {variant}
            </p>
          </div>
          <span
            className={`self-center rounded-md px-2.5 py-1 text-center text-xs font-semibold ${
              index === 2
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {stock} left
          </span>
          <span className="hidden self-center text-right text-sm font-semibold text-slate-900 sm:block">
            {price}
          </span>
        </div>
      ))}
    </div>
  );
}

function CatalogMockup() {
  return (
    <div className="premium-lift rounded-lg border border-slate-800 bg-slate-950 p-4 shadow-xl shadow-slate-900/20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Public catalog
          </p>
          <h4 className="mt-1 text-base font-semibold text-white">
            Sapana Closet
          </h4>
        </div>
        <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
          /shop/sapana
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          ["Floral Maxi", "NPR 1,800", "bg-blue-200"],
          ["Silk Kurta", "NPR 2,500", "bg-rose-200"],
          ["Cotton Tee", "NPR 600", "bg-slate-200"],
          ["Denim Jacket", "NPR 2,200", "bg-indigo-200"],
        ].map(([name, price, tone]) => (
          <div
            key={name}
            className="rounded-md bg-white/8 p-2.5 transition hover:bg-white/12"
          >
            <div className={`mb-2 h-20 rounded-md ${tone} motion-float-late`} />
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="mt-1 text-xs text-slate-400">{price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="motion-rise mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase text-blue-700">
            Product flow
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
            A back office that matches the speed of social selling.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Each workflow is designed for fast entry, clear records, and fewer
            follow-up messages.
          </p>
        </div>

        <div className="mt-16 space-y-16 md:space-y-24">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                  feature.reverse ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div
                  className={`motion-rise ${
                    feature.reverse ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  <div className="premium-lift mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon size={21} />
                  </div>
                  <p className="text-sm font-semibold uppercase text-blue-700">
                    {feature.eyebrow}
                  </p>
                  <h3 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                    {feature.body}
                  </p>
                </div>
                <div
                  className={`motion-rise-slow motion-delay-1 ${
                    feature.reverse ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  {feature.mockup}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OperationsSection() {
  return (
    <section id="security" className="border-y border-slate-200 bg-slate-950 py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="motion-rise">
            <p className="text-sm font-semibold uppercase text-blue-300">
              Built for real operating conditions
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Fast on phones. Clear for owners. Limited for staff.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Invo keeps the interface direct for mobile use while protecting
              sensitive cost and profit data from staff accounts.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Smartphone,
                title: "Mobile-first workflows",
                body: "Compact screens, large actions, and focused forms for sellers working from Android phones.",
              },
              {
                icon: WifiOff,
                title: "Patchy-network friendly",
                body: "Pages stay lightweight and practical for mobile data and uneven 4G conditions.",
              },
              {
                icon: ShieldCheck,
                title: "Role-aware access",
                body: "Owners see business performance. Staff can help sell without seeing cost prices.",
              },
              {
                icon: ClipboardList,
                title: "Historical records",
                body: "Bills snapshot product details at sale time, so old receipts stay accurate.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="motion-rise premium-lift rounded-lg border border-white/10 bg-white/6 p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-blue-200">
                    <Icon size={19} />
                  </div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="motion-rise mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase text-blue-700">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
            Start free, then upgrade when the store gets busier.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Pricing is in NPR and built for small sellers who need useful tools
            before they need enterprise software.
          </p>

          <div className="mt-7 inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`h-9 rounded px-4 text-sm font-semibold transition ${
                !yearly
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`h-9 rounded px-4 text-sm font-semibold transition ${
                yearly
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="motion-rise premium-lift rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <h3 className="text-xl font-semibold text-slate-950">Free</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                For new sellers moving away from notebooks and spreadsheets.
              </p>
              <div className="mt-5">
                <span className="text-4xl font-semibold text-slate-950">
                  NPR 0
                </span>
                <span className="text-sm font-medium text-slate-500">
                  {" "}
                  / month
                </span>
              </div>
            </div>

            <ul className="space-y-3">
              {PRICING_FREE.map((feature) => (
                <li
                  key={feature.text}
                  className={`flex items-center gap-3 text-sm ${
                    feature.ok ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {feature.ok ? (
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-emerald-600"
                    />
                  ) : (
                    <CircleSlash size={17} className="shrink-0 text-slate-300" />
                  )}
                  {feature.text}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Get started free
            </Link>
          </div>

          <div className="motion-rise motion-delay-1 premium-lift premium-shine relative overflow-hidden rounded-lg bg-blue-600 p-6 text-white shadow-xl shadow-blue-600/20 sm:p-8">
            <div className="motion-float absolute right-0 top-0 h-40 w-40 rounded-lg bg-white/10 blur-2xl" />
            <div className="relative mb-7 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold text-blue-50">
                  Most popular
                </div>
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
                  For stores that need profit clarity, purchase history, staff
                  access, and no operational limits.
                </p>
                <div className="mt-5">
                  <span className="text-4xl font-semibold">
                    NPR {yearly ? "9,999" : "999"}
                  </span>
                  <span className="text-sm font-medium text-blue-100">
                    {" "}
                    / {yearly ? "year" : "month"}
                  </span>
                </div>
              </div>
            </div>

            <ul className="relative grid gap-3 sm:grid-cols-2">
              {PRICING_PRO.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check size={17} className="shrink-0 text-blue-100" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="premium-lift relative mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-white text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Start Pro trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="motion-rise premium-lift grid gap-8 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">
              Ready when you are
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-slate-950">
              Give your store a cleaner operating system before the next busy
              week starts.
            </h2>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
              {["No credit card", "Free for small sellers", "Built in NPR"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <Link
            to="/register"
            className="group premium-lift inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Create free store
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <LogoMark small />
          <div>
            <p className="text-sm font-semibold text-slate-950">Invo</p>
            <p className="text-sm text-slate-500">
              Built for online sellers in Nepal.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
          <span className="hover:text-slate-800">Privacy</span>
          <span className="hover:text-slate-800">Terms</span>
          <span className="hover:text-slate-800">Contact</span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <Hero />
      <PainPoints />
      <Features />
      <OperationsSection />
      <Pricing />
      <CtaSection />
      <Footer />
    </div>
  );
}
