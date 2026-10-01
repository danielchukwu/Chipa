import { Button } from "@repo/ui/components/button.tsx";
import FAQ from "#/components/FAQ";
import TwinkleIcon from "@repo/ui/icons/landing-page/twinkle-icon.tsx";
import VerifiedIcon from "@repo/ui/icons/landing-page/verified-icon.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { openWaitlist } from "../lib/waitlist";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  const pageVersion = getLandingPageVersion();
  return pageVersion === "LP1" ? <LP1 /> : <LP2 />;
}

function getLandingPageVersion(): "LP1" | "LP2" {
  return "LP2";
}

function LP2() {
  const services = [
    {
      title: "Airtime, right when you need it",
      description: "Top up your line in a few taps and get back to your day.",
      image: "https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929772/CHIPA/landing-page/Airtime_uzyhtc.webp",
      alt: "Airtime purchase options",
      tone: "bg-[#FFF0E8] border-[#FCE2D5]",
    },
    {
      title: "Data for wherever life takes you",
      description: "Choose a data bundle and stay connected to what matters.",
      image: "https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929774/CHIPA/landing-page/Data_kwwp0x.webp",
      alt: "Mobile internet data bundle options",
      tone: "bg-[#EEF5FF] border-[#DFEAFA]",
    },
    {
      title: "Keep the lights on",
      description: "Pay your electricity bill from your phone, without the hassle.",
      image: "https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929776/CHIPA/landing-page/Select_Electricity_dli34e.webp",
      alt: "Electricity bill providers",
      tone: "bg-[#EEF8EE] border-[#DFEFDF]",
    },
    {
      title: "Your favourite shows, sorted",
      description: "Renew cable TV subscriptions like DStv, GOtv and StarTimes.",
      image: "https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929776/CHIPA/landing-page/Select_Cable_seuhya.webp",
      alt: "Cable television providers",
      tone: "bg-[#F4EEFC] border-[#E9E0F5]",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111111]">
      <section className="relative overflow-hidden bg-[#FCF9F4]">
        <div className="pointer-events-none absolute -right-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-[#FFD8C5]/60 blur-3xl" />
        <div className="page-container relative grid min-h-[620px] grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-10">
          <div className="rise-in lg:col-span-6 xl:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E9E1D7] bg-white/80 px-4 py-2 text-sm font-semibold text-[#56514B]">
              <span className="h-2 w-2 rounded-full bg-[#009A49]" />
              Everyday money, made easier
            </span>
            <h1 className="mt-6 max-w-2xl font-display text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.5rem] xl:text-[5rem]">
              Your money, <span className="text-[#FF793F]">your everyday</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#525252] sm:text-lg lg:text-xl">
              Receive naira, send money to local bank accounts, and take care of airtime, data and bills from one simple app.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button variant="black" onClick={openWaitlist} className="h-auto rounded-full px-8 py-4 text-base font-semibold shadow-sm transition hover:scale-[1.02] sm:text-lg">
                Join the waitlist
              </Button>
              <span className="text-sm text-[#68635D]">A simpler way to handle the everyday.</span>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {["Naira wallet", "Bank transfers", "Airtime & data", "Bills"] .map((item) => (
                <div key={item} className="rounded-2xl border border-[#EDE5DB] bg-white/75 px-3 py-3 text-center text-xs font-semibold text-[#45413D] sm:text-sm">{item}</div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px] lg:col-span-6 lg:mx-0 lg:justify-self-end xl:col-span-5">
            <div className="absolute inset-x-8 bottom-3 top-12 rounded-[3rem] bg-[#F3D5C4]" />
            <img
              src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929861/CHIPA/landing-page/hero-lady_hm57zb.webp"
              alt="Smiling woman using Chipa on her phone"
              className="relative z-10 h-auto w-full select-none object-contain drop-shadow-xl"
              loading="eager"
            />
            <div className="absolute bottom-8 left-0 z-20 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl sm:-left-8 sm:p-5">
              <p className="text-xs font-medium text-[#77716B]">Your Chipa balance</p>
              <p className="mt-1 font-display text-2xl font-black">₦24,500<span className="text-[#009A49]">.00</span></p>
              <p className="mt-1 text-xs font-semibold text-[#009A49]">Ready for your everyday</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#009A49]">All the essentials</span>
          <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The everyday stuff. <span className="text-[#009A49]">One app.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#626262] sm:text-lg">
            From topping up your phone to settling household bills, Chipa helps you get it done quickly and simply.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:gap-7">
          {services.map((service, index) => (
            <article key={service.title} className={`group relative flex min-h-[440px] flex-col overflow-hidden rounded-[2rem] border p-7 transition duration-300 hover:-translate-y-1 sm:min-h-[500px] sm:p-10 ${service.tone}`}>
              <div className="relative z-10 max-w-sm">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">0{index + 1} / Chipa essentials</span>
                <h3 className="mt-3 font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl">{service.title}</h3>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-[#595959]">{service.description}</p>
              </div>
              <img src={service.image} alt={service.alt} loading="lazy" className="mt-auto h-[250px] w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03] sm:h-[300px]" />
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#111112] py-20 text-white sm:py-24">
        <div className="page-container grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#FDBE4E]">Simple by design</span>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Goodbye to the bill-payment scramble.</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">Keep your naira close, make local transfers and handle your regular top-ups and bills in one place.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
            {[
              ["₦", "Receive naira"],
              ["↗", "Send a transfer"],
              ["▮", "Buy airtime & data"],
              ["⌂", "Pay home bills"],
            ].map(([icon, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDBE4E] text-xl font-black text-[#111112]">{icon}</span>
                <p className="mt-5 text-sm font-semibold sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#F6F1E9] px-7 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#FFD1B8]/70 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-4xl font-black tracking-tight sm:text-5xl">Make everyday money easier.</h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#5C5853] sm:text-lg">Get on the list for early access to Chipa.</p>
            <Button variant="black" onClick={openWaitlist} className="mt-7 h-auto rounded-full px-8 py-4 text-base font-semibold shadow-sm transition hover:scale-[1.02] sm:text-lg">Join the waitlist</Button>
          </div>
        </div>
      </section>
      <FAQ title={<>Frequently Asked<br />Questions</>} subtitle="Everything you need to know about using Chipa for everyday payments." items={LP2_FAQS} />
    </main>
  );
}

const LP2_FAQS = [
  { id: "what-is-chipa", question: "What is Chipa?", answer: "Chipa is an everyday money app for receiving naira, making local bank transfers, buying airtime and data, and paying electricity and cable TV bills." },
  { id: "what-can-i-pay", question: "What can I pay for with Chipa?", answer: "You can top up airtime and data, pay electricity bills, and renew supported cable TV subscriptions, all from the app." },
  { id: "when-launching", question: "When is Chipa launching?", answer: "We are preparing to welcome our first users. Join the waitlist to hear about early access and launch updates." },
  { id: "how-waitlist-works", question: "How does the waitlist work?", answer: "Leave your email on the waitlist and we will contact you with product updates and an invitation when access is available." },
];

function LP1() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -440 : 440;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#111111] overflow-x-hidden">
      <div className="bg-[#FCF9F4] h-24 w-full absolute top-0 left-0" />
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="bg-[#FCF9F4] pt-8 sm:pt-12 lg:pt-16">
        <div className="page-container grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8 min-h-[580px]">
          {/* Left Column: Headline, Copy & CTA */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center rise-in">
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-[4.75rem] xl:text-[5.25rem] text-[#111111] leading-[1.05] tracking-tight">
              Get paid globally.
              <br />
              Live <span className="text-[#FF793F]">locally.</span>
            </h1>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-[#525252] leading-relaxed max-w-xl">
              Receive, hold, convert and move your money across NGN, USD, EUR
              and GBP, all in one place.
            </p>

            <div className="mt-8 sm:mt-10">
              <Button
                variant="black"
                onClick={openWaitlist}
                className="rounded-full text-base sm:text-lg font-semibold px-8 sm:px-10 py-4 h-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                Join the waitlist
              </Button>
            </div>
          </div>

          {/* Right Column: Hero Lady Image */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end items-end relative">
            <div className="relative w-full max-w-[480px] lg:max-w-none">
              <img
                src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929861/CHIPA/landing-page/hero-lady_hm57zb.webp"
                alt="Smiling young woman using Chipa on her phone"
                className="w-full h-auto object-contain object-bottom select-none drop-shadow-sm"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 2: "Money, without the limits." & "One account..."            */}
      {/* ========================================================================= */}
      <section className="page-container py-12 sm:py-20 lg:py-24">
        {/* Intro Header with Verified Checkmark & Twinkle Sparkles */}
        <div className="relative max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          {/* Sparkles positioned according to design */}
          <div className="pointer-events-none absolute -top-8 left-1/3 text-black/70 animate-pulse">
            <TwinkleIcon className="w-5 h-5" />
          </div>
          <div className="pointer-events-none absolute -top-4 right-1/4 text-[#009A49] animate-pulse">
            <TwinkleIcon className="w-4 h-4 text-[#009A49]" />
          </div>
          <div className="pointer-events-none absolute top-1/2 -left-4 sm:-left-12 text-black/70 animate-pulse">
            <TwinkleIcon className="w-4 h-4" />
          </div>
          <div className="pointer-events-none absolute top-1/2 -right-4 sm:-right-12 text-black/70 animate-pulse">
            <TwinkleIcon className="w-4 h-4" />
          </div>

          {/* Verified Badge */}
          <div className="flex justify-center mb-5">
            <VerifiedIcon className="w-14 h-14 sm:w-16 sm:h-16 text-[#009A49] drop-shadow-sm" />
          </div>

          {/* Headline */}
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#111111] leading-[1.08] tracking-tight">
            Money, without
            <br />
            the <span className="text-[#009A49]">limits.</span>
          </h2>
        </div>

        {/* Feature Showcase Card: "One account. Multiple currencies." */}
        <div className="bg-[#FAF7F2] rounded-[2rem] sm:rounded-[2.75rem] lg:rounded-[3rem] p-8 sm:p-12 lg:p-16 border border-[#F0EBE1] overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center z-10">
              <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] text-[#111111] leading-[1.08] tracking-tight">
                One account. Multiple currencies.
              </h3>

              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[#555555] max-w-md leading-relaxed">
                Keep your naira, dollars, euros and pounds together without
                managing multiple apps.
              </p>

              <div className="mt-8 sm:mt-10">
                <Button
                  variant="outline"
                  onClick={openWaitlist}
                  className="rounded-full text-sm sm:text-base font-semibold px-7 sm:px-8 py-3.5 h-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm border-[#111111] text-[#111111] hover:bg-black hover:text-white"
                >
                  Join the waitlist
                </Button>
              </div>
            </div>

            {/* Right Column: Hand Holding Phone */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end items-end relative pt-4 lg:pt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] -mb-8 sm:-mb-12 lg:-mb-16">
                <img
                  src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929775/CHIPA/landing-page/hand-holds-phone-showing-home-screen_bi17d3.webp"
                  alt="Chipa multi-currency wallet displayed on smartphone in hand"
                  className="w-full h-auto object-contain object-bottom select-none drop-shadow-md"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. 2x2 FEATURE CARDS GRID                                               */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Card 1: Convert currencies in seconds */}
          <div className="bg-[#EEF8EE] rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 lg:p-12 border border-[#E0F0E0] flex flex-col justify-between overflow-hidden relative min-h-[580px] sm:min-h-[640px] group transition-transform duration-300 hover:-translate-y-1">
            <div>
              <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[2.6rem] text-[#111111] leading-[1.1] tracking-tight">
                Convert currencies
                <br />
                in seconds
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[#555555] max-w-sm leading-relaxed">
                Convert between USD, EUR, GBP and NGN at the cheapest rates.
              </p>
            </div>

            <div className="mt-8 flex justify-center items-end -mb-4 sm:-mb-6">
              <img
                src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929773/CHIPA/landing-page/convert-currencies_rpn8zk.webp"
                alt="Currency conversion calculator with live exchange rate"
                className="w-full max-w-[340px] sm:max-w-[380px] h-auto object-contain drop-shadow-sm select-none"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 2: Send money left, right, and center */}
          <div className="bg-[#EDF5FE] rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 lg:p-12 border border-[#DFEDFC] flex flex-col justify-between overflow-hidden relative min-h-[580px] sm:min-h-[640px] group transition-transform duration-300 hover:-translate-y-1">
            <div className="z-10 relative">
              <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[2.6rem] text-[#111111] leading-[1.1] tracking-tight">
                Send money left,
                <br />
                right, and center
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[#555555] max-w-sm leading-relaxed">
                Send money to friends and family effortlessly
              </p>
            </div>

            {/* Earth Illustration with Floating Atmosphere */}
            <div className="mt-8 relative flex justify-center items-end w-full">
              <div className="relative w-full max-w-[420px] sm:max-w-[480px] flex justify-center -mb-8 sm:-mb-12">
                <img
                  src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929773/CHIPA/landing-page/earth_a71kpe.webp"
                  alt="Planet earth globe representing global financial transfers"
                  className="w-full h-auto object-contain object-bottom select-none"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Virtual cards that gives confidence */}
          <div className="bg-[#F3EDFC] rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 lg:p-12 border border-[#EAE1F8] flex flex-col justify-between overflow-hidden relative min-h-[580px] sm:min-h-[640px] group transition-transform duration-300 hover:-translate-y-1">
            <div>
              <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[2.6rem] text-[#111111] leading-[1.1] tracking-tight">
                Virtual cards that
                <br />
                gives confidence
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[#555555] max-w-sm leading-relaxed">
                Create multiple virtual cards and spend as you like.
              </p>
            </div>

            <div className="mt-8 flex justify-center items-end -mb-4 sm:-mb-6">
              <img
                src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929778/CHIPA/landing-page/virtual-cards_vvvsai.webp"
                alt="Stacked Mastercard and Visa virtual debit cards"
                className="w-full max-w-[360px] sm:max-w-[420px] h-auto object-contain drop-shadow-md select-none"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 4: Subscribe and pay for your faves */}
          <div className="bg-[#FDF1EC] rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 lg:p-12 border border-[#FCE5DC] flex flex-col justify-between overflow-hidden relative min-h-[580px] sm:min-h-[640px] group transition-transform duration-300 hover:-translate-y-1">
            <div>
              <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-[2.6rem] text-[#111111] leading-[1.1] tracking-tight">
                Subscribe and pay
                <br />
                for your faves
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[#555555] max-w-sm leading-relaxed">
                Shop online, subscribe and spend internationally with ease.
              </p>
            </div>

            <div className="mt-8 flex justify-center items-end -mb-4 sm:-mb-6">
              <img
                src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929777/CHIPA/landing-page/subscription-apps_bwjizq.webp"
                alt="3D app icons for Netflix, YouTube, Spotify, Airbnb, Showmax, Apple, Canva, Amazon"
                className="w-full max-w-[360px] sm:max-w-[420px] h-auto object-contain drop-shadow-sm select-none"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "EVERYTHING YOU NEED IN ONE APP" CAROUSEL SECTION                     */}
      {/* ========================================================================= */}
      <section className="bg-[#0C0C0E] text-white py-20 sm:py-28 lg:py-32 overflow-hidden relative">
        <div className="page-container">
          {/* Header Row: Title & Navigation Arrows */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#FDBE4E] tracking-tight leading-[1.1]">
                Everything you
                <br />
                need in one app
              </h2>
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className="w-12 h-12 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition shadow-sm cursor-pointer"
                aria-label="Previous carousel item"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="w-12 h-12 rounded-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition shadow-sm cursor-pointer"
                aria-label="Next carousel item"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Carousel */}
          <div
            ref={carouselRef}
            className="flex items-stretch gap-6 sm:gap-8 overflow-x-auto scrollbar-none pb-6 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Card 1: Free local transfers */}
            <div className="w-[310px] sm:w-[370px] lg:w-[410px] shrink-0 snap-start bg-[#161618] rounded-[2.25rem] p-7 sm:p-8 border border-white/[0.07] flex flex-col justify-between overflow-hidden relative h-[560px] sm:h-[620px]">
              <div className="z-10 relative">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Free local transfers
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-400 leading-relaxed">
                  Transfer to banks in your country for free. No charges.
                </p>
              </div>

              {/* Watermark FREE */}
              <span className="absolute top-28 sm:top-32 left-1/2 -translate-x-1/2 font-display font-black text-5xl sm:text-6xl text-[#009A49]/30 uppercase tracking-wider select-none pointer-events-none z-0">
                FREE
              </span>

              {/* Transfer Sheet Mockup */}
              <div className="mt-8 z-10 w-full max-w-[310px] mx-auto bg-white rounded-t-[1.75rem] p-5 sm:p-6 text-gray-900 shadow-2xl border border-gray-100 -mb-7 sm:-mb-8 select-none">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-4" />
                  <span className="font-display font-bold text-2xl text-[#111111]">
                    ₦5,000
                  </span>
                  <span className="text-gray-400 text-xs font-semibold">✕</span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Bank</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#009A49]" />
                      OPAY
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Account Number</span>
                    <span className="font-mono font-medium text-gray-900">
                      904440488
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Name</span>
                    <span className="font-semibold text-gray-900 text-right">
                      ANGELA CHIOMA OKORO
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Stamp Duty</span>
                    <span className="text-gray-900">₦0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Fee</span>
                    <div>
                      <span className="line-through text-gray-400 mr-1.5">
                        ₦30.00
                      </span>
                      <span className="text-[#009A49] font-bold">FREE</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🇳🇬</span>
                    <span className="text-gray-600">Available Balance</span>
                  </div>
                  <span className="font-bold text-[#009A49]">₦2,800.00</span>
                </div>
              </div>
            </div>

            {/* Card 2: Buy Airtime */}
            <div className="w-[310px] sm:w-[370px] lg:w-[410px] shrink-0 snap-start bg-[#161618] rounded-[2.25rem] p-7 sm:p-8 border border-white/[0.07] flex flex-col justify-between overflow-hidden relative h-[560px] sm:h-[620px]">
              <div className="z-10 relative">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Buy Airtime
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-400 leading-relaxed">
                  Buy airtime at a discount whenever.
                </p>
              </div>

              {/* Watermark DISCOUNTED */}
              <span className="absolute top-28 sm:top-32 left-1/2 -translate-x-1/2 font-display font-black text-4xl sm:text-5xl text-[#FF793F]/25 uppercase tracking-wider select-none pointer-events-none z-0">
                DISCOUNTED
              </span>

              {/* Airtime Graphic */}
              <div className="mt-8 z-10 w-full flex justify-center items-end -mb-7 sm:-mb-8">
                <img
                  src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929772/CHIPA/landing-page/Airtime_uzyhtc.webp"
                  alt="Airtime purchase discount options"
                  className="w-full max-w-[310px] h-auto object-contain object-bottom select-none drop-shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Card 3: Buy Data */}
            <div className="w-[310px] sm:w-[370px] lg:w-[410px] shrink-0 snap-start bg-[#161618] rounded-[2.25rem] p-7 sm:p-8 border border-white/[0.07] flex flex-col justify-between overflow-hidden relative h-[560px] sm:h-[620px]">
              <div className="z-10 relative">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Buy Data
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-400 leading-relaxed">
                  Buy data and browse the internet with ease.
                </p>
              </div>

              {/* Watermark DISCOUNTED */}
              <span className="absolute top-28 sm:top-32 left-1/2 -translate-x-1/2 font-display font-black text-4xl sm:text-5xl text-[#FF793F]/25 uppercase tracking-wider select-none pointer-events-none z-0">
                DISCOUNTED
              </span>

              {/* Data Graphic */}
              <div className="mt-8 z-10 w-full flex justify-center items-end -mb-7 sm:-mb-8">
                <img
                  src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929774/CHIPA/landing-page/Data_kwwp0x.webp"
                  alt="Mobile internet data bundle options"
                  className="w-full max-w-[310px] h-auto object-contain object-bottom select-none drop-shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Card 4: Watch More */}
            <div className="w-[310px] sm:w-[370px] lg:w-[410px] shrink-0 snap-start bg-[#161618] rounded-[2.25rem] p-7 sm:p-8 border border-white/[0.07] flex flex-col justify-between overflow-hidden relative h-[560px] sm:h-[620px]">
              <div className="z-10 relative">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Watch More
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-400 leading-relaxed">
                  Pay for DSTV, GOTV, StarTimes, and more...
                </p>
              </div>

              {/* TV Provider Graphic */}
              <div className="mt-8 z-10 w-full flex justify-center items-end -mb-7 sm:-mb-8">
                <img
                  src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929776/CHIPA/landing-page/Select_Cable_seuhya.webp"
                  alt="Cable television providers"
                  className="w-full max-w-[310px] h-auto object-contain object-bottom select-none drop-shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Card 5: Keep the Lights On */}
            <div className="w-[310px] sm:w-[370px] lg:w-[410px] shrink-0 snap-start bg-[#161618] rounded-[2.25rem] p-7 sm:p-8 border border-white/[0.07] flex flex-col justify-between overflow-hidden relative h-[560px] sm:h-[620px]">
              <div className="z-10 relative">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  Keep the Lights On
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-400 leading-relaxed">
                  Pay your electricity bills in a few taps.
                </p>
              </div>

              {/* Electricity Graphic */}
              <div className="mt-8 z-10 w-full flex justify-center items-end -mb-7 sm:-mb-8">
                <img
                  src="https://res.cloudinary.com/dhtcwqsx4/image/upload/v1789929776/CHIPA/landing-page/Select_Electricity_dli34e.webp"
                  alt="Electricity utility bill providers"
                  className="w-full max-w-[310px] h-auto object-contain object-bottom select-none drop-shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQ />
    </main>
  );
}
