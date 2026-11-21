const API = "http://localhost:3000";
const productsList = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const maxPrice = document.getElementById("max-price");
const inStockFilter = document.getElementById("in-stock-filter");
const resetFilters = document.getElementById("reset-filters");
const cartDialog = document.getElementById("cart-dialog");
const openCart = document.getElementById("open-cart");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartEmptyMessage = document.getElementById("cart-empty-message");
const cartProductCount = document.getElementById("cart-product-count");
const cartItemCount = document.getElementById("cart-item-count");
const cartTotal = document.getElementById("cart-total");
const clearCart = document.getElementById("clear-cart");
let products = [];
let cart = readCartFromLS();

openCart.addEventListener("click", (event) => {
  event.preventDefault();
  cartDialog.showModal();
});

closeCart.addEventListener("click", () => {
  cartDialog.close();
});

clearCart.addEventListener("click", () => {
  cart = [];
  saveCartToLS();
  renderCart();
});

async function loadProducts() {
  try {
    const response = await fetch(API + "/api/products");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    products = await response.json();

    displayProducts(products);
  } catch (error) {
    console.error(error.message);
  }
}

async function loadCategories() {
  try {
    const response = await fetch(API + "/api/categories");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const categories = await response.json();

    displayCategories(categories);
  } catch (error) {
    console.error(error.message);
  }
}

function displayCategories(categories) {
  categories.forEach((category) => {
    categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
  });
}

function displayProducts(products) {
  const productCount = document.getElementById("product-count");
  const emptyMessage = document.getElementById("empty-message");

  emptyMessage.classList.toggle("hidden", products.length > 0);

  productCount.textContent = `${products.length} products`;

  productsList.innerHTML = "";

  products.forEach((product) => {
    productsList.innerHTML += `<article
  id="${product.id}"
  categoryId="${product.categoryId}"
  class="bg-[#302E2A] border border-[#3A3834] rounded-2xl overflow-hidden hover:border-[#C6AD88]/50 transition-colors"
>
  <div
    id="product-image"
    class="flex justify-center items-center bg-[#272622]"
  >
    <img src="${API}${product.image}" class="w-full h-full object-contain" />
  </div>
  <div id="product-info" class="flex flex-col gap-3 p-5">
    <div class="flex flex-col gap-1">
      <h2 class="font-bold text-lg">${product.name}</h2>
      <p class="text-sm text-[#A39B91]">${product.description}</p>
    </div>
    <div
      id="product-details"
      class="flex justify-between items-center pt-3 border-t border-[#49443C]"
    >
      <span class="text-[#C6AD88] font-bold text-xl">${product.price}</span>
      <div class="flex flex-col items-end gap-1">
        <span
          class="text-xs text-[#C6AD88] bg-[#3B3730] px-2.5 py-1 rounded-full"
          >${product.categoryName}</span
        >
        <span class="text-xs text-[#A39B91]">Stock: ${product.stock}</span>
      </div>
    </div>
    <button
      type="button"
      onclick="addToCart(${product.id})"
      class="mt-1 w-full bg-[#C6AD88] text-[#272622] font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-[#d4be9d] active:scale-[0.98] transition-all cursor-pointer"
    >
      Add to Cart
    </button>
  </div>
</article>
`;
  });
}

function filterProducts() {
  searchInput.addEventListener("input", fetchFilters);
  categoryFilter.addEventListener("change", fetchFilters);
  maxPrice.addEventListener("input", fetchFilters);
  inStockFilter.addEventListener("change", fetchFilters);
  resetFilters.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    maxPrice.value = "";
    inStockFilter.checked = false;
    fetchFilters();
  });
}

async function fetchFilters() {
  const params = new URLSearchParams();

  const searchValue = searchInput.value.trim();
  const categoryValue = categoryFilter.value;
  const priceValue = maxPrice.value;
  const stockChecked = inStockFilter.checked;

  try {
    if (searchValue !== "") {
      params.append("search", searchValue);
    }

    if (categoryValue !== "") {
      params.append("categoryId", categoryValue);
    }

    if (priceValue !== "") {
      params.append("maxPrice", priceValue);
    }

    if (stockChecked) {
      params.append("inStock", "true");
    }

    const urlstring = params.toString();

    if (urlstring !== "") {
      const urlresponse = await fetch(API + "/api/products?" + urlstring);

      if (!urlresponse.ok) {
        throw new Error("Something went wrong");
      }

      const urljson = await urlresponse.json();

      displayProducts(urljson);
    } else {
      loadProducts();
    }
  } catch (error) {
    console.error(error.message);
    document.getElementById("empty-message").classList.remove("hidden");
  }
}

function addToCart(id) {
  const clickedProduct = products.find((product) => product.id === id);

  if (!clickedProduct) {
    return;
  }

  const existingItem = cart.find((item) => item.productId === id);

  if (existingItem) {
    if (existingItem.quantity < clickedProduct.stock) {
      existingItem.quantity++;
    } else {
      NotifyX.error("", {
        duration: 4000,
        dismissible: true,
        position: "top-right",
        theme: "glass",
        animation: "spring",
        priority: "normal",
        title: "You cannot add more than the available stock.",
        showIcon: true,
      });
      return;
    }
  } else {
    if (clickedProduct.stock <= 0) {
      NotifyX.error("", {
        duration: 4000,
        dismissible: true,
        position: "top-right",
        theme: "glass",
        animation: "spring",
        priority: "normal",
        title: "This product is out of stock.",
        showIcon: true,
      });
      return;
    }

    cart.push({
      productId: clickedProduct.id,
      name: clickedProduct.name,
      description: clickedProduct.description,
      image: clickedProduct.image,
      unitPrice: Number(clickedProduct.price),
      quantity: 1,
      stock: clickedProduct.stock,
    });
  }

  saveCartToLS();
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    cartItems.innerHTML += `
      <article
        class="cart-item flex gap-4 bg-[#272622] border border-[#49443C] rounded-xl p-3"
      >
        <img
          src="${API}${item.image}"
          class="w-20 h-24 object-contain rounded-lg"
        />

        <div class="flex flex-1 justify-between">
          <div>
            <h4 class="font-bold text-sm">${item.name}</h4>
            <p class="text-xs text-[#A39B91]">${item.description}</p>
            <p class="text-[#C6AD88]">${item.unitPrice}</p>
          </div>

          <div class="flex flex-col justify-between items-end">
            <span>Quantity: ${item.quantity}</span>
            <span>
              Subtotal: ${(item.unitPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </article>
    `;
  });

  cartEmptyMessage.classList.toggle("hidden", cart.length > 0);
  cartProductCount.textContent = `${cart.length} products`;

  let totalItems = 0;
  let totalPrice = 0;
  cart.forEach((item) => {
    totalItems += item.quantity;
    totalPrice += item.unitPrice * item.quantity;
  });
  cartItemCount.textContent = `${totalItems} items`;
  cartTotal.textContent = totalPrice.toFixed(2);
}

function readCartFromLS() {
  const savedCart = localStorage.getItem("cart");

  if (savedCart === null) {
    return [];
  }

  return JSON.parse(savedCart);
}

function saveCartToLS() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

filterProducts();
fetchFilters();
loadCategories();
renderCart();
