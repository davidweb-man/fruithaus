/* =====================================================================
   FRUITHAUS — script.js
   Everything you are likely to edit is in the first two blocks below.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. WHATSAPP SETTINGS  (YOU MUST EDIT THIS)
   ---------------------------------------------------------------------
   Replace ADD_YOUR_WHATSAPP_NUMBER with your WhatsApp number in
   INTERNATIONAL format: digits only, no plus sign, no spaces, no dashes.

   Format: country code + number without the leading 0.
   Fictional example only (not a real number): 2348012345678
   (that is 234 for Nigeria, then 8012345678 instead of 08012345678)

   Until you change it, the order buttons will show a helpful message
   instead of opening a broken WhatsApp link.
   --------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "2348140412877";


/* ---------------------------------------------------------------------
   2. PRODUCTS  (edit names, prices, descriptions and image paths here)
   ---------------------------------------------------------------------
   id           short unique name, no spaces (used to remember the cart)
   name         shown on the card, in the cart and in the WhatsApp message
   price        number only, in naira (2500 means ₦2,500)
   size         bottle size shown on the card
   description  one or two short sentences
   ingredients  leave "" until you have the real list. When it is empty the
                site shows a neutral "ask us" message. Never guess here.
   image        path to the photo for this drink
   color        colour of the drink, used only for the placeholder bottle
                and card tint if the photo is missing
   --------------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "watermelon",
    name: "Watermelon Fruit Juice",
    price: 2500,
    size: "50 cl",
    description: "Summer Melon and Splash.",
    ingredients: "Watermelon, Lemon, Mint Leaves",
    image: "images/water.jpg",
    color: "#C23B3B"
  },
  {
    id: "pineapple",
    name: "Pineapple Fruit Juice",
    price: 2500,
    size: "50 cl",
    description: "Golden Tropics",
    ingredients: "Pineapple, Lemon, Ginger, Mint leaves",
    image: "images/pine.jpg",
    color: "#D9A21B"
  },
  {
    id: "tigernut",
    name: "Tigernut Milk",
    price: 3000,
    size: "50 cl",
    description: "Desert Cream.",
    ingredients: "Tigernut, Coconut, Banana, Dates, Ginger, Cloves",
    image: "images/nut.jpg",
    color: "#E3D2AC"
  },
  {
    id: "zobo",
    name: "Zobo Fruit Drink",
    price: 2500,
    size: "50 cl",
    description: "Hibiscus and Spice.",
    ingredients: "Zobo leaves, Ginger, Cloves, Cinnamon, Dates, Pineapple",
    image: "images/5.jpg",
    color: "#6E1B30"
  }
];

/* ---------------------------------------------------------------------
   GALLERY PHOTOS (optional)
   Lifestyle photos shown as a strip at the bottom of the page, e.g. your
   bottles outdoors, on a table, in someone's hand. Add as many as you like
   (4 to 6 looks best). Photos that do not exist are skipped, and if none
   exist the strip does not appear at all.
   --------------------------------------------------------------------- */
const GALLERY = [
  "images/gallery-1.jpg",
  "images/gallery-2.jpg",
  "images/gallery-3.jpg",
  "images/gallery-4.jpg",
  "images/gallery-5.jpg",
  "images/gallery-6.jpg"
];

/* Text shown when "ingredients" is empty above. */
const INGREDIENTS_FALLBACK =
  "Full ingredient list coming soon. Message us on WhatsApp and we will tell you what you want to know.";

/* Key used to remember the order in the browser (localStorage). */
const STORAGE_KEY = "fruithaus-order-v1";

/* Highest quantity of one drink that can be selected at once. */
const MAX_QTY = 99;


/* =====================================================================
   Everything below is the working code. You do not need to edit it.
   ===================================================================== */

/* ---------- Helpers ---------- */

// Format a number as naira, e.g. 4500 -> "₦4,500".
// The symbol is added by hand so it looks the same in every browser.
const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
function formatNaira(amount) {
  return "₦" + numberFormat.format(amount);
}

