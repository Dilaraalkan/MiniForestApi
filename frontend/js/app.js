const BASE_URL = "http://localhost:5097/Focus";
    
    /* DOM  */
    const loginPage = document.getElementById("loginPage");
    const appPage = document.getElementById("appPage");
    const forestGrid = document.getElementById("forestGrid");
    const currentSessionSpan = document.getElementById("currentSessionId");
    const timerDisplay = document.getElementById("timerDisplay");
    const durationInput = document.getElementById("durationInput");
    const sessionsList = document.getElementById("sessionsList");
    const todaySummary = document.getElementById("todaySummary");
    const treeType = document.getElementById("treeType");
    const motivationQuote = document.getElementById("motivationQuote");
    const loginUsername = document.getElementById("loginUsername");
    const loginPassword = document.getElementById("loginPassword");
    const registerUsername = document.getElementById("registerUsername");
    const registerPassword = document.getElementById("registerPassword");
    const errorMessage = document.getElementById("errorMessage");
    const loginInfoMessage = document.getElementById("loginInfoMessage");
    const themeToggle = document.getElementById("themeToggle");
    
    /* STATE  */
    let currentSessionId = null;
    let timerInterval = null;
    let remainingSeconds = 0;
    let statsChart = null;
    
    /*  COMPLETION MAP   */
    function getCompletionMap() {
        return JSON.parse(localStorage.getItem("completionMap") || "{}");
    }

    function saveCompletionMap(map) {
        localStorage.setItem("completionMap", JSON.stringify(map));
    }

    function setCompletionForSession(sessionId, completed) {
        const map = getCompletionMap();
        map[sessionId] = completed === true;
        saveCompletionMap(map);
    }

    function isTimerCompleted(sessionId) {
        const map = getCompletionMap();
        return map[sessionId] === true;
    }
    
    /*  USER  */
    function getLoggedUsername() {
        return localStorage.getItem("loggedUser");
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem("users") || "[]");
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    
    /*  SESSION OWNERS  */
    function getSessionOwners() {
        return JSON.parse(localStorage.getItem("sessionOwners") || "[]");
    }
    
    function saveSessionOwners(list) {
        localStorage.setItem("sessionOwners", JSON.stringify(list));
    }

    function addSessionOwner(sessionId) {
        const u = getLoggedUsername();
        if (!u) return;
        const owners = getSessionOwners();
        owners.push({ id: sessionId, username: u });
        saveSessionOwners(owners);
    }

    function getOwnedSessionIdsForCurrentUser() {
        const u = getLoggedUsername();
        return getSessionOwners()
            .filter(o => o.username === u)
            .map(o => o.id);
    }
    
    /* FOREST  */
    function getForestKey() {
        const u = getLoggedUsername();
        if (!u) return null;   
        return "forest_" + u;
    }
    
    function getForestArray() {
        const key = getForestKey();
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key) || "[]");
    }
    
    function saveForestArray(arr) {
        localStorage.setItem(getForestKey(), JSON.stringify(arr));
    }

    function addTree(type) {
        const arr = getForestArray();
        arr.push(type);
        saveForestArray(arr);
    }

    function renderForest() {
        forestGrid.innerHTML = "";
        getForestArray().forEach(t => {
            const d = document.createElement("div");
            d.className = "tree-item";
            d.textContent = t;
            forestGrid.appendChild(d);
        });
    }

    function clearForest() {
        const u = getLoggedUsername();
        if (!u) {
            alert("Önce giriş yapmalısın.");
            return;
        }
    
        if (!confirm("Ormanı tamamen silmek istiyor musun?")) return;
    
        const key = "forest_" + u;
        localStorage.removeItem(key); 
    
        forestGrid.innerHTML = "";    
    }
    
    
    /* AUTH */
    function login() {
        const u = loginUsername.value.trim();
        const p = loginPassword.value.trim();
        if (!u || !p) return errorMessage.textContent = "Alanlar boş olamaz";
        const users = getUsers();
        if (!users.find(x => x.username === u && x.password === p))
            return errorMessage.textContent = "Hatalı giriş";
        localStorage.setItem("loggedUser", u);
        openApp(u);
    }

    function register() {
        const u = registerUsername.value.trim();
        const p = registerPassword.value.trim();
        if (!u || !p) return;
        const users = getUsers();
        if (users.some(x => x.username === u)) return;
        users.push({ username: u, password: p });
        saveUsers(users);
        showTab("login");
    }

    function showTab(tab) {
        document.getElementById("loginForm").style.display = tab === "login" ? "block" : "none";
        document.getElementById("registerForm").style.display = tab === "register" ? "block" : "none";
    }

    function logout() {
        localStorage.removeItem("loggedUser");
        location.reload();
    }
    
    /* APP  */
    function openApp(username) {
        loginPage.style.display = "none";
        appPage.classList.add("active");
        document.getElementById("navbarUser").textContent = "Hoş geldin, " + username;
        renderForest();
        loadToday();
        loadSessions();
    }
    
    /* TIMER  */
    function startTimer(sec) {
        clearInterval(timerInterval);
        remainingSeconds = sec;
        timerInterval = setInterval(() => {
            remainingSeconds--;
            updateTimer();
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                finishSession(true); 
            }
        }, 1000);
    }

    function updateTimer() {
        if (remainingSeconds <= 0) timerDisplay.textContent = "Süre bitti";
        else timerDisplay.textContent =
            `${Math.floor(remainingSeconds/60)} dk ${remainingSeconds%60} sn`;
    }
    
    /* SESSION  */
    async function startSession() {
        const min = parseInt(durationInput.value);
        if (!min) return;
        const r = await fetch(BASE_URL + "/start", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ durationMinutes: min })
        });
        const d = await r.json();
        currentSessionId = d.body.id;
        addSessionOwner(currentSessionId);
        startTimer(min * 60);
    }

    async function finishSession(completed) {
        if (!currentSessionId) return;
        const sid = currentSessionId;
        await fetch(BASE_URL + "/finish/" + sid + "?completed=" + completed, { method:"POST" });
        setCompletionForSession(sid, completed);
        if (completed) {
            addTree(treeType.value);
            renderForest();
        }
        currentSessionId = null;
        remainingSeconds = 0;
        loadToday();
        loadSessions();
    }

    
    /*  TODAY  */
    async function loadToday() {
        const u = getLoggedUsername();
        if (!u) {
            todaySummary.textContent = "Önce giriş yapmalısın.";
            return;
        }
    
        try {
            const r = await fetch(BASE_URL);
            const d = await r.json();
    
            // SADECE BU KULLANICIYA AİT OTURUMLAR
            const ownedIds = new Set(getOwnedSessionIdsForCurrentUser());
            const mySessions = d.body.filter(s => ownedIds.has(s.id));
    
            const todayStr = new Date().toLocaleDateString("tr-TR");
    
            const totalMinutes = mySessions
                .filter(s =>
                    isTimerCompleted(s.id) === true &&
                    new Date(s.startTime).toLocaleDateString("tr-TR") === todayStr
                )
                .reduce((sum, s) => sum + s.durationMinutes, 0);
    
            todaySummary.textContent =
                totalMinutes === 0
                    ? "Bugün için kayıtlı odak oturumu yok."
                    : `${todayStr} tarihinde ${totalMinutes} dk odaklandın.`;
    
        } catch (err) {
            todaySummary.textContent = "Hata: " + err;
        }
    }
    
    
    /*  LIST + CHART */
    async function loadSessions() {
        const r = await fetch(BASE_URL);
        const d = await r.json();
        const ids = getOwnedSessionIdsForCurrentUser();
        const my = d.body.filter(s => ids.includes(s.id));
        sessionsList.innerHTML = "";
        my.forEach(s => {
            const li = document.createElement("li");
            li.textContent = `${s.durationMinutes} dk | ${isTimerCompleted(s.id) ? "Tamamlandı" : "İptal"}`;
            sessionsList.appendChild(li);
        });
        drawChart(my);
    }

    function toggleSessions() {
        if (!sessionsList) return;
    
        if (sessionsList.style.display === "none") {
            sessionsList.style.display = "block";
        } else {
            sessionsList.style.display = "none";
        }
    }
    

    function drawChart(sessions) {
        const ctx = document.getElementById("statsChart");
        if (!ctx) return;
        const data = {};
        sessions.filter(s => isTimerCompleted(s.id)).forEach(s => {
            const k = new Date(s.startTime).toLocaleDateString("tr-TR");
            data[k] = (data[k] || 0) + s.durationMinutes;
        });
        if (statsChart) statsChart.destroy();
        statsChart = new Chart(ctx, {
            type: "line",
            data: { labels:Object.keys(data), datasets:[{ data:Object.values(data) }] },
            options:{ plugins:{ legend:{ display:false } } }
        });
    }
    
/* DARK MODE  */
function initTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeToggle) themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        if (themeToggle) themeToggle.textContent = "🌙";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
    }
}

initTheme();

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}

function clearSessions() {
    if (!sessionsList) return;

    const onay = confirm("Tüm oturumları listeden silmek istiyor musun?");
    if (!onay) return;

    //  Sadece ekrandan sil
    sessionsList.innerHTML = "";

    // Liste gizlensin ki geri dolmasın
    sessionsList.style.display = "none";
}


    /* INIT */
    if (getLoggedUsername()) openApp(getLoggedUsername());
    window.toggleSessions = toggleSessions;
    window.startSession = startSession;
    window.finishSession = finishSession;
    window.login = login;
    window.register = register;
    window.logout = logout;
    window.showTab = showTab;
    window.clearSessions = clearSessions;




