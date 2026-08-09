"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  pack: string;
  price: number;
  mrp: number;
  image: string;
  emoji: string;
  purchased: number;
};

type Cart = Record<number, number>;

const categories = [
  "Sparklers",
  "Flower Pots",
  "Chakkars",
  "Rockets",
  "Ground Spinners",
  "Bombs",
  "Gift Boxes",
  "Fancy Crackers",
  "Bhijili",
];

const products: Product[] = [
  {
    id: 1,
    name: "Green Sparklers",
    category: "Sparklers",
    pack: "10 sticks",
    price: 45,
    mrp: 60,
    image: "",
    emoji: "✨",
    purchased: 980,
  },
  {
    id: 2,
    name: "Aerial Sparklers",
    category: "Sparklers",
    pack: "10 sticks",
    price: 65,
    mrp: 80,
    image: "",
    emoji: "✨",
    purchased: 850,
  },
  {
    id: 3,
    name: "Electric Sparklers",
    category: "Sparklers",
    pack: "10 sticks",
    price: 80,
    mrp: 100,
    image: "",
    emoji: "⚡",
    purchased: 760,
  },
  {
    id: 4,
    name: "Golden Flower Pot",
    category: "Flower Pots",
    pack: "5 pieces",
    price: 120,
    mrp: 150,
    image: "",
    emoji: "🌸",
    purchased: 920,
  },
  {
    id: 5,
    name: "Flower Pots Small",
    category: "Flower Pots",
    pack: "10 pieces",
    price: 190,
    mrp: 220,
    image: "",
    emoji: "🌺",
    purchased: 650,
  },
  {
    id: 6,
    name: "Flower Pots Big",
    category: "Flower Pots",
    pack: "10 pieces",
    price: 262,
    mrp: 320,
    image: "",
    emoji: "🌸",
    purchased: 590,
  },
  {
    id: 7,
    name: "Flower Pots Special",
    category: "Flower Pots",
    pack: "10 pieces",
    price: 127,
    mrp: 145,
    image: "",
    emoji: "🌼",
    purchased: 520,
  },
  {
    id: 8,
    name: "Colour Koti",
    category: "Flower Pots",
    pack: "10 pieces",
    price: 145,
    mrp: 165,
    image: "",
    emoji: "🎆",
    purchased: 490,
  },
  {
    id: 9,
    name: "Colour Koti Deluxe",
    category: "Flower Pots",
    pack: "10 pieces",
    price: 260,
    mrp: 340,
    image: "",
    emoji: "🎇",
    purchased: 440,
  },
  {
    id: 10,
    name: "Chakkaram Big",
    category: "Chakkars",
    pack: "10 pieces",
    price: 140,
    mrp: 180,
    image: "",
    emoji: "🌀",
    purchased: 830,
  },
  {
    id: 11,
    name: "Chakkaram Special",
    category: "Chakkars",
    pack: "10 pieces",
    price: 305,
    mrp: 375,
    image: "",
    emoji: "🌀",
    purchased: 700,
  },
  {
    id: 12,
    name: "Chakkar Supreme",
    category: "Chakkars",
    pack: "6 pieces",
    price: 80,
    mrp: 100,
    image: "",
    emoji: "💫",
    purchased: 610,
  },
  {
    id: 13,
    name: "Rocket Bomb",
    category: "Rockets",
    pack: "10 pieces",
    price: 180,
    mrp: 220,
    image: "",
    emoji: "🚀",
    purchased: 780,
  },
  {
    id: 14,
    name: "Whistling Rocket",
    category: "Rockets",
    pack: "5 pieces",
    price: 150,
    mrp: 190,
    image: "",
    emoji: "🚀",
    purchased: 520,
  },
  {
    id: 15,
    name: "Ground Spinner",
    category: "Ground Spinners",
    pack: "10 pieces",
    price: 110,
    mrp: 140,
    image: "",
    emoji: "🌪️",
    purchased: 690,
  },
  {
    id: 16,
    name: "Fancy Ground Spinner",
    category: "Ground Spinners",
    pack: "5 pieces",
    price: 160,
    mrp: 200,
    image: "",
    emoji: "🌀",
    purchased: 540,
  },
  {
    id: 17,
    name: "Color Bomb Pack",
    category: "Bombs",
    pack: "10 pieces",
    price: 150,
    mrp: 180,
    image: "",
    emoji: "💥",
    purchased: 880,
  },
  {
    id: 18,
    name: "Atom Bomb",
    category: "Bombs",
    pack: "10 pieces",
    price: 210,
    mrp: 260,
    image: "",
    emoji: "💥",
    purchased: 630,
  },
  {
    id: 19,
    name: "Diwali Gift Box",
    category: "Gift Boxes",
    pack: "1 box",
    price: 599,
    mrp: 799,
    image: "",
    emoji: "🎁",
    purchased: 740,
  },
  {
    id: 20,
    name: "Premium Gift Box",
    category: "Gift Boxes",
    pack: "1 box",
    price: 999,
    mrp: 1299,
    image: "",
    emoji: "🎁",
    purchased: 460,
  },
  {
    id: 21,
    name: "Fancy Crackers Combo",
    category: "Fancy Crackers",
    pack: "1 combo",
    price: 450,
    mrp: 600,
    image: "",
    emoji: "🎆",
    purchased: 720,
  },
  {
    id: 22,
    name: "Deluxe Fancy Combo",
    category: "Fancy Crackers",
    pack: "1 combo",
    price: 750,
    mrp: 950,
    image: "",
    emoji: "🎇",
    purchased: 580,
  },
  {
    id: 23,
    name: "Bhijili Crackers",
    category: "Bhijili",
    pack: "10 pieces",
    price: 95,
    mrp: 120,
    image: "",
    emoji: "💥",
    purchased: 960,
  },
  {
    id: 24,
    name: "Bhijili Special",
    category: "Bhijili",
    pack: "10 pieces",
    price: 145,
    mrp: 180,
    image: "",
    emoji: "🔥",
    purchased: 890,
  },
];

