// Cookie Shop — Single-file React + Tailwind App
// Save this as CookieShop.jsx and include it in a React project (Vite/Create React App) with Tailwind CSS enabled.
// Features:
// - Product listing with images, descriptions, prices
// - Search, category filter, and sorting
// - Add to cart, update quantities, remove items
// - Cart persisted to localStorage
// - Checkout form with basic validation and downloadable receipt (JSON)
// - Mobile responsive layout using Tailwind classes

import React, { useEffect, useState } from 'react';

const SAMPLE_PRODUCTS = [
  {
    id: 'cookies-01',
    name: 'Classic Chocolate Chip',
    price: 4.5,
    category: 'Classic',
    desc: 'Chewy, buttery cookies packed with semi-sweet chocolate chips.',
    img: 'https://images.unsplash.com/photo-1606755962779-0c2a3d4a5c3b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1',
  },
  {
    id: 'cookies-02',
    name: 'Oatmeal Raisin',
    price: 4.0,
    category: 'Healthy',
    desc: 'Wholesome oats, plump raisins and a cinnamon hint.',
    img: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=2',
  },
  {
    id: 'cookies-03',
    name: 'Double Chocolate',
    price: 5.0,
    category: 'Decadent',
    desc: 'Intense cocoa cookie with extra dark chocolate chunks.',
    img: 'https://images.unsplash.com/photo-1544025161-7f53f50f98b0?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3',
  },
  {
    id: 'cookies-04',
    name: 'Peanut Butter Swirl',
    price: 4.75,
    category: 'Classic',
    desc: 'Creamy peanut butter ribbon in a soft cookie.',
    img: 'https://images.unsplash.com/photo-1605475129286-1a29e0a6fb8b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=4',
  },
];

