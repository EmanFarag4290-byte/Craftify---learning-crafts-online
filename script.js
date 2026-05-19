document.addEventListener('DOMContentLoaded', () => {
    const pages = {
        hero: document.getElementById('hero-page'),
        lang: document.getElementById('page-language'),
        homeEn: document.getElementById('page-home'),
        homeAr: document.getElementById('page-home-ar'),
        craftsEn: document.getElementById('page-crafts-en'),
        craftsAr: document.getElementById('page-crafts-ar'),
        videoEn: document.getElementById('page-video-en'),
        videoAr: document.getElementById('page-video-ar'),
        planner: document.getElementById('page-planner'),
        plannerAr: document.getElementById('page-planner-ar'),
        pomodoroEn: document.getElementById('page-pomodoro'),
        pomodoroAr: document.getElementById('page-pomodoro-ar'),
        gallery: document.getElementById('page-gallery'),
        galleryAr: document.getElementById('page-gallery-ar'),
        shop: document.getElementById('page-shop'),
        shopAr: document.getElementById('page-shop-ar'),
    };

    let currentCraftIndex = 0;
    const playlistsEn = ["PL2Y7G15DrVt5hGupHwu78-WZIcXpziUJ-", "PL25EvqjrQtPNNajoBYQIVRnvyu0REQjcZ", "PLfnNT9e0hjrzR5tqm7hELGHBJoGyME_cm", "PL1HIh25sbqZnkA1T09UtVHoyjYaMJuK0a", "PL_55D3-e9Q5uK4hNEHoim4mNf1f_E9WsA", "PL2WJhtTF0eGiE4V8YtblvueQdhPzysavM"];
    const playlistsAr = ["PLjLtX3KjOJ5066tdkKpHXGJmH39t5C2z0", "PLcpD5UYBC2wv8vTpwtNmv2yF4Fe_SNzdI", "PLuozZVmiMjU42QQuKzREiqfOkG8sHLUgL", "PLszusRlhWcGeVGCWH29Pd60x8qN4hL4p5", "PLzyjH9gzeHG0kMRbrjLDDR87g-uSseYEY", "PLjzfvU-wb-w_V9WRfIJh3qWoNWoXCbtGo"];
    let tasks = JSON.parse(localStorage.getItem("plannerTasks")) || [];
    let totalCompletedEver = parseInt(localStorage.getItem("plannerTotalCompleted") || "0", 10);
    const hours = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM"];

    function hideAll() {
        Object.values(pages).forEach(p => { if (p) p.style.display = 'none'; });
    }

    document.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('nav-planner')) {
            e.preventDefault();
            hideAll();
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            if (isAr) {
                pages.plannerAr.style.display = 'block';
                createSchedule('ar');
                renderPlanner('ar');
            } else {
                pages.planner.style.display = 'block';
                createSchedule('en');
                renderPlanner('en');
            }
            showBadgesBar();
        }

        if (target.classList.contains('nav-home')) {
            e.preventDefault();
            hideAll();
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            isAr ? pages.homeAr.style.display = 'flex' : pages.homeEn.style.display = 'flex';
            showBadgesBar();
        }

        if (target.classList.contains('nav-crafts') || target.classList.contains('craft-btn') || target.classList.contains('craft-btn-ar')) {
            e.preventDefault();
            hideAll();
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl' || target.classList.contains('craft-btn-ar');
            isAr ? pages.craftsAr.style.display = 'grid' : pages.craftsEn.style.display = 'grid';
            showBadgesBar();
        }

        if (target.classList.contains('nav-pomodoro')) {
            e.preventDefault();
            hideAll();
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            if (isAr) {
                pages.pomodoroAr.style.display = 'block';
            } else {
                pages.pomodoroEn.style.display = 'block';
            }
            updatePomodoroDisplay();
            showBadgesBar();
        }

        if (target.classList.contains('back-to-lang')) {
            e.preventDefault();
            hideAll();
            hideBadgesBar();
            pages.lang.style.display = 'flex';
        }

        if (target.classList.contains('nav-gallery')) {
            e.preventDefault();
            hideAll();
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            if (isAr) { pages.galleryAr.style.display = 'block'; }
            else { pages.gallery.style.display = 'block'; }
            showBadgesBar();
        }

        if (target.classList.contains('nav-shop')) {
            e.preventDefault();
            hideAll();
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            if (isAr) { pages.shopAr.style.display = 'block'; renderShop('ar'); }
            else { pages.shop.style.display = 'block'; renderShop('en'); }
            showBadgesBar();
        }

        // category filter
        if (target.classList.contains('cat-btn')) {
            const sidebar = target.closest('.shop-sidebar');
            sidebar.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            renderShop(isAr ? 'ar' : 'en', target.dataset.cat);
        }

        // add to cart
        if (target.classList.contains('add-to-cart-btn')) {
            const id = Number(target.dataset.id);
            const isAr = target.closest('section')?.getAttribute('dir') === 'rtl';
            addToCart(id, isAr ? 'ar' : 'en');
        }

        // checkout
        if (target.id === 'checkoutBtn' || target.id === 'checkoutBtnAr') {
            const lang = target.id === 'checkoutBtnAr' ? 'ar' : 'en';
            if (cart[lang].length === 0) return;
            cart[lang] = [];
            renderCart(lang);
            showTrophy({ title: lang === 'ar' ? 'عملية شراء ناجحة!' : 'Purchase Complete!', desc: lang === 'ar' ? 'شكراً لتسوقك في Craftify.' : 'Thanks for shopping at Craftify!', badge: '🛒' });
            awardBadge('shopper');
        }

        // trophy close handled via direct onclick set in showTrophy()
    });

    function updateVideo(lang) {
        hideAll();
        const list = lang === 'en' ? playlistsEn : playlistsAr;
        const player = lang === 'en' ? 'player-en' : 'player-ar';
        const titleId = lang === 'en' ? 'video-title-en' : 'video-title-ar';
        const targetPage = lang === 'en' ? pages.videoEn : pages.videoAr;
        const cardSrc = lang === 'en' ? '#page-crafts-en' : '#page-crafts-ar';
        
        const titleSpan = document.querySelectorAll(`${cardSrc} .craft-card span`)[currentCraftIndex];
        if(titleSpan) document.getElementById(titleId).innerText = titleSpan.innerText;
        
        document.getElementById(player).innerHTML = `<iframe class="youtube-iframe" src="https://www.youtube.com/embed?listType=playlist&list=${list[currentCraftIndex]}&origin=${window.location.origin}&rel=0" allowfullscreen></iframe>`;
        targetPage.style.display = 'flex';
    }

    function saveTasks() {
        localStorage.setItem("plannerTasks", JSON.stringify(tasks));
        localStorage.setItem("plannerTotalCompleted", String(totalCompletedEver));
    }

    function createSchedule(lang) {
        const scheduleId = lang === 'ar' ? 'scheduleAr' : 'schedule';
        const schedule = document.getElementById(scheduleId);
        if(!schedule) return;
        schedule.innerHTML = "";
        hours.forEach(hour => {
            const slot = document.createElement("div");
            slot.className = "time-slot";
            slot.innerHTML = `<div class="time-label">${hour}</div><div class="planner-drop-area" data-time="${hour}"></div>`;
            const dropArea = slot.querySelector('.planner-drop-area');
            dropArea.addEventListener("dragover", ev => ev.preventDefault());
            dropArea.addEventListener("drop", handleDrop);
            schedule.appendChild(slot);
        });
    }

    function renderPlanner(lang) {
        const backlogId = lang === 'ar' ? 'backlogAr' : 'backlog';
        const sectionId = lang === 'ar' ? 'page-planner-ar' : 'page-planner';
        const backlog = document.getElementById(backlogId);
        const section = document.getElementById(sectionId);
        if(!backlog || !section) return;
        backlog.innerHTML = "";
        section.querySelectorAll(".planner-drop-area").forEach(area => area.innerHTML = "");

        tasks.forEach(task => {
            const div = document.createElement("div");
            div.className = "planner-task" + (task.completed ? " completed" : "");
            div.draggable = true;
            div.innerHTML = `
                <div class="task-main-group">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}, this)">
                    <span>${task.text}</span>
                </div>
                <button onclick="deleteTask(${task.id})" style="background:none; border:none; color:#8a7d72; cursor:pointer; font-size:1rem; padding:0 4px;">✕</button>
            `;
            div.addEventListener("dragstart", ev => ev.dataTransfer.setData("id", task.id));
            if (task.time) {
                const slot = section.querySelector(`.planner-drop-area[data-time="${task.time}"]`);
                if(slot) slot.appendChild(div);
            } else {
                backlog.appendChild(div);
            }
        });

        // Update badge count
        const backlogCount = document.getElementById(lang === 'ar' ? 'backlog-count-ar' : 'backlog-count');
        if (backlogCount) backlogCount.textContent = tasks.filter(t => !t.time).length;
    }

    function handleDrop(e) {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData("id"));
        const time = e.currentTarget.dataset.time || null;
        const task = tasks.find(t => t.id === id);
        if(task) { task.time = time; saveTasks(); renderPlanner('en'); renderPlanner('ar'); }
    }

    function launchConfetti(originEl) {
        const colors = ['#b3562d', '#d4784f', '#f5ebe4', '#7a9e87', '#5588c5', '#f5c97a', '#e8a87c'];
        const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        const count = 48;

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            const size = Math.random() * 8 + 5;
            const isCircle = Math.random() > 0.5;
            el.style.cssText = `
                position: fixed;
                left: ${originX}px;
                top: ${originY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${isCircle ? '50%' : '2px'};
                pointer-events: none;
                z-index: 99999;
                opacity: 1;
                transform: rotate(${Math.random() * 360}deg);
            `;
            document.body.appendChild(el);

            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = Math.random() * 180 + 80;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - 120;
            const gravity = 300;
            const duration = Math.random() * 600 + 700;
            const start = performance.now();

            function animate(now) {
                const t = (now - start) / 1000;
                const progress = (now - start) / duration;
                if (progress >= 1) { el.remove(); return; }
                const x = originX + vx * t;
                const y = originY + vy * t + 0.5 * gravity * t * t;
                const opacity = 1 - progress;
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.opacity = opacity;
                el.style.transform = `rotate(${t * 360}deg)`;
                requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }
    }

    window.toggleTask = (id, checkboxEl) => {
        const task = tasks.find(t => t.id === id);
        if(task) {
            task.completed = !task.completed;
            if (task.completed) {
                launchConfetti(checkboxEl);
                totalCompletedEver++;
                localStorage.setItem("plannerTotalCompleted", String(totalCompletedEver));
                // Award badge every 5 completions (every multiple of 5)
                if (totalCompletedEver % 5 === 0) awardBadge('planner5');
            }
            saveTasks(); renderPlanner('en'); renderPlanner('ar');
        }
    };

    window.deleteTask = (id) => { tasks = tasks.filter(t => t.id !== id); saveTasks(); renderPlanner('en'); renderPlanner('ar'); };

    // Pomodoro
    let customMinutes = 25;
    let timeLeft = customMinutes * 60;
    let totalTime = customMinutes * 60;
    let timerId = null;
    let isRunning = false;
    const CIRCUMFERENCE = 2 * Math.PI * 85; // r=85

    function updatePomodoroDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        ['minutesEn','minutesAr'].forEach(id => { const el = document.getElementById(id); if(el) el.innerText = m; });
        ['secondsEn','secondsAr'].forEach(id => { const el = document.getElementById(id); if(el) el.innerText = s; });

        const progress = timeLeft / totalTime;
        const offset = CIRCUMFERENCE * (1 - progress);
        ['ringProgressEn', 'ringProgressAr'].forEach(id => {
            const ring = document.getElementById(id);
            if (ring) {
                ring.style.strokeDasharray = CIRCUMFERENCE;
                ring.style.strokeDashoffset = offset;
            }
        });
    }

    function syncTimeInput() {
        // Keep the custom-time inputs in sync with current customMinutes
        ['pomodoroTimeEn','pomodoroTimeAr'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = customMinutes;
        });
    }

    function applyCustomTime(lang) {
        if (isRunning) return; // don't allow mid-session changes
        const inputId = lang === 'en' ? 'pomodoroTimeEn' : 'pomodoroTimeAr';
        const input = document.getElementById(inputId);
        if (!input) return;
        const val = parseInt(input.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 120) {
            customMinutes = val;
            totalTime = customMinutes * 60;
            timeLeft = totalTime;
            // sync the other language input too
            ['pomodoroTimeEn','pomodoroTimeAr'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = customMinutes;
            });
            updatePomodoroDisplay();
        }
    }

    function toggleTimer(lang) {
        if (!isRunning) {
            isRunning = true;
            timerId = setInterval(() => {
                timeLeft--;
                updatePomodoroDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    isRunning = false;
                    // Confetti burst from the timer ring
                    const timerEl = document.getElementById('timerContainerEn') || document.getElementById('timerContainerAr');
                    launchConfetti(timerEl);
                    // Award badge for completing a full session
                    setTimeout(() => awardBadge('focuser'), 600);
                    resetTimer();
                }
            }, 1000);
            const startBtn = document.getElementById(lang === 'en' ? 'startBtnEn' : 'startBtnAr');
            if(startBtn) startBtn.innerText = (lang === 'en' ? '⏸ Pause' : '⏸ إيقاف');
            // disable time inputs while running
            ['pomodoroTimeEn','pomodoroTimeAr'].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = true; });
        } else {
            clearInterval(timerId);
            isRunning = false;
            const startBtn = document.getElementById(lang === 'en' ? 'startBtnEn' : 'startBtnAr');
            if(startBtn) startBtn.innerText = (lang === 'en' ? '▶ Start Focus' : '▶ ابدأ التركيز');
            // re-enable time inputs
            ['pomodoroTimeEn','pomodoroTimeAr'].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = false; });
        }
    }

    function resetTimer() {
        clearInterval(timerId);
        isRunning = false;
        timeLeft = totalTime;
        updatePomodoroDisplay();
        ['startBtnEn','startBtnAr'].forEach((id, i) => {
            const el = document.getElementById(id);
            if(el) el.innerText = i === 0 ? '▶ Start Focus' : '▶ ابدأ التركيز';
        });
        ['pomodoroTimeEn','pomodoroTimeAr'].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = false; });
    }

    // Init
    document.getElementById('enrollBtn').onclick = () => { hideAll(); pages.lang.style.display = 'flex'; };

    document.querySelectorAll('.lang-option-btn').forEach(btn => {
        btn.onclick = (e) => {
            hideAll();
            const txt = e.currentTarget.querySelector('span:nth-child(2)')?.innerText?.trim() || e.target.innerText.trim();
            txt === "English" ? pages.homeEn.style.display = 'flex' : pages.homeAr.style.display = 'flex';
        };
    });

    document.querySelectorAll('#page-crafts-en .craft-card').forEach((c, i) => { c.onclick = () => { currentCraftIndex = i; updateVideo('en'); }; });
    document.querySelectorAll('#page-crafts-ar .craft-card').forEach((c, i) => { c.onclick = () => { currentCraftIndex = i; updateVideo('ar'); }; });

    document.getElementById('next-video-en').onclick = () => { currentCraftIndex = (currentCraftIndex + 1) % playlistsEn.length; updateVideo('en'); };
    document.getElementById('prev-video-en').onclick = () => { currentCraftIndex = (currentCraftIndex - 1 + playlistsEn.length) % playlistsEn.length; updateVideo('en'); };
    document.getElementById('next-video-ar').onclick = () => { currentCraftIndex = (currentCraftIndex + 1) % playlistsAr.length; updateVideo('ar'); };
    document.getElementById('prev-video-ar').onclick = () => { currentCraftIndex = (currentCraftIndex - 1 + playlistsAr.length) % playlistsAr.length; updateVideo('ar'); };

    document.getElementById('backToCraftsEn').onclick = () => { hideAll(); pages.craftsEn.style.display = 'grid'; };
    document.getElementById('backToCraftsAr').onclick = () => { hideAll(); pages.craftsAr.style.display = 'grid'; };

    const startEn = document.getElementById('startBtnEn');
    const resetEn = document.getElementById('resetBtnEn');
    const startAr = document.getElementById('startBtnAr');
    const resetAr = document.getElementById('resetBtnAr');

    if(startEn) startEn.onclick = () => toggleTimer('en');
    if(resetEn) resetEn.onclick = resetTimer;
    if(startAr) startAr.onclick = () => toggleTimer('ar');
    if(resetAr) resetAr.onclick = resetTimer;

    // Custom time inputs
    const timeInputEn = document.getElementById('pomodoroTimeEn');
    const timeInputAr = document.getElementById('pomodoroTimeAr');
    if(timeInputEn) {
        timeInputEn.addEventListener('change', () => applyCustomTime('en'));
        timeInputEn.addEventListener('blur', () => applyCustomTime('en'));
    }
    if(timeInputAr) {
        timeInputAr.addEventListener('change', () => applyCustomTime('ar'));
        timeInputAr.addEventListener('blur', () => applyCustomTime('ar'));
    }
    syncTimeInput();

    // ±5 minute buttons
    document.querySelectorAll('.pomo-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;
            const lang = btn.dataset.lang;
            const inputId = lang === 'en' ? 'pomodoroTimeEn' : 'pomodoroTimeAr';
            const input = document.getElementById(inputId);
            if (!input) return;
            const delta = parseInt(btn.dataset.delta, 10);
            const newVal = Math.min(120, Math.max(1, (parseInt(input.value, 10) || 25) + delta));
            input.value = newVal;
            applyCustomTime(lang);
        });
    });

    const addTaskBtn = document.getElementById('addTaskBtn');
    if(addTaskBtn) {
        addTaskBtn.onclick = () => {
            const input = document.getElementById('taskInput');
            if (!input.value.trim()) return;
            tasks.push({ id: Date.now(), text: input.value, time: null, completed: false });
            input.value = ""; saveTasks(); renderPlanner('en'); renderPlanner('ar');
        };
    }

    const addTaskBtnAr = document.getElementById('addTaskBtnAr');
    if(addTaskBtnAr) {
        addTaskBtnAr.onclick = () => {
            const input = document.getElementById('taskInputAr');
            if (!input || !input.value.trim()) return;
            tasks.push({ id: Date.now(), text: input.value, time: null, completed: false });
            input.value = ""; saveTasks(); renderPlanner('en'); renderPlanner('ar');
        };
    }

    // Init ring
    updatePomodoroDisplay();

    // ===== BADGES BAR =====
    function showBadgesBar() {
        const bar = document.getElementById('badgesBar');
        if (bar) bar.style.display = 'block';
    }
    function hideBadgesBar() {
        const bar = document.getElementById('badgesBar');
        if (bar) bar.style.display = 'none';
    }

    // ===== BADGE SYSTEM =====
    const BADGES = [
        { id: 'focuser',   icon: '⏱️', label: 'Focuser',      desc: 'Completed a full focus session' },
        { id: 'planner5',  icon: '📋', label: 'Task Master',   desc: 'Completed 5 planner tasks' },
        { id: 'artist',    icon: '🎨', label: 'Artist',        desc: 'Uploaded to the Gallery' },
        { id: 'shopper',   icon: '🛒', label: 'Shopper',       desc: 'Completed a purchase' },
        { id: 'collector', icon: '🏅', label: 'Collector',     desc: 'Earned 3 badges' },
        { id: 'master',    icon: '🏆', label: 'Master',        desc: 'Earned all badges!' },
    ];

    let earnedBadges = JSON.parse(localStorage.getItem('craftifyBadges') || '[]');

    function saveBadges() { localStorage.setItem('craftifyBadges', JSON.stringify(earnedBadges)); }

    function renderBadgesList() {
        const list = document.getElementById('badgesList');
        if (!list) return;
        list.innerHTML = '';
        BADGES.forEach(b => {
            const chip = document.createElement('div');
            chip.className = 'badge-chip' + (earnedBadges.includes(b.id) ? ' earned' : '');
            chip.title = b.desc;
            chip.innerHTML = `<span class="badge-chip-icon">${b.icon}</span>${b.label}`;
            list.appendChild(chip);
        });
    }

    function awardBadge(id) {
        const isNew = !earnedBadges.includes(id);
        if (isNew) {
            earnedBadges.push(id);
            saveBadges();
            renderBadgesList();
        }
        const badge = BADGES.find(b => b.id === id);
        if (badge) showTrophy({ title: badge.label, desc: badge.desc, badge: badge.icon });
        // Check milestone badges
        if (isNew) {
            if (earnedBadges.length >= 3 && !earnedBadges.includes('collector')) setTimeout(() => awardBadge('collector'), 1200);
            if (earnedBadges.length >= BADGES.length - 1 && !earnedBadges.includes('master')) setTimeout(() => awardBadge('master'), 1200);
        }
    }

   function closeTrophy() {
    const modal = document.getElementById('trophyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ✅ FIXED: removed nested DOMContentLoaded
const closeBtn = document.getElementById('trophyCloseBtn');
const modal = document.getElementById('trophyModal');

if (modal) {
    const backdrop = modal.querySelector('.trophy-modal-backdrop');

    if (closeBtn) {
        closeBtn.addEventListener("click", (e) => {
            e.preventDefault(); // prevents form issues
            closeTrophy();
        });
    } else {
        console.error("trophyCloseBtn not found");
    }

    if (backdrop) {
        backdrop.addEventListener("click", closeTrophy);
    }
} else {
    console.error("trophyModal not found");
}

    function showTrophy({ title, desc, badge }) {
    const modal = document.getElementById('trophyModal');

    document.getElementById('trophyTitle').textContent = title;
    document.getElementById('trophyDesc').textContent = desc;
    document.getElementById('trophyBadgeDisplay').textContent = badge || '🏆';

    // Store current badge info for sharing
    modal._badgeTitle = title;
    modal._badgeDesc = desc;
    modal._badgeIcon = badge || '🏆';

    modal.style.display = 'flex';

    launchConfetti(modal.querySelector('.trophy-modal-card'));
}

    // ===== BADGE SHARING =====
    window.shareBadgeTwitter = function() {
        const modal = document.getElementById('trophyModal');
        const text = `I just earned the "${modal._badgeTitle}" badge ${modal._badgeIcon} on Craftify! #Craftify #Handmade #Learning`;
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
    };

    window.shareBadgeWhatsApp = function() {
        const modal = document.getElementById('trophyModal');
        const text = `I just earned the "${modal._badgeTitle}" badge ${modal._badgeIcon} on Craftify! 🎉`;
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    };

    window.downloadBadge = function() {
        const modal = document.getElementById('trophyModal');
        const title = modal._badgeTitle || 'Badge';
        const icon = modal._badgeIcon || '🏆';
        const desc = modal._badgeDesc || '';

        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 600, 400);
        grad.addColorStop(0, '#fdf6ee');
        grad.addColorStop(1, '#f5e6d3');
        ctx.fillStyle = grad;
        ctx.roundRect(0, 0, 600, 400, 24);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#b3562d';
        ctx.lineWidth = 3;
        ctx.roundRect(10, 10, 580, 380, 18);
        ctx.stroke();

        // Dashed inner ring
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#e8a87c';
        ctx.lineWidth = 1.5;
        ctx.roundRect(22, 22, 556, 356, 12);
        ctx.stroke();
        ctx.setLineDash([]);

        // Emoji icon
        ctx.font = '90px serif';
        ctx.textAlign = 'center';
        ctx.fillText(icon, 300, 155);

        // Eyebrow text
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#b3562d';
        ctx.letterSpacing = '3px';
        ctx.fillText('ACHIEVEMENT UNLOCKED', 300, 195);

        // Title
        ctx.font = 'bold 36px Georgia, serif';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(title, 300, 245);

        // Desc
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#7a6a60';
        ctx.fillText(desc, 300, 285);

        // Craftify footer
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = '#b3562d';
        ctx.fillText('✦  Craftify', 300, 355);

        const link = document.createElement('a');
        link.download = `craftify-badge-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // ===== GALLERY =====
    let galleryImages = [];

    function setupGalleryUpload(inputId, gridId, lang) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    galleryImages.push({ src: ev.target.result, name: file.name });
                    renderGallery(gridId);
                    awardBadge('artist');
                    showBadgesBar();
                };
                reader.readAsDataURL(file);
            });
            input.value = '';
        });
    }

    function renderGallery(gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        grid.innerHTML = '';
        if (galleryImages.length === 0) {
            grid.innerHTML = `<div class="gallery-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p>No uploads yet</p></div>`;
            return;
        }
        galleryImages.forEach((img, i) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${img.src}" alt="Upload ${i+1}">
                <div class="gallery-item-overlay"><span>${img.name}</span></div>
                <button class="gallery-delete-btn" data-index="${i}" title="Delete image">✕</button>
            `;
            item.querySelector('.gallery-delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showGalleryDeleteConfirm(i, gridId);
            });
            grid.appendChild(item);
        });
    }

    function showGalleryDeleteConfirm(index, gridId) {
        // Remove any existing confirm card
        document.querySelectorAll('.gallery-delete-confirm').forEach(el => el.remove());
        const backdrop = document.createElement('div');
        backdrop.className = 'gallery-delete-backdrop';
        backdrop.innerHTML = `
            <div class="gallery-delete-confirm">
                <div class="gallery-delete-confirm-icon">🗑️</div>
                <p class="gallery-delete-confirm-title">Delete this photo?</p>
                <p class="gallery-delete-confirm-sub">This action cannot be undone.</p>
                <div class="gallery-delete-confirm-btns">
                    <button class="gallery-delete-cancel-btn">Cancel</button>
                    <button class="gallery-delete-ok-btn">Yes, delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        backdrop.querySelector('.gallery-delete-cancel-btn').addEventListener('click', () => backdrop.remove());
        backdrop.querySelector('.gallery-delete-ok-btn').addEventListener('click', () => {
            galleryImages.splice(index, 1);
            backdrop.remove();
            renderGallery('galleryGrid');
            renderGallery('galleryGridAr');
        });
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
    }

    setupGalleryUpload('galleryUpload', 'galleryGrid', 'en');
    setupGalleryUpload('galleryUploadAr', 'galleryGridAr', 'ar');

    // ===== SHOP =====
    const PRODUCTS = [
        { id:1,  name:'Chisels Set',       price:24.99, cat:'wood',     img:'images/Chisels Set.jpg' },
        { id:2,  name:'Oak Wood Block',    price:14.50, cat:'wood',      img:'images/Oak Wood Block.jpg' },
        { id:3,  name:'Sandpaper Pack',    price:7.99,  cat:'wood',      img:'images/Sandpaper Pack.jpg' },
        { id:4,  name:'Seed Bead Kit',     price:18.00, cat:'beading',   img:'images/Seed Bead Kit.jpg' },
        { id:5,  name:'Beading Wire',      price:9.50,  cat:'beading',   img:'images/Beading Wire.jpg' },
        { id:6,  name:'Loom Board',        price:22.00, cat:'beading',   img:'images/Loom Board.jpg' },
        { id:7,  name:'Sketch Pencils Set',price:12.99, cat:'drawing',   img:'images/Sketch Pencils Set.webp'},
        { id:8,  name:'Canvas Pack (5)',   price:19.99, cat:'drawing',   img:'images/Canvas Pack (5).jpg' },
        { id:9,  name:'Acrylic Paints',    price:16.00, cat:'drawing',   img:'images/Acrylic colour 🎨.jpg'},
        { id:10, name:'Clay 2kg',          price:11.99, cat:'pottery',   img:'images/Clay 2kg.jpg' },
        { id:11, name:'Sculpting Tools',   price:17.50, cat:'pottery',   img:'images/Sculpting Tools.jpg'},
        { id:12, name:'PLA Filament',      price:29.99, cat:'printing',  img:'images/PLA Filament.jpg'},
    ];

    let cart = { en: [], ar: [] };
    let activeCat = { en: 'all', ar: 'all' };

    function renderShop(lang, cat) {
        if (cat) activeCat[lang] = cat;
        const containerId = lang === 'ar' ? 'shopProductsAr' : 'shopProducts';
        const container = document.getElementById(containerId);
        if (!container) return;
        const filtered = activeCat[lang] === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat[lang]);
        container.innerHTML = '';
        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
        card.innerHTML = `
                <img class="product-card-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                <div class="product-card-img-fallback" style="display:none;width:100%;aspect-ratio:4/3;align-items:center;justify-content:center;background:var(--terracotta-pale);font-size:2.5rem">🛍️</div>
                <div class="product-info">
                    <div class="product-name">${p.name}</div>
                    <div class="product-cat-tag">${p.cat}</div>
                    <div class="product-price">$${p.price.toFixed(2)}</div>
                </div>
                <button class="add-to-cart-btn" data-id="${p.id}">${lang === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}</button>
            `;
            container.appendChild(card);
        });
    }

    function addToCart(productId, lang) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;
        const existing = cart[lang].find(i => i.id === productId);
        if (existing) { existing.qty++; }
        else { cart[lang].push({ ...product, qty: 1 }); }
        renderCart(lang);
        showBadgesBar();
    }

    function renderCart(lang) {
        const itemsId = lang === 'ar' ? 'cartItemsAr' : 'cartItems';
        const countId = lang === 'ar' ? 'cartCountAr' : 'cartCount';
        const totalId = lang === 'ar' ? 'cartTotalAr' : 'cartTotal';
        const itemsEl = document.getElementById(itemsId);
        const countEl = document.getElementById(countId);
        const totalEl = document.getElementById(totalId);
        if (!itemsEl) return;
        if (cart[lang].length === 0) {
            itemsEl.innerHTML = `<p class="cart-empty">${lang === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}</p>`;
        } else {
            itemsEl.innerHTML = cart[lang].map(i =>
                `<div class="cart-item-row"><span>${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}</span><span>$${(i.price * i.qty).toFixed(2)}</span></div>`
            ).join('');
        }
        const total = cart[lang].reduce((s, i) => s + i.price * i.qty, 0);
        if (countEl) countEl.textContent = cart[lang].reduce((s, i) => s + i.qty, 0);
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    }

    renderBadgesList();
    
});

/* =====================================================
   HAMBURGER MENU — RESPONSIVE NAV
   ===================================================== */
(function () {
    function initHamburgers() {
        document.querySelectorAll('.nav-hamburger').forEach(btn => {
            // Avoid double-binding
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';

            const navLinks = btn.nextElementSibling; // the <ul class="nav-links">

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = navLinks.classList.toggle('open');
                btn.classList.toggle('open', isOpen);
                btn.setAttribute('aria-expanded', isOpen);
            });

            // Close when any nav link is clicked
            navLinks.addEventListener('click', () => {
                navLinks.classList.remove('open');
                btn.classList.remove('open');
                btn.setAttribute('aria-expanded', false);
            });
        });

        // Close all menus on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.nav-links.open').forEach(ul => ul.classList.remove('open'));
            document.querySelectorAll('.nav-hamburger.open').forEach(b => {
                b.classList.remove('open');
                b.setAttribute('aria-expanded', false);
            });
        });
    }

    // Run on load and after each page switch (MutationObserver on body display changes)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHamburgers);
    } else {
        initHamburgers();
    }

    // Re-init after page transitions expose new navbars
    const observer = new MutationObserver(initHamburgers);
    observer.observe(document.body, { subtree: true, attributeFilter: ['style'] });
})();
