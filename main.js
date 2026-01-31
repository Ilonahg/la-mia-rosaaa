 
/* =====================================================
   BLOCK 1: ANNOUNCEMENT BAR
===================================================== */
 

(function () {
    const texts = document.querySelectorAll(".announcement-bar__text");
    if (!texts || texts.length === 0) return;

    let currentIndex = 0;

    // initial state
    texts.forEach((el, index) => {
        el.classList.toggle("is-active", index === 0);
    });

    setInterval(() => {
        texts[currentIndex].classList.remove("is-active");
        currentIndex = (currentIndex + 1) % texts.length;
        texts[currentIndex].classList.add("is-active");
    }, 3000);
})();

/* =====================================================
   COLLECTION DATA
===================================================== */

const collections = {
    knitwear: [
        {
            productKey: "black-zip-cardigan",
            title: "Side-Zip Turtleneck Sweater",
            image: "images/black-zip-cardigan-1.jpg",
            oldPrice: "1,549.90 TL",
            newPrice: "1,249.90 TL",
            inStock: true
        },
        {
            productKey: "soft-maxi-cardigan-black",
            title: "Soft Maxi Cardigan with Beard Pattern – Black",
            image: "images/classic-black-cardigan-black-2.jpg",
            oldPrice: "1,749.90 TL",
            newPrice: "1,699.90 TL",
            inStock: true
        },
        {
            productKey: "hedgehog-cardigan-blue",
            title: "Hedgehog Long Cardigan – Blue",
            image: "images/classic-cardigan-light-1.jpg",
            oldPrice: "1,649.90 TL",
            newPrice: "1,499.90 TL",
            inStock: true
        },
        {
            productKey: "ethnic-cardigan-brown",
            title: "Ethnic Pattern Oversize Cardigan – Brown",
            image: "images/ethnic-cardigan.jpg",
            oldPrice: "1,799.90 TL",
            newPrice: "1,599.90 TL",
            inStock: true
        },
        {
            productKey: "hedgehog-sweater-mink",
            title: "Hedgehog Sweater – Mink",
            image: "images/hedgehog-sweater.jpg",
            oldPrice: "1,299.90 TL",
            newPrice: "999.90 TL",
            inStock: true
        }
    ],

    blouse: [
        {
            productKey: "oysho-ribbed-blouse-cream",
            title: "Oysho Ribbed Blouse – Cream",
            image: "images/fitted-long-sleeve-light-1.jpg",
            oldPrice: null,
            newPrice: "449.90 TL",
            inStock: true
        },
        {
            productKey: "oysho-ribbed-blouse-brown",
            title: "Oysho Ribbed Blouse – Brown",
            image: "images/long-sleeve-brown.jpg",
            oldPrice: null,
            newPrice: "449.90 TL",
            inStock: true
        }
    ],

    jean: [
        {
            productKey: "zr-jeans-blue",
            title: "ZR Jeans – Blue",
            image: "images/jeans-1.jpg",
            oldPrice: null,
            newPrice: "1,049.90 TL",
            inStock: false
        },
        {
            productKey: "zr-jeans-ecru",
            title: "ZR Jeans – Ecru",
            image: "images/light-jeans-1.jpg",
            oldPrice: null,
            newPrice: "1,049.90 TL",
            inStock: true
        }
    ],

    skirt: [
        {
            productKey: "maxi-length-satin-skirt-black",
            title: "Maxi Length Satin Skirt – Black",
            image: "images/skirt-1.jpg",
            oldPrice: null,
            newPrice: "949.90 TL",
            inStock: true
        }
    ],

    vest: [
        {
            productKey: "knitted-detail-puffer-vest-black",
            title: "Knitted Detail Puffer Vest – Black",
            image: "images/puffer-vest-2.jpg",
            oldPrice: "1,749.90 TL",
            newPrice: "1,599.90 TL",
            inStock: false
        }
    ]
};
/* =====================================================
   RENDER COLLECTION + FILTERS (ADAPTED TO YOUR DATA)
===================================================== */

const productsContainer = document.getElementById("products");

if (productsContainer) {

    const params = new URLSearchParams(window.location.search);
    const collectionName = params.get("collection") || "knitwear";

    // ===== GET PRODUCTS =====
    let allProducts = [];

    if (collectionName === "all") {
        Object.values(collections).forEach(col => {
            allProducts.push(...col);
        });
    } else {
        allProducts = collections[collectionName] || [];
    }

    // ===== FILTER ELEMENTS =====
    const filterInStock = document.getElementById("filter-instock");
    const filterOutStock = document.getElementById("filter-outofstock");
    const priceMinInput = document.getElementById("price-min");
    const priceMaxInput = document.getElementById("price-max");

    // ===== HELPER: GET NUMBER PRICE FROM STRING =====
    function getPriceNumber(product) {
        if (!product.newPrice) return null;

        return parseFloat(
            product.newPrice
                .replace("TL", "")
                .replace("₺", "")
                .replace(",", "")
                .trim()
        );
    }

    // ===== RENDER FUNCTION =====
    function renderProducts(products) {
        productsContainer.innerHTML = "";

        if (!products.length) {
            productsContainer.innerHTML = "<p>No products found</p>";
            return;
        }

        products.forEach(product => {
            productsContainer.innerHTML += `
                <a href="product.html?product=${product.productKey}" class="product-card">
                    <div class="product-image">
                        ${product.oldPrice ? `<span class="badge">Discount</span>` : ""}
                        <img src="${product.image}" alt="${product.title}">
                    </div>

                    <p class="product-title">${product.title}</p>

                    <p class="price">
                        ${product.oldPrice ? `<span class="old">${product.oldPrice}</span>` : ""}
                        <span class="new">${product.newPrice}</span>
                    </p>
                </a>
            `;
        });
    }

    // ===== FILTER LOGIC =====
    function applyFilters() {
        let filtered = [...allProducts];

        const showInStock = filterInStock?.checked;
        const showOutStock = filterOutStock?.checked;
        const minPrice = parseFloat(priceMinInput?.value);
        const maxPrice = parseFloat(priceMaxInput?.value);

        // --- STOCK FILTER ---
        if (showInStock && !showOutStock) {
            filtered = filtered.filter(p => p.inStock === true);
        } else if (!showInStock && showOutStock) {
            filtered = filtered.filter(p => p.inStock === false);
        }

        // --- PRICE FILTER ---
        if (!isNaN(minPrice)) {
            filtered = filtered.filter(p => {
                const price = getPriceNumber(p);
                return price !== null && price >= minPrice;
            });
        }

        if (!isNaN(maxPrice)) {
            filtered = filtered.filter(p => {
                const price = getPriceNumber(p);
                return price !== null && price <= maxPrice;
            });
        }

        renderProducts(filtered);
    }

    // ===== LISTENERS =====
    filterInStock?.addEventListener("change", applyFilters);
    filterOutStock?.addEventListener("change", applyFilters);
    priceMinInput?.addEventListener("input", applyFilters);
    priceMaxInput?.addEventListener("input", applyFilters);

    // INITIAL RENDER
    renderProducts(allProducts);
}

