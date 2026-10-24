(function () {
  var WHATSAPP_NUMBER = "2348140412877"; // <- your number: country code first, no +, spaces or leading 0

  function naira(n) { return "₦" + n.toLocaleString("en-NG"); }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");

  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.textContent = isOpen ? "✕" : "☰";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- Order summary ---------- */
  var selects = document.querySelectorAll(".qty");
  var summary = document.getElementById("summary");
  var totalEl = document.getElementById("total");

  function getItems() {
    var items = [];
    selects.forEach(function (s) {
      var qty = parseInt(s.value, 10) || 0;
      if (qty > 0) {
        var price = parseInt(s.dataset.price, 10);
        items.push({ name: s.dataset.product, qty: qty, line: qty * price });
      }
    });
    return items;
  }

  function render() {
    var items = getItems();
    var total = 0;
    if (!items.length) {
      summary.innerHTML = '<p class="empty">Choose quantities above to start your order.</p>';
    } else {
      summary.innerHTML = items.map(function (i) {
        total += i.line;
        return '<div class="summary-item"><span>' + i.qty + " × " + i.name +
               "</span><span>" + naira(i.line) + "</span></div>";
      }).join("");
    }
    totalEl.textContent = naira(total);
  }

  selects.forEach(function (s) { s.addEventListener("change", render); });
  render();

  /* ---------- Send order to WhatsApp ---------- */
  var form = document.getElementById("orderForm");
  var errorEl = document.getElementById("error");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stops the jump to the top of the page
    var items = getItems();

    if (!items.length) {
      errorEl.textContent = "Please choose at least one drink above before continuing.";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    var total = items.reduce(function (sum, i) { return sum + i.line; }, 0);
    var name = document.getElementById("name").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var area = document.getElementById("area").value.trim();
    var note = document.getElementById("note").value.trim();

    var lines = ["Hello Fruithaus, I'd like to place an order:", ""];
    items.forEach(function (i) {
      lines.push(i.qty + " x " + i.name + " - " + naira(i.line));
    });
    lines.push("", "Subtotal: " + naira(total), "");
    lines.push("Name: " + name, "Phone: " + phone, "Delivery area: " + area);
    if (note) lines.push("Note: " + note);

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    var win = window.open(url, "_blank");
    if (!win) window.location.href = url; // fallback if the browser blocks the new tab
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
