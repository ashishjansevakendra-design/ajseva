// ============================================================
// AJ SEVA - SERVICES FRONTEND
// FIREBASE LIVE SERVICES
// ============================================================

import {
    db,
    collection,
    onSnapshot
} from "./firebase-config.js";


// ============================================================
// COLLECTION
// ============================================================

const SERVICES_COLLECTION = "services";


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
        return "";
    }

    const amount = Number(price);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return "";
    }

    return `
        <strong
            style="
                color:#f97316;
                font-size:20px;
            "
        >
            ₹${amount.toLocaleString("en-IN")}
        </strong>
    `;
}


// ============================================================
// IMAGE
// ============================================================

function createServiceImage(item) {

    const image =
        item.image ||
        item.imageUrl ||
        item.photo ||
        item.photoUrl ||
        "";

    if (!image) {

        return `
            <div
                class="service-icon"
            >
                🛠️
            </div>
        `;
    }

    return `
        <div
            style="
                width:80px;
                height:80px;
                margin:0 auto 15px;
                border-radius:15px;
                overflow:hidden;
            "
        >

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                    item.name ||
                    "Service"
                )}"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    display:block;
                "
                onerror="
                    this.style.display='none';
                "
            >

        </div>
    `;
}


// ============================================================
// SERVICE CARD
// ============================================================

function createServiceCard(item) {

    const name =
        item.name ||
        item.title ||
        item.serviceName ||
        "Service";

    const description =
        item.description ||
        "इस सेवा की जानकारी के लिए संपर्क करें।";

    const price =
        formatPrice(
            item.price
        );


    return `

        <div
            class="service-card"
        >

            ${createServiceImage(item)}


            <h3>
                ${escapeHTML(name)}
            </h3>


            <p>
                ${escapeHTML(description)}
            </p>


            ${
                price
                ?
                `
                <div
                    style="
                        margin:12px 0;
                    "
                >
                    ${price}
                </div>
                `
                :
                ""
            }


            <a
                href="booking.html?service=${encodeURIComponent(name)}"
            >
                Apply Now →
            </a>

        </div>

    `;
}


// ============================================================
// RENDER
// ============================================================

function renderServices(
    services
) {

    const grid =
        document.getElementById(
            "servicesGrid"
        );


    if (!grid) {

        console.error(
            "AJ SEVA: #servicesGrid नहीं मिला।"
        );

        return;
    }


    const activeServices =
        services.filter(
            item =>
                item.status !==
                "inactive"
        );


    if (
        activeServices.length === 0
    ) {

        grid.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:50px 20px;
                "
            >

                <div
                    style="
                        font-size:50px;
                    "
                >
                    🛠️
                </div>

                <h3>
                    अभी कोई Service उपलब्ध नहीं है।
                </h3>

                <p>
                    Admin Panel से Service जोड़ें।
                </p>

            </div>

        `;

        return;
    }


    grid.innerHTML =
        activeServices
            .map(
                service =>
                    createServiceCard(
                        service
                    )
            )
            .join("");


    console.log(
        "AJ SEVA: Frontend Services:",
        activeServices.length
    );
}


// ============================================================
// FIREBASE LIVE LISTENER
// ============================================================

function startServicesListener() {

    console.log(
        "AJ SEVA: Services Firebase LIVE शुरू..."
    );


    const grid =
        document.getElementById(
            "servicesGrid"
        );


    if (!grid) {

        console.error(
            "AJ SEVA: servicesGrid नहीं मिला।"
        );

        return;
    }


    onSnapshot(

        collection(
            db,
            SERVICES_COLLECTION
        ),

        snapshot => {

            const services = [];


            snapshot.forEach(
                document => {

                    services.push({

                        id:
                            document.id,

                        ...document.data()

                    });

                }
            );


            services.sort(
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
                "AJ SEVA: Firebase Services Update:",
                services.length
            );


            renderServices(
                services
            );

        },

        error => {

            console.error(
                "AJ SEVA SERVICES FIREBASE ERROR:",
                error
            );


            grid.innerHTML = `

                <div
                    style="
                        grid-column:1/-1;
                        text-align:center;
                        padding:50px 20px;
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
                        Services load नहीं हुईं।
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

        startServicesListener();

    }
);