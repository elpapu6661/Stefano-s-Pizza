/* =====================================================
   STEFANO PIZZA — configuración cargada desde data/config.json
   Si el archivo no está disponible (servidor local sin red),
   se usa DEFAULT_CONFIG embebido como fallback.
   ===================================================== */

const DEFAULT_CONFIG = {
  lat: -33.3912257,
  lng: -70.6419472,
  mapsLink: "https://maps.app.goo.gl/qQL93Sv9di4y3oRV6",
  address: "Stefano Pizza — ver dirección exacta en Google Maps",
  phone: "+56 9 0000 0000",
  whatsapp: "56900000000",
  hours: {
    "0": { label: "Domingo", open: "12:00", close: "22:00" },
    "1": { label: "Lunes", open: "12:00", close: "22:00" },
    "2": { label: "Martes", open: "12:00", close: "22:00" },
    "3": { label: "Miércoles", open: "12:00", close: "22:00" },
    "4": { label: "Jueves", open: "12:00", close: "22:00" },
    "5": { label: "Viernes", open: "12:00", close: "23:30" },
    "6": { label: "Sábado", open: "12:00", close: "23:30" }
  },
  menu: {
    Pizzas: {
      note: "Todas con masa artesanal y mozzarella. Precio Mediana / Familiar.",
      items: [
        { name: "Margarita", desc: "Salsa de tomate, mozzarella y albahaca fresca.", price: [7900, 11900], tag: "clásica" },
        { name: "Pepperoni", desc: "Pepperoni, mozzarella y orégano.", price: [8900, 12900], tag: "la favorita" },
        { name: "Napolitana", desc: "Tomate en rodajas, ajo, mozzarella y albahaca.", price: [8500, 12500] },
        { name: "Cuatro quesos", desc: "Mozzarella, parmesano, queso azul y provolone.", price: [9500, 13900] },
        { name: "Jamón y champiñón", desc: "Jamón, champiñones salteados y mozzarella.", price: [8900, 12900] },
        { name: "Stefano", desc: "La de la casa: carne, cebolla caramelizada, pimentón y aceitunas.", price: [10500, 14900], tag: "especial" }
      ]
    },
    Entradas: {
      note: "Para picar mientras sale la pizza.",
      items: [
        { name: "Palitos de ajo", desc: "Con queso gratinado y salsa de la casa.", price: [3900] },
        { name: "Bruschettas", desc: "Pan tostado, tomate, albahaca y aceite de oliva.", price: [4500] },
        { name: "Papas rústicas", desc: "Con piel, merkén y alioli.", price: [4200] }
      ]
    },
    Bebidas: {
      note: "Heladitas, como corresponde.",
      items: [
        { name: "Bebida lata", desc: "Coca-Cola, Sprite o Fanta.", price: [1800] },
        { name: "Bebida 1,5 L", desc: "Para compartir.", price: [3200] },
        { name: "Cerveza", desc: "Consulta las variedades del día.", price: [2800] },
        { name: "Jugo natural", desc: "Según fruta de temporada.", price: [2500] }
      ]
    },
    Postres: {
      note: "Si queda espacio.",
      items: [
        { name: "Tiramisú", desc: "Receta clásica, hecho en casa.", price: [3900] },
        { name: "Brownie con helado", desc: "Tibio, con helado de vainilla.", price: [3500] }
      ]
    }
  },
  promos: [
    { title: "Combo Pareja", big: "2 pizzas", text: "2 medianas a elección + 1 bebida 1,5 L.", when: "Lunes a jueves" },
    { title: "Familiar + Palitos", big: "Gratis", text: "Pide una pizza familiar y llévate palitos de ajo.", when: "Todos los días" },
    { title: "Retira y ahorra", big: "-10%", text: "Descuento si retiras en el local.", when: "Siempre" },
    { title: "Noche de amigos", big: "3x2", text: "En pizzas personales, para la juntita.", when: "Viernes" }
  ]
};

let CONFIG = DEFAULT_CONFIG;

