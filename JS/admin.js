// ============================================================
// AJ SEVA ADMIN PANEL
// CLEAN COMPLETE VERSION
// FIREBASE AUTH + TRAVEL + SERVICES + BOOKINGS
// CUSTOMERS + SETTINGS
// ============================================================

import {
    db,
    auth,

    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    doc,
    serverTimestamp,

    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "./firebase-config.js";


// ============================================================
// COLLECTIONS
// ============================================================

const TRAVEL_COLLECTION = "travelPackages";
const SERVICES_COLLECTION = "services";
const BOOKINGS_COLLECTION = "bookings";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOCUMENT = "general";


// ============================================================
// GLOBAL DATA
// ============================================================

let adminUser = null;

let travelPackages = [];
let services = [];
let adminBookings = [];

let currentEditTravelId = null;
let currentEditServiceId = null;

let adminInitialized = false;


// ============================================================
// PAGE LOCK
// ============================================================

function lockAdminPage() {

    document.body.classList.add("admin-locked");

    const loginScreen =
        document.getElementById("adminLoginScreen");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }
}


// ============================================================
// SHOW ADMIN PANEL
// ============================================================

function showAdminPanel() {

    const loginScreen =
        document.getElementById("adminLoginScreen");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    document.body.classList.remove("admin-locked");

    console.log("AJ SEVA: Admin Panel Visible");
}


// ============================================================
// SHOW LOGIN
// ============================================================

function showAdminLoginScreen() {

    document.body.classList.add("admin-locked");

    const loginScreen =
        document.getElementById("adminLoginScreen");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }
}


// ============================================================
// TOAST
// ============================================================

function showAdminToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("adminToast");

    const messageElement =
        document.getElementById("toastMessage");

    if (!toast || !messageElement) {

        console.log(
            "AJ SEVA:",
            message
        );

        return;
    }

    messageElement.textContent =
        message;

    toast.style.background =
        type === "error"
            ? "#b91c1c"
            : "#172554";

    toast.classList.add("show");

    clearTimeout(
        window.ajToastTimer
    );

    window.ajToastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);
}


// ============================================================
// LOGIN ERROR
// ============================================================

function showLoginError(message) {

    const errorBox =
        document.getElementById("loginError");

    if (!errorBox) {

        showAdminToast(
            message,
            "error"
        );

        return;
    }

    errorBox.textContent =
        message || "";

    errorBox.style.display =
        message
            ? "block"
            : "none";
}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function firebaseErrorMessage(error) {

    console.error(
        "AJ SEVA FIREBASE ERROR:",
        error
    );

    switch (error?.code) {

        case "permission-denied":
            return "Firebase Permission Denied. Firestore Rules check करें।";

        case "unavailable":
            return "Internet/Firebase connection उपलब्ध नहीं है।";

        case "not-found":
            return "Firebase document नहीं मिला।";

        case "failed-precondition":
            return "Firebase operation पूरा नहीं हो पाया।";

        case "unauthenticated":
            return "Admin login जरूरी है।";

        default:
            return (
                error?.message ||
                "Firebase में समस्या हुई।"
            );
    }
}


// ============================================================
// LOGIN ERROR MESSAGE
// ============================================================

function getLoginErrorMessage(error) {

    console.error(
        "AJ SEVA LOGIN ERROR:",
        error
    );

    switch (error?.code) {

        case "auth/invalid-email":
            return "❌ Email address सही नहीं है।";

        case "auth/user-not-found":
            return "❌ इस Email से Admin account नहीं मिला।";

        case "auth/wrong-password":
            return "❌ Password गलत है।";

        case "auth/invalid-credential":
            return "❌ Email या Password गलत है।";

        case "auth/user-disabled":
            return "❌ यह Admin account disabled है।";

        case "auth/too-many-requests":
            return "⚠️ बहुत ज्यादा Login प्रयास हुए हैं। थोड़ी देर बाद कोशिश करें।";

        case "auth/network-request-failed":
            return "❌ Internet connection check करें।";

        case "auth/operation-not-allowed":
            return "❌ Firebase में Email/Password Login Enable नहीं है।";

        default:
            return (
                error?.message ||
                "❌ Admin Login नहीं हो पाया।"
            );
    }
}


// ============================================================
// NUMBER
// ============================================================

function num(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


// ============================================================
// TIME
// ============================================================

function timeOf(value) {

    if (!value) {
        return 0;
    }

    if (
        typeof value?.toMillis ===
        "function"
    ) {
        return value.toMillis();
    }

    if (
        typeof value?.seconds ===
        "number"
    ) {
        return value.seconds * 1000;
    }

    const time =
        new Date(value).getTime();

    return Number.isFinite(time)
        ? time
        : 0;
}


// ============================================================
// DATE
// ============================================================

function formatDate(value) {

    const time =
        timeOf(value);

    if (!time) {
        return "—";
    }

    return new Date(time).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// FIELD GET
// ============================================================

function getField(id) {

    return (
        document.getElementById(id)
            ?.value
            ?.trim() ||
        ""
    );
}


// ============================================================
// FIELD SET
// ============================================================

function setField(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value =
            value ?? "";
    }
}


// ============================================================
// TEXT SET
// ============================================================

function setFieldText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "";
    }
}


// ============================================================
// IMAGE COMPRESS
// ============================================================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {
                resolve("");
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    const image =
                        new Image();

                    image.onload =
                        () => {

                            let width =
                                image.width;

                            let height =
                                image.height;

                            const maxWidth =
                                900;

                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    height *
                                    maxWidth /
                                    width;

                                width =
                                    maxWidth;
                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                width;

                            canvas.height =
                                height;

                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );

                            if (!ctx) {

                                reject(
                                    new Error(
                                        "Canvas उपलब्ध नहीं है।"
                                    )
                                );

                                return;
                            }

                            ctx.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );

                            let quality =
                                0.65;

                            let result =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                );

                            while (
                                result.length >
                                    700000 &&
                                quality >
                                    0.25
                            ) {

                                quality -=
                                    0.10;

                                result =
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        quality
                                    );
                            }

                            resolve(result);
                        };

                    image.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Image load नहीं हुई।"
                                )
                            );
                        };

                    image.src =
                        event.target.result;
                };

            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Image read नहीं हुई।"
                        )
                    );
                };

            reader.readAsDataURL(file);
        }
    );
}


// ============================================================
// AUTH LOGIN
// ============================================================

async function adminLogin(event) {

    if (event) {
        event.preventDefault();
    }

    const emailInput =
        document.getElementById(
            "adminEmail"
        );

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );

    const loginButton =
        document.getElementById(
            "adminLoginBtn"
        );

    const email =
        emailInput?.value?.trim() ||
        "";

    const password =
        passwordInput?.value ||
        "";

    showLoginError("");

    if (!email) {

        showLoginError(
            "Admin Email डालें।"
        );

        emailInput?.focus();

        return;
    }

    if (!password) {

        showLoginError(
            "Password डालें।"
        );

        passwordInput?.focus();

        return;
    }

    if (loginButton) {

        loginButton.disabled =
            true;

        loginButton.dataset.oldText =
            loginButton.textContent;

        loginButton.textContent =
            "⏳ Login हो रहा है...";
    }

    try {

        console.log(
            "AJ SEVA: Firebase Admin Login शुरू..."
        );

        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        adminUser =
            result.user;

        console.log(
            "AJ SEVA: Admin Login SUCCESS:",
            adminUser.email
        );

        showLoginError("");

        showAdminPanel();

        await initializeAdminPanel();

    } catch (error) {

        showAdminLoginScreen();

        showLoginError(
            getLoginErrorMessage(
                error
            )
        );

    } finally {

        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                loginButton.dataset.oldText ||
                "🔐 Login";
        }
    }
}


