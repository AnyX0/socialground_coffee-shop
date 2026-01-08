let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

document.querySelectorAll('.image-slider img').forEach(images => {
    images.onclick = () => {
        var src = images.getAttribute('src');
        document.querySelector('.main-home-image').src = src;
    };
});

var swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
    grabCursor: true,
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        }
    },
});

// LOGIN MODAL LOGIC (fake auth: admin | admin)
(function () {
    const openBtn = document.getElementById('open-login');
    const modal = document.getElementById('login-modal');
    const overlay = document.getElementById('login-overlay');
    const closeBtn = document.getElementById('login-close');
    const form = document.getElementById('login-form');
    const msg = document.getElementById('login-msg');

    if (!openBtn) return;

    // If already logged in, turn CTA into Dashboard link
    let authed = false;
    try { authed = !!localStorage.getItem('auth'); } catch (_) {}
    if (authed) {
        openBtn.textContent = 'Dashboard';
        openBtn.setAttribute('href', 'dashboard.html');
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });
        return; // don't bind modal if already authed
    }

    if (!modal) return;

    const open = () => {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    };

    const close = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (msg) msg.textContent = '';
    };

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        open();
    });

    overlay && overlay.addEventListener('click', close);
    closeBtn && closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const username = (data.get('username') || '').toString().trim();
            const password = (data.get('password') || '').toString();

            if (!username) {
                msg.textContent = 'Masukkan username.';
                msg.style.color = '#c0392b';
                return;
            }
            if (!password || password.length < 3) {
                msg.textContent = 'Password minimal 3 karakter.';
                msg.style.color = '#c0392b';
                return;
            }

            const OK = username === 'admin' && password === 'admin';
            if (!OK) {
                msg.textContent = 'Username atau password salah.';
                msg.style.color = '#c0392b';
                return;
            }

            try {
                localStorage.setItem('auth', JSON.stringify({ username, time: Date.now() }));
            } catch (_) {}
            msg.textContent = 'Login berhasil. Mengarahkan ke dashboard...';
            msg.style.color = '#27ae60';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        });
    }
})();

