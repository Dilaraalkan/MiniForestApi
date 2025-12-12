/* AYARLAR */
const API_BASE_URL = "http://localhost:5097"; 

/* DOM ELEMENTLERİ */
const modalOverlay = document.getElementById("focusModal");
const editModal = document.getElementById("editModal"); // YENİ
const modalTimerDisplay = document.getElementById("modalTimerDisplay");
const growingTree = document.getElementById("growingTree");
const modalQuote = document.getElementById("modalQuote");
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const forestGrid = document.getElementById("forestGrid");
const timerDisplay = document.getElementById("timerDisplay");
const durationInput = document.getElementById("durationInput");
const sessionsList = document.getElementById("sessionsList");
const todaySummary = document.getElementById("todaySummary");
const treeType = document.getElementById("treeType");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const errorMessage = document.getElementById("errorMessage");
const themeToggle = document.getElementById("themeToggle");

// Edit Modal Inputs
const editSessionId = document.getElementById("editSessionId");
const editDuration = document.getElementById("editDuration");
const editTreeType = document.getElementById("editTreeType");
const editNote = document.getElementById("editNote");

/* STATE */
let currentSessionId = null;
let timerInterval = null;
let remainingSeconds = 0;
let statsChart = null;
let initialTotalSeconds = 0;

/* --- AUTH --- */
async function login() {
    const u = loginUsername.value.trim();
    const p = loginPassword.value.trim();
    if (!u || !p) return errorMessage.textContent = "Alanlar boş olamaz";

    try {
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: u, password: p })
        });

        const data = await response.json();
        if (!response.ok) {
            errorMessage.textContent = data.message || "Giriş başarısız";
            return;
        }

        localStorage.setItem("loggedUser", data.username);
        localStorage.setItem("userId", data.userId);
        openApp(data.username);

    } catch (err) {
        console.error(err);
        errorMessage.textContent = "Sunucuya bağlanılamadı.";
    }
}