// ============================================================
// LOGOUT
// ============================================================

async function adminLogout() {

    try {

        await signOut(auth);

        adminUser =
            null;

        adminInitialized =
            false;

        travelPackages = [];
        services = [];
        adminBookings = [];

        showAdminLoginScreen();

        showLoginError("");

        const passwordInput =
            document.getElementById(
                "adminPassword"
            );

        if (passwordInput) {
            passwordInput.value = "";
        }

        console.log(
            "AJ SEVA: Admin Logged Out"
        );

    } catch (error) {

        console.error(
            "AJ SEVA LOGOUT ERROR:",
            error
        );

        showLoginError(
            "Logout नहीं हो पाया।"
        );
    }
}


// ============================================================
// PASSWORD SHOW/HIDE
// ============================================================

function bindPasswordToggle() {

    const button =
        document.getElementById(
            "togglePassword"
        );

    const password =
        document.getElementById(
            "adminPassword"
        );

    if (
        !button ||
        !password ||
        button.dataset.ajBound === "1"
    ) {
        return;
    }

    button.dataset.ajBound =
        "1";

    button.addEventListener(
        "click",
        () => {

            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                button.textContent =
                    "🙈";

            } else {

                password.type =
                    "password";

                button.textContent =
                    "👁️";
            }
        }
    );
}


// ============================================================
// AUTH BINDING
// ============================================================

function bindAdminLogin() {

    const form =
        document.getElementById(
            "adminLoginForm"
        );

    const loginButton =
        document.getElementById(
            "adminLoginBtn"
        );

    if (
        form &&
        form.dataset.ajLoginBound !==
            "1"
    ) {

        form.dataset.ajLoginBound =
            "1";

        form.addEventListener(
            "submit",
            adminLogin
        );

    } else if (
        !form &&
        loginButton &&
        loginButton.dataset.ajLoginBound !==
            "1"
    ) {

        loginButton.dataset.ajLoginBound =
            "1";

        loginButton.addEventListener(
            "click",
            adminLogin
        );
    }

    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );

    if (
        logoutButton &&
        logoutButton.dataset.ajLogoutBound !==
            "1"
    ) {

        logoutButton.dataset.ajLogoutBound =
            "1";

        logoutButton.addEventListener(
            "click",
            adminLogout
        );
    }

    bindPasswordToggle();
}


// ============================================================
// AUTH STATE
// ============================================================

function setupAdminAuth() {

    onAuthStateChanged(
        auth,
        async user => {

            console.log(
                "AJ SEVA AUTH STATE:",
                user
                    ? user.email
                    : "LOGGED OUT"
            );

            if (user) {

                adminUser =
                    user;

                showAdminPanel();

                await initializeAdminPanel();

            } else {

                adminUser =
                    null;

                adminInitialized =
                    false;

                showAdminLoginScreen();

                console.log(
                    "AJ SEVA: Login required."
                );
            }
        }
    );
}


// ============================================================
// INITIALIZE ADMIN PANEL
// ============================================================

async function initializeAdminPanel() {

    if (adminInitialized) {
        return;
    }

    if (!auth.currentUser) {

        console.log(
            "AJ SEVA: User authenticated नहीं है।"
        );

        showAdminLoginScreen();

        return;
    }

    adminInitialized =
        true;

    console.log(
        "======================================"
    );

    console.log(
        "AJ SEVA ADMIN PANEL STARTING..."
    );

    console.log(
        "======================================"
    );

    try {

        setupNavigation();

        bindForms();

        bindSettings();

        await loadTravelPackages();

        await loadServices();

        await loadAllBookings();

        await loadSettings();

        updateDashboardCounts();

        renderDashboardRecentBookings();

        renderCustomers();

        console.log(
            "======================================"
        );

        console.log(
            "AJ SEVA ADMIN READY"
        );

        console.log(
            "======================================"
        );

    } catch (error) {

        console.error(
            "AJ SEVA ADMIN INITIALIZER ERROR:",
            error
        );

        adminInitialized =
            false;

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".admin-nav-link, .quick-card, .view-all-btn"
        );

    const pages =
        document.querySelectorAll(
            ".admin-page"
        );

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    links.forEach(link => {

        if (
            link.dataset.ajNavigationBound ===
            "1"
        ) {
            return;
        }

        link.dataset.ajNavigationBound =
            "1";

        link.addEventListener(
            "click",
            async event => {

                const target =
                    link.dataset.page;

                if (!target) {
                    return;
                }

                if (
                    link.tagName.toLowerCase() ===
                    "a"
                ) {
                    event.preventDefault();
                }

                pages.forEach(page => {
                    page.classList.remove(
                        "active"
                    );
                });

                document
                    .querySelectorAll(
                        ".admin-nav-link"
                    )
                    .forEach(nav => {
                        nav.classList.remove(
                            "active"
                        );
                    });

                const targetPage =
                    document.getElementById(
                        `page-${target}`
                    );

                if (targetPage) {
                    targetPage.classList.add(
                        "active"
                    );
                }

                const targetNav =
                    document.querySelector(
                        `.admin-nav-link[data-page="${target}"]`
                    );

                if (targetNav) {
                    targetNav.classList.add(
                        "active"
                    );
                }

                if (pageTitle) {

                    const titleMap = {
                        dashboard: "Dashboard",
                        travel: "Travel",
                        services: "Services",
                        bookings: "Bookings",
                        gallery: "Gallery",
                        customers: "Customers",
                        settings: "Settings"
                    };

                    pageTitle.textContent =
                        titleMap[target] ||
                        target;
                }

                try {

                    if (
                        target === "dashboard" ||
                        target === "bookings" ||
                        target === "customers"
                    ) {

                        await loadAllBookings();
                    }

                    if (
                        target ===
                        "customers"
                    ) {

                        renderCustomers();
                    }

                    if (
                        target ===
                        "travel"
                    ) {

                        await loadTravelPackages();
                    }

                    if (
                        target ===
                        "services"
                    ) {

                        await loadServices();
                    }

                    if (
                        target ===
                        "settings"
                    ) {

                        await loadSettings();
                    }

                } catch (error) {

                    showAdminToast(
                        firebaseErrorMessage(
                            error
                        ),
                        "error"
                    );
                }
            }
        );
    });


    const toggle =
        document.getElementById(
            "sidebarToggle"
        );

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    if (
        toggle &&
        sidebar &&
        toggle.dataset.ajSidebarBound !==
            "1"
    ) {

        toggle.dataset.ajSidebarBound =
            "1";

        toggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }
}


// ============================================================
// DASHBOARD COUNTS
// ============================================================