/* =====================================================
   GLOBAL PRODUCT DESCRIPTION TEMPLATE
===================================================== */

const PRODUCT_DESCRIPTION_TEMPLATE = `
    It is a standard size.<br><br>
    Model's Height: 1.76 CM<br>
    Model's Weight: 65 KG<br><br>
    Instructions for proper cleaning of the product are given on the inside label.
`;

/* =====================================================
   PRODUCT DATA + SIZE STOCK (MASTER SOURCE)
   Sizes & stock now belong to product itself
===================================================== */

const products = {

  "black-zip-cardigan": {
    title: "Side-Zip Turtleneck Sweater",
    images: [
      "images/black-zip-cardigan-1.jpg",
      "images/black-zip-cardigan-2.jpg"
    ],
    oldPrice: "1,549.90 TL",
    newPrice: "1,249.90 TL",
    description: `
      It is a standard size.<br><br>
      Model's Height: 1.76 CM<br>
      Model's Weight: 65 KG<br><br>
      Instructions for proper cleaning of the product are given on the inside label.
    `,
    
  },

  "soft-maxi-cardigan-black": {
    title: "Soft Maxi Cardigan with Beard Pattern – Black",
    images: [
      "images/classic-black-cardigan-black-2.jpg",
      "images/classic-black-cardigan-black-1.jpg",
      "images/classic-black-cardigan-black-0.jpg"
    ],
    oldPrice: "1,749.90 TL",
    newPrice: "1,699.90 TL",
    description: `
      It is a standard size.<br><br>
      Model's Height: 1.76 CM<br>
      Model's Weight: 65 KG<br>
    `,
     
  },

  "hedgehog-cardigan-blue": {
    title: "Hedgehog Long Cardigan – Blue",
    images: [
      "images/classic-cardigan-light-1.jpg",
      "images/classic-cardigan-light-2.jpg",
      "images/classic-cardigan-light-3.jpg"
    ],
    oldPrice: "1,649.90 TL",
    newPrice: "1,499.90 TL",
    description: `
      It is a standard size.<br><br>
      Model's Height: 1.76 CM<br>
      Model's Weight: 65 KG
    `,
     
  },

  "ethnic-cardigan-brown": {
    title: "Ethnic Pattern Oversize Cardigan – Brown",
    images: [
      "images/ethnic-cardigan.jpg",
      "images/ethnic-cardigan-2.jpg"
    ],
    oldPrice: "1,799.90 TL",
    newPrice: "1,599.90 TL",
    description: `It is a standard size.<br><br>Comfortable oversize fit.`,
     
  },

  "hedgehog-sweater-mink": {
    title: "Hedgehog Sweater – Mink",
    images: [
      "images/hedgehog-sweater.jpg",
      "images/hedgehog-sweater-2.jpg",
      "images/hedgehog-sweater-3.jpg"
    ],
    oldPrice: "1,299.90 TL",
    newPrice: "999.90 TL",
    description: `It is a standard size.<br><br>Cozy daily sweater.`,
     
  },

  "oysho-ribbed-blouse-cream": {
    title: "Oysho Ribbed Blouse – Cream",
    images: ["images/fitted-long-sleeve-light-1.jpg"],
    oldPrice: null,
    newPrice: "449.90 TL",
    description: `It is a standard size.`,
    sizes: { S: 6, M: 4, L: 2 }
  },

  "oysho-ribbed-blouse-brown": {
    title: "Oysho Ribbed Blouse – Brown",
    images: ["images/long-sleeve-brown.jpg"],
    oldPrice: null,
    newPrice: "449.90 TL",
    description: `It is a standard size.`,
    sizes: { S: 2, M: 1, L: 5 }
  },

  "zr-jeans-blue": {
    title: "ZR Jeans – Blue",
    images: [
      "images/jeans-1.jpg",
      "images/puffer-vest-2.jpg"
    ],
    oldPrice: null,
    newPrice: "1,049.90 TL",
    description: `Model is wearing size 38.`,
    sizes: { 34: 3, 36: 5, 38: 2, 40: 1, 42: 0 }
  },

  "zr-jeans-ecru": {
    title: "ZR Jeans – Ecru",
    images: [
      "images/light-jeans-1.jpg",
      "images/ethnic-cardigan-2.jpg"
    ],
    oldPrice: null,
    newPrice: "1,049.90 TL",
    description: `Model is wearing size 38.`,
    sizes: { 34: 0, 36: 4, 38: 3, 40: 2, 42: 1 }
  },

  "maxi-length-satin-skirt-black": {
    title: "Maxi Length Satin Skirt – Black",
    images: ["images/skirt-1.jpg"],
    oldPrice: null,
    newPrice: "949.90 TL",
    description: `Elegant satin skirt.`,
    sizes: { S: 3, M: 2, L: 1 }
  },

  "knitted-detail-puffer-vest-black": {
    title: "Knitted Detail Puffer Vest – Black",
    images: [
      "images/puffer-vest-2.jpg",
      "images/puffer-vest-1.jpg"
    ],
    oldPrice: "1,749.90 TL",
    newPrice: "1,599.90 TL",
    description: `Warm winter vest.`,
    sizes: { S: 2, M: 0, L: 1 }
  }

};
/* =====================================================
   PERSISTENT STOCK SYSTEM
   Saves remaining stock in localStorage
===================================================== */

const STOCK_KEY = "shopify_stock";

/* Load saved stock or initialize */
function loadStock(productKey, product) {
  let savedStock = JSON.parse(localStorage.getItem(STOCK_KEY)) || {};

  if (!savedStock[productKey]) {
    savedStock[productKey] = { ...product.sizes };
    localStorage.setItem(STOCK_KEY, JSON.stringify(savedStock));
  }

  return savedStock[productKey];
}

/* Save stock after change */
function saveStock(productKey, sizes) {
  let savedStock = JSON.parse(localStorage.getItem(STOCK_KEY)) || {};
  savedStock[productKey] = sizes;
  localStorage.setItem(STOCK_KEY, JSON.stringify(savedStock));
}


/* =====================================================
   RENDER PRODUCT (FINAL – SMART GALLERY, NO ERRORS)
===================================================== */

const gallery = document.getElementById("productGallery");

