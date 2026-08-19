const API_BASE = '/api';
const tokenKey = 'velora_token';
const userKey = 'velora_user';

const state = {
  products: [],
  activeCategory: 'All',
  searchQuery: '',
  cart: [],
  currentUser: null,
  authMode: 'login',
  detailProductId: null,
  quantity: 1
};

const authButton = document.getElementById('authButton');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const productGrid = document.getElementById('productGrid');
const categoryList = document.getElementById('categoryList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const loadingState = document.getElementById('loadingState');
const cartCount = document.getElementById('cartCount');

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const query = (selector) => document.querySelector(selector);

function getToken() {
  return localStorage.getItem(tokenKey);
}

function saveToken(token) {
  localStorage.setItem(tokenKey, token);
}

function getUser() {
  const saved = localStorage.getItem(userKey);
  return saved ? JSON.parse(saved) : null;
}

function saveUser(user) {
  localStorage.setItem(userKey, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  state.currentUser = null;
  updateAuthButton();
}

function updateAuthButton() {
  const user = getUser();
  if (!authButton) return;

  if (user) {
    authButton.textContent = `Hi, ${user.name.split(' ')[0]}`;
    authButton.classList.add('logout-style');
    authButton.onclick = () => {
      clearAuth();
      window.location.href = '/';
    };
  } else {
    authButton.textContent = 'Login';
    authButton.classList.remove('logout-style');
    authButton.onclick = () => openAuthModal();
  }
}

function openAuthModal(mode = 'login') {
  state.authMode = mode;
  const modal = document.getElementById('authModal');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const nameWrap = document.getElementById('registerNameWrap');
  const submitButton = document.getElementById('authSubmitBtn');

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  tabButtons.forEach((btn) => {
    const active = btn.dataset.authTab === mode;
    btn.classList.toggle('active', active);
  });

  nameWrap.classList.toggle('hidden', mode !== 'register');
  submitButton.textContent = mode === 'register' ? 'Create account' : 'Login';
  authMessage.textContent = '';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

async function loadProducts() {
  try {
    if (loadingState) {
      loadingState.classList.remove('hidden');
    }

    const params = new URLSearchParams();
    if (state.activeCategory !== 'All') params.set('category', state.activeCategory);
    if (state.searchQuery) params.set('search', state.searchQuery);

    const products = await apiFetch(`/products?${params.toString()}`);
    state.products = products || [];
    renderProducts();
  } catch (error) {
    console.error(error);
    if (productGrid) {
      productGrid.innerHTML = `<div class="empty-state"><h3>Unable to load products</h3><p>${error.message}</p></div>`;
    }
  } finally {
    if (loadingState) {
      loadingState.classList.add('hidden');
    }
  }
}

function renderCategoryList() {
  const categories = ['All', 'Electronics', 'Accessories', 'Apparel', 'Home', 'Footwear', 'Lifestyle'];

  if (!categoryList) return;

  categoryList.innerHTML = categories
    .map((category) => {
      const isActive = category === state.activeCategory;
      const iconMap = {
        All: '🛍️',
        Electronics: '📱',
        Accessories: '🎒',
        Apparel: '👕',
        Home: '🏠',
        Footwear: '👟',
        Lifestyle: '✨'
      };

      return `
        <button class="category-card ${isActive ? 'active' : ''}" data-category="${category}">
          <span class="icon">${iconMap[category] || '✨'}</span>
          <div>
            <h4>${category}</h4>
            <small>${category === 'All' ? 'Top picks' : 'Popular items'}</small>
          </div>
        </button>
      `;
    })
    .join('');

  categoryList.querySelectorAll('.category-card').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      renderCategoryList();
      document.querySelectorAll('.chip').forEach((chip) => {
        chip.classList.toggle('active', chip.dataset.category === state.activeCategory);
      });
      loadProducts();
    });
  });
}