function updateDashboardCounts() {

    const travelCount =
        document.getElementById(
            "travelCount"
        );

    const serviceCount =
        document.getElementById(
            "serviceCount"
        );

    const bookingCount =
        document.getElementById(
            "bookingCount"
        );

    const customerCount =
        document.getElementById(
            "customerCount"
        );

    if (travelCount) {
        travelCount.textContent =
            String(
                travelPackages.length
            );
    }

    if (serviceCount) {
        serviceCount.textContent =
            String(
                services.length
            );
    }

    if (bookingCount) {
        bookingCount.textContent =
            String(
                adminBookings.length
            );
    }

    if (customerCount) {
        customerCount.textContent =
            String(
                buildCustomers().length
            );
    }
}


// ============================================================
// TRAVEL LOAD
// ============================================================

async function loadTravelPackages() {

    if (!auth.currentUser) {
        return;
    }

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    TRAVEL_COLLECTION
                )
            );

        travelPackages =
            snap.docs.map(
                item => ({
                    id: item.id,
                    ...item.data()
                })
            );

        travelPackages.sort(
            (a, b) =>
                timeOf(b.createdAt) -
                timeOf(a.createdAt)
        );

        renderTravelPackages();

        updateDashboardCounts();

        console.log(
            "AJ SEVA: Travel Loaded:",
            travelPackages.length
        );

    } catch (error) {

        console.error(
            "TRAVEL LOAD ERROR:",
            error
        );

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}


// ============================================================
// TRAVEL RENDER
// ============================================================

