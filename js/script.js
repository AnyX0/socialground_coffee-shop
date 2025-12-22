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
            wallet = Number(wallet) + amount;
            write(K.wallet, wallet);
            if (msg) { msg.textContent = 'Top up berhasil!'; msg.style.color = '#27ae60'; }
            render();
            if (input) input.value = '';
        });
    }

    // ----- ORDER -----
    const orderForm = $('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const itemSel = $('order-item');
            const qtyEl = $('order-qty');
            const msg = $('order-msg');
            const item = itemSel ? itemSel.value : 'espresso';
            const qty = Math.max(1, Number(qtyEl && qtyEl.value || 1));
            const price = PRICE[item] || 0;
            const total = price * qty;
            if (total <= 0) {
                if (msg) { msg.textContent = 'Pesanan tidak valid.'; msg.style.color = '#c0392b'; }
                return;
            }
            if (wallet < total) {
                if (msg) { msg.textContent = 'Saldo dompet tidak cukup.'; msg.style.color = '#c0392b'; }
                return;
            }
            // Deduct wallet, add points (1 point per $1), record history
            wallet = Number(wallet) - total;
            points = Number(points) + Math.round(total);
            history.push({ time: Date.now(), item, qty, total });
            write(K.wallet, wallet);
            write(K.points, points);
            write(K.history, history);
            if (msg) { msg.textContent = `Pesanan berhasil: ${item} x${qty} (${fmt(total)}).`; msg.style.color = '#27ae60'; }
            render();
        });
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