async function register() {
    const u = registerUsername.value.trim();
    const p = registerPassword.value.trim();
    if (!u || !p) return alert("Alanları doldurun");

    try {
        const response = await fetch(`${API_BASE_URL}/Auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: u, password: p })
        });

        const data = await response.json();
        if (!response.ok) return alert("Hata: " + (data.message || "Kayıt olunamadı"));
        
        alert("Kayıt başarılı! Giriş yapabilirsin.");
        showTab("login");
    } catch (err) {
        console.error(err);
        alert("Sunucu hatası.");
    }
}

function showTab(tab) {
    document.getElementById("loginForm").style.display = tab === "login" ? "block" : "none";
    document.getElementById("registerForm").style.display = tab === "register" ? "block" : "none";
    errorMessage.textContent = "";
}

function logout() {
    localStorage.clear();
    location.reload();
}

function openApp(username) {
    loginPage.style.display = "none";
    appPage.classList.add("active");
    document.getElementById("navbarUser").textContent = "Hoş geldin, " + username;
    loadUserData();
}

/* --- VERİ YÖNETİMİ --- */
function loadUserData() {
    const userId = localStorage.getItem("userId");
    if(!userId) return;
    fetchSessionsFromBackend(userId);
}

async function fetchSessionsFromBackend(userId) {
    try {
        const r = await fetch(`${API_BASE_URL}/Focus/user/${userId}`);
        if(!r.ok) throw new Error("Veri çekilemedi");

        const d = await r.json();
        const mySessions = d.body || [];
        updateUI(mySessions);

    } catch (err) {
        console.error(err);
        todaySummary.textContent = "Veriler yüklenirken hata oluştu.";
    }
}

// LİSTE GÜNCELLEME (İKONLAR EKLENDİ)
function updateUI(sessions) {
    sessionsList.innerHTML = "";
    
    // Tarihe göre sırala
    const sortedSessions = sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    sortedSessions.slice(0, 10).forEach(s => {
        const li = document.createElement("li");
        
        const dateStr = new Date(s.startTime).toLocaleString("tr-TR");
        const treeEmoji = s.treeType || "🌲"; 
        // Not varsa yanına ataç koyalım
        const noteIcon = s.note ? " 📝" : "";
        
        // HTML İçeriği: Sol tarafta yazı, Sağ tarafta butonlar
        li.innerHTML = `
            <div class="session-item-content">
                <span>
                    ${dateStr} - <strong>${s.durationMinutes} dk</strong> 
                    | ${s.isCompleted ? `<span style="color:green">✅ ${treeEmoji}</span>` : '<span style="color:red">❌ İptal</span>'}
                    ${noteIcon}
                </span>
                <div class="action-buttons">
                    <button onclick="openEditModal(${s.id})" class="btn-icon btn-edit" title="Düzenle"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteSession(${s.id})" class="btn-icon btn-delete" title="Sil"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        sessionsList.appendChild(li);
    });

    // ORMANI GÜNCELLE
    forestGrid.innerHTML = "";
    const completedSessions = sessions.filter(s => s.isCompleted);
    
    if (completedSessions.length === 0) {
        forestGrid.innerHTML = "<p style='width:100%; text-align:center; opacity:0.6'>Henüz ağaç dikmedin.</p>";
    } else {
        completedSessions.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).forEach(s => {
            const d = document.createElement("div");
            d.className = "tree-item";
            d.textContent = s.treeType || "🌲"; 
            // Mouse üzerine gelince notu da göstersin
            const tooltip = s.note ? `\nNot: ${s.note}` : "";
            d.title = `${new Date(s.startTime).toLocaleDateString()} - ${s.durationMinutes} dk${tooltip}`;
            forestGrid.appendChild(d);
        });
    }

    // ÖZET GÜNCELLE
    const todayStr = new Date().toLocaleDateString("tr-TR");
    let totalMinutes = 0;
    sessions.forEach(s => {
        if (s.isCompleted && new Date(s.startTime).toLocaleDateString("tr-TR") === todayStr) {
            totalMinutes += s.durationMinutes;
        }
    });
    todaySummary.textContent = totalMinutes === 0 
        ? "Bugün henüz odaklanmadın." 
        : `${todayStr} tarihinde toplam ${totalMinutes} dk odaklandın.`;

    // GRAFİK
    drawChart(sessions);
}

/* --- YENİ EKLENEN FONKSİYONLAR (CRUD) --- */

// 1. SİLME (DELETE)
async function deleteSession(id) {
    if (!confirm("Bu kaydı silmek istediğine emin misin?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/Focus/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Kayıt silindi!");
            loadUserData(); // Listeyi yenile
        } else {
            alert("Silinemedi.");
        }
    } catch (err) {
        console.error(err);
        alert("Hata oluştu.");
    }
}

// 2. DÜZENLEME MODALINI AÇ (GET SINGLE)
async function openEditModal(id) {
    try {
        // Backend'den güncel veriyi çek
        const response = await fetch(`${API_BASE_URL}/Focus/${id}`);
        const data = await response.json();
        
        if (!data.success) {
            alert("Veri çekilemedi");
            return;
        }

        const session = data.body;

        // Formu doldur
        editSessionId.value = session.id;
        editDuration.value = session.durationMinutes;
        editTreeType.value = session.treeType || "🌲";
        editNote.value = session.note || ""; // Not varsa getir

        // Modalı göster
        editModal.classList.add("active");

    } catch (err) {
        console.error(err);
        alert("Bağlantı hatası");
    }
}

