let allProducts = [
  { id: 1, name: "Proteína Whey", brand: "MuscleTech", category: "Suplementos", price: 150, stock: 10, rating: 4, image: "https://via.placeholder.com/150", description: "Suplemento proteico ideal para recuperación muscular." },
  { id: 2, name: "Camiseta DryFit", brand: "Nike", category: "Ropa", price: 45, stock: 20, rating: 5, image: "https://via.placeholder.com/150", description: "Camiseta transpirable perfecta para entrenar." },
  { id: 3, name: "Botella shaker", brand: "SmartShake", category: "Accesorios", price: 25, stock: 15, rating: 3, image: "https://via.placeholder.com/150", description: "Botella mezcladora resistente y práctica." }
];

let shown = 0;
let carrito = [];

// Cargar estado inicial
window.addEventListener("DOMContentLoaded", () => {
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    actualizarCarrito();
  }

  const modoOscuro = localStorage.getItem("modoOscuro") === "true";
  if (modoOscuro) {
    document.body.classList.add("dark-mode", "bg-dark", "text-white");
    document.body.classList.remove("bg-light", "text-dark");
  }

  loadMore();
});

function adaptarModalOscuro(modalId) {
  const modalContent = document.querySelector(`#${modalId} .modal-content`);
  if (document.body.classList.contains("dark-mode")) {
    modalContent.classList.add("bg-dark", "text-white");
  } else {
    modalContent.classList.remove("bg-dark", "text-white");
  }
}

function renderProducts(products) {
  const container = document.getElementById("productContainer");
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "col-md-4";
    card.innerHTML = `
      <div class="card h-100">
        <img src="${p.image}" class="card-img-top" alt="${p.name}" onclick="mostrarDetalles(${p.id})" style="cursor:pointer;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">${p.brand} - $${p.price}</p>
          <button class="btn btn-outline-primary w-100 mb-2 mt-auto" onclick="agregarAlCarrito(${p.id})">Agregar al carrito</button>
          <a class="btn btn-success w-100" href="https://wa.me/59899946914?text=Hola,%20quiero%20consultar%20por%20el%20producto:%20${encodeURIComponent(p.name)}" target="_blank">Consultar por WhatsApp</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function loadMore() {
  const remaining = allProducts.slice(shown, shown + 3);
  renderProducts(remaining);
  shown += 3;
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-mode");

  if (isDark) {
    body.classList.add("bg-dark", "text-white");
    body.classList.remove("bg-light", "text-dark");
  } else {
    body.classList.remove("bg-dark", "text-white");
    body.classList.add("bg-light", "text-dark");
  }

  localStorage.setItem("modoOscuro", isDark);
}

function agregarAlCarrito(id) {
  const prod = allProducts.find(p => p.id === id);
  carrito.push(prod);
  actualizarCarrito();
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarCarrito() {
  document.getElementById("carritoCount").innerText = carrito.length;
}

function mostrarDetalles(id) {
  const prod = allProducts.find(p => p.id === id);
  document.getElementById("modalTitle").innerText = prod.name;
  document.getElementById("modalBody").innerHTML = `
    <img src="${prod.image}" class="img-fluid mb-2">
    <p><strong>Marca:</strong> ${prod.brand}</p>
    <p><strong>Precio:</strong> $${prod.price}</p>
    <p><strong>Categoría:</strong> ${prod.category}</p>
    <p>${prod.description}</p>
  `;
  adaptarModalOscuro("productoModal");
  const modal = new bootstrap.Modal(document.getElementById("productoModal"));
  modal.show();
}

function verCarrito() {
  const carritoBody = document.getElementById("carritoBody");
  carritoBody.innerHTML = "";

  if (carrito.length === 0) {
    carritoBody.innerHTML = "<p>El carrito está vacío.</p>";
  } else {
    const agrupados = {};
    carrito.forEach(p => {
      if (!agrupados[p.id]) agrupados[p.id] = { ...p, cantidad: 0 };
      agrupados[p.id].cantidad++;
    });

    for (const key in agrupados) {
      const item = agrupados[key];
      const div = document.createElement("div");
      div.classList.add("mb-3", "border-bottom", "pb-2");
      div.innerHTML = `
        <strong>${item.name}</strong> - Cantidad: ${item.cantidad} <br>
        Precio unitario: $${item.price} <br>
        Subtotal: $${item.price * item.cantidad}
      `;
      carritoBody.appendChild(div);
    }

    const total = carrito.reduce((sum, p) => sum + p.price, 0);
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("fw-bold", "mt-3");
    totalDiv.innerText = `Total: $${total}`;
    carritoBody.appendChild(totalDiv);
  }

  adaptarModalOscuro("carritoModal");
  const modal = new bootstrap.Modal(document.getElementById("carritoModal"));
  modal.show();
}

function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
  localStorage.removeItem("carrito");

  // Cerramos el modal si está abierto
  const modalEl = document.getElementById("carritoModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) {
    modal.hide();
  }

  // Limpiamos el contenido del modal para que no quede info vieja
  document.getElementById("carritoBody").innerHTML = "<p>El carrito está vacío.</p>";
}

function enviarCarritoPorWhatsApp() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const nombre = prompt("Escribí tu nombre:");
  if (!nombre) return;

  const ubicacion = prompt("¿Dónde te encontrás? (opcional)") || "";

  const agrupados = {};
  carrito.forEach(p => {
    if (!agrupados[p.id]) agrupados[p.id] = { ...p, cantidad: 0 };
    agrupados[p.id].cantidad++;
  });

  let mensaje = `Hola, soy ${nombre}`;
  if (ubicacion) mensaje += ` desde ${ubicacion}`;
  mensaje += `. Quiero consultar por los siguientes productos:\n\n`;

  let total = 0;
  for (const key in agrupados) {
    const item = agrupados[key];
    const subtotal = item.price * item.cantidad;
    mensaje += `🔹 ${item.name} x${item.cantidad} - $${subtotal}\n`;
    total += subtotal;
  }

  mensaje += `\n🧾 Total: $${total}`;

  // Número correcto sin espacios ni símbolos
  const telefono = "59899946914";
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// Filtros
document.getElementById("searchInput").addEventListener("input", filterProducts);
document.getElementById("categoryFilter").addEventListener("change", filterProducts);
document.getElementById("priceRange").addEventListener("input", () => {
  document.getElementById("priceLabel").innerText = "Precio hasta: $" + document.getElementById("priceRange").value;
  filterProducts();
});

function filterProducts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const maxPrice = parseInt(document.getElementById("priceRange").value);
  const container = document.getElementById("productContainer");
  container.innerHTML = "";
  shown = 0;

  const filtered = allProducts.filter(p =>
    (p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)) &&
    (!category || p.category === category) &&
    p.price <= maxPrice
  );

  renderProducts(filtered);
  shown = filtered.length;
}