function renderTravelPackages() {

    const list =
        document.getElementById(
            "travelPackagesList"
        ) ||
        document.getElementById(
            "travelList"
        );

    if (!list) {
        return;
    }

    if (!travelPackages.length) {

        list.innerHTML = `
            <div
                class="gallery-placeholder"
                style="
                    grid-column:1/-1;
                    padding:40px;
                    text-align:center;
                "
            >
                ✈️
                <br>
                अभी कोई Travel Package नहीं है।
            </div>
        `;

        return;
    }

    list.innerHTML =
        travelPackages
            .map(item => {

                const name =
                    item.name ||
                    item.packageName ||
                    "Travel Package";

                const location =
                    item.location ||
                    item.travelLocation ||
                    "";

                const description =
                    item.description ||
                    "";

                const image =
                    item.image ||
                    item.imageUrl ||
                    item.photo ||
                    "";

                const status =
                    item.status ===
                    "inactive"
                        ? "inactive"
                        : "active";

                return `
                    <div
                        class="package-admin-card"
                    >

                        <div
                            class="package-admin-image"
                        >

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(name)}"
                                            style="
                                                width:100%;
                                                height:100%;
                                                object-fit:cover;
                                            "
                                        >
                                    `
                                    : `
                                        <div
                                            style="
                                                height:100%;
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                font-size:50px;
                                            "
                                        >
                                            ✈️
                                        </div>
                                    `
                            }

                        </div>

                        <div
                            class="package-admin-content"
                        >

                            <span
                                class="status ${status}"
                            >
                                ${
                                    status ===
                                    "active"
                                        ? "Active"
                                        : "Inactive"
                                }
                            </span>

                            <h3>
                                ${escapeHTML(
                                    name
                                )}
                            </h3>

                            <p>
                                📍
                                ${escapeHTML(
                                    location
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    description
                                )}
                            </p>

                            <strong>
                                ₹${num(
                                    item.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                                <small>
                                    / व्यक्ति
                                </small>
                            </strong>

                            <div
                                class="card-actions"
                            >

                                <button
                                    type="button"
                                    onclick="editTravel('${escapeHTML(item.id)}')"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="delete-btn"
                                    onclick="deleteTravel('${escapeHTML(item.id)}')"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>

                    </div>
                `;

            })
            .join("");
}


// ============================================================
// OPEN TRAVEL FORM
// ============================================================

function openTravelForm(
    item = null
) {

    const card =
        document.getElementById(
            "travelFormCard"
        );

    const form =
        document.getElementById(
            "travelForm"
        );

    if (!card || !form) {

        showAdminToast(
            "Travel Form नहीं मिला।",
            "error"
        );

        return;
    }

    card.style.display =
        "block";

    currentEditTravelId =
        item?.id || null;

    if (item) {

        setField(
            "travelEditId",
            item.id
        );

        setField(
            "travelName",
            item.name ||
            item.packageName
        );

        setField(
            "travelFrom",
            item.from ||
            item.startingPlace ||
            ""
        );

        setField(
            "travelLocation",
            item.location ||
            item.travelLocation
        );

        setField(
            "travelPrice",
            item.price
        );

        setField(
            "travelDescription",
            item.description
        );

        setField(
            "travelStatus",
            item.status ||
            "active"
        );

        setFieldText(
            "travelFormTitle",
            "Travel Package Edit करें"
        );

    } else {

        form.reset();

        currentEditTravelId =
            null;

        setField(
            "travelStatus",
            "active"
        );

        setFieldText(
            "travelFormTitle",
            "Travel Package जोड़ें"
        );
    }

    card.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================================
// CLOSE TRAVEL FORM
// ============================================================

function closeTravelForm() {

    const card =
        document.getElementById(
            "travelFormCard"
        );

    const form =
        document.getElementById(
            "travelForm"
        );

    if (card) {
        card.style.display =
            "none";
    }

    if (form) {
        form.reset();
    }

    currentEditTravelId =
        null;

    setFieldText(
        "travelFormTitle",
        "Travel Package जोड़ें"
    );
}


// ============================================================
// SAVE TRAVEL
// ============================================================

async function saveTravelForm(
    event
) {

    event.preventDefault();

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    const form =
        document.getElementById(
            "travelForm"
        );

    if (!form) {
        return;
    }

    const button =
        form.querySelector(
            "button[type='submit']"
        );

    const editId =
        currentEditTravelId ||
        getField("travelEditId") ||
        "";

    if (button) {

        button.disabled =
            true;

        button.textContent =
            editId
                ? "⏳ Updating..."
                : "⏳ Saving...";
    }

    try {

        const name =
            getField("travelName");

        const from =
            getField("travelFrom");

        const location =
            getField("travelLocation");

        const description =
            getField(
                "travelDescription"
            );

        const price =
            num(
                document.getElementById(
                    "travelPrice"
                )?.value
            );

        const status =
            document.getElementById(
                "travelStatus"
            )?.value ||
            "active";

        if (!name) {

            showAdminToast(
                "Travel Package का नाम डालें।",
                "error"
            );

            return;
        }

        const file =
            document.getElementById(
                "travelImage"
            )?.files?.[0];

        let image =
            file
                ? await compressImage(file)
                : "";

        if (editId) {

            const old =
                travelPackages.find(
                    item =>
                        String(item.id) ===
                        String(editId)
                );

            if (!image) {

                image =
                    old?.image ||
                    old?.imageUrl ||
                    old?.photo ||
                    "";
            }

            await updateDoc(
                doc(
                    db,
                    TRAVEL_COLLECTION,
                    editId
                ),
                {
                    name,
                    from,
                    location,
                    price,
                    description,
                    status,
                    image,
                    updatedAt:
                        serverTimestamp()
                }
            );

            showAdminToast(
                "✅ Travel Package Update हो गया।"
            );

        } else {

            await addDoc(
                collection(
                    db,
                    TRAVEL_COLLECTION
                ),
                {
                    name,
                    from,
                    location,
                    price,
                    description,
                    status,
                    image,
                    createdAt:
                        serverTimestamp(),
                    updatedAt:
                        serverTimestamp()
                }
            );

            showAdminToast(
                "✅ नया Travel Package Save हो गया।"
            );
        }

        closeTravelForm();

        await loadTravelPackages();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                editId
                    ? "Update Package"
                    : "Save Package";
        }
    }
}


// ============================================================
// EDIT TRAVEL
// ============================================================

window.editTravel =
    id => {

        const item =
            travelPackages.find(
                travel =>
                    String(
                        travel.id
                    ) ===
                    String(id)
            );

        if (item) {
            openTravelForm(item);
        }
    };


// ============================================================
// DELETE TRAVEL
// ============================================================

async function deleteTravel(id) {

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    const item =
        travelPackages.find(
            travel =>
                String(travel.id) ===
                String(id)
        );

    if (!item) {
        return;
    }

    const name =
        item.name ||
        "Travel Package";

    if (
        !confirm(
            `"${name}" को Delete करना चाहते हैं?`
        )
    ) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                TRAVEL_COLLECTION,
                id
            )
        );

        showAdminToast(
            "🗑️ Travel Package Delete हो गया।"
        );

        await loadTravelPackages();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}

window.deleteTravel =
    deleteTravel;


// ============================================================
// SERVICES LOAD
// ============================================================

async function loadServices() {

    if (!auth.currentUser) {
        return;
    }

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    SERVICES_COLLECTION
                )
            );

        services =
            snap.docs.map(
                item => ({
                    id: item.id,
                    ...item.data()
                })
            );

        services.sort(
            (a, b) =>
                timeOf(b.createdAt) -
                timeOf(a.createdAt)
        );

        renderServices();

        updateDashboardCounts();

        console.log(
            "AJ SEVA: Services Loaded:",
            services.length
        );

    } catch (error) {

        console.error(
            "SERVICES LOAD ERROR:",
            error
        );

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}


// ============================================================
// SERVICE RENDER
// ============================================================

function renderServices() {

    const list =
        document.getElementById(
            "servicesList"
        );

    if (!list) {
        return;
    }

    if (!services.length) {

        list.innerHTML = `
            <div
                class="gallery-placeholder"
                style="
                    grid-column:1/-1;
                    padding:40px;
                    text-align:center;
                "
            >
                🛠️
                <br>
                अभी कोई Service नहीं है।
            </div>
        `;

        return;
    }

    list.innerHTML =
        services
            .map(item => {

                const name =
                    item.name ||
                    item.serviceName ||
                    item.title ||
                    "Service";

                const description =
                    item.description ||
                    item.serviceDescription ||
                    item.details ||
                    "";

                const image =
                    item.image ||
                    item.imageUrl ||
                    item.photo ||
                    "";

                const status =
                    item.status ===
                    "inactive"
                        ? "inactive"
                        : "active";

                return `
                    <div
                        class="package-admin-card"
                    >

                        <div
                            class="package-admin-image"
                        >

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(name)}"
                                            style="
                                                width:100%;
                                                height:100%;
                                                object-fit:cover;
                                            "
                                        >
                                    `
                                    : `
                                        <div
                                            style="
                                                height:100%;
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                font-size:50px;
                                            "
                                        >
                                            🛠️
                                        </div>
                                    `
                            }

                        </div>

                        <div
                            class="package-admin-content"
                        >

                            <span
                                class="status ${status}"
                            >
                                ${
                                    status ===
                                    "active"
                                        ? "Active"
                                        : "Inactive"
                                }
                            </span>

                            <h3>
                                ${escapeHTML(
                                    name
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    description
                                )}
                            </p>

                            ${
                                num(
                                    item.price
                                ) > 0
                                    ? `
                                        <strong>
                                            ₹${num(
                                                item.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    `
                                    : `
                                        <strong>
                                            संपर्क करें
                                        </strong>
                                    `
                            }

                            <div
                                class="card-actions"
                            >

                                <button
                                    type="button"
                                    onclick="editService('${escapeHTML(item.id)}')"
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    type="button"
                                    class="delete-btn"
                                    onclick="deleteService('${escapeHTML(item.id)}')"
                                >
                                    🗑️ Delete
                                </button>

                            </div>

                        </div>

                    </div>
                `;

            })
            .join("");
}


// ============================================================
// OPEN SERVICE FORM
// ============================================================

function openServiceForm(
    item = null
) {

    const card =
        document.getElementById(
            "serviceFormCard"
        );

    const form =
        document.getElementById(
            "serviceForm"
        );

    if (!card || !form) {

        showAdminToast(
            "Service Form नहीं मिला।",
            "error"
        );

        return;
    }

    card.style.display =
        "block";

    currentEditServiceId =
        item?.id || null;

    if (item) {

        setField(
            "serviceEditId",
            item.id
        );

        setField(
            "serviceName",
            item.name ||
            item.serviceName ||
            item.title
        );

        setField(
            "servicePrice",
            item.price
        );

        setField(
            "serviceDescription",
            item.description ||
            item.serviceDescription ||
            item.details
        );

        setField(
            "serviceStatus",
            item.status ||
            "active"
        );

        setFieldText(
            "serviceFormTitle",
            "Service Edit करें"
        );

    } else {

        form.reset();

        currentEditServiceId =
            null;

        setField(
            "serviceStatus",
            "active"
        );

        setFieldText(
            "serviceFormTitle",
            "Service जोड़ें"
        );
    }

    card.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================================
// CLOSE SERVICE
// ============================================================

function closeServiceForm() {

    const card =
        document.getElementById(
            "serviceFormCard"
        );

    const form =
        document.getElementById(
            "serviceForm"
        );

    if (card) {
        card.style.display =
            "none";
    }

    if (form) {
        form.reset();
    }

    currentEditServiceId =
        null;

    setFieldText(
        "serviceFormTitle",
        "Service जोड़ें"
    );
}


// ============================================================
// SAVE SERVICE
// ============================================================

async function saveServiceForm(
    event
) {

    event.preventDefault();

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    const form =
        document.getElementById(
            "serviceForm"
        );

    if (!form) {
        return;
    }

    const button =
        form.querySelector(
            "button[type='submit']"
        );

    const editId =
        currentEditServiceId ||
        getField("serviceEditId") ||
        "";

    if (button) {

        button.disabled =
            true;

        button.textContent =
            editId
                ? "⏳ Updating..."
                : "⏳ Saving...";
    }

    try {

        const name =
            getField("serviceName");

        const description =
            getField(
                "serviceDescription"
            );

        const price =
            num(
                document.getElementById(
                    "servicePrice"
                )?.value
            );

        const status =
            document.getElementById(
                "serviceStatus"
            )?.value ||
            "active";

        if (!name) {

            showAdminToast(
                "Service का नाम डालें।",
                "error"
            );

            return;
        }

        const file =
            document.getElementById(
                "serviceImage"
            )?.files?.[0];

        let image =
            file
                ? await compressImage(file)
                : "";

        if (editId) {

            const old =
                services.find(
                    service =>
                        String(
                            service.id
                        ) ===
                        String(
                            editId
                        )
                );

            if (!image) {

                image =
                    old?.image ||
                    old?.imageUrl ||
                    old?.photo ||
                    "";
            }

            await updateDoc(
                doc(
                    db,
                    SERVICES_COLLECTION,
                    editId
                ),
                {
                    name,
                    serviceName:
                        name,
                    title:
                        name,
                    price,
                    description,
                    serviceDescription:
                        description,
                    status,
                    image,
                    updatedAt:
                        serverTimestamp()
                }
            );

            showAdminToast(
                "✅ Service Update हो गई।"
            );

        } else {

            await addDoc(
                collection(
                    db,
                    SERVICES_COLLECTION
                ),
                {
                    name,
                    serviceName:
                        name,
                    title:
                        name,
                    price,
                    description,
                    serviceDescription:
                        description,
                    status,
                    image,
                    icon: "🛠️",
                    emoji: "🛠️",
                    createdAt:
                        serverTimestamp(),
                    updatedAt:
                        serverTimestamp()
                }
            );

            showAdminToast(
                "✅ नई Service Save हो गई।"
            );
        }

        closeServiceForm();

        await loadServices();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                editId
                    ? "Update Service"
                    : "Save Service";
        }
    }
}


// ============================================================
// EDIT SERVICE
// ============================================================

window.editService =
    id => {

        const item =
            services.find(
                service =>
                    String(
                        service.id
                    ) ===
                    String(id)
            );

        if (item) {
            openServiceForm(item);
        }
    };


// ============================================================
// DELETE SERVICE
// ============================================================

async function deleteService(id) {

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    const item =
        services.find(
            service =>
                String(
                    service.id
                ) ===
                String(id)
        );

    if (!item) {
        return;
    }

    const name =
        item.name ||
        item.serviceName ||
        "Service";

    if (
        !confirm(
            `"${name}" को Delete करना चाहते हैं?`
        )
    ) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                SERVICES_COLLECTION,
                id
            )
        );

        showAdminToast(
            "🗑️ Service Delete हो गई।"
        );

        await loadServices();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}