function bottlesLabel(n) {
  return n === 1 ? "1 bottle" : n + " bottles";
}

function findProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function $(selector, scope) {
  return (scope || document).querySelector(selector);
}

/* ---------- State ---------- */

// cart = { productId: quantity }
let cart = loadCart();
// quantity currently chosen on each product card (before "Add to Order")
const pending = {};
PRODUCTS.forEach(function (p) { pending[p.id] = 1; });

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const clean = {};
    // Only keep items that still exist in PRODUCTS, with sensible quantities.
    PRODUCTS.forEach(function (p) {
      const q = Number(parsed && parsed[p.id]);
      if (Number.isInteger(q) && q > 0) clean[p.id] = Math.min(q, MAX_QTY);
    });
    return clean;
  } catch (e) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    /* Storage can be blocked (private mode). The cart still works. */
  }
}

/* ---------- Cart maths ---------- */

function cartItems() {
  return PRODUCTS
    .filter(function (p) { return cart[p.id] > 0; })
    .map(function (p) {
      return { product: p, qty: cart[p.id], subtotal: p.price * cart[p.id] };
    });
}

function cartTotals() {
  const items = cartItems();
  return {
    items: items,
    bottles: items.reduce(function (sum, i) { return sum + i.qty; }, 0),
    total: items.reduce(function (sum, i) { return sum + i.subtotal; }, 0)
  };
}

function addToCart(id, qty) {
  if (!findProduct(id) || qty < 1) return;
  // Same product added twice? Combine into one line.
  cart[id] = Math.min((cart[id] || 0) + qty, MAX_QTY);
  saveCart();
  renderCart();
}

function setCartQty(id, qty) {
  if (qty <= 0) {
    delete cart[id];
  } else {
    cart[id] = Math.min(qty, MAX_QTY);
  }
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

/* ---------- Images with graceful fallback ---------- */

// If a photo is missing, hide it and let the CSS placeholder show instead.
function watchImage(img) {
  const media = img.closest(".media");
  if (!media) return;
  function markMissing() {
    media.classList.add("is-missing");
  }
  img.addEventListener("error", markMissing);
  // The image may already have failed before this script ran.
  if (img.complete && img.naturalWidth === 0) markMissing();
}

/* ---------- Product cards ---------- */

function buildProductCards() {
  const grid = $("#product-grid");
  grid.innerHTML = "";

  PRODUCTS.forEach(function (p) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.setProperty("--drink", p.color);
    card.dataset.id = p.id;

    card.innerHTML =
      '<div class="product-media media">' +
        '<img alt="" loading="lazy" width="600" height="750">' +
        '<span class="fb-single" aria-hidden="true"></span>' +
      "</div>" +
      '<div class="product-body">' +
        '<div class="product-meta"><span class="product-size"></span><span class="product-price"></span></div>' +
        '<h3 class="product-name"></h3>' +
        '<p class="product-desc"></p>' +
        '<div class="product-buy">' +
          '<div class="qty" role="group">' +
            '<button type="button" class="qty-btn" data-act="minus">&minus;</button>' +
            '<output class="qty-value" aria-live="polite">1</output>' +
            '<button type="button" class="qty-btn" data-act="plus">+</button>' +
          "</div>" +
          '<button type="button" class="btn btn-primary btn-add">Add to Order</button>' +
        "</div>" +
      "</div>";

    // Fill in text with textContent (safe) rather than inside the HTML string.
    const img = $("img", card);
    img.src = p.image;
    img.alt = p.name + ", " + p.size + " bottle";
    $(".product-size", card).textContent = p.size;
    $(".product-price", card).textContent = formatNaira(p.price);
    $(".product-name", card).textContent = p.name;
    $(".product-desc", card).textContent = p.description;
    $(".qty", card).setAttribute("aria-label", "Quantity of " + p.name);
    $('[data-act="minus"]', card).setAttribute("aria-label", "Decrease quantity of " + p.name);
    $('[data-act="plus"]', card).setAttribute("aria-label", "Increase quantity of " + p.name);
    $(".btn-add", card).setAttribute("aria-label", "Add " + p.name + " to order");

    watchImage(img);
    grid.appendChild(card);
    updateCardQty(card, p.id);
  });

  // One listener for every card button.
  grid.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;
    const card = button.closest(".product-card");
    if (!card) return;
    const id = card.dataset.id;

    if (button.dataset.act === "minus") {
      pending[id] = Math.max(0, pending[id] - 1);
      updateCardQty(card, id);
    } else if (button.dataset.act === "plus") {
      pending[id] = Math.min(MAX_QTY, pending[id] + 1);
      updateCardQty(card, id);
    } else if (button.classList.contains("btn-add")) {
      handleAdd(card, id, button);
    }
  });
}

