// ============================================================
// AJ SEVA - TRAVEL FRONTEND
// FIREBASE LIVE TRAVEL PACKAGES
// ============================================================

import {
    db,
    collection,
    onSnapshot
} from "./firebase-config.js";


// ============================================================
// COLLECTION
// ============================================================

const TRAVEL_COLLECTION = "travelPackages";


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// PRICE
// ============================================================

function formatPrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {
        return "संपर्क करें";
    }

    const amount = Number(price);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return "संपर्क करें";
    }

    return "₹" +
        amount.toLocaleString("en-IN");
}


// ============================================================
// FIND TRAVEL GRID
// ============================================================

function getTravelGrid() {

    let grid =
        document.querySelector(
            ".travel-grid"
        );

    if (grid) {
        return grid;
    }

    grid =
        document.getElementById(
            "travelGrid"
        );

    return grid;
}


// ============================================================
// IMAGE
// ============================================================

function createImage(item) {

    const image =
        item.image ||
        item.imageUrl ||
        item.photo ||
        item.photoUrl ||
        "";

    if (!image) {

        return `
            <div
                class="travel-image"
                style="
                    width:100%;
                    height:220px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    flex-direction:column;
                    background:#eef2f7;
                "
            >

                <div
                    style="
                        font-size:55px;
                    "
                >
                    ✈️
                </div>

                <strong>
                    फोटो उपलब्ध नहीं है
                </strong>

            </div>
        `;
    }

    return `
        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(
                item.name ||
                item.title ||
                "Travel Package"
            )}"
            loading="lazy"
            style="
                width:100%;
                height:220px;
                object-fit:cover;
                display:block;
            "
            onerror="
                this.onerror=null;
                this.style.display='none';
            "
        >
    `;
}


// ============================================================
// PACKAGE CARD
// ============================================================

function createPackageCard(item) {

    const name =
        item.name ||
        item.title ||
        item.packageName ||
        "Travel Package";

    const location =
        item.location ||
        item.from ||
        "भारत";

    const description =
        item.description ||
        "Travel package की जानकारी के लिए संपर्क करें।";

    const price =
        formatPrice(
            item.price
        );

    const id =
        item.id || "";


    return `

        <div
            class="travel-card"
            data-firebase-id="${escapeHTML(id)}"
        >

            <!-- IMAGE -->

            <div
                class="travel-image"
                style="
                    overflow:hidden;
                "
            >

                ${createImage(item)}

            </div>


            <!-- CONTENT -->

            <div class="travel-content">

                <div
                    style="
                        color:#f97316;
                        font-size:13px;
                        font-weight:700;
                        margin-bottom:6px;
                    "
                >
                    ✈️ AJ SEVA TOUR & TRAVEL
                </div>


                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(description)}
                </p>


                <div
                    class="travel-meta"
                >

                    <span>
                        📍
                        ${escapeHTML(location)}
                    </span>

                    <span>
                        🚌 यात्रा
                    </span>

                </div>


                <div
                    class="travel-bottom"
                >

                    <div
                        class="travel-price"
                    >
                        ${price}

                        <small>
                            / व्यक्ति
                        </small>
                    </div>


                    <!--
                        IMPORTANT:
                        अब Book Now direct WhatsApp नहीं खोलेगा।
                        यह booking.html पर जाएगा।
                    -->

                    <a
                        href="booking.html?type=travel&package=${encodeURIComponent(name)}&price=${encodeURIComponent(String(item.price ?? item.amount ?? item.pricePerPerson ?? ""))}"
                        class="travel-btn firebase-book-btn"
                        data-name="${escapeHTML(name)}"
                        data-price="${escapeHTML(
                            String(
                                item.price ??
                                item.amount ??
                                item.pricePerPerson ??
                                ""
                            )
                        )}"
                    >
                        Book Now →
                    </a>

                </div>

            </div>

        </div>

    `;
}


// ============================================================
// RENDER FIREBASE PACKAGES
// ============================================================

