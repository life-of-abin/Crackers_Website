"use client";

import { useEffect, useState } from "react";

/* =========================================================
   TYPES
   ========================================================= */

type Product = {
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  discount: string;
  quantity: string;
  badge: string;
  purchases: number;
};


/* =========================================================
   CLICK / TAP FIREWORK EFFECT
   ========================================================= */
function FireworkTouchEffect() {
  useEffect(() => {
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

      // Bright center flash
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
        }
      );

      container.appendChild(center);

      // Main explosion
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
        spark.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`;

        spark.animate(
          [
            {
              transform: "translate(0, 0) scale(1)",
              opacity: 1,
            },
            {
              transform: `translate(${dx}px, ${dy}px) scale(0.1)`,
              opacity: 0,
            },
          ],
          {
            duration: 650 + Math.random() * 450,
            easing: "cubic-bezier(0.1, 0.7, 0.3, 1)",
            fill: "forwards",
          }
        );

        container.appendChild(spark);
      }

      // Small secondary sparks
      setTimeout(() => {
        for (let i = 0; i < 18; i++) {
          const spark = document.createElement("span");

          const angle = Math.random() * Math.PI * 2;
          const distance = 25 + Math.random() * 85;

          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;

          spark.style.position = "absolute";
          spark.style.left = "0";
          spark.style.top = "0";
          spark.style.width = "2px";
          spark.style.height = "2px";
          spark.style.borderRadius = "50%";
          spark.style.background = "#fff";
          spark.style.boxShadow =
            "0 0 5px #fff, 0 0 10px #ffd700";

          spark.animate(
            [
              {
                transform: "translate(0, 0) scale(1)",
                opacity: 1,
              },
              {
                transform: `translate(${dx}px, ${dy}px) scale(0)`,
                opacity: 0,
              },
            ],
            {
              duration: 500 + Math.random() * 400,
              easing: "ease-out",
              fill: "forwards",
            }
          );

          container.appendChild(spark);
        }
      }, 80);

      // Remove after animation
      setTimeout(() => {
        container.remove();
      }, 1300);
    };

    // ==========================================
    // DESKTOP + MOBILE POINTER
    // ==========================================

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest("input") ||
        target?.closest("textarea") ||
        target?.closest("select")
      ) {
        return;
      }

      createFirework(
        event.clientX,
        event.clientY
      );
    };

    // ==========================================
    // DIRECT MOBILE TOUCH SUPPORT
    // ==========================================

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.closest("input") ||
        target?.closest("textarea") ||
        target?.closest("select")
      ) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      createFirework(
        touch.clientX,
        touch.clientY
      );
    };

    // Desktop / modern browsers
    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      {
        passive: true,
      }
    );

    // Direct mobile touch
    document.addEventListener(
      "touchstart",
      handleTouchStart,
      {
        passive: true,
      }
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "touchstart",
        handleTouchStart
      );
    };
  }, []);

  return null;
}
/* =========================================================
   HOME PAGE
   ========================================================= */

export default function Home() {

  /* =======================================================
     CART
     ======================================================= */

  const [cartCount, setCartCount] = useState(0);

  const [addedProduct, setAddedProduct] = useState<string | null>(null);


  const addToCart = (product: Product) => {
    setCartCount((current) => current + 1);

    setAddedProduct(product.name);

    setTimeout(() => {
      setAddedProduct(null);
    }, 1200);
  };


  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categories = [
    {
      name: "Bijili",
      icon: "🧨",
      id: "bijili",
    },
    {
      name: "Sparklers",
      icon: "✨",
      id: "sparklers",
    },
    {
      name: "Flower Pots",
      icon: "🌸",
      id: "flower-pots",
    },
    {
      name: "Chakkars",
      icon: "🌀",
      id: "chakkars",
    },
    {
      name: "Rockets",
      icon: "🚀",
      id: "rockets",
    },
    {
      name: "Ground Spinners",
      icon: "☄️",
      id: "ground-spinners",
    },
    {
      name: "Bombs",
      icon: "💥",
      id: "bombs",
    },
    {
      name: "Gift Boxes",
      icon: "🎁",
      id: "gift-boxes",
    },
    {
      name: "Fancy Crackers",
      icon: "🎆",
      id: "fancy-crackers",
    },
  ];


  /* =======================================================
     PRODUCTS
     ======================================================= */

  const products: Product[] = [
     /* BIJILI */

    {
      name: "Bijili Crackers",
      category: "Bijili",
      price: 80,
      oldPrice: 100,
      discount: "20%",
      quantity: "100 pieces",
      badge: "Fan Favourite",
      purchases: 680,
    },

    {
      name: "Special Bijili",
      category: "Bijili",
      price: 110,
      oldPrice: 140,
      discount: "21%",
      quantity: "100 pieces",
      badge: "Popular",
      purchases: 520,
    },

    {
      name: "Deluxe Bijili",
      category: "Bijili",
      price: 150,
      oldPrice: 190,
      discount: "21%",
      quantity: "100 pieces",
      badge: "Premium",
      purchases: 390,
    },


    /* SPARKLERS */

    {
      name: "Green Sparklers",
      category: "Sparklers",
      price: 45,
      oldPrice: 60,
      discount: "25%",
      quantity: "10 sticks",
      badge: "Best Seller",
      purchases: 580,
    },

    {
      name: "Golden Sparklers",
      category: "Sparklers",
      price: 55,
      oldPrice: 70,
      discount: "21%",
      quantity: "10 sticks",
      badge: "Popular",
      purchases: 430,
    },

    {
      name: "Electric Sparklers",
      category: "Sparklers",
      price: 75,
      oldPrice: 95,
      discount: "21%",
      quantity: "10 sticks",
      badge: "",
      purchases: 290,
    },

    {
      name: "Aerial Sparklers",
      category: "Sparklers",
      price: 65,
      oldPrice: 80,
      discount: "19%",
      quantity: "10 sticks",
      badge: "",
      purchases: 350,
    },


    /* FLOWER POTS */

    {
      name: "Golden Flower Pot",
      category: "Flower Pots",
      price: 120,
      oldPrice: 150,
      discount: "20%",
      quantity: "5 pieces",
      badge: "Fan Favourite",
      purchases: 510,
    },

    {
      name: "Color Flower Pot",
      category: "Flower Pots",
      price: 140,
      oldPrice: 175,
      discount: "20%",
      quantity: "5 pieces",
      badge: "",
      purchases: 390,
    },

    {
      name: "Big Fountain",
      category: "Flower Pots",
      price: 180,
      oldPrice: 220,
      discount: "18%",
      quantity: "3 pieces",
      badge: "Popular",
      purchases: 270,
    },


    /* CHAKKARS */

    {
      name: "Chakkar Supreme",
      category: "Chakkars",
      price: 80,
      oldPrice: 100,
      discount: "20%",
      quantity: "6 pieces",
      badge: "Best Seller",
      purchases: 470,
    },

    {
      name: "Deluxe Chakkar",
      category: "Chakkars",
      price: 110,
      oldPrice: 140,
      discount: "21%",
      quantity: "6 pieces",
      badge: "",
      purchases: 250,
    },

    {
      name: "Color Chakkar",
      category: "Chakkars",
      price: 95,
      oldPrice: 120,
      discount: "21%",
      quantity: "6 pieces",
      badge: "",
      purchases: 210,
    },


    /* ROCKETS */

    {
      name: "Sky Rocket",
      category: "Rockets",
      price: 150,
      oldPrice: 190,
      discount: "21%",
      quantity: "5 rockets",
      badge: "Popular",
      purchases: 440,
    },

    {
      name: "Multi Colour Rocket",
      category: "Rockets",
      price: 200,
      oldPrice: 250,
      discount: "20%",
      quantity: "5 rockets",
      badge: "",
      purchases: 320,
    },

    {
      name: "Whistling Rocket",
      category: "Rockets",
      price: 175,
      oldPrice: 220,
      discount: "20%",
      quantity: "5 rockets",
      badge: "",
      purchases: 180,
    },


    /* GROUND SPINNERS */

    {
      name: "Ground Spinner",
      category: "Ground Spinners",
      price: 60,
      oldPrice: 80,
      discount: "25%",
      quantity: "5 pieces",
      badge: "Popular",
      purchases: 360,
    },

    {
      name: "Color Spinner",
      category: "Ground Spinners",
      price: 90,
      oldPrice: 110,
      discount: "18%",
      quantity: "5 pieces",
      badge: "",
      purchases: 240,
    },

    {
      name: "Turbo Spinner",
      category: "Ground Spinners",
      price: 110,
      oldPrice: 140,
      discount: "21%",
      quantity: "5 pieces",
      badge: "",
      purchases: 190,
    },


    /* BOMBS */

    {
      name: "Color Bomb Pack",
      category: "Bombs",
      price: 150,
      oldPrice: 180,
      discount: "17%",
      quantity: "10 pieces",
      badge: "Best Seller",
      purchases: 620,
    },

    {
      name: "Atom Bomb",
      category: "Bombs",
      price: 180,
      oldPrice: 220,
      discount: "18%",
      quantity: "10 pieces",
      badge: "",
      purchases: 330,
    },

    {
      name: "Thunder Bomb",
      category: "Bombs",
      price: 200,
      oldPrice: 250,
      discount: "20%",
      quantity: "10 pieces",
      badge: "",
      purchases: 280,
    },


    /* GIFT BOXES */

    {
      name: "Family Gift Box",
      category: "Gift Boxes",
      price: 999,
      oldPrice: 1300,
      discount: "23%",
      quantity: "Combo Pack",
      badge: "Best Seller",
      purchases: 740,
    },

    {
      name: "Premium Gift Box",
      category: "Gift Boxes",
      price: 1499,
      oldPrice: 1900,
      discount: "21%",
      quantity: "Combo Pack",
      badge: "Premium",
      purchases: 540,
    },

    {
      name: "Kids Gift Box",
      category: "Gift Boxes",
      price: 699,
      oldPrice: 900,
      discount: "22%",
      quantity: "Combo Pack",
      badge: "",
      purchases: 420,
    },


    /* FANCY CRACKERS */

    {
      name: "Fancy Aerial Show",
      category: "Fancy Crackers",
      price: 350,
      oldPrice: 450,
      discount: "22%",
      quantity: "3 pieces",
      badge: "Popular",
      purchases: 490,
    },

    {
      name: "Multi Colour Show",
      category: "Fancy Crackers",
      price: 450,
      oldPrice: 600,
      discount: "25%",
      quantity: "3 pieces",
      badge: "",
      purchases: 410,
    },

    {
      name: "Grand Sky Show",
      category: "Fancy Crackers",
      price: 650,
      oldPrice: 800,
      discount: "19%",
      quantity: "2 pieces",
      badge: "Premium",
      purchases: 350,
    },
  ];


  /* =======================================================
     BEST SELLERS
     ======================================================= */

  const bestSellers = [...products]
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 5);


  /* =======================================================
     SCROLL FUNCTION
     ======================================================= */

  const scrollToSection = (id: string) => {

    const element = document.getElementById(id);

    if (!element) return;

    const headerOffset = 105;

    const elementPosition =
      element.getBoundingClientRect().top;

    const offsetPosition =
      elementPosition +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };


  /* =======================================================
     PRODUCT CARD
     ======================================================= */

  const ProductCard = ({
    product,
  }: {
    product: Product;
  }) => {

    const isAdded = addedProduct === product.name;

    return (
      <article className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">


        {/* PRODUCT IMAGE */}

        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-800 to-orange-950 sm:h-48">

          <div className="absolute text-7xl opacity-80 transition duration-500 group-hover:scale-125">
            🎆
          </div>


          {/* BADGE */}

          {product.badge && (
            <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[9px] font-bold text-white">
              {product.badge}
            </span>
          )}


          {/* DISCOUNT */}

          <span className="absolute right-2 top-2 rounded-full bg-orange-400 px-2 py-1 text-[9px] font-bold text-white">
            -{product.discount}
          </span>

        </div>


        {/* INFORMATION */}

        <div className="p-3">

          <p className="text-[10px] font-medium text-orange-600">
            {product.category}
          </p>

          <h3 className="mt-1 line-clamp-1 text-sm font-bold text-zinc-900">
            {product.name}
          </h3>

          <p className="mt-1 text-[10px] text-zinc-400">
            {product.quantity}
          </p>


          {/* PRICE */}

          <div className="mt-3 flex items-center gap-2">

            <span className="text-base font-bold text-red-600">
              ₹{product.price}
            </span>

            <span className="text-xs text-zinc-400 line-through">
              ₹{product.oldPrice}
            </span>

          </div>


          {/* STOCK */}

          <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-green-600">

            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

            In Stock

          </div>


          {/* CART BUTTON */}

          <button
            type="button"
            onClick={() => addToCart(product)}
            className={`mt-3 w-full rounded-lg py-2 text-xs font-bold text-white transition ${
              isAdded
                ? "bg-green-600"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isAdded ? "✓ Added to Cart" : "Add to Cart"}
          </button>

        </div>

      </article>
    );
  };


  /* =======================================================
     CATEGORY SECTION
     ======================================================= */

  const CategorySection = ({
    category,
    icon,
    id,
  }: {
    category: string;
    icon: string;
    id: string;
  }) => {

    const categoryProducts = products.filter(
      (product) => product.category === category
    );

    return (
      <section
        id={id}
        className="scroll-mt-[105px] bg-white py-14 sm:py-16"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">


          {/* CATEGORY TITLE */}

          <div className="mb-8 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-3">

                <span className="text-3xl">
                  {icon}
                </span>

                <h2 className="font-serif text-3xl font-bold text-zinc-900 sm:text-4xl">
                  {category}
                </h2>

              </div>

              <p className="mt-2 text-sm text-zinc-500">
                Explore our {category.toLowerCase()} collection
              </p>

            </div>


            {/* BACK TO TOP */}

            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="hidden text-sm font-semibold text-red-600 transition hover:text-red-800 sm:block"
            >
              Back to top ↑
            </button>

          </div>


          {/* PRODUCTS */}

          {categoryProducts.length > 0 ? (

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

              {categoryProducts.map((product) => (

                <ProductCard
                  key={product.name}
                  product={product}
                />

              ))}

            </div>

          ) : (

            <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500">
              Products coming soon.
            </div>

          )}

        </div>

      </section>
    );
  };


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main
      id="home"
      className="min-h-screen bg-white text-zinc-900"
    >

      <FireworkTouchEffect />


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md">

        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">


          {/* LOGO */}

          <button
            type="button"
            onClick={() => scrollToSection("home")}
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


          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-5 lg:flex">

            <button
              type="button"
              onClick={() => scrollToSection("products")}
              className="text-sm font-medium text-zinc-700 transition hover:text-red-600"
            >
              Best Sellers
            </button>

            {categories.slice(0, 4).map((category) => (

              <button
                type="button"
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="text-sm font-medium text-zinc-700 transition hover:text-red-600"
              >
                {category.name}
              </button>

            ))}

          </nav>


          {/* ACTIONS */}

          <div className="flex items-center gap-1 sm:gap-3">


            {/* LOCATION */}

            <button
              type="button"
              aria-label="Delivery location"
              className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-red-50 sm:flex"
            >

              <span className="text-xl">
                📍
              </span>

              <span className="leading-tight">

                <span className="block text-[10px] text-zinc-400">
                  Here Our
                </span>

                <span className="block text-xs font-semibold text-zinc-800">
                  Shop Address
                </span>

              </span>

            </button>


            <div className="hidden h-7 w-px bg-zinc-200 sm:block" />


            {/* SEARCH */}

            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
            >
              🔍
            </button>


            {/* CART */}

            <button
              type="button"
              aria-label="Shopping cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-lg text-zinc-700 transition hover:bg-red-50 hover:text-red-600"
            >

              🛒

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow">
                  {cartCount}
                </span>
              )}

            </button>

          </div>

        </div>


        {/* SALE BAR */}

        <div className="bg-red-700 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">

          🎉 Diwali Season Sale — Up to 30% OFF on Gift Boxes & Combo Packs!

          <button
            type="button"
            onClick={() => scrollToSection("products")}
            className="ml-1 underline underline-offset-2"
          >
            Shop Now →
          </button>

        </div>

      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative min-h-[560px] overflow-hidden bg-zinc-950">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bg.png')",
          }}
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

        <div className="absolute inset-0 shadow-[inset_0_0_160px_55px_rgba(0,0,0,0.65)]" />


        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-8">

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
              Premium quality crackers straight from Sivakasi.
              Trusted by families across India for years.
              Safe, spectacular, and delivered to your door.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => scrollToSection("products")}
                className="rounded-lg bg-red-600 px-7 py-3 text-center font-bold text-white shadow-lg transition hover:bg-red-700"
              >
                Shop Now →
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("categories")}
                className="rounded-lg border border-white/30 bg-white/10 px-7 py-3 text-center font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                View Categories
              </button>

            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-200">

              <span>
                🚚 Free shipping ₹500+
              </span>

              <span>
                ✅ Quality assured
              </span>

              <span>
                🔒 Secure payment
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SHOP BY CATEGORY
          ===================================================== */}

      <section
        id="categories"
        className="bg-white py-14 sm:py-16"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">

          <div className="mb-8">

            <h2 className="font-serif text-3xl font-bold text-zinc-900 sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Choose a category to explore our collection
            </p>

          </div>


          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">

            {categories.map((category) => (

              <button
                type="button"
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="group flex min-h-[105px] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-2 transition hover:-translate-y-1 hover:border-red-200 hover:bg-red-50 hover:shadow-md"
              >

                <span className="text-3xl transition group-hover:scale-110">
                  {category.icon}
                </span>

                <span className="mt-2 text-center text-xs font-semibold text-zinc-800">
                  {category.name}
                </span>

              </button>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          BEST SELLERS
          ===================================================== */}

      <section
        id="products"
        className="scroll-mt-[105px] bg-zinc-50 py-14 sm:py-16"
      >

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">


          <div className="mb-8">

            <div className="flex items-center gap-3">

              <span className="text-3xl">
                🔥
              </span>

              <h2 className="font-serif text-3xl font-bold text-zinc-900 sm:text-4xl">
                Best Sellers
              </h2>

            </div>

            <p className="mt-2 text-sm text-zinc-500">
              Our most purchased products, loved by customers
            </p>

          </div>


          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

            {bestSellers.map((product) => (

              <ProductCard
                key={product.name}
                product={product}
              />

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          CATEGORY SECTIONS
          ===================================================== */}

      {categories.map((category) => (

        <CategorySection
          key={category.id}
          category={category.name}
          icon={category.icon}
          id={category.id}
        />

      ))}


      {/* =====================================================
          FESTIVAL OFFERS
          ===================================================== */}

      <section className="bg-white py-14 sm:py-16">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">

          <h2 className="mb-7 font-serif text-3xl font-bold text-zinc-900 sm:text-4xl">
            Festival Offers
          </h2>


          <div className="grid gap-4 md:grid-cols-3">


            <div className="relative overflow-hidden rounded-2xl bg-red-800 p-6 text-white">

              <div className="absolute right-3 top-2 text-6xl opacity-10">
                🎆
              </div>

              <span className="rounded-full bg-orange-400 px-3 py-1 text-[10px] font-bold">
                UP TO 29% OFF
              </span>

              <h3 className="mt-5 font-serif text-2xl font-bold">
                Diwali Combo Packs
              </h3>

              <p className="mt-2 text-sm text-red-100">
                Everything you need for the perfect Diwali night.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection("gift-boxes")}
                className="mt-5 rounded-lg bg-white px-5 py-2 text-sm font-bold text-red-700"
              >
                Shop Now
              </button>

            </div>


            <div className="relative overflow-hidden rounded-2xl bg-orange-800 p-6 text-white">

              <div className="absolute right-3 top-2 text-6xl opacity-10">
                🚀
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-orange-700">
                PREMIUM
              </span>

              <h3 className="mt-5 font-serif text-2xl font-bold">
                Fancy Aerial Crackers
              </h3>

              <p className="mt-2 text-sm text-orange-100">
                Sky shots, multi-burst shells, and more.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection("fancy-crackers")}
                className="mt-5 rounded-lg bg-white px-5 py-2 text-sm font-bold text-orange-700"
              >
                Explore
              </button>

            </div>


            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white">

              <div className="absolute right-3 top-2 text-6xl opacity-10">
                ✨
              </div>

              <span className="rounded-full bg-green-500 px-3 py-1 text-[10px] font-bold">
                25% OFF
              </span>

              <h3 className="mt-5 font-serif text-2xl font-bold">
                All Sparklers
              </h3>

              <p className="mt-2 text-sm text-zinc-300">
                Gold, green and multi-colour sparkler packs.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection("sparklers")}
                className="mt-5 rounded-lg bg-orange-400 px-5 py-2 text-sm font-bold text-zinc-900"
              >
                Buy Now
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          WHY CHOOSE US
          ===================================================== */}

      <section className="bg-zinc-950 py-16 text-white">

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-8">

          <div className="mb-12 text-center">

            <h2 className="font-serif text-3xl font-bold sm:text-4xl">

              Why Choose{" "}

              <span className="text-orange-400">
                Sivakasi Crackers?
              </span>

            </h2>

          </div>


          <div className="grid grid-cols-2 gap-10 md:grid-cols-5">


            <div className="text-center">

              <div className="text-4xl">
                🏅
              </div>

              <h3 className="mt-3 text-sm font-bold">
                Quality Assured
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Premium quality products from trusted manufacturers.
              </p>

            </div>


            <div className="text-center">

              <div className="text-4xl">
                🛒
              </div>

              <h3 className="mt-3 text-sm font-bold">
                Easy Ordering
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                No account required. Add products and checkout easily.
              </p>

            </div>


            <div className="text-center">

              <div className="text-4xl">
                🔒
              </div>

              <h3 className="mt-3 text-sm font-bold">
                Secure Payment
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Payments securely processed through Razorpay.
              </p>

            </div>


            <div className="text-center">

              <div className="text-4xl">
                ⚡
              </div>

              <h3 className="mt-3 text-sm font-bold">
                Fast Processing
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Orders are confirmed and processed quickly.
              </p>

            </div>


            <div className="col-span-2 text-center md:col-span-1">

              <div className="text-4xl">
                🤝
              </div>

              <h3 className="mt-3 text-sm font-bold">
                Customer Support
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-400">
                WhatsApp and phone support for your convenience.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="relative overflow-hidden bg-red-700 px-5 py-16 text-center text-white">

        <div className="absolute inset-0 opacity-10">

          <div className="absolute left-10 top-5 text-6xl">
            ✨
          </div>

          <div className="absolute right-20 top-20 text-6xl">
            ✨
          </div>

          <div className="absolute bottom-5 left-1/3 text-5xl">
            ✨
          </div>

          <div className="absolute bottom-10 right-1/4 text-5xl">
            ✨
          </div>

        </div>


        <div className="relative z-10 mx-auto max-w-2xl">

          <h2 className="font-serif text-4xl font-bold sm:text-5xl">
            Ready to Celebrate?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-red-100 sm:text-base">
            Shop our full range of premium crackers and make this Diwali
            the most spectacular one yet.
          </p>

          <button
            type="button"
            onClick={() => scrollToSection("products")}
            className="mt-7 rounded-xl bg-white px-8 py-3 font-bold text-red-700 shadow-lg transition hover:scale-105"
          >
            Browse Best Sellers →
          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="bg-zinc-900 text-zinc-300">

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-4 lg:px-8">


          {/* BRAND */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700">
                🎆
              </div>

              <div>

                <div className="font-serif font-bold text-white">
                  Sivakasi Crackers
                </div>

                <div className="text-[9px] font-semibold text-orange-400">
                  PREMIUM FIREWORKS
                </div>

              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-400">
              Your trusted source for premium-quality crackers.
              Celebrating every festival with safe, brilliant,
              and affordable fireworks.
            </p>

          </div>


          {/* CATEGORIES */}

          <div>

            <h3 className="mb-4 font-bold text-white">
              Categories
            </h3>

            <ul className="space-y-3 text-sm">

              {categories.slice(0, 5).map((category) => (

                <li key={category.id}>

                  <button
                    type="button"
                    onClick={() => scrollToSection(category.id)}
                    className="transition hover:text-orange-400"
                  >
                    {category.name}
                  </button>

                </li>

              ))}

            </ul>

          </div>


          {/* QUICK LINKS */}

          <div>

            <h3 className="mb-4 font-bold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">

              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("products")}
                  className="transition hover:text-orange-400"
                >
                  Best Sellers
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("categories")}
                  className="transition hover:text-orange-400"
                >
                  Shop Categories
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("gift-boxes")}
                  className="transition hover:text-orange-400"
                >
                  Gift Boxes
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("fancy-crackers")}
                  className="transition hover:text-orange-400"
                >
                  Fancy Crackers
                </button>
              </li>

            </ul>

          </div>


          {/* CONTACT */}

          <div>

            <h3 className="mb-4 font-bold text-white">
              Contact Us
            </h3>

            <div className="space-y-3 text-sm text-zinc-400">

              <p>
                📍 Sivakasi, Tamil Nadu
              </p>

              <p>
                📞 +91 XXXXX XXXXX
              </p>

              <p>
                💬 WhatsApp Support
              </p>

              <p>
                ✉️ hello@sivakasicrackers.in
              </p>

            </div>

          </div>

        </div>


        {/* COPYRIGHT */}

        <div className="border-t border-zinc-800">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-zinc-500 sm:px-8 md:flex-row lg:px-8">

            <p>
              © 2026 Sivakasi Crackers. All rights reserved.
            </p>

            <p>
              🔒 Secure Checkout • Razorpay
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}