if (gallery) {
    const params = new URLSearchParams(window.location.search);
    const productKey = params.get("product");
    const product = products[productKey];

    if (!product) {
        document.body.innerHTML = "<h2>Product not found</h2>";
    } else {

        /* ===== COLOR OPTION VISIBILITY ===== */
        const colorOption = document.getElementById("colorOption");

        if (colorOption) {
            if (productKey === "black-zip-cardigan") {
                colorOption.style.display = "block";
            } else {
                colorOption.style.display = "none";
            }
        }

        /* ===== BASIC INFO ===== */
        const titleEl = document.getElementById("productTitle");
        const newPriceEl = document.getElementById("productNewPrice");
        const descEl = document.getElementById("productDescription");
        const oldPriceEl = document.getElementById("productOldPrice");
        const badgeEl = document.getElementById("productBadge");

        if (titleEl) titleEl.textContent = product.title;
        if (newPriceEl) newPriceEl.textContent = product.newPrice;
        if (descEl) descEl.innerHTML = PRODUCT_DESCRIPTION_TEMPLATE;

        if (product.oldPrice && oldPriceEl) {
            oldPriceEl.textContent = product.oldPrice;
        } else {
            if (oldPriceEl) oldPriceEl.style.display = "none";
            if (badgeEl) badgeEl.style.display = "none";
        }

        /* ===== GALLERY (SMART) ===== */
        gallery.innerHTML = "";

        // MAIN IMAGE
        const mainImg = document.createElement("img");
        mainImg.src = product.images[0];
        mainImg.className = "product-main-image";
        gallery.appendChild(mainImg);

        // SHOW THUMBS ONLY IF MORE THAN ONE IMAGE
        if (product.images && product.images.length > 1) {

            const thumbsWrapper = document.createElement("div");
            thumbsWrapper.className = "product-thumbs";

            product.images.forEach((src, index) => {
                const thumb = document.createElement("img");
                thumb.src = src;
                thumb.className = "product-thumb";
                if (index === 0) thumb.classList.add("is-active");

                thumb.addEventListener("click", () => {
                    mainImg.src = src;

                    document.querySelectorAll(".product-thumb")
                        .forEach(t => t.classList.remove("is-active"));
                    thumb.classList.add("is-active");
                });

                thumbsWrapper.appendChild(thumb);
            });

            gallery.appendChild(thumbsWrapper);
        }
    }
}

/* =====================================================
   COLOR SELECTOR — WITH URL AUTO SELECT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const colorSwatches = document.querySelectorAll(".color-swatch");
    if (!colorSwatches.length) return;

    const params = new URLSearchParams(window.location.search);
    const productKey = params.get("product");
    const urlColor = params.get("color"); // ← ось магія

    const gallery = document.getElementById("productGallery");
    if (!gallery) return;

    function renderGallery(images) {
        gallery.innerHTML = "";

        const mainImg = document.createElement("img");
        mainImg.src = images[0];
        mainImg.className = "product-main-image";
        gallery.appendChild(mainImg);

        if (images.length === 1) return;

        const thumbsWrapper = document.createElement("div");
        thumbsWrapper.className = "product-thumbs";

        images.forEach((src, index) => {
            const thumb = document.createElement("img");
            thumb.src = src;
            thumb.className = "product-thumb";
            if (index === 0) thumb.classList.add("is-active");

            thumb.addEventListener("click", () => {
                mainImg.src = src;
                thumbsWrapper.querySelectorAll(".product-thumb")
                    .forEach(t => t.classList.remove("is-active"));
                thumb.classList.add("is-active");
            });

            thumbsWrapper.appendChild(thumb);
        });

        gallery.appendChild(thumbsWrapper);
    }

    function applyColor(color) {
        colorSwatches.forEach(s => {
            s.classList.toggle("is-active", s.dataset.color === color);
        });

        if (productKey === "black-zip-cardigan") {
            if (color === "black") {
                renderGallery([
                    "images/black-zip-cardigan-1.jpg",
                    "images/black-zip-cardigan-2.jpg"
                ]);
            }

            if (color === "brown") {
                renderGallery([
                    "images/brown-zip-cardigan.jpg"
                ]);
            }
        }
    }

    // 🟢 КЛІК КОЛЬОРУ
    colorSwatches.forEach(swatch => {
        swatch.addEventListener("click", () => {
            applyColor(swatch.dataset.color);
        });
    });

    // 🔥 AUTO SELECT З URL
    if (urlColor) {
        applyColor(urlColor);
    }
});

/* ================= QUANTITY SELECTOR ================= */

const qtyValue = document.getElementById("qtyValue");
const qtyMinus = document.querySelector(".qty-minus");
const qtyPlus = document.querySelector(".qty-plus");

if (qtyValue && qtyMinus && qtyPlus) {
    let quantity = 1;

    qtyPlus.addEventListener("click", () => {
        quantity++;
        qtyValue.textContent = quantity;
    });

    qtyMinus.addEventListener("click", () => {
        if (quantity > 1) {
            quantity--;
            qtyValue.textContent = quantity;
        }
    });
}
 

/* ================= RELATED PRODUCTS ================= */

const relatedContainer = document.getElementById("relatedProducts");

if (relatedContainer && typeof collections !== "undefined") {

    let allProducts = [];
    Object.values(collections).forEach(col => {
        allProducts = allProducts.concat(col);
    });

    allProducts.sort(() => 0.5 - Math.random());

    const related = allProducts.slice(0, 4);

    relatedContainer.innerHTML = "";

    related.forEach(product => {
        relatedContainer.innerHTML += `
            <a href="product.html?product=${product.productKey}" class="product-card">
                <div class="product-image">
                    ${product.oldPrice ? `<span class="badge">Discount</span>` : ""}
                    <img src="${product.image}" alt="${product.title}">
                </div>

                <p class="product-title">${product.title}</p>

                <p class="price">
                    ${product.oldPrice ? `<span class="old">${product.oldPrice}</span>` : ""}
                    <span class="new">${product.newPrice}</span>
                </p>
            </a>
        `;
    });
}
// SILENT HEADER SCROLL BEHAVIOR
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                body.classList.toggle("is-scrolled", scrollY > 80);
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
});
/* =====================================================
   SMART SEARCH (SAFE)
===================================================== */

