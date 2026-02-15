let sepet = [];
let masa;

// Masa numarasını al
const urlParams = new URLSearchParams(window.location.search);
masa = urlParams.get("masa");
document.getElementById("masaNo").innerText = masa || "1";

// Menü yükleme
fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    const menuDiv = document.getElementById("menu");
    menuDiv.innerHTML = "";

    data.forEach(urun => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <img src="${urun.resim}" class="urun-resim" alt="${urun.isim}">
        <h3>${urun.isim}</h3>
        <p>${urun.fiyat} TL</p>
        <button onclick="ekle('${urun.isim}', ${urun.fiyat})">
          Sepete Ekle
        </button>
      `;

      menuDiv.appendChild(div);
    });
  })
  .catch(err => console.error("HATA:", err));

function ekle(urun, fiyat) {
  sepet.push({ urun, fiyat });
  listele();
}

function listele() {
  const liste = document.getElementById("sepet");
  liste.innerHTML = "";

  sepet.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.urun + " - " + item.fiyat + " TL";
    liste.appendChild(li);
  });
}

function siparisGonder() {
  if (sepet.length === 0) {
    alert("Sepet boş!");
    return;
  }

  fetch("/siparis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      masa: masa,
      urunler: sepet,
      tarih: new Date()
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Sipariş gönderildi!");
      sepet = [];
      listele();
    });
}