function renderProducts() {
  if (!productGrid) return;

  if (!state.products.length) {
    productGrid.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try a different search or category.</p></div>';
    return;
  }

  productGrid.innerHTML = state.products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img src="${product.image}" alt="${product.name}" />
            <span class="product-badge">${product.featured ? 'Featured' : product.category}</span>
          </div>
          <div class="product-info">
            <div class="product-info-top">
              <h3>${product.name}</h3>
              <span class="rating">★ ${Number(product.rating || 4.5).toFixed(1)}</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
              <span class="price">${formatCurrency(product.price)}</span>
              <span class="stock-copy">${product.stock} left</span>
            </div>
            <div class="product-actions">
              <button class="add-cart-btn" data-add-to-cart="${product._id}">Add to Cart</button>
              <button class="view-details-btn" data-view-product="${product._id}">View</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  productGrid.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.addToCart));
  });

  productGrid.querySelectorAll('[data-view-product]').forEach((button) => {
    button.addEventListener('click', () => openProductModal(button.dataset.viewProduct));
  });
}

async function openProductModal(productId) {
  const product = state.products.find((item) => item._id === productId);
  if (!product) return;

  const modal = document.getElementById('productModal');
  const detailImage = document.getElementById('detailImage');
  const detailCategory = document.getElementById('detailCategory');
  const detailName = document.getElementById('detailName');
  const detailRating = document.getElementById('detailRating');
  const detailDescription = document.getElementById('detailDescription');
  const detailPrice = document.getElementById('detailPrice');
  const detailStock = document.getElementById('detailStock');
  const quantityInput = document.getElementById('detailQuantity');

  detailImage.src = product.image;
  detailImage.alt = product.name;
  detailCategory.textContent = product.category;
  detailName.textContent = product.name;
  detailRating.textContent = `★ ${Number(product.rating || 4.5).toFixed(1)} rating`;
  detailDescription.textContent = product.description;
  detailPrice.textContent = formatCurrency(product.price);
  detailStock.textContent = `${product.stock} in stock`;
  state.detailProductId = productId;
  state.quantity = 1;
  quantityInput.value = state.quantity;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

async function addToCart(productId, qty = 1) {
  const token = getToken();

  if (!token) {
    openAuthModal('login');
    return;
  }

  try {
    await apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: qty })
    });

    updateCartBadge();
    if (document.getElementById('productModal')) {
      closeProductModal();
    }
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function updateCartBadge() {
  try {
    const token = getToken();
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('velora_local_cart') || '[]');
      if (cartCount) cartCount.textContent = localCart.length;
      return;
    }

    const response = await apiFetch('/cart');
    const count = response.cartItems ? response.cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
    if (cartCount) cartCount.textContent = count;
  } catch (error) {
    console.error('Cart badge update failed', error);
  }
}