function updateCardQty(card, id) {
  const qty = pending[id];
  $(".qty-value", card).textContent = qty;
  $('[data-act="minus"]', card).disabled = qty <= 0;
  $('[data-act="plus"]', card).disabled = qty >= MAX_QTY;
  $(".btn-add", card).disabled = qty <= 0;
}

const addTimers = {};
function handleAdd(card, id, button) {
  const qty = pending[id];
  if (qty < 1) return;
  const product = findProduct(id);

  addToCart(id, qty);
  showToast(bottlesLabel(qty) + " of " + product.name + " added to your order.");

  // Visual feedback on the button.
  button.classList.add("is-added");
  button.textContent = "Added ✓";
  clearTimeout(addTimers[id]);
  addTimers[id] = setTimeout(function () {
    button.classList.remove("is-added");
    button.textContent = "Add to Order";
  }, 1400);

  // Ready for the next add.
  pending[id] = 1;
  updateCardQty(card, id);
}

/* ---------- Photo strip (only photos that exist are shown) ---------- */

function buildGallery() {
  const box = $("#gallery");
  if (!box || !GALLERY.length) return;
  const results = new Array(GALLERY.length);
  let settled = 0;

  GALLERY.forEach(function (path, i) {
    const img = new Image();
    function done(ok) {
      results[i] = ok ? img : null;
      settled += 1;
      if (settled === GALLERY.length) {
        const loaded = results.filter(Boolean);
        if (!loaded.length) return;
        loaded.forEach(function (el) { box.appendChild(el); });
        box.hidden = false;
      }
    }
    img.onload = function () { done(true); };
    img.onerror = function () { done(false); };
    img.alt = "Fruithaus drinks";
    img.loading = "lazy";
    img.src = path;
  });
}

/* ---------- Ingredients / product information section ---------- */

function buildInfoList() {
  const list = $("#info-list");
  list.innerHTML = "";
  PRODUCTS.forEach(function (p) {
    const row = document.createElement("article");
    row.className = "info-item";
    row.style.setProperty("--drink", p.color);

    const swatch = document.createElement("span");
    swatch.className = "info-swatch";
    swatch.setAttribute("aria-hidden", "true");

    const wrap = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = p.name;
    const meta = document.createElement("p");
    meta.className = "info-meta";
    meta.textContent = p.size + " · " + formatNaira(p.price);
    const text = document.createElement("p");
    text.className = "info-text";
    text.textContent = p.ingredients && p.ingredients.trim() ? p.ingredients : INGREDIENTS_FALLBACK;

    wrap.appendChild(title);
    wrap.appendChild(meta);
    wrap.appendChild(text);
    row.appendChild(swatch);
    row.appendChild(wrap);
    list.appendChild(row);
  });
}

/* ---------- Order drawer rendering ---------- */

