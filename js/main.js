const API = "http://localhost:3000";
const productsList = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const maxPrice = document.getElementById("max-price");
const inStockFilter = document.getElementById("in-stock-filter");
const resetFilters = document.getElementById("reset-filters");

async function loadProducts() {
  try {
    const response = await fetch(API + "/api/products");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const products = await response.json();

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

    displayCategories(categories)
  } catch {
    console.error(error.message);
  }
}

function displayCategories(categories) {
  categories.forEach(category => {
    categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`
  });
}

function displayProducts(products) {
  const productCount = document.getElementById("product-count");
  const emptyMessage = document.getElementById("empty-message");

  emptyMessage.classList.toggle("hidden", products.length > 0);

  productCount.textContent = `${products.length} products`;

  productsList.innerHTML = "";

  products.forEach((product) => {
    productsList.innerHTML += `        <article
          id="${product.id}" categoryId="${product.categoryId}"
          class="bg-[#302E2A] border border-[#3A3834] rounded-2xl overflow-hidden hover:border-[#C6AD88]/50 transition-colors"
        >
          <div
            id="product-image"
            class="flex justify-center items-center bg-[#272622]"
          >
            <img
              src="${API}${product.image}"
              class="w-full h-full object-contain"
            />
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
                >${product.categoryName}</span>
                <span class="text-xs text-[#A39B91]">Stock: ${product.stock}</span>
              </div>
            </div>
          </div>
        </article>`;
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

filterProducts();
fetchFilters();
loadCategories()