const bestSellers = [...products]
  .sort((a, b) => b.purchased - a.purchased)
  .slice(0, 5);

function discount(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}

/* =========================================================
   FIREWORK TAP EFFECT
========================================================= */

function useFireworkTap() {
  const createFirework = (x: number, y: number) => {
    const container = document.createElement("div");

    container.style.position = "fixed";
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.pointerEvents = "none";
    container.style.zIndex = "999999";
    container.style.transform = "translate(-50%, -50%)";

    document.body.appendChild(container);

    const center = document.createElement("div");

    center.style.position = "absolute";
    center.style.left = "0";
    center.style.top = "0";
    center.style.width = "10px";
    center.style.height = "10px";
    center.style.borderRadius = "50%";
    center.style.background = "#fff";
    center.style.boxShadow =
      "0 0 8px #fff, 0 0 18px #ffd700, 0 0 35px #ff8c00";

    center.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2)",
          opacity: 1,
        },
        {
          transform: "translate(-50%, -50%) scale(2.5)",
          opacity: 0,
        },
      ],
      {
        duration: 450,
        easing: "ease-out",
        fill: "forwards",
      },
    );

    container.appendChild(center);

    const sparkCount = 36;

    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement("span");

      const angle =
        (Math.PI * 2 * i) / sparkCount +
        (Math.random() - 0.5) * 0.12;

      const distance = 35 + Math.random() * 65;

      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const size = 2 + Math.random() * 3;

      const colors = [
        "#ffffff",
        "#ffd700",
        "#ffb300",
        "#ff8c00",
      ];

      const color =
        colors[Math.floor(Math.random() * colors.length)];

      spark.style.position = "absolute";
      spark.style.left = "0";
      spark.style.top = "0";
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      spark.style.borderRadius = "50%";
      spark.style.background = color;
      spark.style.boxShadow =
        `0 0 6px ${color}, 0 0 12px ${color}`;

      spark.animate(
        [
          {
            transform: "translate(0, 0) scale(1)",
            opacity: 1,
          },
          {
            transform:
              `translate(${dx}px, ${dy}px) scale(0.1)`,
            opacity: 0,
          },
        ],
        {
          duration: 650 + Math.random() * 450,
          easing: "cubic-bezier(0.1, 0.7, 0.3, 1)",
          fill: "forwards",
        },
      );

      container.appendChild(spark);
    }

    setTimeout(() => {
      container.remove();
    }, 1300);
  };

  const shouldIgnore = (
    target: EventTarget | null,
  ) => {
    const el = target as HTMLElement | null;

    return Boolean(
      el?.closest("input") ||
        el?.closest("textarea") ||
        el?.closest("select") ||
        el?.closest("button") ||
        el?.closest("a"),
    );
  };

  return (event: PointerEvent) => {
    if (shouldIgnore(event.target)) return;

    createFirework(
      event.clientX,
      event.clientY,
    );
  };
}

