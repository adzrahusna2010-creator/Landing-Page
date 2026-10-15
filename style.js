/* =====================================================
   PENGATURAN – EDIT DI SINI
   ===================================================== */
const WA_NUMBER = "6281572833235"; // nomor WhatsApp Donatsu (format 62...)

// Pilihan cara terima & ongkir (angka biaya silakan disesuaikan)
const ONGKIR = [
  { id: "ambil",  label: "Ambil di toko",                       biaya: 0,     antar: false },
  { id: "dekat",  label: "Diantar – Cijerah & sekitarnya",      biaya: 8000,  antar: true },
  { id: "sedang", label: "Diantar – Cimahi / Bandung Barat",    biaya: 12000, antar: true },
  { id: "jauh",   label: "Diantar – Kota Bandung",              biaya: 18000, antar: true }
];

/* =====================================================
   KODE UTAMA
   ===================================================== */
document.documentElement.classList.add("js");
const $  = (id) => document.getElementById(id);
const rp = (x) => "Rp" + x.toLocaleString("id-ID");
const waLink = (teks) => `https://wa.me/${WA_NUMBER}` + (teks ? `?text=${encodeURIComponent(teks)}` : "");

/* ---------- 1. Navbar: menu HP & efek saat scroll ---------- */
const navbar = $("navbar"), burger = $("burger"), navLinks = $("navLinks");

function tutupMenu() {
  navLinks.classList.remove("open");
  burger.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
}
burger.onclick = () => {
  const buka = navLinks.classList.toggle("open");
  burger.classList.toggle("open", buka);
  burger.setAttribute("aria-expanded", String(buka));
};
navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) tutupMenu(); });
window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 10), { passive: true });

/* ---------- 2. Teks berjalan & tahun footer ---------- */
$("mq").innerHTML = "🍩 Donat susu empuk &nbsp; 🌈 Topping warna-warni &nbsp; 💌 Bisa kirim pesan &nbsp; ".repeat(8);
$("year").textContent = new Date().getFullYear();

/* ---------- 3. Animasi saat section muncul ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((list) => {
    list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

/* ---------- 4. Foto produk (emoji jika foto belum ada) ---------- */
document.querySelectorAll("img.photo").forEach((img) => {
  const ganti = () => {
    const e = document.createElement("span");
    e.className = "emoji";
    e.textContent = img.dataset.emoji || "🍩";
    img.replaceWith(e);
  };
  img.addEventListener("error", ganti);
  if (img.complete && img.naturalWidth === 0) ganti();
});