function renderFirebasePackages(
    packages
) {

    const grid =
        getTravelGrid();

    if (!grid) {

        console.error(
            "AJ SEVA ERROR: .travel-grid नहीं मिला।"
        );

        return;
    }


    // ========================================================
    // ONLY ACTIVE PACKAGES
    // ========================================================

    const activePackages =
        packages.filter(
            item =>
                item.status !==
                "inactive"
        );


    // ========================================================
    // EMPTY
    // ========================================================

    if (
        activePackages.length === 0
    ) {

        grid.innerHTML = `

            <div
                style="
                    width:100%;
                    text-align:center;
                    padding:50px 20px;
                    grid-column:1/-1;
                "
            >

                <div
                    style="
                        font-size:55px;
                    "
                >
                    ✈️
                </div>

                <h3>
                    अभी कोई Travel Package उपलब्ध नहीं है।
                </h3>

                <p>
                    Admin Panel से नया package जोड़ें।
                </p>

            </div>

        `;

        return;
    }


    // ========================================================
    // REMOVE OLD STATIC CARDS
    // INSERT FIREBASE CARDS
    // ========================================================

    grid.innerHTML =
        activePackages
            .map(
                item =>
                    createPackageCard(item)
            )
            .join("");


    // ========================================================
    // BOOK BUTTONS
    // ========================================================
    //
    // Travel Card
    //      ↓
    // booking.html
    //      ↓
    // Travel Application Form
    //      ↓
    // QR / UPI Payment
    //      ↓
    // Payment Success
    //      ↓
    // WhatsApp
    //
    // ========================================================

    document
        .querySelectorAll(
            ".firebase-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const packageName =
                            this.dataset.name ||
                            "Travel Package";


                        const packagePrice =
                            this.dataset.price ||
                            "";


                        const url =
                            "booking.html" +
                            "?type=travel" +
                            "&package=" +
                            encodeURIComponent(
                                packageName
                            ) +
                            "&price=" +
                            encodeURIComponent(
                                packagePrice
                            );


                        console.log(
                            "======================================"
                        );

                        console.log(
                            "AJ SEVA TRAVEL BOOKING"
                        );

                        console.log(
                            "Package:",
                            packageName
                        );

                        console.log(
                            "Price:",
                            packagePrice
                        );

                        console.log(
                            "Opening:",
                            url
                        );

                        console.log(
                            "======================================"
                        );


                        // =================================================
                        // OPEN TRAVEL BOOKING FORM
                        // =================================================

                        window.location.href =
                            url;

                    }
                );

            }
        );


    console.log(
        "Travel Packages Frontend पर दिखाए गए:",
        activePackages.length
    );

}


// ============================================================
// FIREBASE LIVE LISTENER
// ============================================================

function startFirebaseTravel() {

    console.log(
        "AJ SEVA: Firebase Travel LIVE listener शुरू..."
    );


    const grid =
        getTravelGrid();

    if (!grid) {

        console.error(
            "AJ SEVA: .travel-grid नहीं मिला।"
        );

        return;
    }


    // ========================================================
    // LOADING
    // ========================================================

    grid.innerHTML = `

        <div
            style="
                width:100%;
                text-align:center;
                padding:50px 20px;
                grid-column:1/-1;
            "
        >

            <div
                style="
                    font-size:50px;
                "
            >
                ✈️
            </div>

            <h3>
                Travel Packages लोड हो रहे हैं...
            </h3>

        </div>

    `;


    // ========================================================
    // REALTIME FIREBASE
    // ========================================================

    onSnapshot(

        collection(
            db,
            TRAVEL_COLLECTION
        ),

        snapshot => {

            console.log(
                "AJ SEVA: Firebase से Travel update मिला।"
            );


            const packages = [];


            snapshot.forEach(
                document => {

                    packages.push({

                        id:
                            document.id,

                        ...document.data()

                    });

                }
            );


            // =================================================
            // NEWEST FIRST
            // =================================================

            packages.sort(
                (a, b) => {

                    const aTime =
                        a.createdAt?.seconds ||
                        0;

                    const bTime =
                        b.createdAt?.seconds ||
                        0;

                    return bTime - aTime;

                }
            );


            console.log(
                "Firebase Travel Documents:",
                packages.length
            );


            // =================================================
            // FRONTEND UPDATE
            // =================================================

            renderFirebasePackages(
                packages
            );

        },

        error => {

            console.error(
                "AJ SEVA Travel Firebase Error:",
                error
            );


            grid.innerHTML = `

                <div
                    style="
                        width:100%;
                        text-align:center;
                        padding:50px 20px;
                        grid-column:1/-1;
                    "
                >

                    <div
                        style="
                            font-size:50px;
                        "
                    >
                        ⚠️
                    </div>

                    <h3>
                        Travel Packages load नहीं हुए।
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }

    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "======================================"
        );

        console.log(
            "AJ SEVA TRAVEL.JS LOADED"
        );

        console.log(
            "FIREBASE LIVE MODE"
        );

        console.log(
            "TRAVEL BOOKING FLOW ENABLED"
        );

        console.log(
            "======================================"
        );


        startFirebaseTravel();

    }
);