/* =========================================================
   MAIN
========================================================= */

export default function Home() {
  const [cart, setCart] = useState<Cart>({});
  const [showTop, setShowTop] = useState(false);

  /* BEST SELLER CAROUSEL */

  const [bestSellerIndex, setBestSellerIndex] =
    useState(0);

  const [showProductPopup, setShowProductPopup] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleFireworkTap = useFireworkTap();

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  /* =====================================================
     AUTO BEST SELLER ROTATION
  ===================================================== */

  useEffect(() => {
    if (showProductPopup || isDragging) return;

    const timer = window.setInterval(() => {
      setBestSellerIndex((previous) =>
        (previous + 1) % bestSellers.length,
      );
    }, 2400);

    return () => window.clearInterval(timer);
  }, [showProductPopup, isDragging]);

  /* =====================================================
     PAGE SCROLL
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 500);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
  }, []);

  /* =====================================================
     CART
  ===================================================== */

  const updateQuantity = (
    id: number,
    change: number,
  ) => {
    setCart((previous) => {
      const current = previous[id] || 0;
      const next = Math.max(
        0,
        current + change,
      );

      const updated = {
        ...previous,
      };

      if (next === 0) {
        delete updated[id];
      } else {
        updated[id] = next;
      }

      return updated;
    });
  };

  const addToCart = (id: number) => {
    setCart((previous) => ({
      ...previous,
      [id]: (previous[id] || 0) + 1,
    }));
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const scrollToSection = (
    id: string,
    offset = 0,
  ) => {
    const element =
      document.getElementById(id);

    if (!element) return;

    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     BEST SELLER SWIPE
  ===================================================== */

  const goNextBestSeller = () => {
    setBestSellerIndex(
      (previous) =>
        (previous + 1) % bestSellers.length,
    );
  };

  const goPreviousBestSeller = () => {
    setBestSellerIndex(
      (previous) =>
        (previous - 1 + bestSellers.length) %
        bestSellers.length,
    );
  };

  const handleBannerPointerDown = (
    event: PointerEvent,
  ) => {
    touchStartX.current =
      event.clientX;

    touchStartY.current =
      event.clientY;

    setIsDragging(false);
  };

  const handleBannerPointerUp = (
    event: PointerEvent,
  ) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const deltaX =
      event.clientX - touchStartX.current;

    const deltaY =
      event.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (
      Math.abs(deltaX) < 40 ||
      Math.abs(deltaX) < Math.abs(deltaY)
    ) {
      return;
    }

    setIsDragging(true);

    if (deltaX < 0) {
      goNextBestSeller();
    } else {
      goPreviousBestSeller();
    }

    window.setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  const openProductPopup = (
    product: Product,
  ) => {
    if (isDragging) return;

    setSelectedProduct(product);
    setShowProductPopup(true);
  };

  const currentBestSeller =
    bestSellers[bestSellerIndex];

  return (
    <main
      className="min-h-screen bg-white text-zinc-900"
      onPointerDown={handleFireworkTap}
      style={{
        touchAction: "manipulation",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">

          {/* LOGO */}

          <button
            type="button"
            onClick={goHome}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-lg shadow-sm">
              🎆
            </div>

            <div className="leading-tight">
              <div className="font-serif text-base font-bold text-red-700 sm:text-lg">
                Sivakasi Crackers
              </div>

              <div className="text-[9px] font-semibold tracking-wide text-orange-500 sm:text-[10px]">
                PREMIUM FIREWORKS
              </div>
            </div>
          </button>

          {/* RIGHT */}

          <div className="flex items-center gap-1 sm:gap-3">

            {/* LOCATION */}

            <a
              href="https://goo.gl/maps/4dTnVHoPRWjL1h487"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open our shop location in Google Maps"
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-red-50 sm:flex"
            >
              {/* ANIMATED PIN */}

              <div className="relative flex h-11 w-10 items-center justify-center">
                {/* Floating shadow */}

                <div className="absolute bottom-0 h-2 w-8 rounded-full bg-red-500/20 blur-[2px] animate-[pinShadow_2s_ease-in-out_infinite]" />

                {/* Pin */}

                <div className="animate-[pinFloat_2s_ease-in-out_infinite]">
                  <div className="animate-[pinRotate_2s_ease-in-out_infinite] text-3xl">
                    📍
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-medium text-zinc-500">
                  Our Shop
                </div>

                <span className="block text-xs font-semibold text-zinc-800">
                  Sivakasi, Tamil Nadu
                </span>
              </div>
            </a>

            <div className="hidden h-7 w-px bg-zinc-200 sm:block" />

            {/* SEARCH */}

            <div className="flex h-9 items-center rounded-full border border-zinc-200 bg-white px-3 transition focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100">
              <span className="mr-2 text-base text-zinc-500">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search crackers"
                className="w-24 bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400 sm:w-36"
              />
            </div>

            {/* CART */}

            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Cart"
              onClick={() =>
                scrollToSection(
                  "cart-summary",
                  80,
                )
              }
            >
              🛒

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SALE BAR */}

      <div className="bg-red-700 px-4 py-2.5 text-center text-xs font-semibold text-white sm:text-sm">
        🎉 Diwali Season Sale — Up to 30% OFF
      </div>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        id="home"
        className="relative min-h-[570px] overflow-hidden bg-black"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero-bg.png')",
          }}
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        <div className="absolute inset-0 shadow-[inset_0_0_160px_55px_rgba(0,0,0,0.65)]" />

        <div className="relative z-10 mx-auto flex min-h-[570px] max-w-7xl items-center px-5 py-20 sm:px-8">
          <div className="max-w-2xl">

            <div className="mb-6 inline-flex rounded-full border border-orange-400/50 bg-black/40 px-4 py-2 text-xs font-bold tracking-wider text-orange-400 backdrop-blur-sm">
              ✨ DIWALI 2026 — CELEBRATE IN STYLE
            </div>

            <h1 className="font-serif text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Light Up the{" "}
              <span className="text-orange-400">
                Night Sky
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">
              Premium quality crackers straight
              from Sivakasi. Trusted by families
              across India for years. Safe,
              spectacular, and delivered to your door.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "products",
                    70,
                  )
                }
                className="rounded-lg bg-red-600 px-7 py-3 font-bold text-white shadow-lg transition hover:bg-red-700"
              >
                Shop Now →
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "categories",
                    70,
                  )
                }
                className="rounded-lg border border-white/30 bg-white/10 px-7 py-3 font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                View Categories
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-200">
              <span>🚚 Free shipping ₹500+</span>
              <span>✅ Quality assured</span>
              <span>🔒 Secure payment</span>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          CATEGORIES
      ================================================= */}

      <section
        id="categories"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8"
      >
        <div className="mb-6">
          <h2 className="font-serif text-3xl font-bold">
            Shop by Category
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                scrollToSection(
                  category
                    .toLowerCase()
                    .replaceAll(
                      " ",
                      "-",
                    ),
                  75,
                )
              }
              className="group rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
            >
              <div className="mb-2 text-3xl">
                {category === "Sparklers" && "✨"}
                {category === "Flower Pots" && "🌸"}
                {category === "Chakkars" && "🌀"}
                {category === "Rockets" && "🚀"}
                {category === "Ground Spinners" && "🌪️"}
                {category === "Bombs" && "💥"}
                {category === "Gift Boxes" && "🎁"}
                {category === "Fancy Crackers" && "🎆"}
                {category === "Bhijili" && "🔥"}
              </div>

              <div className="text-xs font-bold group-hover:text-red-600">
                {category}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =================================================
          BEST SELLER BANNER
      ================================================= */}

      <section
        id="products"
        className="bg-zinc-50 px-4 py-10 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold">
                Best Sellers
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Most loved by our customers this season
              </p>
            </div>

            <span className="hidden text-sm font-semibold text-red-600 sm:block">
              Swipe to explore →
            </span>
          </div>

          {/* BANNER */}

          <div
            className="relative select-none overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md"
            onPointerDown={handleBannerPointerDown}
            onPointerUp={handleBannerPointerUp}
            onPointerCancel={() => {
              touchStartX.current = null;
              touchStartY.current = null;
            }}
            style={{
              touchAction: "pan-y",
            }}
          >

            {/* PRODUCT */}

            <button
              type="button"
              onClick={() =>
                openProductPopup(
                  currentBestSeller,
                )
              }
              className="relative block w-full text-left"
            >
              <div className="grid min-h-[235px] grid-cols-[115px_1fr] items-center gap-5 p-5 sm:grid-cols-[230px_1fr] sm:p-8">

                {/* IMAGE */}

                <div className="flex h-36 w-full items-center justify-center rounded-xl bg-zinc-950 text-7xl sm:h-48 sm:text-8xl">
                  {currentBestSeller.emoji}
                </div>

                {/* DETAILS */}

                <div className="min-w-0">

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase text-orange-700">
                      Best Seller
                    </span>

                    <span className="text-xs font-semibold text-green-600">
                      {currentBestSeller.purchased}+ sold
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-orange-600">
                    {currentBestSeller.category}
                  </div>

                  <h3 className="mt-1 text-xl font-bold text-zinc-900 sm:text-3xl">
                    {currentBestSeller.name}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {currentBestSeller.pack}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-2xl font-bold text-red-600">
                      ₹{currentBestSeller.price}
                    </span>

                    <del className="text-sm text-zinc-400">
                      ₹{currentBestSeller.mrp}
                    </del>

                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                      {discount(
                        currentBestSeller.price,
                        currentBestSeller.mrp,
                      )}
                      % OFF
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-zinc-500">
                    👆 Tap to view product
                  </p>
                </div>
              </div>
            </button>

            {/* PREVIOUS */}

            <button
              type="button"
              aria-label="Previous best seller"
              onClick={goPreviousBestSeller}
              className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-md hover:bg-white sm:flex"
            >
              ‹
            </button>

            {/* NEXT */}

            <button
              type="button"
              aria-label="Next best seller"
              onClick={goNextBestSeller}
              className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-md hover:bg-white sm:flex"
            >
              ›
            </button>

            {/* DOTS */}

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {bestSellers.map(
                (product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    aria-label={`Show ${product.name}`}
                    onClick={() =>
                      setBestSellerIndex(index)
                    }
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === bestSellerIndex
                        ? "w-7 bg-red-600"
                        : "w-1.5 bg-zinc-300"
                    }`}
                  />
                ),
              )}
            </div>

            {/* TINY AUTO-PROGRESS BAR */}

            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-zinc-100">
              <div
                key={bestSellerIndex}
                className="h-full bg-red-600"
                style={{
                  animation:
                    "bestSellerProgress 2400ms linear",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          CATEGORY PRODUCTS
      ================================================= */}

      <section
        id="category-products"
        className="bg-white"
      >
        {categories.map((category) => {
          const categoryProducts =
            products.filter(
              (product) =>
                product.category ===
                category,
            );

          if (
            categoryProducts.length === 0
          ) {
            return null;
          }

          const sectionId = category
            .toLowerCase()
            .replaceAll(" ", "-");

          return (
            <div
              key={category}
              id={sectionId}
              className="scroll-mt-20 border-b border-zinc-200"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 sm:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                  <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-white">
                    {category}
                  </h2>

                  <span className="text-xs font-semibold text-white/90">
                    {categoryProducts.length} Products
                  </span>
                </div>
              </div>

              <div className="mx-auto max-w-7xl px-3 sm:px-8">
                {categoryProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border-b border-zinc-100 py-3 sm:grid-cols-[90px_1.7fr_130px_120px_150px]"
                    >
                      <div className="flex h-16 w-[72px] items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-3xl sm:h-20 sm:w-[90px]">
                        {product.emoji}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-zinc-900 sm:text-base">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {product.pack}
                        </p>

                        <div className="mt-1 text-xs font-semibold text-green-600">
                          In Stock
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <div className="text-sm text-zinc-400">
                          MRP{" "}
                          <del>
                            ₹{product.mrp}
                          </del>
                        </div>

                        <div className="font-bold text-red-600">
                          ₹{product.price}
                        </div>
                      </div>

                      <div className="hidden text-center sm:block">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          {discount(
                            product.price,
                            product.mrp,
                          )}
                          % OFF
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                        <div className="flex h-9 items-center rounded-lg border border-zinc-300 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                -1,
                              )
                            }
                            className="flex h-full w-8 items-center justify-center text-lg font-bold hover:bg-zinc-100"
                          >
                            −
                          </button>

                          <span className="w-7 text-center text-sm font-semibold">
                            {cart[
                              product.id
                            ] || 0}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                1,
                              )
                            }
                            className="flex h-full w-8 items-center justify-center text-lg font-bold hover:bg-zinc-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              product.id,
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-red-700 sm:px-4 sm:text-xs"
                        >
                          Add to Cart
                        </button>
                      </div>

                      <div className="col-span-2 flex items-center gap-2 sm:hidden">
                        <span className="font-bold text-red-600">
                          ₹{product.price}
                        </span>

                        <del className="text-xs text-zinc-400">
                          ₹{product.mrp}
                        </del>

                        <span className="text-xs font-bold text-orange-600">
                          {discount(
                            product.price,
                            product.mrp,
                          )}
                          % OFF
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* =================================================
          CART
      ================================================= */}

      <section
        id="cart-summary"
        className="mx-auto max-w-7xl px-5 py-12 sm:px-8"
      >
        <div className="rounded-2xl bg-zinc-950 p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-zinc-400">
                Your Cart
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold">
                {cartCount === 0
                  ? "Your cart is empty"
                  : `${cartCount} item${
                      cartCount > 1
                        ? "s"
                        : ""
                    } in your cart`}
              </h2>
            </div>

            {cartCount > 0 && (
              <button
                type="button"
                className="rounded-lg bg-red-600 px-6 py-3 font-bold transition hover:bg-red-700"
                onClick={() =>
                  alert(
                    "Checkout will be connected next.",
                  )
                }
              >
                View Cart →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          WHY CHOOSE US
      ================================================= */}

      <section className="bg-zinc-950 px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-serif text-3xl font-bold">
            Why Choose{" "}
            <span className="text-orange-400">
              Sivakasi Crackers?
            </span>
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [
                "🏅",
                "Quality Assured",
                "Premium quality products",
              ],
              [
                "🛒",
                "Easy Ordering",
                "No account required",
              ],
              [
                "🔒",
                "Secure Payment",
                "Safe checkout",
              ],
              [
                "⚡",
                "Fast Processing",
                "Quick order confirmation",
              ],
              [
                "🤝",
                "Customer Support",
                "WhatsApp & phone support",
              ],
            ].map(
              ([icon, title, description]) => (
                <div
                  key={title}
                  className="text-center"
                >
                  <div className="text-4xl">
                    {icon}
                  </div>

                  <h3 className="mt-3 font-bold">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    {description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="relative overflow-hidden bg-red-700 px-5 py-16 text-center text-white">
        <div className="absolute inset-0 opacity-10">
          ✨　🎆　✨　🎇　✨　🎆　✨
        </div>

        <div className="relative">
          <h2 className="font-serif text-4xl font-bold">
            Ready to Celebrate?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Shop our full range of premium
            crackers and make this Diwali the
            most spectacular one yet.
          </p>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "products",
                70,
              )
            }
            className="mt-7 rounded-xl bg-white px-7 py-4 font-bold text-red-700 shadow-lg transition hover:scale-105"
          >
            Browse All Products →
          </button>
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="bg-zinc-900 px-5 py-12 text-zinc-300 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">

          <div>
            <div className="font-serif text-xl font-bold text-white">
              Sivakasi Crackers
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              India's trusted source for
              premium-quality crackers.
              Celebrating every festival with
              safe, brilliant and affordable
              fireworks.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white">
              Categories
            </h3>

            <div className="mt-3 space-y-2 text-sm">
              {categories
                .slice(0, 6)
                .map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        category
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-",
                          ),
                        70,
                      )
                    }
                    className="block transition hover:text-orange-400"
                  >
                    {category}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">
              Quick Links
            </h3>

            <div className="mt-3 space-y-2 text-sm">
              <button
                type="button"
                onClick={goHome}
                className="block hover:text-orange-400"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "products",
                    70,
                  )
                }
                className="block hover:text-orange-400"
              >
                All Products
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "cart-summary",
                    70,
                  )
                }
                className="block hover:text-orange-400"
              >
                Cart
              </button>

              <span className="block">
                Terms & Conditions
              </span>

              <span className="block">
                Privacy Policy
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">
              Contact Us
            </h3>

            <div className="mt-3 space-y-3 text-sm text-zinc-400">
              <p>
                📍 Fireworks Market, Sivakasi
              </p>

              <p>
                📞 +91 45622 34567
              </p>

              <p>
                💬 WhatsApp: 98765 43210
              </p>

              <p>
                ✉️ hello@sivakasicrackers.in
              </p>
            </div>
          </div>

        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-zinc-800 pt-6 text-xs text-zinc-500">
          © 2026 Sivakasi Crackers. All rights reserved.
        </div>
      </footer>

      {/* =================================================
          BACK TO TOP
      ================================================= */}

      {showTop && (
        <button
          type="button"
          onClick={goHome}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white shadow-xl transition hover:scale-110 hover:bg-red-700"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      {/* =================================================
          PRODUCT POPUP
      ================================================= */}

      {showProductPopup &&
        selectedProduct && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            onClick={() =>
              setShowProductPopup(false)
            }
          >
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setShowProductPopup(false)
                }
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white backdrop-blur-md"
                aria-label="Close product"
              >
                ×
              </button>

              {/* IMAGE */}

              <div className="flex h-64 items-center justify-center bg-zinc-950 text-9xl">
                {selectedProduct.emoji}
              </div>

              <div className="p-6">

                <div className="text-xs font-bold uppercase text-orange-600">
                  {selectedProduct.category}
                </div>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedProduct.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {selectedProduct.pack}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    ₹{selectedProduct.price}
                  </span>

                  <del className="text-sm text-zinc-400">
                    ₹{selectedProduct.mrp}
                  </del>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    {discount(
                      selectedProduct.price,
                      selectedProduct.mrp,
                    )}
                    % OFF
                  </span>
                </div>

                <div className="mt-3 text-sm font-semibold text-green-600">
                  ✓ In Stock
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart(
                      selectedProduct.id,
                    );
                    setShowProductPopup(false);
                  }}
                  className="mt-6 w-full rounded-xl bg-red-600 py-4 font-bold text-white shadow-lg transition hover:bg-red-700"
                >
                  🛒 Add to Cart
                </button>

              </div>
            </div>
          </div>
        )}

      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style jsx global>{`
        @keyframes pinFloat {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes pinRotate {
          0% {
            transform: rotate(-8deg);
          }

          25% {
            transform: rotate(8deg);
          }

          50% {
            transform: rotate(-5deg);
          }

          75% {
            transform: rotate(6deg);
          }

          100% {
            transform: rotate(-8deg);
          }
        }

        @keyframes pinShadow {
          0%,
          100% {
            transform: scaleX(1);
            opacity: 0.25;
          }

          50% {
            transform: scaleX(0.65);
            opacity: 0.12;
          }
        }

        @keyframes bestSellerProgress {
          from {
            width: 0%;
          }

          to {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}