// DASHBOARD ACCESS GUARD + LOGOUT
(function () {
    const isDashboard = /(^|\/)dashboard\.html(\?.*)?(#.*)?$/.test(window.location.pathname) || document.title.toLowerCase().includes('dashboard');
    if (!isDashboard) return;

    let username = null;
    try {
        const raw = localStorage.getItem('auth');
        if (raw) username = (JSON.parse(raw).username || '').toString();
    } catch (_) {}

    if (!username) {
        window.location.replace('index.html');
        return;
    }

    const nameSpans = document.querySelectorAll('[data-username]');
    nameSpans.forEach(el => el.textContent = username);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try { localStorage.removeItem('auth'); } catch (_) {}
            window.location.href = 'index.html';
        });
    }

    const logoutSide = document.getElementById('logout-side');
    if (logoutSide) {
        logoutSide.addEventListener('click', (e) => {
            e.preventDefault();
            try { localStorage.removeItem('auth'); } catch (_) {}
            window.location.href = 'index.html';
        });
    }

    // ----- MEMBER STATE -----
    const STORE_PREFIX = 'sg_member_';
    const K = {
        wallet: STORE_PREFIX + 'wallet',
        points: STORE_PREFIX + 'points',
        history: STORE_PREFIX + 'history'
    };

    const PRICE = { espresso: 3.5, cappuccino: 4.5, latte: 4.5, mocha: 5.0 };
    const REWARD_STEP = 100; // points needed per reward
    const REWARD_VALUE = 5;  // wallet dollars per reward

    const read = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (_) {
            return fallback;
        }
    };
    const write = (key, val) => {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
    };

    let wallet = read(K.wallet, 25.00);
    let points = read(K.points, 0);
    let history = read(K.history, []);

    const $ = (id) => document.getElementById(id);
    const fmt = (n) => `$${Number(n).toFixed(2)}`;

    const updatePointsUI = () => {
        const total = Number(points) || 0;
        const progressTextEl = $('points-progress-text');
        const progressFillEl = $('points-progress-fill');
        const nextRewardEl = $('points-next-reward');
        const tierEl = $('points-tier');

        const remainder = total % REWARD_STEP;
        const towardsNext = total === 0 ? 0 : (remainder === 0 ? REWARD_STEP : remainder);
        const remaining = total === 0 ? REWARD_STEP : (remainder === 0 ? REWARD_STEP : REWARD_STEP - remainder);
        const percent = Math.min(100, (towardsNext / REWARD_STEP) * 100);

        if (progressTextEl) progressTextEl.textContent = `${towardsNext} / ${REWARD_STEP}`;
        if (progressFillEl) progressFillEl.style.width = `${percent}%`;
        if (nextRewardEl) nextRewardEl.textContent = `Tinggal ${remaining} poin lagi untuk redeem $${REWARD_VALUE}`;

        if (tierEl) {
            const tiers = [
                { name: 'Bronze Member', min: 0 },
                { name: 'Silver Member', min: 200 },
                { name: 'Gold Member', min: 500 },
                { name: 'Platinum Member', min: 1000 }
            ];
            const active = tiers.filter(t => total >= t.min).pop();
            tierEl.textContent = active ? active.name : 'Bronze Member';
        }
    };

    // ----- RENDER -----
    const render = () => {
        const pointsEl = $('points-total');
        const pointsEl2 = $('points-total-2');
        const walletEl = $('wallet-balance');
        const walletEl2 = $('wallet-balance-2');
        const ordersCount = $('orders-count');
        const tbody = $('history-body');
        const empty = $('history-empty');
        const badge = $('points-badge');

        if (pointsEl) pointsEl.textContent = points;
        if (pointsEl2) pointsEl2.textContent = points;
        if (walletEl) walletEl.textContent = fmt(wallet);
        if (walletEl2) walletEl2.textContent = fmt(wallet);
        if (ordersCount) ordersCount.textContent = history.length;
        if (badge) badge.textContent = `${points} pts`;

        if (tbody) {
            tbody.innerHTML = '';
            history.slice().reverse().forEach((h) => {
                const tr = document.createElement('tr');
                const d = new Date(h.time);
                tr.innerHTML = `<td>${d.toLocaleString()}</td><td>${h.item}</td><td>${h.qty}</td><td>${fmt(h.total)}</td>`;
                tbody.appendChild(tr);
            });
        }
        if (empty) empty.style.display = history.length ? 'none' : 'block';

        updatePointsUI();

        // Render monthly summary
        renderMonthlySummary();
    };

    const renderMonthlySummary = () => {
        const summaryContainer = $('history-summary');
        const summaryGrid = $('summary-grid');
        
        if (!summaryContainer || !summaryGrid) return;

        if (history.length === 0) {
            summaryContainer.style.display = 'none';
            return;
        }

        // Group transactions by month
        const monthlyData = {};
        history.forEach(h => {
            const date = new Date(h.time);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('id-ID', { year: 'numeric', month: 'long' });
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    name: monthName,
                    total: 0,
                    count: 0
                };
            }
            monthlyData[monthKey].total += h.total;
            monthlyData[monthKey].count += 1;
        });

        // Sort by month (newest first)
        const sortedMonths = Object.keys(monthlyData).sort().reverse();

        summaryGrid.innerHTML = '';
        sortedMonths.forEach(key => {
            const data = monthlyData[key];
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="summary-month">${data.name}</div>
                <div class="summary-amount">${fmt(data.total)}</div>
                <div class="summary-count">${data.count} transaksi</div>
            `;
            summaryGrid.appendChild(card);
        });

        summaryContainer.style.display = 'block';
    };

    render();

    // ----- ACTIVE SIDEBAR LINK ON SCROLL -----
    const links = document.querySelectorAll('.member-nav a[href^="#"]');
    const sections = [];
    links.forEach((a) => {
        const id = a.getAttribute('href').slice(1);
        const sec = document.getElementById(id);
        if (sec) sections.push({ id, el: sec, link: a });
    });

    const setActive = (id) => {
        links.forEach((a) => a.classList.remove('active'));
        const found = sections.find(s => s.id === id);
        if (found) found.link.classList.add('active');
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.1 });

    sections.forEach((s) => io.observe(s.el));

    // ----- TOP UP -----
    let pendingTopupAmount = 0;
    
    const topupModal = document.getElementById('topup-modal');
    const topupOverlay = document.getElementById('topup-overlay');
    const topupModalClose = document.getElementById('topup-modal-close');
    const topupConfirmBtn = document.getElementById('topup-confirm-btn');
    const topupCancelBtn = document.getElementById('topup-cancel-btn');
    const topupModalAmount = document.getElementById('topup-modal-amount');
    const topupModalMsg = document.getElementById('topup-modal-msg');
    const topupPaymentRadios = document.querySelectorAll('input[name="topup-payment-method"]');

    // Topup success modal elements
    const topupSuccessModal = document.getElementById('topup-success');
    const topupSuccessOverlay = document.getElementById('topup-success-overlay');
    const topupSuccessClose = document.getElementById('topup-success-close');
    const topupSuccessHome = document.getElementById('topup-success-home');
    const topupSuccessOk = document.getElementById('topup-success-ok');
    const topupSuccessMessage = document.getElementById('topup-success-message');

    // Topup loading modal elements
    const topupLoadingModal = document.getElementById('topup-loading');

    const openTopupLoadingModal = () => {
        if (!topupLoadingModal) return;
        topupLoadingModal.classList.add('active');
        topupLoadingModal.setAttribute('aria-hidden', 'false');
    };

    const closeTopupLoadingModal = () => {
        if (!topupLoadingModal) return;
        topupLoadingModal.classList.remove('active');
        topupLoadingModal.setAttribute('aria-hidden', 'true');
    };

    const openTopupSuccessModal = (amount, method) => {
        if (!topupSuccessModal) return;
        if (topupSuccessMessage) {
            topupSuccessMessage.textContent = `Top up $${amount} via ${method} berhasil! Saldo dompet Anda telah diperbarui.`;
        }
        topupSuccessModal.classList.add('active');
        topupSuccessModal.setAttribute('aria-hidden', 'false');
    };

    const closeTopupSuccessModal = () => {
        if (!topupSuccessModal) return;
        topupSuccessModal.classList.remove('active');
        topupSuccessModal.setAttribute('aria-hidden', 'true');
    };

    const openTopupModal = (amount) => {
        if (!topupModal) return;
        pendingTopupAmount = amount;
        if (topupModalAmount) topupModalAmount.textContent = fmt(amount);
        if (topupModalMsg) topupModalMsg.textContent = '';
        topupPaymentRadios.forEach(r => { r.checked = r.value === 'bank'; });
        topupModal.classList.add('active');
        topupModal.setAttribute('aria-hidden', 'false');
    };

    const closeTopupModal = () => {
        if (!topupModal) return;
        topupModal.classList.remove('active');
        topupModal.setAttribute('aria-hidden', 'true');
        if (topupModalMsg) topupModalMsg.textContent = '';
        pendingTopupAmount = 0;
    };

    const getSelectedTopupPayment = () => {
        let val = 'bank';
        topupPaymentRadios.forEach(r => { if (r.checked) val = r.value; });
        return val;
    };

    const topupForm = $('topup-form');
    if (topupForm) {
        topupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = $('topup-amount');
            const msg = $('topup-msg');
            const amount = Number((input && input.value) || 0);
            if (!amount || amount <= 0) {
                if (msg) { msg.textContent = 'Masukkan nominal top up yang valid.'; msg.style.color = '#c0392b'; }
                return;
            }
            openTopupModal(amount);
            if (input) input.value = '';
        });
    }

    // Quick top-up buttons
    const quickTopupButtons = document.querySelectorAll('[data-topup-amount]');
    quickTopupButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = Number(btn.getAttribute('data-topup-amount'));
            if (amount > 0) {
                openTopupModal(amount);
            }
        });
    });

    // Topup confirm
    if (topupConfirmBtn) {
        topupConfirmBtn.addEventListener('click', () => {
            if (pendingTopupAmount <= 0) return;
            const payMethod = getSelectedTopupPayment();
            const payMethodNames = {
                'bank': 'Transfer Bank',
                'card': 'Kartu Kredit/Debit',
                'ewallet': 'E-Wallet',
                'qr': 'QRIS'
            };
            
            closeTopupModal();
            openTopupLoadingModal();

            // Process after 5 seconds
            setTimeout(() => {
                wallet = Number(wallet) + pendingTopupAmount;
                write(K.wallet, wallet);
                render();
                
                closeTopupLoadingModal();
                openTopupSuccessModal(pendingTopupAmount, payMethodNames[payMethod]);
                pendingTopupAmount = 0;
            }, 5000);
        });
    }

    // Topup success modal handlers
    if (topupSuccessHome) {
        topupSuccessHome.addEventListener('click', () => {
            closeTopupSuccessModal();
            if (window.sidebarManager && typeof window.sidebarManager.showSection === 'function') {
                window.sidebarManager.showSection('overview');
            } else {
                const overview = document.getElementById('overview');
                if (overview) overview.scrollIntoView({ behavior: 'smooth' });
            }
            window.location.href = '#overview';
        });
    }

    [topupSuccessOverlay, topupSuccessClose, topupSuccessOk].forEach(el => {
        if (el) el.addEventListener('click', closeTopupSuccessModal);
    });

    // Topup modal close handlers
    [topupOverlay, topupModalClose, topupCancelBtn].forEach(el => {
        if (el) el.addEventListener('click', closeTopupModal);
    });

    // ----- ORDER -----
    let selectedItems = [];
    let pendingOrder = null;

    // Handle menu item selection
    const menuItems = document.querySelectorAll('.order-menu-item');
    const orderSummary = document.getElementById('order-summary');
    const orderSelectedList = document.getElementById('order-selected-list');
    const qtyInput = document.getElementById('order-qty');
    const totalPriceEl = document.getElementById('total-price');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    const qtyPlusBtn = document.getElementById('qty-plus');
    const qtyMinusBtn = document.getElementById('qty-minus');
    const orderMsg = document.getElementById('order-msg');

    // Modal elements
    const orderModal = document.getElementById('order-modal');
    const orderOverlay = document.getElementById('order-overlay');
    const orderModalClose = document.getElementById('order-modal-close');
    const orderConfirmBtn = document.getElementById('order-confirm-btn');
    const orderCancelModalBtn = document.getElementById('order-cancel-btn');
    const modalItemsList = document.getElementById('modal-items-list');
    const modalQty = document.getElementById('modal-qty');
    const modalTotal = document.getElementById('modal-total');
    const modalMsg = document.getElementById('order-modal-msg');
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');

    // Success modal elements
    const successModal = document.getElementById('order-success');
    const successOverlay = document.getElementById('order-success-overlay');
    const successClose = document.getElementById('order-success-close');
    const successOk = document.getElementById('order-success-ok');
    const successCheck = document.getElementById('order-success-check');

    // Loading modal elements
    const loadingModal = document.getElementById('order-loading');

    const openLoadingModal = () => {
        if (!loadingModal) return;
        loadingModal.classList.add('active');
        loadingModal.setAttribute('aria-hidden', 'false');
    };

    const closeLoadingModal = () => {
        if (!loadingModal) return;
        loadingModal.classList.remove('active');
        loadingModal.setAttribute('aria-hidden', 'true');
    };

    const selectDefaultPayment = () => {
        paymentRadios.forEach(r => { r.checked = r.value === 'wallet'; });
    };

    const openModal = ({ items, qty, total }) => {
        if (!orderModal) return;
        
        // Populate items list
        if (modalItemsList) {
            modalItemsList.innerHTML = '';
            items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'modal-item-row';
                itemRow.innerHTML = `
                    <span class="modal-item-name">${item.name}</span>
                    <span class="modal-item-price">${fmt(item.price)}</span>
                `;
                modalItemsList.appendChild(itemRow);
            });
        }
        
        if (modalQty) modalQty.textContent = `${qty} cup`;
        if (modalTotal) modalTotal.textContent = fmt(total);
        if (modalMsg) modalMsg.textContent = '';
        selectDefaultPayment();
        orderModal.classList.add('active');
        orderModal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        if (!orderModal) return;
        orderModal.classList.remove('active');
        orderModal.setAttribute('aria-hidden', 'true');
        if (modalMsg) modalMsg.textContent = '';
    };

    const openSuccessModal = () => {
        if (!successModal) return;
        successModal.classList.add('active');
        successModal.setAttribute('aria-hidden', 'false');
    };

    const closeSuccessModal = () => {
        if (!successModal) return;
        successModal.classList.remove('active');
        successModal.setAttribute('aria-hidden', 'true');
    };

    const goToHistory = () => {
        closeSuccessModal();
        // If sidebar manager exists, use it so section becomes visible
        if (window.sidebarManager && typeof window.sidebarManager.showSection === 'function') {
            window.sidebarManager.showSection('history');
        } else {
            const historySection = document.getElementById('history');
            if (historySection) {
                historySection.scrollIntoView({ behavior: 'smooth' });
            }
            window.location.href = '#history';
        }
    };

    const updateSummary = () => {
        if (selectedItems.length === 0) {
            if (orderSummary) orderSummary.style.display = 'none';
            return;
        }

        // Populate items list in column
        if (orderSelectedList) {
            orderSelectedList.innerHTML = '';
            selectedItems.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'selected-item-row';
                itemRow.innerHTML = `
                    <span class="selected-item-name">${item.name}</span>
                    <span class="selected-item-price">${fmt(item.price)}</span>
                `;
                orderSelectedList.appendChild(itemRow);
            });
        }
        
        if (qtyInput) qtyInput.value = 1;
        const totalPrice = selectedItems.reduce((sum, i) => sum + i.price, 0);
        if (totalPriceEl) totalPriceEl.textContent = fmt(totalPrice);
        if (orderSummary) orderSummary.style.display = 'block';
    };

    const updateTotal = () => {
        if (selectedItems.length > 0 && qtyInput) {
            const qty = parseInt(qtyInput.value) || 1;
            const baseTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);
            const total = baseTotal * qty;
            if (totalPriceEl) totalPriceEl.textContent = fmt(total);
        }
    };

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const itemName = item.dataset.item;
            const itemPrice = parseFloat(item.dataset.price);
            
            // Toggle selection
            if (item.classList.contains('selected')) {
                // Unselect
                item.classList.remove('selected');
                selectedItems = selectedItems.filter(i => i.name !== itemName);
            } else {
                // Select
                item.classList.add('selected');
                selectedItems.push({ name: itemName, price: itemPrice });
            }
            
            updateSummary();
            if (orderMsg) orderMsg.textContent = '';
        });
    });

    // Quantity controls
    if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', () => {
            if (qtyInput) {
                let qty = parseInt(qtyInput.value) || 1;
                qtyInput.value = qty + 1;
                updateTotal();
            }
        });
    }

    if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', () => {
            if (qtyInput) {
                let qty = parseInt(qtyInput.value) || 1;
                if (qty > 1) {
                    qtyInput.value = qty - 1;
                    updateTotal();
                }
            }
        });
    }

    // Cancel order from summary
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', () => {
            menuItems.forEach(mi => mi.classList.remove('selected'));
            selectedItems = [];
            pendingOrder = null;
            if (orderSummary) orderSummary.style.display = 'none';
            if (orderMsg) orderMsg.textContent = '';
        });
    }

    // Place order -> open confirmation modal
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            if (selectedItems.length === 0) {
                if (orderMsg) {
                    orderMsg.textContent = 'Pilih menu terlebih dahulu.';
                    orderMsg.style.color = '#c0392b';
                }
                return;
            }

            const qty = Math.max(1, Number((qtyInput && qtyInput.value) || 1));
            const baseTotal = selectedItems.reduce((sum, i) => sum + i.price, 0);
            const total = baseTotal * qty;
            const itemNames = selectedItems.map(i => i.name).join(', ');

            if (total <= 0) {
                if (orderMsg) {
                    orderMsg.textContent = 'Pesanan tidak valid.';
                    orderMsg.style.color = '#c0392b';
                }
                return;
            }

            pendingOrder = { items: selectedItems, itemNames, qty, total };
            openModal({ items: selectedItems, qty, total });
        });
    }

    // Modal interactions
    const getSelectedPayment = () => {
        let val = 'wallet';
        paymentRadios.forEach(r => { if (r.checked) val = r.value; });
        return val;
    };

    if (orderConfirmBtn) {
        orderConfirmBtn.addEventListener('click', () => {
            if (!pendingOrder) return;
            const payMethod = getSelectedPayment();
            const { itemNames, qty, total } = pendingOrder;

            if (payMethod === 'wallet' && wallet < total) {
                if (modalMsg) {
                    modalMsg.textContent = 'Saldo dompet tidak cukup.';
                    modalMsg.style.color = '#c0392b';
                }
                return;
            }

            // Close confirmation modal and show loading
            closeModal();
            openLoadingModal();

            // Process after 5 seconds
            setTimeout(() => {
                // Process payment
                if (payMethod === 'wallet') {
                    wallet = Number(wallet) - total;
                    write(K.wallet, wallet);
                }

                points = Number(points) + Math.round(total);
                history.push({ time: Date.now(), item: itemNames, qty, total, payment: payMethod });
                write(K.points, points);
                write(K.history, history);

                if (orderMsg) {
                    orderMsg.textContent = `Pesanan berhasil: ${itemNames} x${qty} (${fmt(total)}) via ${payMethod}.`;
                    orderMsg.style.color = '#27ae60';
                }

                render();
                closeLoadingModal();
                openSuccessModal();

                // Reset selection
                menuItems.forEach(mi => mi.classList.remove('selected'));
                selectedItems = [];
                pendingOrder = null;
                if (orderSummary) orderSummary.style.display = 'none';
                if (qtyInput) qtyInput.value = 1;
            }, 5000);
        });
    }

    const closeModalHandlers = [orderOverlay, orderModalClose, orderCancelModalBtn];
    closeModalHandlers.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                closeModal();
            });
        }
    });

    // Success modal handlers
    [successOverlay, successClose, successOk].forEach(el => {
        if (el) el.addEventListener('click', closeSuccessModal);
    });

    if (successCheck) {
        successCheck.addEventListener('click', goToHistory);
    }

    // ----- REDEEM POINTS -----
    const redeemBtn = $('redeem-100');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', () => {
            const msg = $('redeem-msg');
            if (points < 100) {
                if (msg) { msg.textContent = 'Poin tidak mencukupi (minimal 100).'; msg.style.color = '#c0392b'; }
                return;
            }
            points = Number(points) - 100;
            wallet = Number(wallet) + 5.0;
            write(K.points, points);
            write(K.wallet, wallet);
            if (msg) { msg.textContent = 'Redeem berhasil! +$5 ke dompet.'; msg.style.color = '#27ae60'; }
            render();
        });
    }
    // ----- SIDEBAR TOGGLE -----
    const SIDEBAR_STATE = 'sidebar_state'
    const SIDEBAR_WIDTH = 16 * 16 // 16rem in pixels

    class SidebarManager {
        constructor() {
            this.sidebar = document.querySelector('.sidebar')
            this.toggleBtn = document.getElementById('sidebar-toggle')
            this.isMobile = window.innerWidth < 768
            this.state = this.loadState()
            this.sections = Array.from(document.querySelectorAll('.member-hero, .member-section'))
            console.log('Sections found:', this.sections.length, this.sections.map(s => s.id))
            // hide all sections initially; they will be shown via showInitialSection
            setTimeout(() => {
                this.sections.forEach((sec) => { 
                    sec.style.display = 'none'
                    console.log('Hiding:', sec.id)
                })
                this.init()
            }, 100)
        }

        init() {
            // Set initial state
            if (!this.isMobile && this.state === 'collapsed') {
                this.sidebar.setAttribute('data-state', 'collapsed')
            }

            // Mobile touch/click handlers
            if (this.toggleBtn) {
                this.toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    this.toggle()
                })
            }

            // Close sidebar on menu item click (mobile) + show selected section
            document.querySelectorAll('.sidebar-menu-button[data-section]').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault()
                    const targetId = button.getAttribute('data-section')
                    this.showSection(targetId)
                    this.setActiveMenu(button)
                    if (this.isMobile) {
                        this.close()
                    }
                })
            })

            // Close sidebar on outside click (mobile)
            document.addEventListener('click', (e) => {
                if (this.isMobile && this.sidebar.classList.contains('active')) {
                    if (!this.sidebar.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                        this.close()
                    }
                }
            })

            // Handle resize
            window.addEventListener('resize', () => {
                const wasMobile = this.isMobile
                this.isMobile = window.innerWidth < 768
                
                if (wasMobile && !this.isMobile) {
                    // Switched from mobile to desktop
                    this.sidebar.classList.remove('active')
                }
            })

            // Keyboard shortcut (Ctrl+B or Cmd+B)
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                    e.preventDefault()
                    this.toggle()
                }
            })

            // Initialize single-page view
            this.showInitialSection()
        }

        toggle() {
            if (this.isMobile) {
                this.sidebar.classList.toggle('active')
            } else {
                const currentState = this.sidebar.getAttribute('data-state')
                const newState = currentState === 'expanded' ? 'collapsed' : 'expanded'
                this.sidebar.setAttribute('data-state', newState)
                this.saveState(newState)
            }
        }

        open() {
            if (this.isMobile) {
                this.sidebar.classList.add('active')
            }
        }

        close() {
            if (this.isMobile) {
                this.sidebar.classList.remove('active')
            }
        }

        setActiveMenu(button) {
            document.querySelectorAll('.sidebar-menu-button').forEach(b => {
                b.classList.remove('active')
            })
            button.classList.add('active')
        }

        showSection(sectionId) {
            if (!this.sections.length) return
            this.sections.forEach((section) => {
                const visible = section.id === sectionId
                section.style.display = visible ? 'block' : 'none'
            })
            const target = document.getElementById(sectionId)
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }

        showInitialSection() {
            const activeBtn = document.querySelector('.sidebar-menu-button.active[data-section]') || document.querySelector('.sidebar-menu-button[data-section]')
            if (activeBtn) {
                const sectionId = activeBtn.getAttribute('data-section')
                this.setActiveMenu(activeBtn)
                this.showSection(sectionId)
            }
        }

        saveState(state) {
            localStorage.setItem(SIDEBAR_STATE, state)
            this.state = state
        }

        loadState() {
            return localStorage.getItem(SIDEBAR_STATE) || 'expanded'
        }
    }

    // Initialize sidebar manager
    if (document.querySelector('.sidebar')) {
        window.sidebarManager = new SidebarManager()
    }
})();

// SELECT BOX LOCATION LOGIC
(function () {
    const selectLocation = document.querySelector('.book form select');
    const firstOption = selectLocation.querySelector('option:first-child');

    selectLocation.addEventListener('focus', () => {
        firstOption.classList.add('hidden');
    });

    selectLocation.addEventListener('blur', () => {
        firstOption.classList.remove('hidden');
    });
})();