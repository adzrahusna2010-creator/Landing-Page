/* =====================================================
   PENGATURAN – EDIT DI SINI
   ===================================================== */
const WA_NUMBER = "6281572833235"; // ganti dengan nomor WhatsApp Donatsu (format 62...)

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

/* ---------- 5. Menu & pesanan ---------- */
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
  tombol.onclick = () => { it.qty = 1; tampil(); info(`${it.nama} ditambahkan 🍩`); };
  tambah.onclick = () => { it.qty++; tampil(); };
  kurang.onclick = () => { if (it.qty > 0) { it.qty--; tampil(); } };
});

const dipilih = () => items.filter((it) => it.qty > 0);
const baris   = () => dipilih().map((it) => `${it.qty}x ${it.nama} (${rp(it.harga * it.qty)})`);
const total   = () => dipilih().reduce((s, it) => s + it.harga * it.qty, 0);

function ringkasan() {
  const l = baris();
  $("sum").innerHTML = l.length
    ? `<b>Pesananmu</b><ul><li>${l.join("</li><li>")}</li></ul><div class="tot">Total ${rp(total())}</div>`
    : `<b>Pesananmu masih kosong.</b><p class="note">Pilih donat di menu dulu ya 🍩</p>`;
  const jumlah = dipilih().reduce((s, it) => s + it.qty, 0);
  $("cartbar").hidden = jumlah === 0;
  $("cartInfo").textContent = `${jumlah} item · ${rp(total())}`;
}
ringkasan();

/* ---------- 6. Tombol WhatsApp (CTA, kontak, footer) ---------- */
$("waCta").href = waLink("Halo Donatsu! Aku mau pesan donat 🍩");
document.querySelectorAll("a[data-wa]").forEach((a) => { a.href = waLink(""); });

/* ---------- 7. Form pesanan ---------- */
$("kirim").onchange = function () { $("tujuan").classList.toggle("show", this.checked); };

$("f").onsubmit = (e) => {
  e.preventDefault();
  const m = $("msg"), l = baris();
  if (!l.length)               { m.textContent = "Pilih minimal satu donat di menu dulu ya."; return; }
  if (!$("nama").value.trim()) { m.textContent = "Isi nama pembeli dulu ya."; return; }

  let t = `Halo Donatsu! Aku mau pesan:\n${l.join("\n")}\nTotal: ${rp(total())}\n\nNama pembeli: ${$("nama").value}`;
  if ($("kirim").checked) {
    if (!$("penerima").value.trim() || !$("alamat").value.trim()) { m.textContent = "Isi nama penerima dan alamatnya dulu."; return; }
    t += `\nDikirim ke: ${$("penerima").value}\nAlamat: ${$("alamat").value}`;
  } else {
    t += "\nUntuk saya sendiri.";
  }
  if ($("pesanTxt").value.trim()) t += `\nPesan di kartu: ${$("pesanTxt").value}`;

  m.textContent = "Membuka WhatsApp...";
  window.open(waLink(t), "_blank");
};

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

$("foto").onchange = function () {
  const f = this.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { cur.textContent = ""; cur.style.backgroundImage = `url(${r.result})`; };
  r.readAsDataURL(f);
};
$("reset").onclick = () => { cur.style.backgroundImage = ""; cur.textContent = "🍩"; $("foto").value = ""; };

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