async function loadConfig() {
  try {
    const res = await fetch("data/config.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    CONFIG = await res.json();
  } catch (err) {
    console.warn("No se pudo cargar data/config.json, usando configuración por defecto:", err);
    CONFIG = DEFAULT_CONFIG;
  }
}

/* ================= utilidades ================= */
const $ = (sel, root = document) => root.querySelector(sel);
const clp = n => "$" + n.toLocaleString("es-CL");
const toMin = hhmm => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

/* ================= enlaces / contacto ================= */
function initContact() {
  const mapFrame = $("#mapFrame");
  const mapSrc = `https://maps.google.com/maps?q=${CONFIG.lat},${CONFIG.lng}&z=17&output=embed`;
  mapFrame.src = mapSrc;

  mapFrame.addEventListener("error", () => {
    mapFrame.hidden = true;
    const fallback = $("#mapFallback");
    if (fallback) fallback.hidden = false;
  });

  $("#addressText").textContent = CONFIG.address;
  $("#dirBtn").href = CONFIG.mapsLink;

  $("#phoneText").textContent = CONFIG.phone;
  $("#callBtn").href = "tel:" + CONFIG.phone.replace(/[^+\d]/g, "");

  const msg = encodeURIComponent("¡Hola Stefano Pizza! Quisiera hacer un pedido.");
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
  $("#waBtn").href = wa;
  $("#heroOrder").href = wa;
  $("#heroOrder").target = "_blank";
  $("#heroOrder").rel = "noopener";

  const soc = $("#socialLinks");
  soc.innerHTML = "";
  if (CONFIG.socials && CONFIG.socials.length) {
    CONFIG.socials.forEach(s => {
      const a = document.createElement("a");
      a.href = s.url;
      a.textContent = s.name;
      a.target = "_blank";
      a.rel = "noopener";
      soc.appendChild(a);
    });
  } else {
    const empty = document.createElement("span");
    empty.className = "empty";
    empty.textContent = "Muy pronto en redes.";
    soc.appendChild(empty);
  }

  $("#year").textContent = new Date().getFullYear();
}

/* ================= carta ================= */
function renderMenu(cat) {
  const data = CONFIG.menu[cat];
  const list = $("#menuList");
  list.innerHTML = "";
  data.items.forEach((it, i) => {
    const li = document.createElement("li");
    li.className = "item";
    li.style.animationDelay = (i * 60) + "ms";
    const h4 = document.createElement("h4");
    h4.textContent = it.name;
    if (it.tag) {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = `· ${it.tag}`;
      h4.appendChild(tag);
    }
    li.appendChild(h4);

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = it.price.map(clp).join(" / ");
    li.appendChild(price);

    const desc = document.createElement("p");
    desc.textContent = it.desc;
    li.appendChild(desc);

    list.appendChild(li);
  });
  $("#menuNote").textContent = data.note || "";
}

function initMenu() {
  const tabs = $("#tabs");
  const cats = Object.keys(CONFIG.menu);
  cats.forEach((cat, i) => {
    const b = document.createElement("button");
    b.className = "tab";
    b.type = "button";
    b.role = "tab";
    b.textContent = cat;
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.addEventListener("click", () => {
      tabs.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", "false"));
      b.setAttribute("aria-selected", "true");
      renderMenu(cat);
    });
    tabs.appendChild(b);
  });
  renderMenu(cats[0]);
}

/* ================= promos ================= */
function initPromos() {
  const grid = $("#promoGrid");
  CONFIG.promos.forEach(p => {
    const d = document.createElement("article");
    d.className = "promo reveal";

    const h3 = document.createElement("h3");
    h3.textContent = p.title;
    d.appendChild(h3);

    const big = document.createElement("div");
    big.className = "big";
    big.textContent = p.big;
    d.appendChild(big);

    const text = document.createElement("p");
    text.textContent = p.text;
    d.appendChild(text);

    const when = document.createElement("div");
    when.className = "when";
    when.textContent = p.when;
    d.appendChild(when);

    grid.appendChild(d);
  });
}

/* ================= pala de pizza: tipo aleatorio en cada visita ================= */
const SVG_NS = "http://www.w3.org/2000/svg";
const PIZZA_CENTER = { x: 250, y: 250 };

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function toppingGroup(dx, dy, children, rotate = 0) {
  const g = svgEl("g", {
    transform: `translate(${PIZZA_CENTER.x + dx} ${PIZZA_CENTER.y + dy})${rotate ? ` rotate(${rotate})` : ""}`
  });
  children.forEach(child => g.appendChild(child));
  return g;
}

const PEPPERONI_SPOTS = [[-72,-52],[58,-66],[84,30],[38,82],[-48,74],[-86,10],[-18,-84],[66,58]];
function pepperoni(count = PEPPERONI_SPOTS.length) {
  return PEPPERONI_SPOTS.slice(0, count).map(([dx, dy]) => toppingGroup(dx, dy, [
    svgEl("circle", { r: 16, fill: "#a62418", stroke: "#6f160f", "stroke-width": 2 }),
    svgEl("circle", { r: 11, fill: "#b93226", opacity: .5 }),
    svgEl("circle", { cx: -4, cy: -3, r: 2, fill: "#6f160f", opacity: .5 }),
    svgEl("circle", { cx: 5, cy: 4, r: 1.6, fill: "#6f160f", opacity: .5 })
  ]));
}

const TOMATO_SPOTS = [[-75,-40],[10,-78],[80,-30],[70,55],[-30,85],[-88,30],[0,10]];
function tomatoes(count = TOMATO_SPOTS.length) {
  return TOMATO_SPOTS.slice(0, count).map(([dx, dy]) => toppingGroup(dx, dy, [
    svgEl("circle", { r: 15, fill: "#d84b2f", stroke: "#a52c1a", "stroke-width": 2 }),
    svgEl("circle", { r: 9, fill: "#e86a4a" }),
    svgEl("circle", { cx: -3, cy: -2, r: 1.4, fill: "#f4d27a" }),
    svgEl("circle", { cx: 3, cy: 3, r: 1.4, fill: "#f4d27a" }),
    svgEl("circle", { cx: -3, cy: 4, r: 1.1, fill: "#f4d27a" })
  ]));
}

const BASIL_SPOTS = [[-38,-88,-25],[92,-40,40],[28,92,-10],[-84,50,70],[5,-30,50],[-20,-10,15]];
function basil(count = BASIL_SPOTS.length) {
  return BASIL_SPOTS.slice(0, count).map(([dx, dy, rot]) => toppingGroup(dx, dy, [
    svgEl("ellipse", { rx: 11, ry: 5, fill: "#3d7a35" }),
    svgEl("path", { d: "M-10 0 Q0 -3 10 0", stroke: "#2a5a25", "stroke-width": 1.4, fill: "none" })
  ], rot));
}

function mozzarella() {
  const spots = [[-40,-55,15],[55,-20,-20],[10,60,10],[-60,35,35],[20,-20,-10]];
  return spots.map(([dx, dy, rot]) => toppingGroup(dx, dy, [
    svgEl("ellipse", { rx: 15, ry: 11, fill: "#fff6d5", stroke: "#e9d08c", "stroke-width": 2, opacity: .95 })
  ], rot));
}

const GARLIC_SPOTS = [[-30,-20],[40,10],[-10,60],[70,-40],[-70,30]];
function garlic() {
  return GARLIC_SPOTS.map(([dx, dy], i) => toppingGroup(dx, dy, [
    svgEl("ellipse", { rx: 9, ry: 5, fill: "#f6ead2", stroke: "#d8c7a0", "stroke-width": 1.5 })
  ], i * 40));
}

const MUSHROOM_SPOTS = [[-60,-55,0],[55,-60,25],[75,30,-15],[20,80,10],[-50,60,-25],[-85,5,40]];
function mushrooms() {
  return MUSHROOM_SPOTS.map(([dx, dy, rot]) => toppingGroup(dx, dy, [
    svgEl("path", { d: "M-12 2 Q-12 -12 0 -12 Q12 -12 12 2 Z", fill: "#d9b98a", stroke: "#b9925f", "stroke-width": 1.5 }),
    svgEl("rect", { x: -3, y: 1, width: 6, height: 10, rx: 2, fill: "#efe2c4" })
  ], rot));
}

const HAM_SPOTS = [[-55,-35,20],[45,-50,-15],[80,25,30],[-20,75,-20],[-80,20,10],[20,5,-35]];
function ham() {
  return HAM_SPOTS.map(([dx, dy, rot]) => toppingGroup(dx, dy, [
    svgEl("ellipse", { rx: 14, ry: 9, fill: "#e89090", stroke: "#c96b6b", "stroke-width": 2 }),
    svgEl("path", { d: "M-9 0 Q0 5 9 0", stroke: "#f6caca", "stroke-width": 2, fill: "none" })
  ], rot));
}

const OLIVE_SPOTS = [[-50,-20],[30,-60],[75,10],[40,60],[-30,70],[-80,25],[0,20]];
function olives() {
  return OLIVE_SPOTS.map(([dx, dy]) => toppingGroup(dx, dy, [
    svgEl("circle", { r: 6, fill: "#2e1b12" }),
    svgEl("circle", { r: 3, fill: "#6b3f24" })
  ]));
}

const ONION_SPOTS = [[-45,-65,15],[50,-35,-20],[65,55,30],[-55,50,-10]];
function onions() {
  return ONION_SPOTS.map(([dx, dy, rot]) => toppingGroup(dx, dy, [
    svgEl("path", { d: "M-14 0 Q0 -7 14 0", stroke: "#f6ead2", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }),
    svgEl("path", { d: "M-11 6 Q0 0 11 6", stroke: "#e3d3b4", "stroke-width": 2.4, fill: "none", "stroke-linecap": "round" })
  ], rot));
}

const PEPPER_SPOTS = [[-35,-30,10],[45,-70,-25],[80,45,20],[-70,70,-15]];
function peppers() {
  return PEPPER_SPOTS.map(([dx, dy, rot], i) => toppingGroup(dx, dy, [
    svgEl("rect", { x: -9, y: -3, width: 18, height: 6, rx: 3, fill: i % 2 ? "#f2b134" : "#d6402a", stroke: "#a52c1a", "stroke-width": 1 })
  ], rot));
}

const CHEESE_SPOTS = [
  [-50,-50,0,"#fff3c8"], [45,-60,20,"#f7d98a"], [75,20,-15,"#e8b84a"],
  [20,70,10,"#fff3c8"], [-60,50,-25,"#f7d98a"], [-85,5,30,"#e8b84a"], [0,0,0,"#fff3c8"]
];
function cheeseBlobs() {
  return CHEESE_SPOTS.map(([dx, dy, rot, fill]) => toppingGroup(dx, dy, [
    svgEl("ellipse", { rx: 18, ry: 12, fill, stroke: "#d9b45a", "stroke-width": 1.5, opacity: .95 }),
    ...(fill === "#e8b84a"
      ? [svgEl("circle", { cx: 4, cy: -2, r: 2, fill: "#7d8f5a" }), svgEl("circle", { cx: -5, cy: 3, r: 1.6, fill: "#7d8f5a" })]
      : [])
  ], rot));
}

const PIZZA_TYPES = [
  { name: "Margarita", short: "Margarita", make: () => [...mozzarella(), ...tomatoes(5), ...basil(4)] },
  { name: "Pepperoni", short: "Pepperoni", make: () => pepperoni() },
  { name: "Napolitana", short: "Napolitana", make: () => [...tomatoes(6), ...garlic(), ...basil(3)] },
  { name: "Cuatro quesos", short: "4 quesos", make: () => cheeseBlobs() },
  { name: "Jamón y champiñón", short: "Jamón", make: () => [...ham(), ...mushrooms()] },
  { name: "Stefano", short: "Stefano", make: () => [...pepperoni(4), ...olives(), ...onions(), ...peppers()] }
];

function initPizza() {
  const layer = $("#pizzaToppings");
  if (!layer) return;
  const type = PIZZA_TYPES[Math.floor(Math.random() * PIZZA_TYPES.length)];
  type.make().forEach(node => layer.appendChild(node));

  const svg = $(".peel-svg");
  if (svg) svg.setAttribute("aria-label", `Pala con pizza ${type.name}`);

  const sticky = $("#pizzaSticky");
  if (sticky) {
    sticky.textContent = "";
    sticky.appendChild(document.createTextNode("Hoy:"));
    sticky.appendChild(document.createElement("br"));
    sticky.appendChild(document.createTextNode(type.short));
  }
}

/* ================= horarios y estado abierto/cerrado ================= */
function initHours() {
  const ul = $("#hoursList");
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  order.forEach(d => {
    const h = CONFIG.hours[d];
    const li = document.createElement("li");
    if (d === today) li.classList.add("today");
    const span1 = document.createElement("span");
    span1.textContent = h.label;
    const span2 = document.createElement("span");
    span2.textContent = `${h.open} – ${h.close}`;
    li.appendChild(span1);
    li.appendChild(span2);
    ul.appendChild(li);
  });

  const badge = $("#openBadge");
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const t = CONFIG.hours[today];
  const prev = CONFIG.hours[(today + 6) % 7];
  const o = toMin(t.open), c = toMin(t.close);
  const openToday = c > o ? (mins >= o && mins < c) : (mins >= o);
  const openFromYesterday = toMin(prev.close) < toMin(prev.open) && mins < toMin(prev.close);
  const isOpen = openToday || openFromYesterday;

  badge.hidden = false;
  badge.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
  badge.classList.toggle("closed", !isOpen);
}

/* ================= menú móvil ================= */
function initNav() {
  const burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }));
}

/* ================= animación al hacer scroll ================= */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(e => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: .12 });
  els.forEach(e => io.observe(e));
}

/* ================= arranque ================= */
document.addEventListener("DOMContentLoaded", async () => {
  initPizza();
  await loadConfig();
  initContact();
  initMenu();
  initPromos();
  initHours();
  initNav();
  initReveal();
});