(function () {
    const openSearch = document.getElementById("openSearch");
    const closeSearch = document.getElementById("closeSearch");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    if (!openSearch || !closeSearch || !searchOverlay || !searchInput || !searchResults) {
        return; // ⛔ search не використовується на цій сторінці
    }

    /* ---------- COLLECT PRODUCTS ---------- */

    let allProducts = [];

    if (typeof collections !== "undefined") {
        Object.values(collections).forEach(col => {
            allProducts = allProducts.concat(col);
        });
    }

    /* ---------- OPEN ---------- */

    openSearch.addEventListener("click", () => {
        searchOverlay.classList.add("active");
        searchInput.value = "";
        searchResults.innerHTML = "";
        searchInput.focus();
    });

    /* ---------- CLOSE ---------- */

    function closeSearchOverlay() {
        searchOverlay.classList.remove("active");
    }

    closeSearch.addEventListener("click", closeSearchOverlay);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSearchOverlay();
    });

    /* ---------- INPUT ---------- */

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = "";

        if (!query) return;

        const matches = allProducts.filter(product =>
            product.title.toLowerCase().includes(query)
        );

        matches.slice(0, 6).forEach(product => {
            const item = document.createElement("div");
            item.className = "search-item";

            item.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <div class="search-item-title">${product.title}</div>
            `;

            item.addEventListener("click", () => {
                window.location.href = `product.html?product=${product.productKey}`;
            });

            searchResults.appendChild(item);
        });
    });

})();
/* =====================================================
   CART ICON COUNT — GLOBAL (SHOPIFY STYLE)
   Updates quantity on cart icon from localStorage
===================================================== */

function updateCartCount() {
  const countEl = document.querySelector(".cart-count");
  if (!countEl) return;

  const cart = JSON.parse(localStorage.getItem("shopify_cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  countEl.textContent = count;
}

/* =====================================================
   AUTH OVERLAY — SHOPIFY FINAL (SINGLE SOURCE)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const authOverlay = document.getElementById("authOverlay");
    const openAuth = document.getElementById("openAuth");
    const closeAuth = document.getElementById("closeAuth");

    const authRegister = document.getElementById("authRegister");
    const authCode = document.getElementById("authCode");

    const authEmail = document.getElementById("authEmail");
    const authSubmit = document.getElementById("authSubmit");
    const authMessage = document.getElementById("authMessage");

    const codeInput = document.getElementById("emailCodeInput");
    const codeBtn = document.getElementById("emailCodeSubmit");
    const codeMsg = document.getElementById("emailCodeMessage");

    if (!authOverlay || !openAuth) return;

    let locked = false;

    /* ---------- UI ---------- */

    function showEmail() {
        authRegister.style.display = "block";
        authCode.style.display = "none";
    }

    function showCode() {
        authRegister.style.display = "none";
        authCode.style.display = "block";
    }

    function openOverlay() {
        authOverlay.classList.add("active");
        showEmail();
    }

    function closeOverlay() {
        authOverlay.classList.remove("active");
        authMessage.textContent = "";
        codeMsg.textContent = "";
        authEmail.value = "";
        codeInput.value = "";
    }

    /* ---------- AUTH CHECK ---------- */

    async function isLoggedIn() {
        try {
            const res = await fetch("http://localhost:3001/me", {
                credentials: "include"
            });
            const data = await res.json();
            return !!data.user;
        } catch {
            return false;
        }
    }

    /* ---------- ACCOUNT ICON ---------- */

    openAuth.addEventListener("click", async (e) => {
        e.preventDefault();
        const logged = await isLoggedIn();
        logged ? location.href = "account.html" : openOverlay();
    });

    closeAuth?.addEventListener("click", closeOverlay);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeOverlay();
    });

    /* ---------- SEND CODE ---------- */

    authSubmit.addEventListener("click", async () => {
        if (locked) return;

        const email = authEmail.value.trim();
        if (!email) {
            authMessage.textContent = "Enter email";
            return;
        }

        locked = true;
        authMessage.textContent = "Sending code...";

        try {
            const res = await fetch("http://localhost:3001/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // ✅ FIX
                body: JSON.stringify({ email })
            });

            if (!res.ok) throw new Error();
            showCode();
            authMessage.textContent = "";
        } catch {
            authMessage.textContent = "Failed to send code";
        }

        locked = false;
    });

    /* ---------- VERIFY CODE ---------- */

    codeBtn.addEventListener("click", async () => {
        if (locked) return;

        const code = codeInput.value.trim();
        const email = authEmail.value.trim();

        if (code.length !== 6) {
            codeMsg.textContent = "Invalid code";
            return;
        }

        locked = true;
        codeMsg.textContent = "Verifying...";

        try {
            const res = await fetch("http://localhost:3001/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, code })
            });

            if (!res.ok) throw new Error();
            closeOverlay();
            location.href = "account.html";
        } catch {
            codeMsg.textContent = "Wrong code";
        }

        locked = false;
    });

});

/* =====================================================
   POLICY MODAL — FULL LEGAL CONTENT (LA MIA ROSA)
   Professional / Safe / No Shopify Mentions
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const policyModal  = document.getElementById("policyModal");
    const policyTitle  = document.getElementById("policyTitle");
    const policyBody   = document.getElementById("policyBody");
    const policyClose  = document.getElementById("policyClose");

    if (!policyModal || !policyTitle || !policyBody) {
        console.warn("Policy modal not found in HTML");
        return;
    }

    /* =====================================================
       POLICY CONTENT
    ===================================================== */

    const policies = {

        privacy: {
            title: "Privacy Policy",
            body: `
                <p><strong>Last Update:</strong> November 10, 2025</p>

                <p>La Mia Rosa operates this website and store to provide customers with a secure and personalized shopping experience.</p>

                <h3>Personal Information We Collect</h3>
                <p>We may collect your name, address, email, phone number, payment details, account data, transaction history, communications, device data, and usage information.</p>

                <h3>How We Use Your Information</h3>
                <p>Your information is used to process orders, deliver products, provide support, improve services, prevent fraud, send updates, and comply with legal requirements.</p>

                <h3>Sharing Information</h3>
                <p>We may share data with payment processors, shipping companies, service providers, and legal authorities where required.</p>

                <h3>Your Rights</h3>
                <p>You may request access, correction, deletion, or transfer of your personal data by contacting us at <strong>info.lamiarosa@gmail.com</strong>.</p>

                <h3>Security</h3>
                <p>We implement appropriate security measures but cannot guarantee absolute protection of transmitted data.</p>
            `
        },

        refund: {
            title: "Money-back Policy",
            body: `
                <p>Our return policy lasts <strong>7 days</strong>. After this period, we cannot offer a refund or exchange.</p>

                <p>Items must be unused, in original condition, and in original packaging. Proof of purchase is required.</p>

                <h3>Non-returnable Items</h3>
                <ul>
                    <li>Gift cards</li>
                    <li>Downloadable software</li>
                    <li>Health and personal care items</li>
                </ul>

                <h3>Refunds</h3>
                <p>After inspection, approved refunds are processed to the original payment method.</p>

                <p>For issues, contact <strong>info.lamiarosa@gmail.com</strong>.</p>
            `
        },

        shipping: {
            title: "Shipping Policy",
            body: `
                <p>Delivery is available within <strong>Turkey</strong> only.</p>

                <p>Orders are delivered within <strong>5–7 business days</strong> excluding weekends and public holidays.</p>

                <p>The seller is responsible for the order until delivery is completed.</p>

                <p>Customers must report damage within 3 days of delivery.</p>
            `
        },

        terms: {
            title: "Terms of Service",
            body: `
                <p>By using the La Mia Rosa website, you agree to comply with all applicable laws.</p>

                <p>Orders are subject to product availability. We reserve the right to modify products, prices, and policies.</p>

                <p>Unauthorized use of this website may result in legal action.</p>
            `
        },

        contact: {
            title: "Contact Information",
            body: `
                <p><strong>Company:</strong> La Mia Rosa</p>
                <p><strong>Address:</strong> Yenimahalle / Ankara</p>
                <p><strong>Working hours:</strong> Monday–Friday 09:00–17:00</p>
                <p><strong>Email:</strong> info.lamiarosa@gmail.com</p>
            `
        },

        legal: {
            title: "Legal Notice",
            body: `
                <p>La Mia Rosa processes personal data in accordance with Turkish Law No. 6698.</p>

                <p>Customer data is used only for order processing and service improvement.</p>

                <p>We do not sell personal data.</p>
            `
        }
    };

    /* =====================================================
       OPEN
    ===================================================== */

    window.openPolicy = function (key) {
        const policy = policies[key];
        if (!policy) return;

        policyTitle.textContent = policy.title;
        policyBody.innerHTML = policy.body;
        policyModal.classList.add("active");
        document.body.style.overflow = "hidden"; // 🔒 stop background scroll
    };

    /* =====================================================
       CLOSE
    ===================================================== */

    function closePolicy() {
        policyModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    policyClose?.addEventListener("click", closePolicy);

    policyModal.addEventListener("click", (e) => {
        if (e.target === policyModal) closePolicy();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closePolicy();
    });

});

/* ========================================================= */
/* ACCOUNT — SINGLE CLEAN BLOCK */
/* ========================================================= */

if (document.body.dataset.page === "account") {

  /* ================= HELPERS ================= */

  const qs = id => document.getElementById(id);

  /* ================= STORAGE ================= */

  const STORAGE_KEY = "shopify_account_state";

  let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    profile: { firstName: "", lastName: "", email: "" },
    addresses: [],
    editingAddressIndex: null
  };

  const persist = () =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

/* ================= AVATAR ================= */

function updateAvatar() {
  const avatar = document.getElementById("accountAvatar");
  const avatarSmall = document.getElementById("accountAvatarSmall");

  const first = (state.profile.firstName || "").trim();
  const last = (state.profile.lastName || "").trim();

  let initials = "";
  if (first) initials += first[0];
  if (last) initials += last[0];
  initials = initials.toUpperCase();

  [avatar, avatarSmall].forEach(el => {
    if (!el) return;

    if (initials) {
      el.textContent = initials;
      el.classList.remove("is-empty");
    } else {
      el.textContent = "";
      el.classList.add("is-empty"); // 👤 з CSS
    }
  });
}


/* ================= VIEW ROUTER (SHOPIFY BEHAVIOR) ================= */

function showView(view, push = true) {
  const views = {
    orders: document.getElementById("ordersView"),
    profile: document.getElementById("profileView"),
    settings: document.getElementById("settingsView")
  };

  Object.values(views).forEach(v => v && (v.hidden = true));
  if (views[view]) views[view].hidden = false;

  if (push) {
    history.pushState({ view }, "", `?view=${view}`);
  }
}

function initAccountView() {
  const params = new URLSearchParams(location.search);
  showView(params.get("view") || "orders", false);
}

window.addEventListener("popstate", e => {
  showView(e.state?.view || "orders", false);
});

  /* ================= DROPDOWN ================= */

  function closeAccountDropdown() {
    const dd = qs("accountDropdown");
    if (dd) dd.classList.remove("open");
  }

  document
    .querySelectorAll(".account-dropdown-link")
    .forEach((link, i) => {
      link.onclick = e => {
        e.preventDefault();
        showView(i === 0 ? "profile" : "settings");
        closeAccountDropdown();
      };
    });

  /* ================= AUTH LOAD ================= */

  async function loadAccountUser() {
    try {
      const res = await fetch("http://localhost:3001/me", {
        credentials: "include"
      });
      const data = await res.json();

      if (!data.user) {
        console.warn("ACCOUNT AUTH: user not found");
        return;
      }

      state.profile.email = data.user.email;
      persist();
      renderProfile();
    } catch (e) {
      console.error("ACCOUNT AUTH ERROR", e);
    }
  }
/* ================= ORDERS ================= */

async function loadOrders() {
  const ordersView = document.getElementById("ordersView");
  if (!ordersView) return;

  try {
    const res = await fetch("http://localhost:3001/orders", {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Not authenticated");

    const data = await res.json();
    const orders = data.orders || [];

    ordersView.innerHTML = `<h2 class="account-box-title">Orders</h2>`;

    if (!orders.length) {
      ordersView.innerHTML += `
        <div class="orders-empty">
          <h3>No orders yet</h3>
          <p>Go to the store to place your first order.</p>
        </div>
      `;
      return;
    }

    orders.forEach(order => {

      const el = document.createElement("div");
      el.className = "order-card";

      let itemsHTML = "";

      /* 🔥 ITEMS WITH IMAGES */
      if (order.items && order.items.length) {
        order.items.forEach(item => {
          itemsHTML += `
            <div class="order-item">
              <img src="${item.image}" class="order-item-img">

              <div class="order-item-info">
                <div class="order-item-title">${item.title}</div>
                ${item.size ? `<div class="order-item-variant">Size: ${item.size}</div>` : ""}
                <div class="order-item-qty">Qty: ${item.qty}</div>
              </div>

              <div class="order-item-price">
                ₺${(item.price * item.qty).toFixed(2)}
              </div>
            </div>
          `;
        });
      }

      el.innerHTML = `
        <div class="order-header">
          <strong>Order #${order.id}</strong>
          <span>${new Date(order.createdAt).toLocaleDateString()}</span>
        </div>

        <div class="order-items">
          ${itemsHTML}
        </div>

        <div class="order-footer">
          <div>Status: ${order.status}</div>
          <div>Total: ₺${order.total}</div>
        </div>
      `;

      ordersView.appendChild(el);
    });

  } catch (err) {
    console.error("LOAD ORDERS ERROR", err);
  }
}


/* ================= PROFILE ================= */

function renderProfile() {
  const emailEl = document.getElementById("profileEmailView");
  const nameEl = document.getElementById("profileNameView");

  const dropdownName = document.getElementById("accountUserName");
  const dropdownEmail = document.getElementById("accountEmail");

  const fullName = `${state.profile.firstName} ${state.profile.lastName}`.trim();

  if (emailEl) emailEl.textContent = state.profile.email || "—";
  if (nameEl) nameEl.textContent = fullName || "—";

  // 🔹 DROPDOWN (як Shopify)
  if (dropdownName) dropdownName.textContent = fullName || "Account";
  if (dropdownEmail) dropdownEmail.textContent = state.profile.email || "";

  updateAvatar();
}

window.openProfileModal = function () {
  document.getElementById("profileFirstName").value = state.profile.firstName || "";
  document.getElementById("profileLastName").value = state.profile.lastName || "";
  document.getElementById("profileEmail").value = state.profile.email || "";
  openModal("profileModal");
};

window.saveProfile = function () {
  state.profile.firstName =
    document.getElementById("profileFirstName").value.trim();
  state.profile.lastName =
    document.getElementById("profileLastName").value.trim();

  persist();
  renderProfile();
  closeModal();
};

/* ================= ADDRESSES ================= */

function renderAddresses() {
  const list = document.getElementById("addressesList");
  const empty = document.getElementById("noAddressesText");

  if (!list) return;

  list.innerHTML = "";

  if (!state.addresses.length) {
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  state.addresses.forEach((a, i) => {
    const card = document.createElement("div");
    card.className = "address-card";

    card.innerHTML = `
      <div class="address-card-header">
        <strong>${a.firstName} ${a.lastName}</strong>
        ${a.default ? `<span class="address-default">Default</span>` : ""}
      </div>

      <div class="address-line">${a.line1}</div>
      ${a.line2 ? `<div class="address-line">${a.line2}</div>` : ""}
      <div class="address-line">${a.country}</div>

      <button class="address-edit-btn">Edit</button>
    `;

    card.querySelector(".address-edit-btn").onclick = () => editAddress(i);

    list.appendChild(card);
  });
}

window.openAddAddress = function () {
  state.editingAddressIndex = null;

  document.getElementById("addressFirstName").value = "";
  document.getElementById("addressLastName").value = "";
  document.getElementById("addressLine1").value = "";
  document.getElementById("addressLine2").value = "";
  document.getElementById("addressCountry").value = "Türkiye";
  document.getElementById("addressDefault").checked = false;

  openModal("addressModal");
};

function editAddress(index) {
  const a = state.addresses[index];
  state.editingAddressIndex = index;

  document.getElementById("addressFirstName").value = a.firstName;
  document.getElementById("addressLastName").value = a.lastName;
  document.getElementById("addressLine1").value = a.line1;
  document.getElementById("addressLine2").value = a.line2 || "";
  document.getElementById("addressCountry").value = a.country;
  document.getElementById("addressDefault").checked = a.default;

  openModal("addressModal");
}

window.saveAddress = function () {
  const address = {
    firstName: document.getElementById("addressFirstName").value.trim(),
    lastName: document.getElementById("addressLastName").value.trim(),
    line1: document.getElementById("addressLine1").value.trim(),
    line2: document.getElementById("addressLine2").value.trim(),
    country: document.getElementById("addressCountry").value,
    default: document.getElementById("addressDefault").checked
  };

  if (!address.firstName || !address.lastName || !address.line1) {
    alert("Please fill required fields");
    return;
  }

  if (address.default) {
    state.addresses.forEach(a => (a.default = false));
  }

  if (state.editingAddressIndex !== null) {
    state.addresses[state.editingAddressIndex] = address;
  } else {
    state.addresses.push(address);
  }

  persist();
  renderAddresses();
  closeModal();
};


  /* ================= LOGOUT ================= */

  const logoutAllBtn = qs("logoutAllBtn");
  if (logoutAllBtn) {
    logoutAllBtn.onclick = async () => {
      try {
        await fetch("http://localhost:3001/logout", {
          method: "POST",
          credentials: "include"
        });
      } catch {}
      localStorage.removeItem(STORAGE_KEY);
      location.href = "index.html";
    };
  }

  /* ================= MODALS ================= */

  function openModal(id) {
    const m = qs(id);
    if (m) m.classList.add("active");
  }

  function closeModal() {
    document
      .querySelectorAll(".modal-overlay")
      .forEach(m => m.classList.remove("active"));
  }

/* ================= INIT ================= */

initAccountView();
loadAccountUser();
loadOrders();        // ← ОЦЕ ДОДАЛИ
renderAddresses();
updateAvatar();

}
/* =========================================================
   ACCOUNT USER BUTTON — DROPDOWN (SHOPIFY STYLE)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const userBtn = document.getElementById("accountUserBtn");
  const dropdown = document.getElementById("accountDropdown");
  const logoutBtn = document.querySelector(".account-dropdown-logout");

  if (!userBtn || !dropdown) return;

  /* open / close dropdown */

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  /* logout */

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("http://localhost:3001/logout", {
          method: "POST",
          credentials: "include"
        });
      } catch {}

      localStorage.removeItem("shopify_account_state");
      window.location.href = "index.html";
    });
  }
});
/* =====================================================
   ADD TO CART — LUXURY BUTTON UX (FIXED CART SYSTEM)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "product") return;

  const addBtn = document.querySelector(".btn-add");
  if (!addBtn) return;

  addBtn.addEventListener("click", () => {

    const params = new URLSearchParams(window.location.search);
    const productKey = params.get("product");
    const product = products[productKey];
    if (!product) return;

    const title = product.title;

    const price = parseFloat(
      product.newPrice.replace("TL", "").replace(",", "").trim()
    );

    const qty = Number(document.getElementById("qtyValue")?.textContent || 1);

    const mainImageEl = document.querySelector(".product-main-image");
    let image = mainImageEl ? mainImageEl.getAttribute("src") : product.images[0];

    let color = null;
    const colorOption = document.getElementById("colorOption");
    if (colorOption && colorOption.style.display !== "none") {
      const activeColor = document.querySelector(".color-swatch.is-active");
      if (activeColor) color = activeColor.dataset.color;
    }

    let size = null;
    const activeSize = document.querySelector(".size-btn.is-active");
    if (activeSize) size = activeSize.dataset.size;

    const cart = JSON.parse(localStorage.getItem("shopify_cart")) || [];

    /* 🔎 CHECK IF SAME PRODUCT VARIANT EXISTS */
    const existingItem = cart.find(item =>
      item.productKey === productKey &&
      item.color === color &&
      item.size === size
    );

    if (existingItem) {
      existingItem.qty += qty;   // ✅ increase quantity
    } else {
      cart.push({ productKey, title, price, qty, image, color, size });
    }

    localStorage.setItem("shopify_cart", JSON.stringify(cart));
    updateCartCount();

    /* ===== LUXURY BUTTON EFFECT ===== */
    addBtn.classList.add("is-added");
    addBtn.textContent = "Added ✓";
    addBtn.disabled = true;

    setTimeout(() => {
      addBtn.classList.remove("is-added");
      addBtn.textContent = "Add to cart";
      addBtn.disabled = false;
    }, 2000);
  });
});


/* =====================================================
   CART PAGE INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "cart") {
    renderCart();
  }
});
/* =====================================================
   CART PAGE — SHOPIFY FINAL RENDER (FIXED)
===================================================== */

function renderCart() {
  const CART_KEY = "shopify_cart";
  const cartItems = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");

  if (!cartItems) return;

  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  /* =====================================================
     🔥 MERGE DUPLICATES (LUXURY SHOP LOGIC)
     same productKey + color + size = one row
  ===================================================== */
  const merged = [];

  cart.forEach(item => {
    const existing = merged.find(p =>
      p.productKey === item.productKey &&
      p.color === item.color &&
      p.size === item.size
    );

    if (existing) {
      existing.qty += item.qty;
    } else {
      merged.push({ ...item });
    }
  });

  cart = merged;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your basket is empty</p>";
    if (cartTotalEl) cartTotalEl.textContent = "₺0";
    updateCartCount();
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const el = document.createElement("div");
    el.className = "cart-item";

    el.innerHTML = `
      <a href="product.html?product=${item.productKey}${item.color ? `&color=${item.color}` : ""}" class="cart-item-link">
        <img src="${item.image}" alt="${item.title}">
      </a>

      <div>
        <a href="product.html?product=${item.productKey}" class="cart-item-title-link">
          <div class="cart-item-title">${item.title}</div>
        </a>

        ${item.size ? `<div class="cart-item-variant">Size: ${item.size}</div>` : ""}
        ${item.color ? `<div class="cart-item-variant">Color: ${item.color}</div>` : ""}
        <div class="cart-item-price">₺${item.price.toFixed(2)}</div>
      </div>

      <div class="cart-qty">
        <button class="qty-minus">−</button>
        <span>${item.qty}</span>
        <button class="qty-plus">+</button>
      </div>

      <button class="cart-remove" aria-label="Remove">🗑</button>

      <div class="cart-item-total">
        ₺${itemTotal.toFixed(2)}
      </div>
    `;

    /* 🔹 QTY − */
    el.querySelector(".qty-minus").onclick = () => {
      if (item.qty > 1) {
        item.qty--;
      } else {
        cart.splice(index, 1);
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
      updateCartCount();
    };

    /* 🔹 QTY + */
    el.querySelector(".qty-plus").onclick = () => {
      item.qty++;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
      updateCartCount();
    };

    /* 🔹 REMOVE */
    el.querySelector(".cart-remove").onclick = () => {
      cart.splice(index, 1);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      renderCart();
      updateCartCount();
    };

    cartItems.appendChild(el);
  });

  if (cartTotalEl) {
    cartTotalEl.textContent = `₺${total.toFixed(2)}`;
  }

  updateCartCount();
}


/* =====================================================
   CART PAGE INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "cart") {
    renderCart();
  }
});
/* =====================================================
   CART PAGE — CHECKOUT REDIRECT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "cart") return;

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("shopify_cart")) || [];

    if (!cart.length) {
      alert("Your basket is empty");
      return;
    }

    window.location.href = "checkout.html";
  });
});
/* =====================================================
   PAYMENT MODE CONFIG
   test  = no backend, instant success
   prod  = real payment provider
===================================================== */

const PAYMENT_MODE = "test"; // ← ЗМІНИШ НА "prod" КОЛИ БУДЕ PAYTR

/* =====================================================
   CHECKOUT — ITEMS WITH IMAGE (STEP 4D.1)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "checkout") return;

  const CART_KEY = "shopify_cart";

  const itemsContainer = document.getElementById("checkoutItems");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");

  if (!itemsContainer || !subtotalEl || !totalEl) return;

  const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  let subtotal = 0;
  itemsContainer.innerHTML = "";

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;

    const el = document.createElement("div");
    el.className = "checkout-item";

    el.innerHTML = `
      <div style="display:flex; gap:12px; align-items:center;">
        <div style="position:relative;">
          <img src="${item.image}" alt="${item.title}" style="width:64px; height:64px; object-fit:cover; border-radius:8px;">
          <span style="
            position:absolute;
            top:-6px;
            right:-6px;
            background:#111;
            color:#fff;
            font-size:12px;
            width:20px;
            height:20px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
          ">${item.qty}</span>
        </div>

        <div style="font-size:14px;">
          ${item.title}
          ${item.size ? `<div style="font-size:12px; opacity:.7;">Size: ${item.size}</div>` : ""}
        </div>
      </div>

      <div style="font-size:14px;">₺${itemTotal.toFixed(2)}</div>
    `;

    itemsContainer.appendChild(el);
  });

  subtotalEl.textContent = `₺${subtotal.toFixed(2)}`;
  totalEl.textContent = `₺${subtotal.toFixed(2)}`;
});

/* =====================================================
   CHECKOUT — PREFILL FROM ACCOUNT (REAL FIX)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "checkout") return;

  const state = JSON.parse(localStorage.getItem("shopify_account_state"));
  if (!state) return;

  /* ---------- EMAIL ---------- */
  const emailInput = document.querySelector('input[type="email"], input[placeholder="Email"]');
  if (emailInput && state.profile?.email) {
    emailInput.value = state.profile.email;
  }

  /* ---------- ADDRESS ---------- */
  const address = state.addresses?.find(a => a.default);
  if (!address) return;

  const inputs = document.querySelectorAll("input");

  const firstNameInput = inputs[1];
  const lastNameInput  = inputs[2];
  const addressInput   = inputs[3];
  const cityInput      = inputs[4];
  const postalInput    = inputs[5];
  const countrySelect  = document.querySelector("select");

  if (firstNameInput) firstNameInput.value = address.firstName || "";
  if (lastNameInput)  lastNameInput.value  = address.lastName || "";
  if (addressInput)   addressInput.value   = address.line1 || "";
  if (cityInput)      cityInput.value      = address.line2 || "";
  if (postalInput)    postalInput.value    = "";

  /* ---------- COUNTRY FIX ---------- */
  if (countrySelect) {
    const map = {
      Turkiye: "Turkey",
      Türkiye: "Turkey"
    };
    countrySelect.value = map[address.country] || address.country;
  }
});
/* =====================================================
   CHECKOUT — PAY NOW (REAL SERVER WAIT + PROTECTION)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "checkout") return;

  const payBtn = document.getElementById("payNowBtn");
  if (!payBtn) return;

  payBtn.onclick = async () => {

    // 🛑 Захист від подвійного кліку
    if (payBtn.disabled) return;
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    const cart = JSON.parse(localStorage.getItem("shopify_cart")) || [];
    if (!cart.length) {
      alert("Cart is empty");
      payBtn.disabled = false;
      payBtn.textContent = "Pay now";
      return;
    }

    const emailInput = document.querySelector('input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email) {
      alert("Enter email");
      payBtn.disabled = false;
      payBtn.textContent = "Pay now";
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    try {
      const res = await fetch("http://localhost:3001/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔥 щоб передався auth_token cookie
        body: JSON.stringify({
          cart,
          total: `₺${total.toFixed(2)}`,
          email
        })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      if (!data.ok) {
        alert("Payment failed");
        payBtn.disabled = false;
        payBtn.textContent = "Pay now";
        return;
      }

      // Зберігаємо для success сторінки
      localStorage.setItem(
        "shopify_last_order",
        JSON.stringify({ cart, total })
      );

      // Чистимо корзину
      localStorage.removeItem("shopify_cart");

      // Перехід
      window.location.href = "success.html";

    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
      payBtn.disabled = false;
      payBtn.textContent = "Pay now";
    }
  };
});

/* =====================================================
   SUCCESS PAGE — RENDER LAST ORDER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page !== "success") return;

  const data = JSON.parse(localStorage.getItem("shopify_last_order"));
  if (!data || !data.cart || !data.cart.length) return;

  const itemsContainer = document.getElementById("successItems");
  const totalEl = document.getElementById("successTotal");

  let total = 0;
  itemsContainer.innerHTML = "";

  data.cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const el = document.createElement("div");
    el.className = "success-item";

    el.innerHTML = `
      <div class="success-item-left">
        <img src="${item.image}" alt="${item.title}">
        <span>
          ${item.title} × ${item.qty}
          ${item.size ? `<div style="font-size:12px; opacity:.7;">Size: ${item.size}</div>` : ""}
        </span>
      </div>
      <div>₺${itemTotal.toFixed(2)}</div>
    `;

    itemsContainer.appendChild(el);
  });

  totalEl.textContent = `₺${total.toFixed(2)}`;

  // ❗ optionally clear snapshot after render
  // localStorage.removeItem("shopify_last_order");
});


/* =====================================================
   GLOBAL CART COUNT INIT (FIX EMPTY CART BUG)
   Ensures cart icon ALWAYS shows real quantity
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount(); // 🔥 sync icon with localStorage on every page load
});
/* =====================================================
   NEWSLETTER SUBSCRIBE — SHOPIFY STYLE
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("newsletterForm");
  const emailInput = document.getElementById("newsletterEmail");
  const message = document.getElementById("newsletterMessage");

  if (!form || !emailInput || !message) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // ❌ без перезавантаження

    const email = emailInput.value.trim();

    // проста перевірка як у Shopify
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      message.textContent = "Please enter a valid email address.";
      message.style.color = "#ffb3b3";
      message.classList.add("show");
      return;
    }

    // "Успішна підписка"
    message.textContent = "✓ Thank you for subscribing!";
    message.style.color = "#b7f5c5";
    message.classList.add("show");

    emailInput.value = "";

    // автоматично ховаємо повідомлення
    setTimeout(() => {
      message.classList.remove("show");
    }, 4000);
  });

});
/* ================= SHIPPING COSTS BUTTON ================= */

document.addEventListener("DOMContentLoaded", () => {
    const shippingBtn = document.getElementById("shippingCostsBtn");

    if (shippingBtn) {
        shippingBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof openPolicy === "function") {
                openPolicy("shipping");
            }
        });
    }
});
/* =========================================================
   LUXURY SCROLL REVEAL FIXED
   Works even when section is in viewport on load
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("is-visible");
        }, 150); // маленька затримка створює появу
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  reveals.forEach(section => {
    section.classList.remove("is-visible"); // гарантія
    revealObserver.observe(section);
  });
});
/* =====================================================
   SHOPIFY-STYLE NAV DROPDOWN TOGGLE
   Click open / click close / outside close
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const dropdownItems = document.querySelectorAll(".nav-item.has-dropdown");

  dropdownItems.forEach(item => {
    const trigger = item.querySelector(".nav-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();

      // close others
      dropdownItems.forEach(i => {
        if (i !== item) i.classList.remove("open");
      });

      // toggle current
      item.classList.toggle("open");
    });
  });

  // click outside closes all
  document.addEventListener("click", function () {
    dropdownItems.forEach(i => i.classList.remove("open"));
  });
});
 

/* =====================================================
   CONTACT FORM SUBMIT (COMMUNICATION PAGE)
===================================================== */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const formMessage = document.getElementById("formMessage");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    formMessage.textContent = "Sending...";
    formMessage.style.color = "#999";

    const formData = new FormData(contactForm);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      comment: formData.get("comment"),
    };

    try {
      const response = await fetch("http://localhost:3001/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        formMessage.textContent = "Message sent successfully 💌";
        formMessage.style.color = "green";
        contactForm.reset();
      } else {
        formMessage.textContent = "Something went wrong. Try again.";
        formMessage.style.color = "red";
      }
    } catch (error) {
      formMessage.textContent = "Server error. Please try later.";
      formMessage.style.color = "red";
    }
  });
}
/* =====================================================
   SIZE SELECTOR ENGINE — SMART VISIBILITY
   Shows size ONLY if product has sizes
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

  if (document.body.dataset.page !== "product") return;

  const sizeOption   = document.getElementById("sizeOption");
  const sizeSelector = document.getElementById("sizeSelector");
  const stockInfo    = document.getElementById("stockInfo");

  if (!sizeOption || !sizeSelector) return;

  const params = new URLSearchParams(window.location.search);
  const productKey = params.get("product");
  const product = products?.[productKey];
  if (!product) return;

  /* 🚫 IF PRODUCT HAS NO SIZES — HIDE BLOCK */
  if (!product.sizes || Object.keys(product.sizes).length === 0) {
    sizeOption.style.display = "none";
    return;
  }

  /* ✅ PRODUCT HAS SIZES */
  const realStock = loadStock(productKey, product);

  sizeOption.style.display = "block";
  sizeSelector.innerHTML = "";

  let firstAvailableBtn = null;

  Object.entries(realStock).forEach(([size, qty]) => {

    const btn = document.createElement("button");
    btn.className = "size-btn";
    btn.textContent = size;
    btn.dataset.size  = size;
    btn.dataset.stock = qty;

    if (qty === 0) {
      btn.classList.add("is-disabled");
      btn.disabled = true;
    } else if (!firstAvailableBtn) {
      firstAvailableBtn = btn;
    }

    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn")
        .forEach(b => b.classList.remove("is-active"));

      btn.classList.add("is-active");
      updateStockInfo(qty);
    });

    sizeSelector.appendChild(btn);
  });

  /* AUTO SELECT */
  if (firstAvailableBtn) {
    firstAvailableBtn.classList.add("is-active");
    updateStockInfo(parseInt(firstAvailableBtn.dataset.stock));
  }

  function updateStockInfo(qty) {
    if (!stockInfo) return;

    if (qty === 0) {
      stockInfo.style.display = "flex";
      stockInfo.innerHTML = `<span class="dot"></span> Out of stock`;
      return;
    }

    if (qty <= 3) {
      stockInfo.style.display = "flex";
      stockInfo.innerHTML =
        `<span class="dot"></span> Stock level is low — only ${qty} left`;
    } else {
      stockInfo.style.display = "none";
    }
  }

});

/* =====================================================
   ACTIVE COLLECTION + SUBCOLLECTION NAV
   Підсвічує головну категорію і підкатегорію
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const collection = params.get("collection");
  if (!collection) return;

  // ---- ПІДСВІТКА ПІДКАТЕГОРІЇ (KNITWEAR, BLOUSE, VEST...) ----
  const subLinks = document.querySelectorAll('.dropdown a');

  subLinks.forEach(link => {
    const url = new URL(link.href);
    if (url.searchParams.get("collection") === collection) {
      link.classList.add("active-sub");

      // знайти батьківський nav-item (OUTERWEAR блок)
      const parentNavItem = link.closest(".nav-item");
      if (parentNavItem) {
        parentNavItem.classList.add("active-parent");
      }
    }
  });

});

/* =====================================================
   MOBILE NAV SYSTEM — FINAL SHOPIFY BEHAVIOR (FIXED)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

  const burgerBtn = document.getElementById("burgerBtn");
  const nav = document.querySelector(".header__nav");
  const body = document.body;
  const overlay = document.getElementById("menuOverlay");

  if (!burgerBtn || !nav || !overlay) return;

  /* ===== OPEN MENU ===== */
  function openMenu() {
    burgerBtn.classList.add("is-active");
    nav.classList.add("is-open");
    overlay.classList.add("is-visible");
    body.classList.add("no-scroll");
    body.classList.add("mobile-nav-active"); // ⭐ ЛОГО ЦЕНТРУЄТЬСЯ ТІЛЬКИ ТУТ
  }

  /* ===== CLOSE MENU ===== */
  function closeMenu() {
    burgerBtn.classList.remove("is-active");
    nav.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    body.classList.remove("no-scroll");
    body.classList.remove("mobile-nav-active");

    document.querySelectorAll(".nav-item.mobile-open")
      .forEach(item => item.classList.remove("mobile-open"));
  }

  /* ===== BURGER CLICK ===== */
  burgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  /* ===== OVERLAY CLICK ===== */
  overlay.addEventListener("click", closeMenu);

  /* ===== MOBILE DROPDOWNS ===== */
  const triggers = document.querySelectorAll(".nav-item.has-dropdown > .nav-trigger");

  triggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {

      if (window.innerWidth > 992) return;

      e.preventDefault();
      const parent = trigger.closest(".nav-item");

      document.querySelectorAll(".nav-item.mobile-open")
        .forEach(item => item !== parent && item.classList.remove("mobile-open"));

      parent.classList.toggle("mobile-open");
    });
  });

  /* ===== CLOSE WHEN LINK CLICKED ===== */
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

});

 