function renderCart() {
  const totals = cartTotals();
  const lines = $("#cart-lines");
  lines.innerHTML = "";

  totals.items.forEach(function (item) {
    const p = item.product;
    const li = document.createElement("li");
    li.className = "cart-line";
    li.dataset.id = p.id;

    const info = document.createElement("div");
    info.className = "cart-line-info";
    const name = document.createElement("p");
    name.className = "cart-line-name";
    name.textContent = p.name;
    const unit = document.createElement("p");
    unit.className = "cart-line-unit";
    unit.textContent = formatNaira(p.price) + " each · " + p.size;
    info.appendChild(name);
    info.appendChild(unit);

    const controls = document.createElement("div");
    controls.className = "cart-line-controls";

    const qty = document.createElement("div");
    qty.className = "qty qty-small";
    qty.setAttribute("role", "group");
    qty.setAttribute("aria-label", "Quantity of " + p.name);

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty-btn";
    minus.dataset.act = "dec";
    minus.innerHTML = "&minus;";
    minus.setAttribute("aria-label", "Reduce quantity of " + p.name);
    minus.disabled = item.qty <= 1; // use the bin button to remove a line

    const value = document.createElement("output");
    value.className = "qty-value";
    value.textContent = item.qty;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty-btn";
    plus.dataset.act = "inc";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase quantity of " + p.name);
    plus.disabled = item.qty >= MAX_QTY;

    qty.appendChild(minus);
    qty.appendChild(value);
    qty.appendChild(plus);

    const sub = document.createElement("p");
    sub.className = "cart-line-sub";
    sub.textContent = formatNaira(item.subtotal);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "link-btn";
    remove.dataset.act = "remove";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", "Remove " + p.name + " from order");

    controls.appendChild(qty);
    controls.appendChild(sub);
    controls.appendChild(remove);

    li.appendChild(info);
    li.appendChild(controls);
    lines.appendChild(li);
  });

  const isEmpty = totals.items.length === 0;
  $("#cart-empty").hidden = !isEmpty;
  lines.hidden = isEmpty;
  $("#cart-bottles").textContent = totals.bottles;
  $("#cart-total").textContent = formatNaira(totals.total);
  $("#cart-checkout").disabled = isEmpty;
  $("#cart-clear").hidden = isEmpty;
  if (isEmpty) hideCartError();

  // Badge on the nav button
  const badge = $("#cart-count");
  badge.textContent = totals.bottles;
  badge.classList.toggle("has-items", !isEmpty);
  $("#cart-count-sr").textContent = isEmpty
    ? "Your order, empty"
    : "Your order, " + bottlesLabel(totals.bottles) + ", " + formatNaira(totals.total);
}

function showCartError(message) {
  const el = $("#cart-error");
  el.textContent = message;
  el.hidden = false;
}
function hideCartError() {
  const el = $("#cart-error");
  el.textContent = "";
  el.hidden = true;
}

/* ---------- Drawer open / close ---------- */

let lastFocused = null;

function openCart() {
  lastFocused = document.activeElement;
  $("#cart-overlay").hidden = false;
  document.body.classList.add("cart-is-open");
  $("#cart-drawer").classList.add("is-open");
  $("#cart-open").setAttribute("aria-expanded", "true");
  setTimeout(function () { $("#cart-close").focus(); }, 50);
}

function closeCart() {
  $("#cart-drawer").classList.remove("is-open");
  $("#cart-overlay").hidden = true;
  document.body.classList.remove("cart-is-open");
  $("#cart-open").setAttribute("aria-expanded", "false");
  hideCartError();
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

function cartIsOpen() {
  return $("#cart-drawer").classList.contains("is-open");
}

// Keep Tab inside the drawer while it is open.
function trapFocus(event) {
  if (event.key !== "Tab" || !cartIsOpen()) return;
  const focusable = $("#cart-drawer").querySelectorAll(
    'a[href], button:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
  );
  const visible = Array.prototype.filter.call(focusable, function (el) {
    return el.offsetParent !== null;
  });
  if (!visible.length) return;
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ---------- Toast (small pop-up message) ---------- */

let toastTimer = null;
function showToast(message, long) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, long ? 6500 : 2600);
}

/* ---------- WhatsApp ---------- */

// A usable number is 8 to 15 digits (international format, digits only).
function whatsappNumberIsValid() {
  return /^[0-9]{8,15}$/.test(String(WHATSAPP_NUMBER));
}

const NUMBER_MISSING_MESSAGE =
  "WhatsApp ordering is not switched on yet. The site owner needs to add their WhatsApp number at the top of script.js.";