async function loadCurrentCartPage() {
  const cartItems = document.getElementById('cartItems');
  const cartLoading = document.getElementById('cartLoading');
  const subtotalValue = document.getElementById('subtotalValue');
  const totalValue = document.getElementById('totalValue');

  if (!cartItems) return;

  if (cartLoading) cartLoading.classList.remove('hidden');

  try {
    const token = getToken();
    if (!token) {
      cartItems.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3><p>Log in to add your favorite items.</p></div>';
      if (subtotalValue) subtotalValue.textContent = '$0.00';
      if (totalValue) totalValue.textContent = '$0.00';
      return;
    }

    const response = await apiFetch('/cart');
    const items = response.cartItems || [];

    if (!items.length) {
      cartItems.innerHTML = '<div class="empty-state"><h3>Your cart is empty</h3><p>Add products to get started.</p></div>';
    } else {
      cartItems.innerHTML = items
        .map(
          (item) => `
            <div class="cart-item" data-cart-id="${item.product._id}">
              <img src="${item.product.image}" alt="${item.product.name}" />
              <div>
                <h4>${item.product.name}</h4>
                <p>${item.product.category}</p>
                <div class="price-tag">${formatCurrency(item.product.price)}</div>
              </div>
              <div class="cart-actions">
                <button class="qty-btn" data-qty-change="decrease" data-product-id="${item.product._id}">−</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="qty-btn" data-qty-change="increase" data-product-id="${item.product._id}">+</button>
              </div>
              <button class="delete-btn" data-remove-product="${item.product._id}">Remove</button>
            </div>
          `
        )
        .join('');

      cartItems.querySelectorAll('[data-qty-change]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const newQty = btn.dataset.qtyChange === 'increase' ? 1 : -1;
          const productId = btn.dataset.productId;
          const currentItem = items.find((cartItem) => cartItem.product._id === productId);
          const nextQty = (currentItem.quantity || 1) + newQty;
          if (nextQty <= 0) {
            await apiFetch(`/cart/${productId}`, { method: 'DELETE' });
          } else {
            await apiFetch(`/cart/${productId}`, {
              method: 'PUT',
              body: JSON.stringify({ quantity: nextQty })
            });
          }
          loadCurrentCartPage();
        });
      });

      cartItems.querySelectorAll('[data-remove-product]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await apiFetch(`/cart/${btn.dataset.removeProduct}`, { method: 'DELETE' });
          loadCurrentCartPage();
        });
      });
    }

    if (subtotalValue) subtotalValue.textContent = formatCurrency(response.subtotal || 0);
    if (totalValue) totalValue.textContent = formatCurrency(response.total || 0);
    updateCartBadge();
  } catch (error) {
    cartItems.innerHTML = `<div class="empty-state"><h3>Cart unavailable</h3><p>${error.message}</p></div>`;
  } finally {
    if (cartLoading) cartLoading.classList.add('hidden');
  }
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummary');
  const totalElement = document.getElementById('checkoutTotal');
  if (!container) return;

  const localCart = JSON.parse(localStorage.getItem('velora_local_cart') || '[]');
  const cartItems = localCart.length ? localCart : [];

  if (!cartItems.length) {
    container.innerHTML = '<p class="empty-state">Your checkout is empty. Add products first.</p>';
    if (totalElement) totalElement.textContent = formatCurrency(0);
    return;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
  container.innerHTML = cartItems
    .map(
      (item) => `
        <div class="checkout-summary-item">
          <span>${item.name} × ${item.quantity || 1}</span>
          <strong>${formatCurrency(Number(item.price) * Number(item.quantity || 1))}</strong>
        </div>
      `
    )
    .join('');

  if (totalElement) totalElement.textContent = formatCurrency(subtotal);
}

async function loadCheckoutPage() {
  const form = document.getElementById('checkoutForm');
  const checkoutSummary = document.getElementById('checkoutSummary');

  if (!form) return;

  try {
    const token = getToken();
    if (!token) {
      window.location.href = '/';
      return;
    }

    const response = await apiFetch('/cart');
    const items = response.cartItems || [];
    if (!items.length) {
      window.location.href = '/cart.html';
      return;
    }

    const summaryList = document.getElementById('checkoutSummary');
    summaryList.innerHTML = items
      .map(
        (item) => `
          <div class="checkout-summary-item">
            <span>${item.product.name} × ${item.quantity}</span>
            <strong>${formatCurrency(item.product.price * item.quantity)}</strong>
          </div>
        `
      )
      .join('');
    document.getElementById('checkoutTotal').textContent = formatCurrency(response.total || 0);
  } catch (error) {
    console.error(error);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const checkoutMessage = document.getElementById('checkoutMessage');

    try {
      const shippingAddress = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
      };

      const response = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress,
          paymentMethod: document.getElementById('paymentMethod').value
        })
      });

      checkoutMessage.textContent = 'Order placed successfully!';
      checkoutMessage.style.color = 'var(--success)';
      setTimeout(() => {
        window.location.href = '/orders.html';
      }, 1200);
      const order = response.order || {};
      if (order._id) {
        localStorage.setItem('velora_last_order', JSON.stringify(order));
      }
    } catch (error) {
      checkoutMessage.textContent = error.message;
      checkoutMessage.style.color = 'var(--danger)';
    }
  });
}