/* ---------- 5. Menu & keranjang ---------- */
// Notifikasi kecil saat donat ditambahkan
const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
document.body.appendChild(toast);
let toastTimer;
function info(teks) {
  toast.textContent = teks;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

const items = [...document.querySelectorAll(".item")].map((el) => ({
  el, nama: el.dataset.name, harga: Number(el.dataset.price), qty: 0
}));

items.forEach((it) => {
  it.el.querySelector(".price").textContent = rp(it.harga);
  const bot = it.el.querySelector(".bot");
  const tombol = it.el.querySelector(".add");

  const qty = document.createElement("div");
  qty.className = "qty";
  qty.hidden = true;
  qty.innerHTML = `<button type="button" aria-label="Kurangi ${it.nama}">−</button><output>0</output><button type="button" aria-label="Tambah ${it.nama}">+</button>`;
  bot.appendChild(qty);
  const [kurang, tambah] = qty.querySelectorAll("button");
  const out = qty.querySelector("output");

  const tampil = () => {
    out.textContent = it.qty;
    qty.hidden = it.qty === 0;
    tombol.hidden = it.qty > 0;
    ringkasan();
  };
  it.tampil = tampil;
  tombol.onclick = () => { it.qty = 1; tampil(); info(`${it.nama} ditambahkan 🍩`); };
  tambah.onclick = () => { it.qty++; tampil(); };
  kurang.onclick = () => { if (it.qty > 0) { it.qty--; tampil(); } };
});

const dipilih  = () => items.filter((it) => it.qty > 0);
const subtotal = () => dipilih().reduce((s, it) => s + it.harga * it.qty, 0);
const area     = () => ONGKIR.find((o) => o.id === $("area").value) || ONGKIR[0];

/* ---------- 6. Ongkir & ringkasan pesanan ---------- */
ONGKIR.forEach((o) => $("area").add(new Option(`${o.label} – ${o.biaya ? rp(o.biaya) : "Gratis"}`, o.id)));

function aturAlamat() { $("alamatBox").classList.toggle("show", area().antar); }

function ringkasan() {
  const l = dipilih(), a = area();
  if (!l.length) {
    $("sum").innerHTML = `<b>Pesananmu masih kosong.</b><p class="note">Pilih donat di menu dulu ya 🍩</p>`;
  } else {
    const daftar = l.map((it) => `<li>${it.qty}x ${it.nama} <b>${rp(it.harga * it.qty)}</b></li>`).join("");
    $("sum").innerHTML =
      `<b>Pesananmu</b><ul>${daftar}</ul>
       <div class="row-sum"><span>Subtotal</span><span>${rp(subtotal())}</span></div>
       <div class="row-sum"><span>Ongkir</span><span>${a.biaya ? rp(a.biaya) : "Gratis"}</span></div>
       <div class="row-sum tot"><span>Total</span><span>${rp(subtotal() + a.biaya)}</span></div>`;
  }
  const jumlah = l.reduce((s, it) => s + it.qty, 0);
  $("cartbar").hidden = jumlah === 0;
  $("cartInfo").textContent = `${jumlah} item · ${rp(subtotal())}`;
}

$("area").onchange = () => { aturAlamat(); ringkasan(); };
$("kirim").onchange = function () {
  $("tujuan").classList.toggle("show", this.checked);
  // kirim ke orang lain = harus diantar
  if (this.checked && !area().antar) {
    const d = ONGKIR.find((o) => o.antar);
    if (d) { $("area").value = d.id; aturAlamat(); ringkasan(); }
  }
};
aturAlamat();
ringkasan();

/* ---------- 7. Tombol WhatsApp (CTA, kontak) ---------- */
$("waCta").href = waLink("Halo Donatsu! Aku mau pesan donat 🍩");
document.querySelectorAll("a[data-wa]").forEach((a) => { a.href = waLink(""); });

/* ---------- 7b. Form pesanan → pembayaran → struk ---------- */
let pesanan = null;
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("f").onsubmit = (e) => {
  e.preventDefault();
  const m = $("msg"), l = dipilih(), a = area();
  const bayar = document.querySelector('input[name="bayar"]:checked').value;
  const kado  = $("kirim").checked;

  if (!l.length)                                  { m.textContent = "Pilih minimal satu donat di menu dulu ya."; return; }
  if (!$("nama").value.trim())                    { m.textContent = "Isi nama pembeli dulu ya."; return; }
  if (kado && !$("penerima").value.trim())        { m.textContent = "Isi nama penerima dulu ya."; return; }
  if (a.antar && !$("alamat").value.trim())       { m.textContent = "Isi alamat pengantaran dulu ya."; return; }
  m.textContent = "";

  const sub = subtotal(), now = new Date();
  pesanan = {
    id: "DN" + now.toISOString().slice(2, 10).replace(/-/g, "") + "-" + (Math.floor(Math.random() * 900) + 100),
    waktu: now.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
    items: l.map(({ nama, harga, qty }) => ({ nama, harga, qty })),
    sub, ongkir: a.biaya, total: sub + a.biaya,
    nama: $("nama").value.trim(),
    penerima: kado ? $("penerima").value.trim() : "",
    area: a.label, antar: a.antar,
    alamat: a.antar ? $("alamat").value.trim() : "",
    pesan: $("pesanTxt").value.trim(),
    bayar
  };

  if (bayar === "qris") {
    $("payTotal").textContent = "Total bayar " + rp(pesanan.total);
    bukaDialog($("payDialog"));
  } else {
    selesai();
  }
};

/* QRIS: gambar pengganti bila file QR belum ada */
const qr = $("qrImg");
const qrKosong = () => {
  const p = document.createElement("p");
  p.className = "qr-miss";
  p.textContent = "Taruh gambar QRIS toko di images/qris-donatsu.png";
  qr.replaceWith(p);
};
qr.addEventListener("error", qrKosong);
if (qr.complete && qr.naturalWidth === 0) qrKosong();

$("payCancel").onclick = () => $("payDialog").close();
$("payDone").onclick   = () => { $("payDialog").close(); selesai(); };

/* Struk */
function selesai() {
  const o = pesanan;
  o.metode = o.bayar === "qris" ? "QRIS / pembayaran digital" : "Bayar di tempat (COD)";
  o.status = o.bayar === "qris"
    ? "✅ SUDAH DIBAYAR (QRIS)"
    : `💵 BELUM DIBAYAR – bayar ${o.antar ? "saat pesanan tiba" : "di toko saat mengambil"}`;
  $("strukBody").innerHTML = strukHTML(o);
  bukaDialog($("strukDialog"));
}

function strukHTML(o) {
  const baris = o.items.map((i) =>
    `<tr><td>${esc(i.nama)}<small>${i.qty} x ${rp(i.harga)}</small></td><td class="r">${rp(i.harga * i.qty)}</td></tr>`).join("");
  const meta = [
    ["No. pesanan", o.id],
    ["Tanggal", o.waktu],
    ["Pembeli", esc(o.nama)],
    o.penerima ? ["Penerima", esc(o.penerima)] : null,
    ["Cara terima", esc(o.area)],
    o.alamat ? ["Alamat", esc(o.alamat)] : null,
    ["Pembayaran", o.metode]
  ].filter(Boolean).map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("");

  return `<h3 id="strukTitle">Donatsu 🍩</h3>
    <p class="note c">Struk pesanan</p>
    <div class="meta">${meta}</div>
    <table>${baris}</table>
    <div class="row-sum"><span>Subtotal</span><span>${rp(o.sub)}</span></div>
    <div class="row-sum"><span>Ongkir</span><span>${o.ongkir ? rp(o.ongkir) : "Gratis"}</span></div>
    <div class="row-sum tot"><span>Total</span><span>${rp(o.total)}</span></div>
    <p class="status">${o.status}</p>
    ${o.pesan ? `<p class="kartu">Pesan di kartu: “${esc(o.pesan)}”</p>` : ""}
    <p class="note c">Terima kasih sudah memesan! 💖</p>`;
}

function strukTeks(o) {
  const l = o.items.map((i) => `- ${i.qty}x ${i.nama} @ ${rp(i.harga)} = ${rp(i.harga * i.qty)}`).join("\n");
  return `STRUK PESANAN DONATSU\nNo: ${o.id}\nTanggal: ${o.waktu}\n\n${l}\n\n` +
    `Subtotal: ${rp(o.sub)}\nOngkir: ${o.ongkir ? rp(o.ongkir) : "Gratis"}\nTOTAL: ${rp(o.total)}\n\n` +
    `Pembeli: ${o.nama}\n` + (o.penerima ? `Penerima: ${o.penerima}\n` : "") +
    `Cara terima: ${o.area}\n` + (o.alamat ? `Alamat: ${o.alamat}\n` : "") +
    `Pembayaran: ${o.metode}\nStatus: ${o.status}` +
    (o.pesan ? `\nPesan di kartu: ${o.pesan}` : "");
}

$("strukWa").onclick    = () => window.open(waLink(strukTeks(pesanan)), "_blank");
$("strukPrint").onclick = () => window.print();
$("strukDone").onclick  = () => $("strukDialog").close();

/* Setelah struk ditutup, keranjang & form dikosongkan */
$("strukDialog").addEventListener("close", () => {
  items.forEach((it) => { it.qty = 0; it.tampil(); });
  $("f").reset();
  $("tujuan").classList.remove("show");
  aturAlamat();
  ringkasan();
  pesanan = null;
});

/* ---------- 8. Slider review ---------- */
const track = $("track"), slides = track.children, dots = $("dots");
let idx = 0, timer;

[...slides].forEach((_, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("aria-label", `Review ${i + 1}`);
  b.onclick = () => { pindah(i); mulai(); };
  dots.appendChild(b);
});
function pindah(i) {
  idx = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${idx * 100}%)`;
  [...dots.children].forEach((d, n) => d.classList.toggle("on", n === idx));
}
function mulai() { clearInterval(timer); timer = setInterval(() => pindah(idx + 1), 6000); }
function berhenti() { clearInterval(timer); }
$("prev").onclick = () => { pindah(idx - 1); mulai(); };
$("next").onclick = () => { pindah(idx + 1); mulai(); };
pindah(0);
mulai();

/* ---------- 9. Kursor custom (bisa diganti foto) ---------- */
const cur = $("cur");

/* Popup (dialog) tampil di "top layer" browser, selalu di atas semua elemen,
   jadi kursor donat dipindah ke dalam popup selama popup terbuka. */
function bukaDialog(d) {
  d.showModal();
  d.appendChild(cur);
}
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) document.body.appendChild(cur); // kembalikan bila tidak ada popup lain
  });
});
const mouse = matchMedia("(hover:hover) and (pointer:fine)").matches;

document.addEventListener("mousemove", (e) => {
  if (!mouse) return;
  cur.classList.add("on");
  document.body.classList.add("mycur");
  cur.style.left = e.clientX + "px";
  cur.style.top  = e.clientY + "px";
});
document.addEventListener("mousedown", () => cur.classList.add("press"));
document.addEventListener("mouseup",   () => cur.classList.remove("press"));
document.documentElement.addEventListener("mouseleave", () => cur.classList.remove("on"));

if ($("foto")) $("foto").onchange = function () {
  const f = this.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { cur.textContent = ""; cur.style.backgroundImage = `url(${r.result})`; };
  r.readAsDataURL(f);
};
if ($("reset")) $("reset").onclick = () => { cur.style.backgroundImage = ""; cur.textContent = "🍩"; $("foto").value = ""; };

/* ---------- 10. Slider: jeda saat disentuh & geser (swipe) ---------- */
const slider = $("slider");
slider.addEventListener("mouseenter", berhenti);
slider.addEventListener("mouseleave", mulai);
slider.addEventListener("focusin", berhenti);
slider.addEventListener("focusout", mulai);

let awalX = 0;
slider.addEventListener("touchstart", (e) => { awalX = e.touches[0].clientX; berhenti(); }, { passive: true });
slider.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - awalX;
  if (Math.abs(dx) > 40) pindah(idx + (dx < 0 ? 1 : -1));
  mulai();
}, { passive: true });

/* ---------- 11. Smooth scrolling ke section (memperhitungkan tinggi navbar) ---------- */
const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id === "#") { e.preventDefault(); return; }       // link placeholder
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight + 1;
    window.scrollTo({ top: y, behavior: kurangiGerak ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });
});

/* ---------- 12. Menu aktif mengikuti posisi scroll ---------- */
const linkNav = [...navLinks.querySelectorAll('a[href^="#"]:not(.btn)')];
const spy = new IntersectionObserver((list) => {
  list.forEach((en) => {
    if (!en.isIntersecting) return;
    linkNav.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
linkNav.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s) spy.observe(s); });

/* ---------- 13. Menu HP: tutup dengan Esc, klik di luar, atau saat layar melebar ---------- */
document.addEventListener("keydown", (e) => { if (e.key === "Escape") tutupMenu(); });
document.addEventListener("click", (e) => { if (!navbar.contains(e.target)) tutupMenu(); });
window.addEventListener("resize", () => { if (window.innerWidth > 768) tutupMenu(); });