// 3. DÜZENLEMEYİ KAYDET (PUT)
async function saveSessionEdit() {
    const id = editSessionId.value;
    const duration = parseInt(editDuration.value);
    const tree = editTreeType.value;
    const note = editNote.value;

    if (duration < 1) return alert("Süre geçersiz");

    try {
        const response = await fetch(`${API_BASE_URL}/Focus/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                durationMinutes: duration,
                treeType: tree,
                note: note
            })
        });

        if (response.ok) {
            alert("Güncelleme başarılı!");
            closeEditModal();
            loadUserData(); // Listeyi yenile
        } else {
            alert("Güncellenemedi.");
        }
    } catch (err) {
        console.error(err);
        alert("Hata oluştu.");
    }
}

function closeEditModal() {
    editModal.classList.remove("active");
}

/* --- API İŞLEMLERİ (START/FINISH) --- */
async function startSession() {
    const min = parseInt(durationInput.value);
    const userId = localStorage.getItem("userId");
    const selectedTree = treeType.value; 

    if (!min || min < 1) return alert("Geçerli bir süre girin.");
    if (!userId) return logout();

    try {
        const response = await fetch(`${API_BASE_URL}/Focus/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                durationMinutes: min, 
                userId: parseInt(userId),
                treeType: selectedTree 
            })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        currentSessionId = data.body.id; 
        
        growingTree.textContent = "🌱";
        startTimer(min * 60);

    } catch (err) {
        alert("Başlatılamadı: " + err.message);
    }
}

async function finishSession(completed) {
    if (!currentSessionId) return;
    closeModal();

    try {
        await fetch(`${API_BASE_URL}/Focus/finish/${currentSessionId}?completed=${completed}`, { method: "POST" });
        
        if (completed) alert("Tebrikler! Ağaç dikildi. 🌳");
        else alert("Oturum iptal edildi. 🍂");
        
        currentSessionId = null;
        loadUserData(); 

    } catch (err) {
        console.error("Hata:", err);
    }
}

/* --- TIMER & MODAL --- */
function startTimer(sec) {
    clearInterval(timerInterval);
    remainingSeconds = sec;
    initialTotalSeconds = sec;
    openModal();
    updateTimer();
    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimer();
        updateTreeGrowth();
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            finishSession(true);
        }
    }, 1000);
}

function updateTimer() {
    let text = "Süre bitti";
    if (remainingSeconds > 0) {
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');
        text = `${mins}:${secs}`;
    }
    timerDisplay.textContent = text;
    modalTimerDisplay.textContent = text;
}

function updateTreeGrowth() {
    if (initialTotalSeconds <= 0) return;
    const progress = (initialTotalSeconds - remainingSeconds) / initialTotalSeconds;
    const selectedTree = treeType.value; 

    if (progress < 0.33) growingTree.textContent = "🌱"; 
    else if (progress < 0.66) growingTree.textContent = "🌿"; 
    else growingTree.textContent = selectedTree; 

    const scaleValue = 1 + (progress * 2.5); 
    growingTree.style.transform = `scale(${scaleValue})`;
}

function openModal() {
    modalOverlay.classList.add("active");
    growingTree.textContent = "🌱";
    growingTree.style.transform = "scale(1)";
    const quotes = ["Odaklan, başar.", "Dijital detoks.", "Geleceğini inşa et."];
    modalQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}
function closeModal() { modalOverlay.classList.remove("active"); }

/* CHART & THEME & INIT */
function drawChart(sessions) {
    const ctx = document.getElementById("statsChart");
    if (!ctx) return;
    const data = {};
    sessions.filter(s => s.isCompleted).forEach(s => {
        const k = new Date(s.startTime).toLocaleDateString("tr-TR");
        data[k] = (data[k] || 0) + s.durationMinutes;
    });
    if (statsChart) statsChart.destroy();
    statsChart = new Chart(ctx, {
        type: "line",
        data: { labels: Object.keys(data), datasets: [{ label: "Süre (dk)", data: Object.values(data), borderColor: "#4CAF50" }] }
    });
}
function initTheme() { if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode"); }
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

/* GLOBAL */
initTheme();
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
if (localStorage.getItem("loggedUser")) openApp(localStorage.getItem("loggedUser"));

// HTML'den erişim için Global yap
window.startSession = startSession;
window.finishSession = finishSession;
window.login = login;
window.register = register;
window.logout = logout;
window.showTab = showTab;
window.deleteSession = deleteSession;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveSessionEdit = saveSessionEdit;
window.toggleSessions = () => sessionsList.style.display = sessionsList.style.display === "none" ? "block" : "none";
window.clearSessions = () => { if(confirm("Tüm verileri silmek için veritabanı sıfırlanmalı.")) {} };