window.deleteService =
    deleteService;


// ============================================================
// BOOKING TYPE
// ============================================================

function getBookingType(
    booking
) {

    const type =
        String(
            booking.bookingType ||
            booking.type ||
            ""
        )
            .toLowerCase();

    if (
        type === "travel" ||
        type === "tour" ||
        booking.packageName ||
        booking.package ||
        booking.travelPackage
    ) {

        return {
            text: "Travel",
            icon: "✈️"
        };
    }

    if (
        type === "ticket" ||
        type === "train" ||
        type === "railway" ||
        type === "bus" ||
        type === "flight" ||
        booking.ticketType ||
        booking.ticket
    ) {

        return {
            text: "Ticket",
            icon: "🎫"
        };
    }

    return {
        text: "Service",
        icon: "🛠️"
    };
}


// ============================================================
// BOOKING TITLE
// ============================================================

function getBookingTitle(
    booking
) {

    const type =
        getBookingType(
            booking
        ).text;

    if (type === "Travel") {

        return (
            booking.packageName ||
            booking.package ||
            booking.nameOfPackage ||
            booking.travelPackage ||
            booking.title ||
            "Travel Package"
        );
    }

    if (type === "Ticket") {

        return (
            booking.ticketType ||
            booking.ticket ||
            booking.ticketName ||
            booking.title ||
            "Ticket Booking"
        );
    }

    return (
        booking.service ||
        booking.serviceName ||
        booking.serviceTitle ||
        booking.serviceType ||
        booking.title ||
        "Service Booking"
    );
}


// ============================================================
// CUSTOMER NAME
// ============================================================

function getCustomerName(
    booking
) {

    return (
        booking.name ||
        booking.customerName ||
        booking.customer ||
        booking.passenger ||
        booking.passengerName ||
        "Unknown Customer"
    );
}


// ============================================================
// CUSTOMER MOBILE
// ============================================================

function getCustomerMobile(
    booking
) {

    const mobile =
        booking.mobile ||
        booking.phone ||
        booking.phoneNumber ||
        booking.contact ||
        "";

    return mobile
        ? String(mobile).trim()
        : "—";
}


// ============================================================
// CUSTOMER EMAIL
// ============================================================

function getCustomerEmail(
    booking
) {

    return (
        booking.email ||
        booking.customerEmail ||
        ""
    );
}


// ============================================================
// BOOKING AMOUNT
// ============================================================

function getBookingAmountNumber(
    booking
) {

    return num(
        booking.totalAmount ??
        booking.amount ??
        booking.price ??
        booking.paidAmount
    );
}


function getBookingAmount(
    booking
) {

    return (
        "₹" +
        getBookingAmountNumber(
            booking
        ).toLocaleString("en-IN")
    );
}


// ============================================================
// PAYMENT STATUS
// ============================================================

function getPaymentStatus(
    booking
) {

    return (
        booking.paymentStatus ||
        booking.payment ||
        "pending"
    );
}


// ============================================================
// BOOKING STATUS
// ============================================================

function getBookingStatus(
    booking
) {

    return (
        booking.status ||
        booking.bookingStatus ||
        "new"
    );
}


// ============================================================
// BUILD CUSTOMERS
// ============================================================

function buildCustomers() {

    const customerMap =
        new Map();

    adminBookings.forEach(
        booking => {

            const name =
                getCustomerName(
                    booking
                );

            const mobile =
                getCustomerMobile(
                    booking
                );

            const email =
                getCustomerEmail(
                    booking
                );

            const key =
                mobile !== "—"
                    ? mobile
                    : (
                        String(name)
                            .trim()
                            .toLowerCase() +
                        "|" +
                        String(email)
                            .trim()
                            .toLowerCase()
                    );

            if (
                !customerMap.has(
                    key
                )
            ) {

                customerMap.set(
                    key,
                    {
                        key,
                        name,
                        mobile,
                        email,
                        bookings: [],
                        totalAmount: 0,
                        lastBooking:
                            booking
                    }
                );
            }

            const customer =
                customerMap.get(
                    key
                );

            customer.bookings.push(
                booking
            );

            customer.totalAmount +=
                getBookingAmountNumber(
                    booking
                );

            if (
                timeOf(
                    booking.createdAt
                ) >
                timeOf(
                    customer.lastBooking
                        ?.createdAt
                )
            ) {

                customer.lastBooking =
                    booking;
            }

            if (!customer.email) {

                customer.email =
                    email;
            }
        }
    );

    return Array.from(
        customerMap.values()
    ).sort(
        (a, b) =>
            timeOf(
                b.lastBooking
                    ?.createdAt
            ) -
            timeOf(
                a.lastBooking
                    ?.createdAt
            )
    );
}


// ============================================================
// CUSTOMER CONTAINER
// ============================================================

function getCustomerContainer() {

    let container =
        document.getElementById(
            "customerListContainer"
        );

    if (container) {
        return container;
    }

    const page =
        document.getElementById(
            "page-customers"
        );

    if (!page) {
        return null;
    }

    container =
        page.querySelector(
            "#customersList"
        );

    if (container) {
        return container;
    }

    container =
        page.querySelector(
            ".customer-list"
        );

    if (container) {
        return container;
    }

    let card =
        page.querySelector(
            ".table-card"
        );

    if (!card) {

        card =
            document.createElement(
                "div"
            );

        card.className =
            "table-card";

        card.style.cssText = `
            width:100%;
            box-sizing:border-box;
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:18px;
            padding:20px;
            margin-top:20px;
        `;

        page.appendChild(
            card
        );
    }

    container =
        document.createElement(
            "div"
        );

    container.id =
        "customerListContainer";

    card.innerHTML = "";

    card.appendChild(
        container
    );

    return container;
}


// ============================================================
// CUSTOMER CARD
// ============================================================