async function loadOrdersPage() {
  const container = document.getElementById('ordersContainer');
  const loading = document.getElementById('ordersLoading');
  if (!container) return;

  loading?.classList.remove('hidden');

  try {
    const token = getToken();
    if (!token) {
      container.innerHTML = '<div class="empty-state"><h3>No orders yet</h3><p>Please login to view previous orders.</p></div>';
      return;
    }

    const orders = await apiFetch('/orders');

    if (!orders.length) {
      container.innerHTML = '<div class="empty-state"><h3>No orders yet</h3><p>Your order history will appear here after checkout.</p></div>';
      return;
    }

    container.innerHTML = orders
      .map(
        (order) => `
          <article class="order-card">
            <div class="order-top">
              <div class="order-number">Order #${order._id.slice(-6).toUpperCase()}</div>
              <span class="order-status">${order.status}</span>
            </div>
            <div class="order-items">
              ${order.items
                .map(
                  (item) => `
                    <div class="order-item-row">
                      <span>${item.name} × ${item.quantity}</span>
                      <strong>${formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  `
                )
                .join('')}
            </div>
            <div class="order-footer">
              <span>${new Date(order.createdAt).toLocaleDateString()}</span>
              <span>Total: ${formatCurrency(order.total)}</span>
            </div>
          </article>
        `
      )
      .join('');
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Unable to load orders</h3><p>${error.message}</p></div>`;
  } finally {
    loading?.classList.add('hidden');
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const formData = new FormData(authForm);
  const payload = {
    email: formData.get('email'),
    password: formData.get('password'),
    ...(state.authMode === 'register' ? { name: formData.get('name') } : {})
  };

  const endpoint = state.authMode === 'register' ? '/auth/register' : '/auth/login';

  try {
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response.token) {
      saveToken(response.token);
      saveUser(response.user);
      state.currentUser = response.user;
      updateAuthButton();
      closeAuthModal();
      if (window.location.pathname === '/' || window.location.pathname.includes('index')) {
        updateCartBadge();
      }
      if (window.location.pathname === '/cart.html' || window.location.pathname === '/checkout.html' || window.location.pathname === '/orders.html') {
        window.location.reload();
      }
    }
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.style.color = 'var(--danger)';
  }
}

function bindUI() {
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => openAuthModal(button.dataset.authTab));
  });

  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach((button) => button.addEventListener('click', () => {
    closeAuthModal();
    closeProductModal();
  }));

  const productModal = document.getElementById('productModal');
  if (productModal) {
    productModal.addEventListener('click', (event) => {
      if (event.target === productModal) closeProductModal();
    });
  }

  const authModalElement = document.getElementById('authModal');
  if (authModalElement) {
    authModalElement.addEventListener('click', (event) => {
      if (event.target === authModalElement) closeAuthModal();
    });
  }

  document.querySelectorAll('[data-qty-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const quantityInput = document.getElementById('detailQuantity');
      const action = button.dataset.qtyAction;
      let nextValue = Number(quantityInput.value || 1);
      nextValue = action === 'increase' ? nextValue + 1 : Math.max(1, nextValue - 1);
      quantityInput.value = nextValue;
      state.quantity = nextValue;
    });
  });

  const detailQuantityInput = document.getElementById('detailQuantity');
  if (detailQuantityInput) {
    detailQuantityInput.addEventListener('input', () => {
      state.quantity = Math.max(1, Number(detailQuantityInput.value || 1));
      detailQuantityInput.value = state.quantity;
    });
  }

  const addToCartDetailBtn = document.getElementById('addToCartDetailBtn');
  if (addToCartDetailBtn) {
    addToCartDetailBtn.addEventListener('click', () => {
      if (!state.detailProductId) return;
      addToCart(state.detailProductId, state.quantity);
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      state.searchQuery = searchInput ? searchInput.value.trim() : '';
      loadProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        state.searchQuery = searchInput.value.trim();
        loadProducts();
      }
    });
  }

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.activeCategory = chip.dataset.category;
      document.querySelectorAll('.chip').forEach((item) => item.classList.toggle('active', item === chip));
      loadProducts();
    });
  });

  const browseCategoriesBtn = document.getElementById('browseCategoriesBtn');
  if (browseCategoriesBtn) {
    browseCategoriesBtn.addEventListener('click', () => {
      document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function init() {
  state.currentUser = getUser();
  updateAuthButton();
  updateCartBadge();
  bindUI();

  if (document.getElementById('productGrid')) {
    renderCategoryList();
    loadProducts();
  }

  if (document.getElementById('cartItems')) {
    loadCurrentCartPage();
  }

  if (document.getElementById('checkoutForm')) {
    loadCheckoutPage();
  }

  if (document.getElementById('ordersContainer')) {
    loadOrdersPage();
  }
}

window.addEventListener('DOMContentLoaded', init);