function buildOrderMessage() {
  const totals = cartTotals();
  const lines = [];
  lines.push("Hello Fruithaus! I'd like to place an order.");
  lines.push("");
  totals.items.forEach(function (item, index) {
    lines.push(
      (index + 1) + ". " + item.product.name + " — " +
      bottlesLabel(item.qty) + " × " + formatNaira(item.product.price) +
      " = " + formatNaira(item.subtotal)
    );
  });
  lines.push("");
  lines.push("Total bottles: " + totals.bottles);
  lines.push("Product total: " + formatNaira(totals.total));
  lines.push("");
  lines.push("Please confirm availability and the delivery or pickup options. Thank you!");
  return lines.join("\n");
}

function whatsappUrl(message) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

function openWhatsApp(message) {
  const url = whatsappUrl(message);
  const win = window.open(url, "_blank", "noopener");
  // If a pop-up blocker stopped it, go there in this tab instead.
  if (!win) window.location.href = url;
}

function handleCheckout() {
  hideCartError();
  const totals = cartTotals();
  if (totals.items.length === 0) {
    showCartError("Your order is empty. Add at least one drink first.");
    return;
  }
  if (!whatsappNumberIsValid()) {
    showCartError(NUMBER_MISSING_MESSAGE);
    return;
  }
  openWhatsApp(buildOrderMessage());
}

// "Order on WhatsApp" links around the page (no cart, just a hello message).
function setupGeneralWhatsAppLinks() {
  const links = document.querySelectorAll("[data-whatsapp]");
  const hello = "Hello Fruithaus! I'd like to place an order.";

  Array.prototype.forEach.call(links, function (link) {
    if (whatsappNumberIsValid()) {
      link.href = whatsappUrl(hello);
      link.target = "_blank";
      link.rel = "noopener";
    }
    link.addEventListener("click", function (event) {
      if (!whatsappNumberIsValid()) {
        event.preventDefault();
        showToast(NUMBER_MISSING_MESSAGE, true);
        return;
      }
      // If the customer already has items, send their order instead.
      if (cartTotals().items.length > 0) {
        event.preventDefault();
        openWhatsApp(buildOrderMessage());
      }
    });
  });
}

/* ---------- Mobile menu ---------- */

function setupMenu() {
  const toggle = $("#menu-toggle");
  const menu = $("#nav-menu");

  function setOpen(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-is-open", open);
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset when the window grows to desktop size.
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1000) setOpen(false);
  });
}

/* ---------- Start everything ---------- */

function init() {
  buildProductCards();
  buildInfoList();
  buildGallery();

  // Hero photo fallback
  const heroImg = $(".hero-media img");
  if (heroImg) watchImage(heroImg);

  // Order drawer events
  $("#cart-open").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  $("#cart-overlay").addEventListener("click", closeCart);
  $("#cart-browse").addEventListener("click", closeCart);
  $("#cart-checkout").addEventListener("click", handleCheckout);
  $("#cart-clear").addEventListener("click", function () {
    clearCart();
    showToast("Your order has been emptied.");
  });

  $("#cart-lines").addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;
    const line = button.closest(".cart-line");
    if (!line) return;
    const id = line.dataset.id;
    const current = cart[id] || 0;

    if (button.dataset.act === "inc") setCartQty(id, current + 1);
    else if (button.dataset.act === "dec") setCartQty(id, current - 1);
    else if (button.dataset.act === "remove") setCartQty(id, 0);

    // The line is redrawn, so put keyboard focus somewhere sensible.
    const stillThere = $('.cart-line[data-id="' + id + '"]');
    if (stillThere && button.dataset.act !== "remove") {
      const same = $('[data-act="' + button.dataset.act + '"]:not([disabled])', stillThere);
      (same || $(".qty-btn:not([disabled])", stillThere) || $("#cart-close")).focus();
    } else {
      $("#cart-close").focus();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && cartIsOpen()) closeCart();
    trapFocus(event);
  });

  setupMenu();
  setupGeneralWhatsAppLinks();
  renderCart();

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
}

init();