function createCustomerCard(
    customer
) {

    const lastBooking =
        customer.lastBooking ||
        {};

    const types =
        [
            ...new Set(
                customer.bookings.map(
                    booking =>
                        getBookingType(
                            booking
                        ).text
                )
            )
        ];

    const initials =
        String(
            customer.name ||
            "C"
        )
            .trim()
            .charAt(0)
            .toUpperCase();

    return `
        <div
            class="customer-admin-card"
            style="
                width:100%;
                box-sizing:border-box;
                background:#fff;
                border:1px solid #e5e7eb;
                border-radius:18px;
                padding:20px;
                box-shadow:0 2px 8px rgba(15,23,42,.04);
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:20px;
                    flex-wrap:wrap;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:15px;
                    "
                >

                    <div
                        style="
                            width:55px;
                            height:55px;
                            border-radius:50%;
                            background:#fff7ed;
                            color:#f97316;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:22px;
                            font-weight:900;
                            flex-shrink:0;
                        "
                    >
                        ${escapeHTML(
                            initials
                        )}
                    </div>

                    <div>

                        <h3
                            style="
                                margin:0 0 6px;
                                color:#172554;
                                font-size:20px;
                            "
                        >
                            ${escapeHTML(
                                customer.name
                            )}
                        </h3>

                        <div
                            style="
                                color:#475569;
                                font-size:14px;
                            "
                        >
                            📱
                            ${escapeHTML(
                                customer.mobile
                            )}
                        </div>

                        ${
                            customer.email
                                ? `
                                    <div
                                        style="
                                            color:#64748b;
                                            font-size:13px;
                                        "
                                    >
                                        ✉️
                                        ${escapeHTML(
                                            customer.email
                                        )}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </div>

                <div
                    style="text-align:right;"
                >

                    <div
                        style="
                            color:#f97316;
                            font-size:25px;
                            font-weight:900;
                        "
                    >
                        ₹${customer.totalAmount.toLocaleString(
                            "en-IN"
                        )}
                    </div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        Total Booking Amount
                    </div>

                </div>

            </div>

            <div
                style="
                    margin-top:18px;
                    padding-top:16px;
                    border-top:1px solid #e5e7eb;
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(170px,1fr));
                    gap:14px;
                "
            >

                <div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        Total Bookings
                    </div>

                    <strong
                        style="
                            color:#172554;
                            font-size:18px;
                        "
                    >
                        ${customer.bookings.length}
                    </strong>

                </div>

                <div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        Booking Type
                    </div>

                    <strong
                        style="
                            color:#172554;
                            font-size:15px;
                        "
                    >
                        ${
                            types
                                .map(
                                    type =>
                                        type ===
                                        "Travel"
                                            ? "✈️ Travel"
                                            : type ===
                                              "Ticket"
                                                ? "🎫 Ticket"
                                                : "🛠️ Service"
                                )
                                .join(
                                    " • "
                                )
                        }
                    </strong>

                </div>

                <div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        Last Booking
                    </div>

                    <strong
                        style="
                            color:#172554;
                        "
                    >
                        ${escapeHTML(
                            getBookingTitle(
                                lastBooking
                            )
                        )}
                    </strong>

                </div>

                <div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        Last Booking Date
                    </div>

                    <strong
                        style="
                            color:#172554;
                        "
                    >
                        ${formatDate(
                            lastBooking.createdAt
                        )}
                    </strong>

                </div>

            </div>

        </div>
    `;
}


// ============================================================
// RENDER CUSTOMERS
// ============================================================

function renderCustomers() {

    const container =
        getCustomerContainer();

    if (!container) {
        return;
    }

    const customers =
        buildCustomers();

    if (!customers.length) {

        container.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:60px 30px;
                "
            >

                <div
                    style="font-size:55px;"
                >
                    👥
                </div>

                <h3
                    style="color:#172554;"
                >
                    अभी Customer data उपलब्ध नहीं है
                </h3>

                <p
                    style="color:#64748b;"
                >
                    Booking आने के बाद customer यहाँ अपने-आप दिखाई देंगे।
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = `

        <div
            style="
                width:100%;
                margin-bottom:18px;
                padding:16px 18px;
                border-radius:14px;
                background:#fff7ed;
                border:1px solid #fed7aa;
                color:#9a3412;
                box-sizing:border-box;
            "
        >
            <strong>
                👥 Total Customers:
                ${customers.length}
            </strong>
        </div>

        <div
            style="
                display:flex;
                flex-direction:column;
                gap:16px;
                width:100%;
            "
        >
            ${
                customers
                    .map(
                        createCustomerCard
                    )
                    .join("")
            }
        </div>
    `;
}


// ============================================================
// LOAD BOOKINGS
// ============================================================

async function loadAllBookings() {

    if (!auth.currentUser) {
        return;
    }

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    BOOKINGS_COLLECTION
                )
            );

        adminBookings =
            snap.docs.map(
                item => ({
                    id: item.id,
                    ...item.data()
                })
            );

        adminBookings.sort(
            (a, b) =>
                timeOf(b.createdAt) -
                timeOf(a.createdAt)
        );

        updateDashboardCounts();

        renderAllBookings();

        renderDashboardRecentBookings();

        renderCustomers();

        console.log(
            "AJ SEVA: Bookings Loaded:",
            adminBookings.length
        );

    } catch (error) {

        console.error(
            "BOOKINGS LOAD ERROR:",
            error
        );

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}


// ============================================================
// BOOKING CONTAINER
// ============================================================

function getBookingContainer() {

    let container =
        document.getElementById(
            "bookingListContainer"
        );

    if (container) {
        return container;
    }

    const page =
        document.getElementById(
            "page-bookings"
        );

    if (!page) {
        return null;
    }

    let card =
        page.querySelector(
            ".table-card"
        );

    if (!card) {

        card =
            document.createElement(
                "div"
            );

        card.className =
            "table-card";

        page.appendChild(
            card
        );
    }

    card.innerHTML = "";

    container =
        document.createElement(
            "div"
        );

    container.id =
        "bookingListContainer";

    card.appendChild(
        container
    );

    return container;
}


// ============================================================
// BOOKING CARD
// ============================================================

function createBookingCard(
    booking
) {

    const type =
        getBookingType(
            booking
        );

    return `
        <div
            class="booking-admin-card"
            style="
                width:100%;
                box-sizing:border-box;
                border:1px solid #e5e7eb;
                border-radius:18px;
                padding:20px;
                background:#fff;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:20px;
                    flex-wrap:wrap;
                "
            >

                <div>

                    <span
                        style="
                            display:inline-flex;
                            background:#fff7ed;
                            color:#f97316;
                            border-radius:20px;
                            padding:7px 13px;
                            font-weight:800;
                        "
                    >
                        ${type.icon}
                        ${type.text}
                    </span>

                    <h3
                        style="
                            margin:12px 0 5px;
                            color:#172554;
                        "
                    >
                        ${escapeHTML(
                            getBookingTitle(
                                booking
                            )
                        )}
                    </h3>

                    <div
                        style="
                            color:#64748b;
                            font-size:14px;
                        "
                    >
                        Booking ID:
                        ${escapeHTML(
                            booking.id
                        )}
                    </div>

                </div>

                <div
                    style="text-align:right;"
                >

                    <div
                        style="
                            color:#f97316;
                            font-size:25px;
                            font-weight:900;
                        "
                    >
                        ${getBookingAmount(
                            booking
                        )}
                    </div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        ${formatDate(
                            booking.createdAt
                        )}
                    </div>

                </div>

            </div>

            <div
                style="
                    border-top:1px solid #e5e7eb;
                    margin-top:18px;
                    padding-top:16px;
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(180px,1fr));
                    gap:12px;
                "
            >

                <div>
                    <strong>नाम:</strong>
                    ${escapeHTML(
                        getCustomerName(
                            booking
                        )
                    )}
                </div>

                <div>
                    <strong>मोबाइल:</strong>
                    ${escapeHTML(
                        getCustomerMobile(
                            booking
                        )
                    )}
                </div>

                <div>
                    <strong>Payment:</strong>
                    ${escapeHTML(
                        getPaymentStatus(
                            booking
                        )
                    )}
                </div>

                <div>
                    <strong>Booking Status:</strong>
                    ${escapeHTML(
                        getBookingStatus(
                            booking
                        )
                    )}
                </div>

            </div>

            <div
                style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:10px;
                    margin-top:18px;
                "
            >

                <button
                    type="button"
                    onclick="updateBookingStatus('${escapeHTML(booking.id)}','confirmed')"
                >
                    ✓ Confirm
                </button>

                <button
                    type="button"
                    onclick="updateBookingStatus('${escapeHTML(booking.id)}','completed')"
                >
                    ✓ Complete
                </button>

                <button
                    type="button"
                    onclick="updateBookingStatus('${escapeHTML(booking.id)}','cancelled')"
                >
                    ✕ Cancel
                </button>

                <button
                    type="button"
                    onclick="deleteAdminBooking('${escapeHTML(booking.id)}')"
                >
                    🗑️ Delete
                </button>

            </div>

        </div>
    `;
}


// ============================================================
// RENDER BOOKINGS
// ============================================================

function renderAllBookings() {

    const container =
        getBookingContainer();

    if (!container) {
        return;
    }

    const search =
        document.getElementById(
            "bookingSearch"
        )?.value
        ?.trim()
        ?.toLowerCase() ||
        "";

    const filter =
        document.getElementById(
            "bookingStatusFilter"
        )?.value ||
        "all";

    const filtered =
        adminBookings.filter(
            booking => {

                const haystack =
                    [
                        getCustomerName(
                            booking
                        ),
                        getCustomerMobile(
                            booking
                        ),
                        getBookingTitle(
                            booking
                        ),
                        getBookingType(
                            booking
                        ).text
                    ]
                        .join(" ")
                        .toLowerCase();

                const status =
                    getBookingStatus(
                        booking
                    )
                        .toLowerCase();

                return (
                    (
                        !search ||
                        haystack.includes(
                            search
                        )
                    ) &&
                    (
                        filter === "all" ||
                        status ===
                        filter.toLowerCase()
                    )
                );
            }
        );

    if (!filtered.length) {

        container.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:50px;
                "
            >
                📋

                <h3>
                    कोई Booking नहीं मिली
                </h3>

                <p>
                    Customer booking करने के बाद यहाँ दिखाई देगी।
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div
            style="
                display:flex;
                flex-direction:column;
                gap:16px;
                width:100%;
            "
        >
            ${
                filtered
                    .map(
                        createBookingCard
                    )
                    .join("")
            }
        </div>
    `;
}