export default function CookieShop() {
  const [products] = useState(SAMPLE_PRODUCTS);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cookie_shop_cart');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ name: '', email: '', address: '' });
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    localStorage.setItem('cookie_shop_cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(productId, qty = 1) {
    setCart(prev => {
      const next = { ...prev };
      next[productId] = (next[productId] || 0) + qty;
      return next;
    });
  }

  function updateQty(productId, qty) {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  function itemsInCart() {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }

  function cartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(x => x.id === id);
      return sum + (p ? p.price * qty : 0);
    }, 0);
  }

  function filteredProducts() {
    let out = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase()));
    if (category !== 'All') out = out.filter(p => p.category === category);
    if (sort === 'price-asc') out = out.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') out = out.sort((a, b) => b.price - a.price);
    return out;
  }

  function handlePlaceOrder(e) {
    e.preventDefault();
    // basic validation
    if (!orderInfo.name || !orderInfo.email || !orderInfo.address) {
      alert('Please complete name, email and address.');
      return;
    }
    if (itemsInCart() === 0) {
      alert('Cart is empty. Add some cookies first.');
      return;
    }

    const order = {
      id: 'ORD-' + Date.now(),
      date: new Date().toISOString(),
      customer: { ...orderInfo },
      items: Object.entries(cart).map(([id, qty]) => {
        const p = products.find(x => x.id === id);
        return { id, name: p?.name || id, qty, unitPrice: p?.price || 0 };
      }),
      subtotal: cartTotal(),
      note: 'This is a simulated checkout — integrate a payment gateway for real orders.',
    };

    setOrderPlaced(order);
    clearCart();
    setCheckoutOpen(false);

    // trigger a JSON download of the receipt
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.id}_receipt.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white p-4">
      <header className="max-w-6xl mx-auto flex items-center justify-between py-4">
        <div>
          <h1 className="text-3xl font-extrabold">Cookie Jar — Fresh Cookies Online</h1>
          <p className="text-sm text-gray-600">Small-batch, oven-fresh cookies — delivered with love.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 border rounded-lg bg-white shadow-sm" onClick={() => setCheckoutOpen(s => !s)}>
            Cart <span className="ml-2 font-semibold">{itemsInCart()}</span>
          </button>
          <div className="text-right text-sm">
            <div className="font-semibold">Total</div>
            <div className="text-gray-700">${cartTotal().toFixed(2)}</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white p-4 rounded-2xl shadow">
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600">Search</label>
            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="Search cookies, flavors..." />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 p-2 border rounded">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600">Sort</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className="w-full mt-1 p-2 border rounded">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Cart Preview</h3>
            <div className="mt-3 space-y-3">
              {Object.keys(cart).length === 0 && <div className="text-sm text-gray-500">Your cart is empty.</div>}
              {Object.entries(cart).map(([id, qty]) => {
                const p = products.find(x => x.id === id);
                return (
                  <div key={id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p?.name}</div>
                      <div className="text-xs text-gray-500">{qty} × ${p?.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(id, qty - 1)} className="px-2 py-1 border rounded">-</button>
                      <div className="w-6 text-center">{qty}</div>
                      <button onClick={() => updateQty(id, qty + 1)} className="px-2 py-1 border rounded">+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="font-semibold">${cartTotal().toFixed(2)}</div>
              </div>
              <button onClick={() => setCheckoutOpen(true)} className="w-full py-2 rounded-xl bg-amber-500 text-white font-semibold">Proceed to Checkout</button>
              <button onClick={clearCart} className="w-full py-2 rounded-xl border">Clear Cart</button>
            </div>
          </div>
        </aside>

        <section className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts().map(p => (
              <article key={p.id} className="bg-white rounded-2xl shadow overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-44 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-bold text-lg">${p.price.toFixed(2)}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => addToCart(p.id, 1)} className="px-3 py-2 rounded-lg bg-amber-400 text-white font-semibold">Add</button>
                      <button onClick={() => addToCart(p.id, 3)} className="px-3 py-2 rounded-lg border">Add 3</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Checkout modal / panel */}
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setCheckoutOpen(false)} />
            <form onSubmit={handlePlaceOrder} className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <p className="text-sm text-gray-600">Fill in your details to place the order. This is a demo checkout (no payment).</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input required value={orderInfo.name} onChange={e => setOrderInfo({ ...orderInfo, name: e.target.value })} placeholder="Full name" className="p-2 border rounded" />
                <input required value={orderInfo.email} onChange={e => setOrderInfo({ ...orderInfo, email: e.target.value })} placeholder="Email" className="p-2 border rounded" />
                <input required value={orderInfo.address} onChange={e => setOrderInfo({ ...orderInfo, address: e.target.value })} placeholder="Delivery address" className="sm:col-span-2 p-2 border rounded" />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                  {Object.entries(cart).length === 0 && <div className="text-sm text-gray-500">No items in cart.</div>}
                  {Object.entries(cart).map(([id, qty]) => {
                    const p = products.find(x => x.id === id);
                    return (
                      <div key={id} className="flex justify-between">
                        <div>
                          <div className="font-medium">{p?.name}</div>
                          <div className="text-xs text-gray-500">{qty} × ${p?.price.toFixed(2)}</div>
                        </div>
                        <div className="font-semibold">${(p?.price * qty).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-gray-600">Subtotal</div>
                  <div className="font-bold">${cartTotal().toFixed(2)}</div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-amber-500 text-white font-semibold">Place Order</button>
                  <button type="button" onClick={() => setCheckoutOpen(false)} className="py-2 px-4 rounded-xl border">Cancel</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Order placed confirmation */}
        {orderPlaced && (
          <div className="md:col-span-4 bg-white p-4 rounded-2xl shadow">
            <h2 className="text-xl font-bold">Order Placed — {orderPlaced.id}</h2>
            <p className="text-sm text-gray-600">Thanks, {orderPlaced.customer.name}! A receipt was downloaded to your device.</p>
            <div className="mt-3">
              <h4 className="font-semibold">Order details</h4>
              <pre className="mt-2 text-sm bg-gray-50 p-3 rounded max-h-60 overflow-auto">{JSON.stringify(orderPlaced, null, 2)}</pre>
            </div>
            <div className="mt-3">
              <button onClick={() => setOrderPlaced(null)} className="py-2 px-4 rounded border">Close</button>
            </div>
          </div>
        )}

      </main>

      <footer className="max-w-6xl mx-auto text-center text-sm text-gray-600 mt-8 mb-6">© {new Date().getFullYear()} Cookie Jar — Small-batch cookies. Demo store.</footer>
    </div>
  );
}
