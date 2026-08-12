"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Product = {
id: number;
name: string;
category: string;
quantity: string;
price: number;
mrp: number;
image: string | null;
purchases: number;
stock: number;
};

type Cart = Record<number, number>;

type HomeClientProps = {
products: Product[];
};

const categoryIcons: Record<string, string> = {
Sparklers: "✨",
Rockets: "🚀",
"Gift Items": "🎁",
Chakkars: "🌀",
"Flower Pots": "🌸",
"Twinkling Star": "⭐",
Pencil: "🕯️",
"Single / Two Sound Crackers": "💥",
"Atom Bomb": "💣",
"Electric Crackers": "⚡",
"Chorsa Garland": "🎇",
Matches: "🔥",
"Guns & Rolls": "🔫",
};

function getDiscount(price: number, mrp: number) {
if (!mrp || mrp <= 0) {
return 0;
}

return Math.round(((mrp - price) / mrp) * 100);
}

function makeSectionId(category: string) {
return category
.toLowerCase()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-|-$/g, "");
}

export default function HomeClient({
products,
}: HomeClientProps) {
const [cart, setCart] = useState<Cart>({});
const [search, setSearch] = useState("");
const [showTop, setShowTop] = useState(false);

const [selectedProduct, setSelectedProduct] =
useState<Product | null>(null);

const [showProductPopup, setShowProductPopup] =
useState(false);

const [bestSellerIndex, setBestSellerIndex] = useState(0);

const touchStartX = useRef<number | null>(null);

const cartCount = Object.values(cart).reduce(
(total, quantity) => total + quantity,
0,
);

const categories = useMemo(() => {
return Array.from(
new Set(products.map((product) => product.category)),
);
}, [products]);

const filteredProducts = useMemo(() => {
const value = search.trim().toLowerCase();


if (!value) {
  return products;
}

return products.filter((product) => {
  return (
    product.name.toLowerCase().includes(value) ||
    product.category.toLowerCase().includes(value) ||
    product.quantity.toLowerCase().includes(value)
  );
});


}, [products, search]);

const bestSellers = useMemo(() => {
return [...products]
.sort((a, b) => b.purchases - a.purchases)
.slice(0, 5);
}, [products]);

const currentBestSeller =
bestSellers.length > 0
? bestSellers[
Math.min(bestSellerIndex, bestSellers.length - 1)
]
: null;

useEffect(() => {
if (bestSellers.length <= 1) {
return;
}


const timer = window.setInterval(() => {
  setBestSellerIndex((previous) => {
    return (previous + 1) % bestSellers.length;
  });
}, 3000);

return () => {
  window.clearInterval(timer);
};

}, [bestSellers.length]);

useEffect(() => {
const handleScroll = () => {
setShowTop(window.scrollY > 500);
};


window.addEventListener("scroll", handleScroll);

return () => {
  window.removeEventListener("scroll", handleScroll);
};


}, []);

const updateQuantity = (
productId: number,
change: number,
) => {
setCart((previous) => {
const current = previous[productId] ?? 0;
const next = Math.max(0, current + change);


  const updated = {
    ...previous,
  };

  if (next === 0) {
    delete updated[productId];
  } else {
    updated[productId] = next;
  }

  return updated;
});

};

const addToCart = (productId: number) => {
setCart((previous) => {
return {
...previous,
[productId]: (previous[productId] ?? 0) + 1,
};
});
};

const scrollToSection = (
id: string,
offset = 70,
) => {
const element = document.getElementById(id);


if (!element) {
  return;
}

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

const nextBestSeller = () => {
if (bestSellers.length === 0) {
return;
}


setBestSellerIndex((previous) => {
  return (previous + 1) % bestSellers.length;
});


};

const previousBestSeller = () => {
if (bestSellers.length === 0) {
return;
}


setBestSellerIndex((previous) => {
  return (
    (previous - 1 + bestSellers.length) %
    bestSellers.length
  );
});


};

const handlePointerDown = (
event: React.PointerEvent<HTMLDivElement>,
) => {
touchStartX.current = event.clientX;
};

const handlePointerUp = (
event: React.PointerEvent<HTMLDivElement>,
) => {
if (touchStartX.current === null) {
return;
}


const difference =
  event.clientX - touchStartX.current;

touchStartX.current = null;

if (Math.abs(difference) < 50) {
  return;
}

if (difference < 0) {
  nextBestSeller();
} else {
  previousBestSeller();
}


};

if (products.length === 0) {
return ( <main className="flex min-h-screen items-center justify-center bg-white px-5"> <div className="text-center"> <div className="text-6xl">🎆</div>


      <h1 className="mt-5 text-2xl font-bold text-zinc-900">
        No products available
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        Please add products to your database.
      </p>
    </div>
  </main>
);


}

return ( <main className="min-h-screen bg-white text-zinc-900">
{/* HEADER */}


  <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
      <button
        type="button"
        onClick={goHome}
        className="flex shrink-0 items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-700 text-xl">
          🎆
        </div>

        <div className="leading-tight">
          <div className="font-serif text-base font-bold text-red-700 sm:text-lg">
            Sivakasi Crackers
          </div>

          <div className="text-[9px] font-bold tracking-wider text-orange-500">
            PREMIUM FIREWORKS
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <a
          href="https://goo.gl/maps/4dTnVHoPRWjL1h487"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-red-50 sm:flex"
        >
          <span className="text-3xl">📍</span>

          <span>
            <span className="block text-[10px] text-zinc-500">
              Our Shop
            </span>

            <span className="block text-xs font-bold">
              Sivakasi, Tamil Nadu
            </span>
          </span>
        </a>

        <div className="hidden h-7 w-px bg-zinc-200 sm:block" />

        <div className="flex h-9 items-center rounded-full border border-zinc-200 px-3 focus-within:border-red-400">
          <span className="mr-2">🔍</span>

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Search crackers"
            className="w-24 bg-transparent text-xs outline-none placeholder:text-zinc-400 sm:w-40"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            scrollToSection("cart-summary", 80)
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-red-50"
          aria-label="Cart"
        >
          🛒

          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  </header>

  {/* SALE BAR */}

  <div className="bg-red-700 px-4 py-2.5 text-center text-xs font-bold text-white sm:text-sm">
    🎉 Diwali Season Sale — Up to 30% OFF
  </div>

  {/* HERO */}

  <section
    id="home"
    className="relative min-h-[560px] overflow-hidden bg-black"
  >
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/hero-bg.png')",
      }}
    />

    <div className="absolute inset-0 bg-black/50" />

    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

    <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-20 sm:px-8">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex rounded-full border border-orange-400/50 bg-black/40 px-4 py-2 text-xs font-bold tracking-wider text-orange-400">
          ✨ DIWALI 2026 — CELEBRATE IN STYLE
        </div>

        <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
          Light Up the{" "}
          <span className="text-orange-400">
            Night Sky
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">
          Premium quality crackers straight
          from Sivakasi. Safe, spectacular,
          and made to make your celebrations
          unforgettable.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              scrollToSection("products", 70)
            }
            className="rounded-lg bg-red-600 px-7 py-3 font-bold text-white hover:bg-red-700"
          >
            Shop Now →
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection("categories", 70)
            }
            className="rounded-lg border border-white/30 bg-white/10 px-7 py-3 font-bold text-white backdrop-blur hover:bg-white/20"
          >
            View Categories
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-5 text-sm text-zinc-200">
          <span>🚚 Free shipping ₹500+</span>
          <span>✅ Quality assured</span>
          <span>🔒 Secure payment</span>
        </div>
      </div>
    </div>
  </section>

  {/* CATEGORIES */}

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

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() =>
            scrollToSection(
              makeSectionId(category),
              75,
            )
          }
          className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
        >
          <div className="mb-2 text-3xl">
            {categoryIcons[category] ?? "🎆"}
          </div>

          <div className="text-xs font-bold">
            {category}
          </div>
        </button>
      ))}
    </div>
  </section>

  {/* BEST SELLERS */}

  {currentBestSeller && (
    <section
      id="products"
      className="bg-zinc-50 px-4 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h2 className="font-serif text-3xl font-bold">
            Best Sellers
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Most loved by our customers
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{
            touchAction: "pan-y",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(currentBestSeller);
              setShowProductPopup(true);
            }}
            className="block w-full text-left"
          >
            <div className="grid min-h-[235px] grid-cols-[110px_1fr] items-center gap-5 p-5 sm:grid-cols-[230px_1fr] sm:p-8">
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-7xl sm:h-48 sm:text-8xl">
                {currentBestSeller.image ? (
                  <img
                    src={currentBestSeller.image}
                    alt={currentBestSeller.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  "🎆"
                )}
              </div>

              <div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase text-orange-700">
                  Best Seller
                </span>

                <div className="mt-2 text-xs font-semibold text-orange-600">
                  {currentBestSeller.category}
                </div>

                <h3 className="mt-1 text-xl font-bold sm:text-3xl">
                  {currentBestSeller.name}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {currentBestSeller.quantity}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-red-600">
                    ₹
                    {currentBestSeller.price.toFixed(
                      2,
                    )}
                  </span>

                  <del className="text-sm text-zinc-400">
                    ₹
                    {currentBestSeller.mrp.toFixed(
                      2,
                    )}
                  </del>

                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    {getDiscount(
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

          {bestSellers.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousBestSeller}
                aria-label="Previous best seller"
                className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl shadow-md sm:flex"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={nextBestSeller}
                aria-label="Next best seller"
                className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xl shadow-md sm:flex"
              >
                ›
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {bestSellers.map(
                  (product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      aria-label={
                        "Show " +
                        product.name
                      }
                      onClick={() =>
                        setBestSellerIndex(
                          index,
                        )
                      }
                      className={
                        index ===
                        bestSellerIndex
                          ? "h-1.5 w-7 rounded-full bg-red-600"
                          : "h-1.5 w-1.5 rounded-full bg-zinc-300"
                      }
                    />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )}

  {/* PRODUCTS */}

  <section id="category-products">
    {categories.map((category) => {
      const categoryProducts =
        filteredProducts.filter(
          (product) =>
            product.category === category,
        );

      if (categoryProducts.length === 0) {
        return null;
      }

      const sectionId = makeSectionId(category);

      return (
        <section
          key={category}
          id={sectionId}
          className="scroll-mt-20 border-b border-zinc-200"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-5 py-3 sm:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <h2 className="font-serif text-lg font-bold uppercase tracking-wide text-white">
                {category}
              </h2>

              <span className="text-xs font-semibold text-white">
                {categoryProducts.length} Products
              </span>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-3 sm:px-8">
            {categoryProducts.map((product) => {
              const quantity =
                cart[product.id] ?? 0;

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border-b border-zinc-100 py-3 sm:grid-cols-[90px_1.7fr_130px_120px_150px]"
                >
                  <div className="flex h-16 w-[72px] items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-3xl sm:h-20 sm:w-[90px]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      categoryIcons[
                        product.category
                      ] ?? "🎆"
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold sm:text-base">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      {product.quantity}
                    </p>

                    <div
                      className={
                        product.stock > 0
                          ? "mt-1 text-xs font-semibold text-green-600"
                          : "mt-1 text-xs font-semibold text-red-600"
                      }
                    >
                      {product.stock > 0
                        ? "In Stock"
                        : "Out of Stock"}
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-sm text-zinc-400">
                      MRP{" "}
                      <del>
                        ₹
                        {product.mrp.toFixed(
                          2,
                        )}
                      </del>
                    </div>

                    <div className="font-bold text-red-600">
                      ₹
                      {product.price.toFixed(
                        2,
                      )}
                    </div>
                  </div>

                  <div className="hidden text-center sm:block">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      {getDiscount(
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
                        disabled={
                          quantity === 0
                        }
                        className="flex h-full w-8 items-center justify-center text-lg font-bold hover:bg-zinc-100 disabled:opacity-30"
                      >
                        −
                      </button>

                      <span className="w-7 text-center text-sm font-semibold">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          product.stock <= 0 ||
                          quantity >=
                            product.stock
                        }
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            1,
                          )
                        }
                        className="flex h-full w-8 items-center justify-center text-lg font-bold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={
                        product.stock <= 0
                      }
                      onClick={() =>
                        addToCart(product.id)
                      }
                      className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:px-4 sm:text-xs"
                    >
                      {product.stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 sm:hidden">
                    <span className="font-bold text-red-600">
                      ₹
                      {product.price.toFixed(
                        2,
                      )}
                    </span>

                    <del className="text-xs text-zinc-400">
                      ₹
                      {product.mrp.toFixed(
                        2,
                      )}
                    </del>

                    <span className="text-xs font-bold text-orange-600">
                      {getDiscount(
                        product.price,
                        product.mrp,
                      )}
                      % OFF
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    })}
  </section>

  {/* SEARCH EMPTY */}

  {search.trim() &&
    filteredProducts.length === 0 && (
      <section className="mx-auto max-w-7xl px-5 py-16 text-center">
        <div className="text-5xl">🔍</div>

        <h2 className="mt-4 text-2xl font-bold">
          No products found
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Try searching for another cracker.
        </p>

        <button
          type="button"
          onClick={() => setSearch("")}
          className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
        >
          Clear Search
        </button>
      </section>
    )}

  {/* CART */}

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
              : cartCount +
                " item" +
                (cartCount > 1 ? "s" : "") +
                " in your cart"}
          </h2>
        </div>

        {cartCount > 0 && (
          <button
            type="button"
            onClick={() =>
              alert(
                "Checkout will be connected next.",
              )
            }
            className="rounded-lg bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
          >
            View Cart →
          </button>
        )}
      </div>
    </div>
  </section>

  {/* WHY CHOOSE US */}

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

  {/* CTA */}

  <section className="relative overflow-hidden bg-red-700 px-5 py-16 text-center text-white">
    <div className="relative">
      <h2 className="font-serif text-4xl font-bold">
        Ready to Celebrate?
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-white/90">
        Shop our full range of premium
        crackers and make this Diwali
        spectacular.
      </p>

      <button
        type="button"
        onClick={() =>
          scrollToSection("products", 70)
        }
        className="mt-7 rounded-xl bg-white px-7 py-4 font-bold text-red-700 shadow-lg hover:scale-105"
      >
        Browse All Products →
      </button>
    </div>
  </section>

  {/* FOOTER */}

  <footer className="bg-zinc-900 px-5 py-12 text-zinc-300 sm:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
      <div>
        <div className="font-serif text-xl font-bold text-white">
          Sivakasi Crackers
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Premium-quality crackers for
          your celebrations.
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
                    makeSectionId(category),
                    70,
                  )
                }
                className="block hover:text-orange-400"
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
              scrollToSection("products", 70)
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

          <p>📞 +91 45622 34567</p>

          <p>💬 WhatsApp: 98765 43210</p>

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

  {/* BACK TO TOP */}

  {showTop && (
    <button
      type="button"
      onClick={goHome}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white shadow-xl hover:bg-red-700"
      aria-label="Back to top"
    >
      ↑
    </button>
  )}

  {/* PRODUCT POPUP */}

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
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowProductPopup(false)
            }
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white"
            aria-label="Close product"
          >
            ×
          </button>

          <div className="flex h-64 items-center justify-center overflow-hidden bg-zinc-950 text-9xl">
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-full w-full object-contain"
              />
            ) : (
              categoryIcons[
                selectedProduct.category
              ] ?? "🎆"
            )}
          </div>

          <div className="p-6">
            <div className="text-xs font-bold uppercase text-orange-600">
              {selectedProduct.category}
            </div>

            <h2 className="mt-1 text-2xl font-bold">
              {selectedProduct.name}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {selectedProduct.quantity}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-red-600">
                ₹
                {selectedProduct.price.toFixed(
                  2,
                )}
              </span>

              <del className="text-sm text-zinc-400">
                ₹
                {selectedProduct.mrp.toFixed(
                  2,
                )}
              </del>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                {getDiscount(
                  selectedProduct.price,
                  selectedProduct.mrp,
                )}
                % OFF
              </span>
            </div>

            <div
              className={
                selectedProduct.stock > 0
                  ? "mt-3 text-sm font-semibold text-green-600"
                  : "mt-3 text-sm font-semibold text-red-600"
              }
            >
              {selectedProduct.stock > 0
                ? "✓ In Stock"
                : "✕ Out of Stock"}
            </div>

            <button
              type="button"
              disabled={
                selectedProduct.stock <= 0
              }
              onClick={() => {
                addToCart(
                  selectedProduct.id,
                );

                setShowProductPopup(false);
              }}
              className="mt-6 w-full rounded-xl bg-red-600 py-4 font-bold text-white hover:bg-red-700 disabled:bg-zinc-400"
            >
              🛒{" "}
              {selectedProduct.stock > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    )}
</main>

);
}