// ============================================================
// DASHBOARD RECENT BOOKINGS
// ============================================================

function renderDashboardRecentBookings() {

    const container =
        document.getElementById(
            "dashboardRecentBookings"
        );

    if (!container) {
        return;
    }

    if (!adminBookings.length) {

        container.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:45px;
                "
            >
                📋

                <h3>
                    अभी कोई Booking नहीं है
                </h3>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div
            style="
                display:flex;
                flex-direction:column;
                gap:14px;
                width:100%;
            "
        >
            ${
                adminBookings
                    .slice(0, 5)
                    .map(
                        createBookingCard
                    )
                    .join("")
            }
        </div>
    `;
}


// ============================================================
// UPDATE BOOKING STATUS
// ============================================================

async function updateBookingStatus(
    id,
    status
) {

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    try {

        await updateDoc(
            doc(
                db,
                BOOKINGS_COLLECTION,
                id
            ),
            {
                status,
                bookingStatus:
                    status,
                updatedAt:
                    serverTimestamp()
            }
        );

        showAdminToast(
            "✅ Booking status update हो गया।"
        );

        await loadAllBookings();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}

window.updateBookingStatus =
    updateBookingStatus;


// ============================================================
// DELETE BOOKING
// ============================================================

async function deleteAdminBooking(
    id
) {

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    const booking =
        adminBookings.find(
            item =>
                String(item.id) ===
                String(id)
        );

    const name =
        getCustomerName(
            booking || {}
        );

    if (
        !confirm(
            `"${name}" की Booking Delete करनी है?`
        )
    ) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                BOOKINGS_COLLECTION,
                id
            )
        );

        showAdminToast(
            "🗑️ Booking Delete हो गई।"
        );

        await loadAllBookings();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}

window.deleteAdminBooking =
    deleteAdminBooking;


// ============================================================
// BOOKING SEARCH
// ============================================================

document.addEventListener(
    "input",
    event => {

        if (
            event.target?.id ===
            "bookingSearch"
        ) {

            renderAllBookings();
        }

        if (
            event.target?.id ===
            "customerSearch"
        ) {

            const query =
                event.target.value
                    .trim()
                    .toLowerCase();

            const filtered =
                buildCustomers().filter(
                    customer =>
                        [
                            customer.name,
                            customer.mobile,
                            customer.email
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                query
                            )
                );

            const container =
                getCustomerContainer();

            if (!container) {
                return;
            }

            container.innerHTML =
                filtered.length
                    ? `
                        <div
                            style="
                                display:flex;
                                flex-direction:column;
                                gap:16px;
                            "
                        >
                            ${
                                filtered
                                    .map(
                                        createCustomerCard
                                    )
                                    .join("")
                            }
                        </div>
                    `
                    : `
                        <div
                            style="
                                text-align:center;
                                padding:50px;
                            "
                        >
                            🔍

                            <h3>
                                Customer नहीं मिला
                            </h3>
                        </div>
                    `;
        }
    }
);


// ============================================================
// BOOKING FILTER
// ============================================================

document.addEventListener(
    "change",
    event => {

        if (
            event.target?.id ===
            "bookingStatusFilter"
        ) {

            renderAllBookings();
        }
    }
);


// ============================================================
// FORM BINDING
// ============================================================

function bindForms() {

    const bind =
        (
            id,
            eventName,
            handler
        ) => {

            const element =
                document.getElementById(id);

            if (
                !element ||
                element.dataset.ajFormBound ===
                    "1"
            ) {
                return;
            }

            element.dataset.ajFormBound =
                "1";

            element.addEventListener(
                eventName,
                handler
            );
        };

    bind(
        "travelForm",
        "submit",
        saveTravelForm
    );

    bind(
        "serviceForm",
        "submit",
        saveServiceForm
    );

    bind(
        "addTravelBtn",
        "click",
        event => {

            event.preventDefault();

            openTravelForm();
        }
    );

    bind(
        "addServiceBtn",
        "click",
        event => {

            event.preventDefault();

            openServiceForm();
        }
    );

    bind(
        "closeTravelForm",
        "click",
        event => {

            event.preventDefault();

            closeTravelForm();
        }
    );

    bind(
        "closeServiceForm",
        "click",
        event => {

            event.preventDefault();

            closeServiceForm();
        }
    );

    bind(
        "cancelTravel",
        "click",
        event => {

            event.preventDefault();

            closeTravelForm();
        }
    );

    bind(
        "cancelTravelBtn",
        "click",
        event => {

            event.preventDefault();

            closeTravelForm();
        }
    );

    bind(
        "cancelService",
        "click",
        event => {

            event.preventDefault();

            closeServiceForm();
        }
    );
}


// ============================================================
// SETTINGS LOAD
// Supports the IDs in your current admin.html
// ============================================================

async function loadSettings() {

    if (!auth.currentUser) {
        return;
    }

    try {

        const settingsRef =
            doc(
                db,
                SETTINGS_COLLECTION,
                SETTINGS_DOCUMENT
            );

        const snap =
            await getDoc(
                settingsRef
            );

        if (!snap.exists()) {

            console.log(
                "AJ SEVA: settings/general अभी नहीं बना है।"
            );

            return;
        }

        const data =
            snap.data();

        setField(
            "settingBizName",
            data.businessName ||
            data.bizName ||
            "AJ Seva"
        );

        setField(
            "settingBizSubtitle",
            data.businessSubtitle ||
            data.bizSubtitle ||
            "आशीष जन सेवा केंद्र"
        );

        setField(
            "settingMobile",
            data.mobile
        );

        setField(
            "settingWhatsapp",
            data.whatsapp
        );

        setField(
            "settingAddress",
            data.address
        );

        setField(
            "settingGmap",
            data.googleMap
        );

        setField(
            "settingYoutube",
            data.youtube
        );

        setField(
            "settingFacebook",
            data.facebook
        );

        setField(
            "settingWebsite",
            data.website
        );

        setField(
            "settingUpi",
            data.upiId
        );

        const qrInput =
            document.getElementById(
                "settingQr"
            );

        const qr =
            data.paymentQr ||
            "";

        if (qrInput) {
            qrInput.dataset.currentQr =
                qr;
        }

        console.log(
            "AJ SEVA: Settings loaded."
        );

    } catch (error) {

        console.error(
            "SETTINGS LOAD ERROR:",
            error
        );

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );
    }
}


// ============================================================
// SAVE SETTINGS
// ============================================================

async function saveSettings(
    event
) {

    if (event) {
        event.preventDefault();
    }

    if (!auth.currentUser) {

        showAdminLoginScreen();

        return;
    }

    const button =
        document.getElementById(
            "saveSettings"
        ) ||
        document.getElementById(
            "saveSettingsBtn"
        ) ||
        document.querySelector(
            "#page-settings .settings-save button"
        );

    if (button) {

        button.disabled =
            true;

        button.dataset.oldText =
            button.textContent;

        button.textContent =
            "⏳ Saving...";
    }

    try {

        const businessName =
            getField(
                "settingBizName"
            );

        const businessSubtitle =
            getField(
                "settingBizSubtitle"
            );

        const mobile =
            getField(
                "settingMobile"
            );

        const whatsapp =
            getField(
                "settingWhatsapp"
            );

        const address =
            getField(
                "settingAddress"
            );

        const googleMap =
            getField(
                "settingGmap"
            );

        const youtube =
            getField(
                "settingYoutube"
            );

        const facebook =
            getField(
                "settingFacebook"
            );

        const website =
            getField(
                "settingWebsite"
            );

        const upiId =
            getField(
                "settingUpi"
            );

        const qrInput =
            document.getElementById(
                "settingQr"
            );

        const qrFile =
            qrInput?.files?.[0];

        let paymentQr =
            qrInput?.dataset?.currentQr ||
            "";

        if (qrFile) {

            paymentQr =
                await compressImage(
                    qrFile
                );
        }

        await setDoc(
            doc(
                db,
                SETTINGS_COLLECTION,
                SETTINGS_DOCUMENT
            ),
            {
                businessName,
                businessSubtitle,
                mobile,
                whatsapp,
                address,
                googleMap,
                youtube,
                facebook,
                website,
                upiId,
                paymentQr,
                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        if (qrInput) {

            qrInput.dataset.currentQr =
                paymentQr;
        }

        showAdminToast(
            "✅ Settings Firebase में Save हो गईं।"
        );

        await loadSettings();

    } catch (error) {

        console.error(
            "SETTINGS SAVE ERROR:",
            error
        );

        showAdminToast(
            firebaseErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                button.dataset.oldText ||
                "💾 Save Settings";
        }
    }
}


// ============================================================
// SETTINGS BIND
// ============================================================

function bindSettings() {

    const button =
        document.getElementById(
            "saveSettings"
        ) ||
        document.getElementById(
            "saveSettingsBtn"
        ) ||
        document.querySelector(
            "#page-settings .settings-save button"
        );

    if (
        button &&
        button.dataset.ajSettingsBound !==
            "1"
    ) {

        button.dataset.ajSettingsBound =
            "1";

        button.addEventListener(
            "click",
            saveSettings
        );
    }

    const form =
        document.getElementById(
            "settingsForm"
        );

    if (
        form &&
        form.dataset.ajSettingsFormBound !==
            "1"
    ) {

        form.dataset.ajSettingsFormBound =
            "1";

        form.addEventListener(
            "submit",
            saveSettings
        );
    }

    const qrInput =
        document.getElementById(
            "settingQr"
        );

    if (
        qrInput &&
        qrInput.dataset.ajQrBound !==
            "1"
    ) {

        qrInput.dataset.ajQrBound =
            "1";

        qrInput.addEventListener(
            "change",
            async () => {

                const file =
                    qrInput.files?.[0];

                if (!file) {
                    return;
                }

                try {

                    const image =
                        await compressImage(
                            file
                        );

                    console.log(
                        "AJ SEVA: QR preview ready:",
                        Boolean(image)
                    );

                } catch (error) {

                    console.error(
                        "QR PREVIEW ERROR:",
                        error
                    );
                }
            }
        );
    }
}


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.adminLogin =
    adminLogin;

window.adminLogout =
    adminLogout;

window.showAdminPanel =
    showAdminPanel;

window.showAdminLoginScreen =
    showAdminLoginScreen;

window.loadSettings =
    loadSettings;

window.saveSettings =
    saveSettings;

window.openTravelForm =
    openTravelForm;

window.closeTravelForm =
    closeTravelForm;

window.openServiceForm =
    openServiceForm;

window.closeServiceForm =
    closeServiceForm;

window.loadAllBookings =
    loadAllBookings;

window.renderAllBookings =
    renderAllBookings;

window.renderDashboardRecentBookings =
    renderDashboardRecentBookings;

window.updateDashboardCounts =
    updateDashboardCounts;

window.renderCustomers =
    renderCustomers;

window.buildCustomers =
    buildCustomers;


// ============================================================
// DOM READY
// ============================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "AJ SEVA ADMIN AUTH SYSTEM STARTING..."
        );

        console.log(
            "======================================"
        );

        // शुरू में login screen ही दिखाएँ
        lockAdminPage();

        // Login / Logout
        bindAdminLogin();

        // Firebase Authentication state
        setupAdminAuth();

    }
);