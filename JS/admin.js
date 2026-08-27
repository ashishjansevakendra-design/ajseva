// ============================================================
// AJ SEVA ADMIN PANEL
// COMPLETE REPLACEMENT VERSION
// TRAVEL + SERVICES + BOOKINGS + CUSTOMERS + SETTINGS
// ============================================================

import {
    db,
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "./firebase-config.js";


// ============================================================
// IMPORTANT:
// setDoc को firebase-config.js से नहीं लिया गया है।
// सीधे Firebase SDK से लिया गया है ताकि Settings document
// नया होने पर भी create हो सके।
// ============================================================

import {
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// COLLECTION NAMES
// ============================================================

const TRAVEL_COLLECTION = "travelPackages";
const SERVICES_COLLECTION = "services";
const BOOKINGS_COLLECTION = "bookings";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOCUMENT = "general";


// ============================================================
// GLOBAL DATA
// ============================================================

let travelPackages = [];
let services = [];
let adminBookings = [];

let currentEditTravelId = null;
let currentEditServiceId = null;


// ============================================================
// TOAST
// ============================================================

function showAdminToast(message, type = "success") {

    const toast =
        document.getElementById("adminToast");

    const msg =
        document.getElementById("toastMessage");

    if (toast && msg) {

        msg.textContent = message;

        toast.style.background =
            type === "error"
                ? "#b91c1c"
                : "#172554";

        toast.classList.add("show");

        clearTimeout(window.ajToastTimer);

        window.ajToastTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 3000);

    } else {

        console.log(
            "AJ SEVA:",
            message
        );

    }

}


// ============================================================
// FIREBASE ERROR
// ============================================================

function firebaseErrorMessage(error) {

    console.error(
        "AJ SEVA FIREBASE ERROR:",
        error
    );

    if (
        error?.code ===
        "permission-denied"
    ) {

        return "Firebase Permission Denied. Firestore Rules check करें।";

    }

    if (
        error?.code ===
        "unavailable"
    ) {

        return "Internet/Firebase connection उपलब्ध नहीं है।";

    }

    if (
        error?.code ===
        "not-found"
    ) {

        return "Firebase document नहीं मिला।";

    }

    return (
        error?.message ||
        "Firebase में समस्या हुई।"
    );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// NUMBER
// ============================================================

function num(value) {

    const n =
        Number(value);

    return Number.isFinite(n)
        ? n
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

    const t =
        new Date(value).getTime();

    return Number.isFinite(t)
        ? t
        : 0;

}


// ============================================================
// DATE
// ============================================================

function formatDate(value) {

    const t =
        timeOf(value);

    if (!t) {

        return "—";

    }

    return new Date(t).toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

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

            reader.onload = e => {

                const image =
                    new Image();

                image.onload = () => {

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

                image.onerror = () => {

                    reject(
                        new Error(
                            "Image load नहीं हुई।"
                        )
                    );

                };

                image.src =
                    e.target.result;

            };

            reader.onerror = () => {

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
            link.dataset.ajBound ===
            "1"
        ) {

            return;

        }

        link.dataset.ajBound =
            "1";


        link.addEventListener(
            "click",
            async e => {

                const target =
                    link.dataset.page;

                if (!target) {

                    return;

                }

                if (
                    link.tagName ===
                    "A"
                ) {

                    e.preventDefault();

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

                    pageTitle.textContent =
                        target
                            .charAt(0)
                            .toUpperCase() +
                        target.slice(1);

                }


                if (
                    target ===
                    "dashboard" ||
                    target ===
                    "bookings" ||
                    target ===
                    "customers"
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
        toggle.dataset.ajBound !==
        "1"
    ) {

        toggle.dataset.ajBound =
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
            travelPackages.length;

    }


    if (serviceCount) {

        serviceCount.textContent =
            services.length;

    }


    if (bookingCount) {

        bookingCount.textContent =
            adminBookings.length;

    }


    if (customerCount) {

        customerCount.textContent =
            buildCustomers().length;

    }

}


// ============================================================
// TRAVEL LOAD
// ============================================================

async function loadTravelPackages() {

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
                d => ({
                    id: d.id,
                    ...d.data()
                })
            );


        travelPackages.sort(
            (a, b) =>
                timeOf(b.createdAt) -
                timeOf(a.createdAt)
        );


        renderTravelPackages();

        updateDashboardCounts();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// TRAVEL FORM OPEN
// ============================================================

function openTravelForm(item = null) {

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

        const title =
            document.getElementById(
                "travelFormTitle"
            );

        if (title) {

            title.textContent =
                "Travel Package Edit करें";

        }


        setField(
            "travelEditId",
            item.id
        );

        setField(
            "travelName",
            item.name
        );

        setField(
            "travelLocation",
            item.location
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

    } else {

        form.reset();

        setField(
            "travelStatus",
            "active"
        );

        setFieldText(
            "travelFormTitle",
            "नया Travel Package"
        );

    }

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

}


// ============================================================
// SAVE TRAVEL
// ============================================================

async function saveTravelForm(e) {

    e.preventDefault();


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
        document.getElementById(
            "travelEditId"
        )?.value ||
        "";


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Saving...";

    }


    try {

        const name =
            getField("travelName");

        const location =
            getField("travelLocation");

        const description =
            getField("travelDescription");

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
                "✅ नया Travel Package Firebase में Save हो गया।"
            );

        }


        closeTravelForm();

        await loadTravelPackages();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(error),
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
// TRAVEL RENDER
// ============================================================

function renderTravelPackages() {

    const list =
        document.getElementById(
            "travelPackagesList"
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
        travelPackages.map(
            item => {

                const image =
                    item.image ||
                    item.imageUrl ||
                    item.photo ||
                    "";


                return `
                    <div class="package-admin-card">

                        <div class="package-admin-image">

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(item.name)}"
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

                        <div class="package-admin-content">

                            <span
                                class="status ${
                                    item.status ===
                                    "inactive"
                                        ? "inactive"
                                        : "active"
                                }"
                            >
                                ${
                                    item.status ===
                                    "inactive"
                                        ? "Inactive"
                                        : "Active"
                                }
                            </span>

                            <h3>
                                ${escapeHTML(
                                    item.name ||
                                    "Travel Package"
                                )}
                            </h3>

                            <p>
                                📍
                                ${escapeHTML(
                                    item.location ||
                                    ""
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    item.description ||
                                    ""
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

                            <div class="card-actions">

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

            }
        ).join("");

}


// ============================================================
// EDIT TRAVEL
// ============================================================

window.editTravel = id => {

    const item =
        travelPackages.find(
            x =>
                String(x.id) ===
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

    const item =
        travelPackages.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if (!item) {

        return;

    }


    if (
        !confirm(
            `"${item.name || "Travel Package"}" को Delete करना चाहते हैं?`
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
            firebaseErrorMessage(error),
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
                d => ({
                    id: d.id,
                    ...d.data()
                })
            );


        services.sort(
            (a, b) =>
                timeOf(b.createdAt) -
                timeOf(a.createdAt)
        );


        renderServices();

        updateDashboardCounts();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// SERVICE FORM
// ============================================================

function openServiceForm(item = null) {

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
            item.serviceName
        );

        setField(
            "servicePrice",
            item.price
        );

        setField(
            "serviceDescription",
            item.description ||
            item.serviceDescription
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

        setField(
            "serviceStatus",
            "active"
        );

        setFieldText(
            "serviceFormTitle",
            "नई Service"
        );

    }

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

}


// ============================================================
// SAVE SERVICE
// ============================================================

async function saveServiceForm(e) {

    e.preventDefault();


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
        document.getElementById(
            "serviceEditId"
        )?.value ||
        "";


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Saving...";

    }


    try {

        const name =
            getField("serviceName");

        const description =
            getField("serviceDescription");

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
                    x =>
                        String(x.id) ===
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
                    SERVICES_COLLECTION,
                    editId
                ),
                {
                    name,
                    price,
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
                "✅ नई Service Firebase में Save हो गई।"
            );

        }


        closeServiceForm();

        await loadServices();

    } catch (error) {

        showAdminToast(
            firebaseErrorMessage(error),
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
        services.map(
            item => {

                const name =
                    item.name ||
                    item.serviceName ||
                    "Service";

                const description =
                    item.description ||
                    item.serviceDescription ||
                    "";

                const image =
                    item.image ||
                    item.imageUrl ||
                    item.photo ||
                    "";


                return `
                    <div class="package-admin-card">

                        <div class="package-admin-image">

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

                        <div class="package-admin-content">

                            <span
                                class="status ${
                                    item.status ===
                                    "inactive"
                                        ? "inactive"
                                        : "active"
                                }"
                            >
                                ${
                                    item.status ===
                                    "inactive"
                                        ? "Inactive"
                                        : "Active"
                                }
                            </span>

                            <h3>
                                ${escapeHTML(name)}
                            </h3>

                            <p>
                                ${escapeHTML(description)}
                            </p>

                            ${
                                num(item.price) > 0
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

                            <div class="card-actions">

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

            }
        ).join("");

}


// ============================================================
// EDIT SERVICE
// ============================================================

window.editService = id => {

    const item =
        services.find(
            x =>
                String(x.id) ===
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

    const item =
        services.find(
            x =>
                String(x.id) ===
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
            firebaseErrorMessage(error),
            "error"
        );

    }

}


window.deleteService =
    deleteService;


// ============================================================
// BOOKING TYPE
// ============================================================

function getBookingType(b) {

    const type =
        String(
            b.bookingType ||
            b.type ||
            ""
        ).toLowerCase();


    if (
        type === "travel" ||
        type === "tour" ||
        b.packageName ||
        b.package ||
        b.travelPackage
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
        b.ticketType ||
        b.ticket
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

function getBookingTitle(b) {

    const type =
        getBookingType(b).text;


    if (type === "Travel") {

        return (
            b.packageName ||
            b.package ||
            b.nameOfPackage ||
            b.travelPackage ||
            b.title ||
            "Travel Package"
        );

    }


    if (type === "Ticket") {

        return (
            b.ticketType ||
            b.ticket ||
            b.ticketName ||
            b.title ||
            "Ticket Booking"
        );

    }


    return (
        b.service ||
        b.serviceName ||
        b.serviceTitle ||
        b.title ||
        "Service Booking"
    );

}


// ============================================================
// CUSTOMER NAME
// ============================================================

function getCustomerName(b) {

    return (
        b.name ||
        b.customerName ||
        b.customer ||
        b.passenger ||
        b.passengerName ||
        "Unknown Customer"
    );

}


// ============================================================
// CUSTOMER MOBILE
// ============================================================

function getCustomerMobile(b) {

    const mobile =
        b.mobile ||
        b.phone ||
        b.phoneNumber ||
        b.contact ||
        "";


    if (!mobile) {

        return "—";

    }


    return String(mobile).trim();

}


// ============================================================
// CUSTOMER EMAIL
// ============================================================

function getCustomerEmail(b) {

    return (
        b.email ||
        b.customerEmail ||
        ""
    );

}


// ============================================================
// BOOKING AMOUNT
// ============================================================

function getBookingAmountNumber(b) {

    return num(
        b.totalAmount ??
        b.amount ??
        b.price ??
        b.paidAmount
    );

}


function getBookingAmount(b) {

    return (
        "₹" +
        getBookingAmountNumber(b)
            .toLocaleString("en-IN")
    );

}


// ============================================================
// PAYMENT STATUS
// ============================================================

function getPaymentStatus(b) {

    return (
        b.paymentStatus ||
        b.payment ||
        "pending"
    );

}


// ============================================================
// BOOKING STATUS
// ============================================================

function getBookingStatus(b) {

    return (
        b.status ||
        b.bookingStatus ||
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

            const mobile =
                getCustomerMobile(
                    booking
                );

            const name =
                getCustomerName(
                    booking
                );


            const key =
                mobile !== "—"
                    ? mobile
                    :
                    (
                        String(name)
                            .trim()
                            .toLowerCase()
                        +
                        "|" +
                        String(
                            getCustomerEmail(
                                booking
                            )
                        )
                            .trim()
                            .toLowerCase()
                    );


            if (
                !customerMap.has(key)
            ) {

                customerMap.set(
                    key,
                    {
                        key,
                        name,
                        mobile,
                        email:
                            getCustomerEmail(
                                booking
                            ),
                        bookings: [],
                        totalAmount: 0,
                        lastBooking:
                            booking
                    }
                );

            }


            const customer =
                customerMap.get(key);


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


            if (
                !customer.email
            ) {

                customer.email =
                    getCustomerEmail(
                        booking
                    );

            }

        }
    );


    return Array.from(
        customerMap.values()
    ).sort(
        (a, b) =>
            timeOf(
                b.lastBooking?.createdAt
            ) -
            timeOf(
                a.lastBooking?.createdAt
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

        page.appendChild(card);

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

function createCustomerCard(customer) {

    const lastBooking =
        customer.lastBooking || {};


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
                        ${escapeHTML(initials)}
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

                <div style="text-align:right;">

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

                    <div style="color:#64748b;font-size:13px;">
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

                    <div style="color:#64748b;font-size:13px;">
                        Booking Type
                    </div>

                    <strong
                        style="
                            color:#172554;
                            font-size:15px;
                        "
                    >
                        ${types
                            .map(
                                type =>
                                    type === "Travel"
                                        ? "✈️ Travel"
                                        :
                                    type === "Ticket"
                                        ? "🎫 Ticket"
                                        :
                                        "🛠️ Service"
                            )
                            .join(" • ")}
                    </strong>

                </div>

                <div>

                    <div style="color:#64748b;font-size:13px;">
                        Last Booking
                    </div>

                    <strong style="color:#172554;">
                        ${escapeHTML(
                            getBookingTitle(
                                lastBooking
                            )
                        )}
                    </strong>

                </div>

                <div>

                    <div style="color:#64748b;font-size:13px;">
                        Last Booking Date
                    </div>

                    <strong style="color:#172554;">
                        ${formatDate(
                            lastBooking.createdAt
                        )}
                    </strong>

                </div>

            </div>

            <div
                style="
                    margin-top:18px;
                    padding-top:15px;
                    border-top:1px solid #f1f5f9;
                "
            >

                <div
                    style="
                        color:#64748b;
                        font-size:13px;
                        margin-bottom:9px;
                    "
                >
                    Recent Bookings
                </div>

                <div
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                    "
                >

                    ${customer.bookings
                        .slice(0,5)
                        .map(
                            booking => {

                                const type =
                                    getBookingType(
                                        booking
                                    );

                                return `
                                    <span
                                        style="
                                            display:inline-flex;
                                            align-items:center;
                                            gap:5px;
                                            padding:7px 10px;
                                            border-radius:20px;
                                            background:#f8fafc;
                                            color:#334155;
                                            font-size:13px;
                                            border:1px solid #e2e8f0;
                                        "
                                    >
                                        ${type.icon}
                                        ${escapeHTML(
                                            getBookingTitle(
                                                booking
                                            )
                                        )}
                                    </span>
                                `;

                            }
                        )
                        .join("")}

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

                <div style="font-size:55px;">
                    👥
                </div>

                <h3 style="color:#172554;">
                    अभी Customer data उपलब्ध नहीं है
                </h3>

                <p style="color:#64748b;">
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
            ${customers
                .map(createCustomerCard)
                .join("")}
        </div>

    `;

}


// ============================================================
// LOAD BOOKINGS
// ============================================================

async function loadAllBookings() {

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
                d => ({
                    id: d.id,
                    ...d.data()
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

    } catch (error) {

        console.error(
            "LOAD BOOKINGS ERROR:",
            error
        );


        showAdminToast(
            firebaseErrorMessage(error),
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

        page.appendChild(card);

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

function createBookingCard(b) {

    const type =
        getBookingType(b);


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
                            getBookingTitle(b)
                        )}
                    </h3>

                    <div
                        style="
                            color:#64748b;
                            font-size:14px;
                        "
                    >
                        Booking ID:
                        ${escapeHTML(b.id)}
                    </div>

                </div>

                <div style="text-align:right;">

                    <div
                        style="
                            color:#f97316;
                            font-size:25px;
                            font-weight:900;
                        "
                    >
                        ${getBookingAmount(b)}
                    </div>

                    <div
                        style="
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        ${formatDate(
                            b.createdAt
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
                        getCustomerName(b)
                    )}
                </div>

                <div>
                    <strong>मोबाइल:</strong>
                    ${escapeHTML(
                        getCustomerMobile(b)
                    )}
                </div>

                <div>
                    <strong>Payment:</strong>
                    ${escapeHTML(
                        getPaymentStatus(b)
                    )}
                </div>

                <div>
                    <strong>Booking Status:</strong>
                    ${escapeHTML(
                        getBookingStatus(b)
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
                    onclick="updateBookingStatus('${escapeHTML(b.id)}','confirmed')"
                >
                    ✓ Confirm
                </button>

                <button
                    type="button"
                    onclick="updateBookingStatus('${escapeHTML(b.id)}','completed')"
                >
                    ✓ Complete
                </button>

                <button
                    type="button"
                    onclick="updateBookingStatus('${escapeHTML(b.id)}','cancelled')"
                >
                    ✕ Cancel
                </button>

                <button
                    type="button"
                    onclick="deleteAdminBooking('${escapeHTML(b.id)}')"
                >
                    🗑️ Delete
                </button>

            </div>

        </div>
    `;

}


// ============================================================
// RENDER ALL BOOKINGS
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


    const list =
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
                    ).toLowerCase();


                return (
                    (
                        !search ||
                        haystack.includes(search)
                    )
                    &&
                    (
                        filter === "all" ||
                        status ===
                        filter.toLowerCase()
                    )
                );

            }
        );


    if (!list.length) {

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
            ${list
                .map(createBookingCard)
                .join("")}
        </div>
    `;

}


// ============================================================
// DASHBOARD BOOKINGS
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
            ${adminBookings
                .slice(0,5)
                .map(createBookingCard)
                .join("")}
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
            firebaseErrorMessage(error),
            "error"
        );

    }

}


window.updateBookingStatus =
    updateBookingStatus;


// ============================================================
// DELETE BOOKING
// ============================================================

async function deleteAdminBooking(id) {

    const booking =
        adminBookings.find(
            x =>
                String(x.id) ===
                String(id)
        );


    if (
        !confirm(
            `"${getCustomerName(
                booking || {}
            )}" की Booking Delete करनी है?`
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
            firebaseErrorMessage(error),
            "error"
        );

    }

}


window.deleteAdminBooking =
    deleteAdminBooking;


// ============================================================
// SEARCH
// ============================================================

document.addEventListener(
    "input",
    e => {

        if (
            e.target?.id ===
            "bookingSearch"
        ) {

            renderAllBookings();

        }


        if (
            e.target?.id ===
            "customerSearch"
        ) {

            const query =
                e.target.value
                    .trim()
                    .toLowerCase();


            const customers =
                buildCustomers();


            const filtered =
                customers.filter(
                    customer =>
                        [
                            customer.name,
                            customer.mobile,
                            customer.email
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(query)
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
                            ${filtered
                                .map(
                                    createCustomerCard
                                )
                                .join("")}
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
    e => {

        if (
            e.target?.id ===
            "bookingStatusFilter"
        ) {

            renderAllBookings();

        }

    }
);


// ============================================================
// COMMON FIELD HELPERS
// ============================================================

function getField(id) {

    return (
        document.getElementById(id)
            ?.value
            ?.trim() ||
        ""
    );

}


function setField(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value ?? "";

    }

}


function setFieldText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value ?? "";

    }

}


// ============================================================
// FORM BINDING
// ============================================================

function bindForms() {

    const bind =
        (
            id,
            event,
            fn
        ) => {

            const element =
                document.getElementById(id);


            if (
                element &&
                element.dataset.ajBound !==
                "1"
            ) {

                element.dataset.ajBound =
                    "1";


                element.addEventListener(
                    event,
                    fn
                );

            }

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
        e => {

            e.preventDefault();

            openTravelForm();

        }
    );


    bind(
        "addServiceBtn",
        "click",
        e => {

            e.preventDefault();

            openServiceForm();

        }
    );


    bind(
        "closeTravelForm",
        "click",
        e => {

            e.preventDefault();

            closeTravelForm();

        }
    );


    bind(
        "closeServiceForm",
        "click",
        e => {

            e.preventDefault();

            closeServiceForm();

        }
    );


    bind(
        "cancelTravel",
        "click",
        e => {

            e.preventDefault();

            closeTravelForm();

        }
    );


    bind(
        "cancelTravelBtn",
        "click",
        e => {

            e.preventDefault();

            closeTravelForm();

        }
    );


    bind(
        "cancelService",
        "click",
        e => {

            e.preventDefault();

            closeServiceForm();

        }
    );

}


// ============================================================
// ============================================================
// SETTINGS
// ============================================================
// ============================================================


// ============================================================
// LOAD SETTINGS
// ============================================================

async function loadSettings() {

    console.log(
        "AJ SEVA: Loading Settings..."
    );


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


        // ----------------------------------------------------
        // DOCUMENT DOES NOT EXIST
        // ----------------------------------------------------

        if (!snap.exists()) {

            console.warn(
                "AJ SEVA: settings/general document नहीं मिला।"
            );


            /*
             * यहाँ ERROR नहीं दिखाया जाएगा।
             * क्योंकि Save करने पर document अपने-आप बन जाएगा।
             */

            return;

        }


        const settingsData =
            snap.data();


        console.log(
            "AJ SEVA SETTINGS:",
            settingsData
        );


        // ----------------------------------------------------
        // LOAD INPUT VALUES
        // ----------------------------------------------------

        setField(
            "mobile",
            settingsData.mobile
        );

        setField(
            "whatsapp",
            settingsData.whatsapp
        );

        setField(
            "address",
            settingsData.address
        );

        setField(
            "googleMap",
            settingsData.googleMap
        );

        setField(
            "youtube",
            settingsData.youtube
        );

        setField(
            "facebook",
            settingsData.facebook
        );

        setField(
            "instagram",
            settingsData.instagram
        );

        setField(
            "twitter",
            settingsData.twitter
        );

        setField(
            "website",
            settingsData.website
        );

        setField(
            "upiId",
            settingsData.upiId
        );


        // ----------------------------------------------------
        // QR
        // ----------------------------------------------------

        const qrInput =
            document.getElementById(
                "paymentQr"
            );


        const qr =
            settingsData.paymentQr ||
            "";


        if (qrInput) {

            qrInput.dataset.currentQr =
                qr;

        }


        const qrPreview =
            document.getElementById(
                "paymentQrPreview"
            );


        if (
            qrPreview &&
            qr
        ) {

            qrPreview.src =
                qr;

            qrPreview.style.display =
                "block";

        }


        console.log(
            "AJ SEVA: Settings successfully loaded."
        );

    } catch (error) {

        console.error(
            "AJ SEVA SETTINGS LOAD ERROR:",
            error
        );


        showAdminToast(
            firebaseErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// SAVE SETTINGS
// ============================================================

async function saveSettings(e) {

    if (e) {

        e.preventDefault();

    }


    console.log(
        "AJ SEVA: SAVE SETTINGS START"
    );


    const button =
        document.getElementById(
            "saveSettings"
        ) ||
        document.getElementById(
            "saveSettingsBtn"
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

        // ----------------------------------------------------
        // GET ALL SETTINGS
        // ----------------------------------------------------

        const mobile =
            getField("mobile");

        const whatsapp =
            getField("whatsapp");

        const address =
            getField("address");

        const googleMap =
            getField("googleMap");

        const youtube =
            getField("youtube");

        const facebook =
            getField("facebook");

        const instagram =
            getField("instagram");

        const twitter =
            getField("twitter");

        const website =
            getField("website");

        const upiId =
            getField("upiId");


        // ----------------------------------------------------
        // QR
        // ----------------------------------------------------

        const qrInput =
            document.getElementById(
                "paymentQr"
            );


        const qrFile =
            qrInput?.files?.[0];


        let paymentQr =
            qrInput?.dataset?.currentQr ||
            "";


        // ----------------------------------------------------
        // NEW QR SELECTED
        // ----------------------------------------------------

        if (qrFile) {

            console.log(
                "AJ SEVA: New QR selected."
            );


            paymentQr =
                await compressImage(
                    qrFile
                );


            if (!paymentQr) {

                throw new Error(
                    "Payment QR image upload नहीं हो पाई।"
                );

            }


            const qrPreview =
                document.getElementById(
                    "paymentQrPreview"
                );


            if (qrPreview) {

                qrPreview.src =
                    paymentQr;

                qrPreview.style.display =
                    "block";

            }

        }


        // ----------------------------------------------------
        // SETTINGS DATA
        // ----------------------------------------------------

        const settingsData = {

            mobile,

            whatsapp,

            address,

            googleMap,

            youtube,

            facebook,

            instagram,

            twitter,

            website,

            upiId,

            paymentQr,

            updatedAt:
                serverTimestamp()

        };


        console.log(
            "AJ SEVA: Saving:",
            settingsData
        );


        // ----------------------------------------------------
        // THIS WILL CREATE OR UPDATE
        // settings/general
        // ----------------------------------------------------

        await setDoc(
            doc(
                db,
                SETTINGS_COLLECTION,
                SETTINGS_DOCUMENT
            ),
            settingsData,
            {
                merge: true
            }
        );


        // ----------------------------------------------------
        // SAVE QR LOCALLY FOR NEXT SAVE
        // ----------------------------------------------------

        if (qrInput) {

            qrInput.dataset.currentQr =
                paymentQr;

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        showAdminToast(
            "✅ Settings Firebase में Save हो गईं।"
        );


        console.log(
            "AJ SEVA: Settings saved successfully."
        );


        // ----------------------------------------------------
        // RELOAD
        // ----------------------------------------------------

        await loadSettings();


    } catch (error) {

        console.error(
            "AJ SEVA SETTINGS SAVE ERROR:",
            error
        );


        showAdminToast(
            firebaseErrorMessage(error),
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
// SETTINGS BINDING
// ============================================================

function bindSettings() {

    console.log(
        "AJ SEVA: Binding Settings..."
    );


    // --------------------------------------------------------
    // SAVE BUTTON
    // --------------------------------------------------------

    const saveButton =
        document.getElementById(
            "saveSettings"
        ) ||
        document.getElementById(
            "saveSettingsBtn"
        );


    if (saveButton) {

        if (
            saveButton.dataset
                .ajSettingsBound !==
            "1"
        ) {

            saveButton.dataset
                .ajSettingsBound =
                "1";


            saveButton.addEventListener(
                "click",
                saveSettings
            );


            console.log(
                "AJ SEVA: Save Settings button connected."
            );

        }

    } else {

        console.warn(
            "AJ SEVA: Save Settings button नहीं मिला।"
        );

    }


    // --------------------------------------------------------
    // SETTINGS FORM
    // --------------------------------------------------------

    const settingsForm =
        document.getElementById(
            "settingsForm"
        );


    if (
        settingsForm &&
        settingsForm.dataset
            .ajSettingsFormBound !==
        "1"
    ) {

        settingsForm.dataset
            .ajSettingsFormBound =
            "1";


        settingsForm.addEventListener(
            "submit",
            saveSettings
        );


        console.log(
            "AJ SEVA: Settings form connected."
        );

    }


    // --------------------------------------------------------
    // QR PREVIEW
    // --------------------------------------------------------

    const qrInput =
        document.getElementById(
            "paymentQr"
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


                    const preview =
                        document.getElementById(
                            "paymentQrPreview"
                        );


                    if (
                        preview &&
                        image
                    ) {

                        preview.src =
                            image;

                        preview.style.display =
                            "block";

                    }

                } catch (error) {

                    console.error(
                        "QR preview error:",
                        error
                    );

                }

            }
        );

    }

}


// ============================================================
// GLOBAL SETTINGS FUNCTIONS
// ============================================================

window.loadSettings =
    loadSettings;

window.saveSettings =
    saveSettings;

window.bindSettings =
    bindSettings;


// ============================================================
// OTHER GLOBAL FUNCTIONS
// ============================================================

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
// ONLY ONE DOM INITIALIZER
// ============================================================

window.addEventListener(
    "DOMContentLoaded",
    async () => {

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

            // --------------------------------------------
            // NAVIGATION
            // --------------------------------------------

            setupNavigation();


            // --------------------------------------------
            // FORMS
            // --------------------------------------------

            bindForms();


            // --------------------------------------------
            // SETTINGS
            // --------------------------------------------

            bindSettings();


            // --------------------------------------------
            // LOAD ALL DATA
            // --------------------------------------------

            await Promise.all([

                loadTravelPackages(),

                loadServices(),

                loadAllBookings(),

                loadSettings()

            ]);


            // --------------------------------------------
            // FINAL REFRESH
            // --------------------------------------------

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


            showAdminToast(
                firebaseErrorMessage(error),
                "error"
            );

        }

    }
);