const API = "http://localhost:3000";
const productsList = document.getElementById("products-container");

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
    document.getElementById("empty-message").classList.remove("hidden");
  }
}

function displayProducts(products) {
  const productCount = document.getElementById("product-count");

  productCount.textContent = `${products.length} products`;

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

function searchProducts() {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", async () => {
    try {
      let searchInputValue = searchInput.value.trim().toLowerCase();
      productsList.innerHTML = "";

      const searchResponse = await fetch(
        API + "/api/products?search=" + searchInputValue,
      );

      let filteredProducts = await searchResponse.json();

      if (filteredProducts.length === 0) {
        document.getElementById("empty-message").classList.remove("hidden");
      } else {
        displayProducts(filteredProducts);
      }
    } catch (error) {
      console.error(error.message);
    }
  });
}

function filterProducts() {
  const categoryFilter = document.getElementById("category-filter");

  categoryFilter.addEventListener("change", async () => {
    if (categoryFilter.value === "") {
      productsList.innerHTML = "";
      loadProducts();
    } else {
      try {
        productsList.innerHTML = "";

        const categoryResponse = await fetch(
          API + "/api/products?categoryId=" + categoryFilter.value,
        );

        let categoryfiltred = await categoryResponse.json();

        displayProducts(categoryfiltred);
      } catch (error) {
        console.error(error.message);
      }
    }
  });
}

loadProducts();
searchProducts();
filterProducts();
