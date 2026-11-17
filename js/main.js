const API = "http://localhost:3000";
let products = [];
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
const cartItemTemplate = document.getElementById("cart-item-template");
let cart = readCartFromLS();

openCart.addEventListener("click", (event) => {
  event.preventDefault();
  cartDialog.showModal();
});

closeCart.addEventListener("click", () => {
  cartDialog.close();
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
  saveclickedProductToLS();

  // cartEmptyMessage.classList.toggle("hidden", cartItems.length > 0);

  cartItems.innerHTML += `<div data-id="${clickedProduct.id}">
          <article
            class="cart-item flex gap-4 bg-[#272622] border border-[#49443C] rounded-xl p-3"
            data-product-id="${clickedProduct.id}"
          >
            <img
              data-cart-image
              src="${API}${clickedProduct.image}"
              class="w-20 h-24 object-contain bg-[#302E2A] rounded-lg shrink-0"
            />

            <div class="flex flex-1 justify-between gap-3 min-w-0">
              <div class="flex flex-col gap-1 min-w-0">
                <h4 data-cart-name class="font-bold text-sm">${clickedProduct.name}</h4>
                <p data-cart-description class="text-xs text-[#A39B91]">${clickedProduct.description}</p>

                <span class="text-xs text-[#A39B91] mt-2">Unit price</span>
                <span
                  data-cart-price
                  class="text-[#C6AD88] font-bold text-sm"
                >${clickedProduct.price}</span>
              </div>

              <div class="flex flex-col justify-between items-end">
                <div
                  class="flex items-center gap-3 bg-[#3B3730] rounded-lg px-2 py-1"
                >
                  <button
                    type="button"
                    data-action="decrease"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span data-cart-quantity class="text-sm font-bold">1</span>

                  <button
                    type="button"
                    data-action="increase"
                    aria-label="Increase quantity"
                    class="text-[#C6AD88]"
                  >
                    +
                  </button>
                </div>

                <div class="text-right">
                  <span data-cart-subtotal class="text-sm font-bold">${clickedProduct.price}</span>

                  <button
                    type="button"
                    data-action="remove"
                    class="block text-xs text-[#D58C78] mt-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>`;
}

function readCartFromLS() {
  return JSON.parse(localStorage.getItem("clickedProduct")) || [];
}

function saveclickedProductToLS() {
  localStorage.setItem("clickedProduct", JSON.stringify(clickedProduct));
}

filterProducts();
fetchFilters();
loadCategories();
