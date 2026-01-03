/**
 * ProducerHub - Core Application Logic
 * Version: 1.2.0
 * Features: Multi-page routing, Chat, Workflow Engine, Admin CRUD
 */

let isAdmin = false;
let posts = JSON.parse(localStorage.getItem('ph_production_db')) || [];
let currentFilter = 'all';

// Mock Data for Community Chat
let chatMessages = [
    { user: "System", text: "Welcome to the ProducerHub Community! Be respectful and share the vibes.", me: false },
    { user: "DrumKing", text: "Does anyone have a good workflow for sidechaining in Ableton?", me: false },
    { user: "SynthWav", text: "Try the new shortcut Cmd+J to consolidate clips faster!", me: false }
];

// Workflow Shortcuts Data
const workflowShortcuts = [
    { action: "Duplicate Track/Clip", key: "Cmd/Ctrl + D", category: "Editing" },
    { action: "Consolidate Selection", key: "Cmd/Ctrl + J", category: "Arrangement" },
    { action: "Quantize MIDI", key: "Q", category: "MIDI" },
    { action: "Split Clip at Playhead", key: "Cmd/Ctrl + E", category: "Editing" },
    { action: "Toggle Mixer View", key: "Tab", category: "Interface" },
    { action: "Add New MIDI Track", key: "Shift + Cmd/Ctrl + T", category: "Creation" },
    { action: "Freeze Track", key: "Right Click > Freeze", category: "Performance" },
    { action: "Reverse Audio", key: "R", category: "Sample Ops" }
];

/**
 * 1. INITIALIZATION
 */
function initApp() {
    renderPosts();
    renderWorkflow();
    renderChat();
    initDragScroll();
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * 2. ROUTING & NAVIGATION
 */
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active-page');

    // Reset filters when changing pages
    currentFilter = 'all';
    window.scrollTo(0, 0);
    renderPosts();
}

/**
 * 3. SLIDER CONTROLS (ARROWS)
 */
function moveSlider(id, direction) {
    const slider = document.getElementById(id);
    const scrollAmount = 320; // Width of one card + gap
    slider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

/**
 * 4. WORKFLOW & CHAT LOGIC
 */
function renderWorkflow() {
    const list = document.getElementById('workflow-list');
    if (!list) return;
    list.innerHTML = workflowShortcuts.map(s => `
        <div class="shortcut-card">
            <small style="color:rgba(255,255,255,0.3); text-transform:uppercase;">${s.category}</small>
            <h4>${s.action}</h4>
            <kbd>${s.key}</kbd>
        </div>
    `).join('');
}

function renderChat() {
    const box = document.getElementById('chat-box');
    if (!box) return;
    box.innerHTML = chatMessages.map(m => `
        <div class="msg ${m.me ? 'me' : ''}">
            <div style="font-size:0.7rem; opacity:0.6; margin-bottom:4px;">${m.user}</div>
            ${m.text}
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if (!input.value.trim()) return;

    chatMessages.push({ user: "You", text: input.value, me: true });
    input.value = "";
    renderChat();
}

/**
 * 5. POST RENDERING ENGINE
 */
function createCard(post) {
    const card = document.createElement('div');
    card.className = "card";
    card.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') openDetail(post.id);
    };

    card.innerHTML = `
        ${post.limited ? '<div class="limited-badge">Limited Time</div>' : ''}
        <img src="${post.img || 'https://via.placeholder.com/400x250'}" class="card-img" loading="lazy">
        <div class="card-content">
            <small>${post.tag} | ${post.price}</small>
            <h3>${post.title}</h3>
            ${isAdmin ? `<button onclick="event.stopPropagation(); editPost('${post.id}')" style="margin-top:10px; background:#fff; color:#000; border:none; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; cursor:pointer;">EDIT RESOURCE</button>` : ''}
        </div>
    `;
    return card;
}

function renderPosts(searchFilter = "") {
    const sliders = { 'trending': 'trending-slider', 'freebies': 'freebies-slider' };
    const grids = { 'trending': 'trending-grid', 'freebies': 'freebies-grid' };

    // Clear all containers
    [...Object.values(sliders), ...Object.values(grids)].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    posts.forEach(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchFilter.toLowerCase());
        const matchesType = currentFilter === 'all' || (currentFilter === 'limited' && post.limited) || post.tag === currentFilter;

        if (!matchesSearch || !matchesType) return;

        // Populate Home Sliders
        if (sliders[post.cat]) {
            const slider = document.getElementById(sliders[post.cat]);
            if (slider) slider.appendChild(createCard(post));
        }

        // Populate Main Grids
        if (grids[post.cat]) {
            const grid = document.getElementById(grids[post.cat]);
            if (grid) grid.appendChild(createCard(post));
        }
    });
}

function openDetail(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    // Build Detail Page
    document.getElementById('detail-main-content').innerHTML = `
        <img src="${post.img}" class="detail-img">
        <div>
            <small style="color:var(--accent); font-weight:bold; letter-spacing:1px;">${post.tag.toUpperCase()}</small>
            <h1>${post.title}</h1>
            <p class="accent-text">${post.price}</p>
            <button class="dl-btn-main" onclick="window.open('${post.link}', '_blank')">GET RESOURCE NOW</button>
        </div>
    `;

    document.getElementById('detail-description-content').innerHTML = `
        <h2 style="font-family:'Montserrat'; margin-bottom:20px;">Resource Information</h2>
        <div style="white-space: pre-wrap;">${post.desc}</div>
    `;

    showPage('post-detail');
}

/**
 * 6. ADMIN SYSTEM
 */
function loginAdmin() {
    if (prompt("Enter Admin Security Code:") === "7744") {
        isAdmin = true;
        document.getElementById('admin-tools').style.display = 'flex';
        renderPosts();
        alert("Admin Access Granted.");
    }
}

function logoutAdmin() {
    isAdmin = false;
    document.getElementById('admin-tools').style.display = 'none';
    renderPosts();
}

function savePost() {
    const id = document.getElementById('editPostId').value || Date.now().toString();
    const newPost = {
        id,
        title: document.getElementById('postTitle').value,
        img: document.getElementById('postImg').value,
        link: document.getElementById('postLink').value,
        cat: document.getElementById('postCat').value,
        tag: document.getElementById('postTag').value,
        price: document.getElementById('postPrice').value,
        limited: document.getElementById('postLimited').checked,
        desc: document.getElementById('postDesc').value
    };

    if (!newPost.title || !newPost.img) return alert("Title and Image URL are required.");

    const index = posts.findIndex(p => p.id === id);
    if (index > -1) posts[index] = newPost;
    else posts.push(newPost);

    localStorage.setItem('ph_production_db', JSON.stringify(posts));
    renderPosts();
    closeModal();
}

function editPost(id) {
    const p = posts.find(x => x.id === id);
    document.getElementById('editPostId').value = p.id;
    document.getElementById('postTitle').value = p.title;
    document.getElementById('postImg').value = p.img;
    document.getElementById('postLink').value = p.link;
    document.getElementById('postCat').value = p.cat;
    document.getElementById('postTag').value = p.tag;
    document.getElementById('postPrice').value = p.price;
    document.getElementById('postLimited').checked = p.limited;
    document.getElementById('postDesc').value = p.desc;
    
    document.getElementById('deleteBtn').style.display = "block";
    openModal();
}

function deletePost() {
    const id = document.getElementById('editPostId').value;
    if (confirm("Permanently delete this resource?")) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('ph_production_db', JSON.stringify(posts));
        renderPosts();
        closeModal();
    }
}

/**
 * 7. UTILS
 */
function openModal() { document.getElementById('postModal').style.display = 'flex'; }
function closeModal() { 
    document.getElementById('postModal').style.display = 'none'; 
    document.getElementById('editPostId').value = "";
    document.getElementById('deleteBtn').style.display = "none";
    document.querySelectorAll('.modal-box input, .modal-box textarea').forEach(i => i.value = "");
}

function handleSearch() {
    renderPosts(document.getElementById('searchInput').value);
}

function updateCountdown() {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Next midnight
    const diff = target - now;
    const h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
    const timer = document.getElementById('countdown');
    if (timer) timer.innerText = `${h}h ${m}m ${s}s`;
}

function initDragScroll() {
    // Basic drag scroll implementation for desktop users
    const sliders = document.querySelectorAll('.horizontal-scroll');
    sliders.forEach(slider => {
        let isDown = false; let startX; let scrollLeft;
        slider.addEventListener('mousedown', (e) => {
            isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => isDown = false);
        slider.addEventListener('mouseup', () => isDown = false);
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2;
            slider.scrollLeft = scrollLeft - walk;
        });
    });
}