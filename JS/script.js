// =========================================================
// AJ SEVA - MAIN JAVASCRIPT
// =========================================================
// HOME + SERVICES + TRAVEL + BOOKING + ABOUT + CONTACT
// MOBILE MENU + BOOKING TRACKING
// =========================================================


(function () {

    "use strict";


    // =====================================================
    // DOM READY
    // =====================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "===================================="
            );

            console.log(
                "AJ SEVA WEBSITE"
            );

            console.log(
                "Main JavaScript Loaded"
            );

            console.log(
                "Booking Tracking Enabled"
            );

            console.log(
                "===================================="
            );


            // -------------------------------------------------
            // MOBILE MENU
            // -------------------------------------------------

            setupMobileMenu();


            // -------------------------------------------------
            // CURRENT YEAR
            // -------------------------------------------------

            setupCurrentYear();


            // -------------------------------------------------
            // BOOKING TRACKING
            // -------------------------------------------------

            setupBookingTracking();


            // -------------------------------------------------
            // LAST BOOKING
            // -------------------------------------------------

            setupLastBookingTracking();

        }
    );



    // =========================================================
    // MOBILE MENU
    // =========================================================

    function setupMobileMenu() {

        const menuBtn =
            document.getElementById(
                "menuBtn"
            );


        const navMenu =
            document.getElementById(
                "navMenu"
            );


        if (
            !menuBtn ||
            !navMenu
        ) {

            return;

        }


        // -----------------------------------------------------
        // OPEN / CLOSE MENU
        // -----------------------------------------------------

        menuBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                navMenu.classList.toggle(
                    "show"
                );

            }
        );


        // -----------------------------------------------------
        // NORMAL NAVIGATION LINKS
        // IMPORTANT:
        // यहाँ किसी link को preventDefault नहीं किया गया है।
        // इसलिए Home / Services / Travel / About / Contact
        // normal तरीके से खुलेंगे।
        // -----------------------------------------------------

        const navLinks =
            navMenu.querySelectorAll(
                "a"
            );


        navLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        navMenu.classList.remove(
                            "show"
                        );

                    }
                );

            }
        );


        // -----------------------------------------------------
        // CLICK OUTSIDE MENU
        // -----------------------------------------------------

        document.addEventListener(
            "click",
            function (event) {

                if (
                    !navMenu.contains(event.target) &&
                    !menuBtn.contains(event.target)
                ) {

                    navMenu.classList.remove(
                        "show"
                    );

                }

            }
        );

    }



    // =========================================================
    // CURRENT YEAR
    // =========================================================

    function setupCurrentYear() {

        const yearElements =
            document.querySelectorAll(
                ".current-year"
            );


        yearElements.forEach(
            function (element) {

                element.textContent =
                    new Date().getFullYear();

            }
        );

    }



    // =========================================================
    // BOOKING TRACKING SETUP
    // =========================================================

    function setupBookingTracking() {

        const navMenu =
            document.getElementById(
                "navMenu"
            );


        if (!navMenu) {

            return;

        }


        // -----------------------------------------------------
        // पहले से Track Booking है तो दोबारा मत बनाओ
        // -----------------------------------------------------

        let trackLink =
            document.getElementById(
                "trackBookingNav"
            );


        // -----------------------------------------------------
        // TRACK BOOKING LINK
        // -----------------------------------------------------

        if (!trackLink) {

            trackLink =
                document.createElement(
                    "a"
                );


            trackLink.id =
                "trackBookingNav";


            trackLink.href =
                "#track-booking";


            trackLink.textContent =
                "🔎 Track Booking";


            trackLink.setAttribute(
                "aria-label",
                "Track Booking"
            );


            trackLink.style.fontWeight =
                "700";


            navMenu.appendChild(
                trackLink
            );

        }


        // -----------------------------------------------------
        // TRACK LINK CLICK
        // -----------------------------------------------------

        if (
            !trackLink.dataset.bound
        ) {

            trackLink.dataset.bound =
                "true";


            trackLink.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    navMenu.classList.remove(
                        "show"
                    );


                    openBookingTracking();

                }
            );

        }


        // -----------------------------------------------------
        // CREATE MODAL
        // -----------------------------------------------------

        createTrackingModal();

    }



    // =========================================================
    // CREATE TRACKING MODAL
    // =========================================================

    function createTrackingModal() {

        if (
            document.getElementById(
                "ajBookingTrackModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "ajBookingTrackModal";


        modal.innerHTML = `

            <div
                class="aj-track-overlay"
                id="ajTrackOverlay"
            >

                <div
                    class="aj-track-box"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ajTrackTitle"
                >

                    <!-- ==================================
                         HEADER
                    ================================== -->

                    <div
                        class="aj-track-header"
                    >

                        <div>

                            <span
                                class="aj-track-brand"
                            >
                                AJ SEVA
                            </span>

                            <h2
                                id="ajTrackTitle"
                            >
                                🔎 Track Booking
                            </h2>

                        </div>


                        <button
                            type="button"
                            id="ajTrackClose"
                            class="aj-track-close"
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <!-- ==================================
                         DESCRIPTION
                    ================================== -->

                    <p
                        class="aj-track-description"
                    >
                        अपनी Booking ID डालकर
                        Booking का वर्तमान Status देखें।
                    </p>


                    <!-- ==================================
                         INPUT
                    ================================== -->

                    <div
                        class="aj-track-input-box"
                    >

                        <label
                            for="ajTrackBookingId"
                        >
                            Booking ID
                        </label>


                        <input
                            type="text"
                            id="ajTrackBookingId"
                            placeholder="जैसे: INM0Zri3qnkQeBgeWEoe"
                            autocomplete="off"
                            spellcheck="false"
                        >

                    </div>


                    <!-- ==================================
                         BUTTON
                    ================================== -->

                    <button
                        type="button"
                        id="ajTrackSearchBtn"
                        class="aj-track-search-btn"
                    >
                        🔎 Check Booking Status
                    </button>


                    <!-- ==================================
                         LOADING
                    ================================== -->

                    <div
                        id="ajTrackLoading"
                        class="aj-track-loading"
                        style="display:none;"
                    >

                        <div>
                            ⏳
                        </div>

                        <p>
                            Booking खोजी जा रही है...
                        </p>

                    </div>


                    <!-- ==================================
                         RESULT
                    ================================== -->

                    <div
                        id="ajTrackResult"
                    ></div>


                    <!-- ==================================
                         FOOTER
                    ================================== -->

                    <div
                        class="aj-track-footer"
                    >

                        <span>
                            Booking ID सही डालें
                        </span>

                        <button
                            type="button"
                            id="ajTrackClearBtn"
                        >
                            Clear
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        addTrackingStyles();


        // -----------------------------------------------------
        // BUTTON EVENTS
        // -----------------------------------------------------

        const closeBtn =
            document.getElementById(
                "ajTrackClose"
            );


        const searchBtn =
            document.getElementById(
                "ajTrackSearchBtn"
            );


        const input =
            document.getElementById(
                "ajTrackBookingId"
            );


        const overlay =
            document.getElementById(
                "ajTrackOverlay"
            );


        const clearBtn =
            document.getElementById(
                "ajTrackClearBtn"
            );


        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                function () {

                    closeBookingTracking();

                }
            );

        }


        if (searchBtn) {

            searchBtn.addEventListener(
                "click",
                function () {

                    searchBooking();

                }
            );

        }


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        searchBooking();

                    }

                }
            );

        }


        if (clearBtn) {

            clearBtn.addEventListener(
                "click",
                function () {

                    if (input) {

                        input.value = "";

                        input.focus();

                    }


                    const result =
                        document.getElementById(
                            "ajTrackResult"
                        );


                    if (result) {

                        result.innerHTML =
                            "";

                    }

                }
            );

        }


        // -----------------------------------------------------
        // CLICK OVERLAY TO CLOSE
        // -----------------------------------------------------

        if (overlay) {

            overlay.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === overlay
                    ) {

                        closeBookingTracking();

                    }

                }
            );

        }

    }



    // =========================================================
    // TRACKING CSS
    // =========================================================

    function addTrackingStyles() {

        if (
            document.getElementById(
                "ajTrackingStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "ajTrackingStyles";


        style.textContent = `

            /* =========================================
               OVERLAY
            ========================================= */

            #ajBookingTrackModal {

                position:fixed;

                inset:0;

                z-index:999999;

                display:none;

            }


            #ajBookingTrackModal.show {

                display:block;

            }


            .aj-track-overlay {

                position:fixed;

                inset:0;

                display:flex;

                align-items:center;

                justify-content:center;

                padding:20px;

                background:
                    rgba(15,23,42,.68);

                backdrop-filter:
                    blur(7px);

            }


            /* =========================================
               BOX
            ========================================= */

            .aj-track-box {

                width:100%;

                max-width:680px;

                max-height:
                    calc(100vh - 40px);

                overflow-y:auto;

                background:#ffffff;

                border-radius:28px;

                padding:32px;

                box-shadow:
                    0 30px 80px
                    rgba(0,0,0,.28);

                box-sizing:border-box;

                animation:
                    ajTrackIn .22s ease;

            }


            @keyframes ajTrackIn {

                from {

                    opacity:0;

                    transform:
                        translateY(20px)
                        scale(.97);

                }

                to {

                    opacity:1;

                    transform:
                        translateY(0)
                        scale(1);

                }

            }


            /* =========================================
               HEADER
            ========================================= */

            .aj-track-header {

                display:flex;

                justify-content:
                    space-between;

                align-items:flex-start;

                gap:15px;

            }


            .aj-track-brand {

                color:#f97316;

                font-size:13px;

                font-weight:900;

                letter-spacing:3px;

            }


            .aj-track-header h2 {

                margin:
                    7px 0 0;

                color:#172554;

                font-size:36px;

                line-height:1.15;

            }


            .aj-track-close {

                width:50px;

                height:50px;

                border:0;

                border-radius:50%;

                background:#f1f5f9;

                color:#172554;

                font-size:34px;

                line-height:1;

                cursor:pointer;

                flex-shrink:0;

            }


            .aj-track-close:hover {

                background:#e2e8f0;

            }


            /* =========================================
               DESCRIPTION
            ========================================= */

            .aj-track-description {

                margin:
                    20px 0 28px;

                color:#64748b;

                font-size:20px;

                line-height:1.5;

            }


            /* =========================================
               INPUT
            ========================================= */

            .aj-track-input-box {

                margin-bottom:18px;

            }


            .aj-track-input-box label {

                display:block;

                margin-bottom:9px;

                color:#172554;

                font-size:18px;

                font-weight:800;

            }


            .aj-track-input-box input {

                width:100%;

                box-sizing:border-box;

                padding:
                    17px 20px;

                border:
                    1px solid #cbd5e1;

                border-radius:15px;

                outline:none;

                font-size:18px;

                color:#172554;

                background:#ffffff;

            }


            .aj-track-input-box input:focus {

                border-color:#f97316;

                box-shadow:
                    0 0 0 4px
                    rgba(249,115,22,.12);

            }


            /* =========================================
               SEARCH BUTTON
            ========================================= */

            .aj-track-search-btn {

                width:100%;

                border:0;

                border-radius:15px;

                padding:
                    17px 20px;

                background:#f97316;

                color:#ffffff;

                font-size:18px;

                font-weight:800;

                cursor:pointer;

            }


            .aj-track-search-btn:hover {

                background:#ea580c;

            }


            .aj-track-search-btn:disabled {

                opacity:.65;

                cursor:not-allowed;

            }


            /* =========================================
               LOADING
            ========================================= */

            .aj-track-loading {

                padding:
                    25px 10px;

                text-align:center;

                color:#64748b;

            }


            .aj-track-loading div {

                font-size:42px;

            }


            .aj-track-loading p {

                margin:8px 0 0;

            }


            /* =========================================
               RESULT CARD
            ========================================= */

            .aj-track-result-card {

                margin-top:22px;

                overflow:hidden;

                border:
                    1px solid #e2e8f0;

                border-radius:18px;

                background:#ffffff;

            }


            .aj-track-result-top {

                display:flex;

                justify-content:
                    space-between;

                align-items:center;

                gap:15px;

                padding:20px;

                background:#f8fafc;

                border-bottom:
                    1px solid #e2e8f0;

            }


            .aj-track-result-title {

                color:#172554;

                font-size:20px;

                font-weight:900;

            }


            .aj-track-status {

                display:inline-flex;

                align-items:center;

                gap:7px;

                padding:
                    9px 13px;

                border-radius:999px;

                font-size:14px;

                font-weight:900;

                white-space:nowrap;

            }


            .aj-track-status.new,
            .aj-track-status.pending {

                background:#fff7ed;

                color:#c2410c;

            }


            .aj-track-status.confirmed {

                background:#eff6ff;

                color:#1d4ed8;

            }


            .aj-track-status.completed {

                background:#f0fdf4;

                color:#15803d;

            }


            .aj-track-status.cancelled {

                background:#fef2f2;

                color:#b91c1c;

            }


            /* =========================================
               DETAILS
            ========================================= */

            .aj-track-details {

                display:grid;

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(180px,1fr)
                    );

                gap:13px;

                padding:20px;

            }


            .aj-track-detail {

                padding:14px;

                border-radius:12px;

                background:#f8fafc;

            }


            .aj-track-detail small {

                display:block;

                margin-bottom:5px;

                color:#64748b;

                font-size:12px;

            }


            .aj-track-detail strong {

                display:block;

                color:#172554;

                font-size:15px;

                word-break:break-word;

            }


            /* =========================================
               NOT FOUND
            ========================================= */

            .aj-track-not-found {

                margin-top:20px;

                padding:25px;

                text-align:center;

                border:
                    1px solid #fecaca;

                border-radius:16px;

                background:#fef2f2;

            }


            .aj-track-not-found-icon {

                font-size:45px;

            }


            .aj-track-not-found h3 {

                margin:
                    8px 0;

                color:#991b1b;

            }


            .aj-track-not-found p {

                margin:0;

                color:#7f1d1d;

                line-height:1.5;

            }


            /* =========================================
               ERROR
            ========================================= */

            .aj-track-error {

                margin-top:20px;

                padding:20px;

                border-radius:15px;

                background:#fff7ed;

                color:#9a3412;

                line-height:1.5;

            }


            /* =========================================
               FOOTER
            ========================================= */

            .aj-track-footer {

                display:flex;

                justify-content:
                    space-between;

                align-items:center;

                gap:10px;

                margin-top:18px;

                color:#94a3b8;

                font-size:12px;

            }


            .aj-track-footer button {

                border:0;

                border-radius:9px;

                padding:
                    8px 13px;

                background:#f1f5f9;

                color:#172554;

                font-weight:800;

                cursor:pointer;

            }


            /* =========================================
               MOBILE
            ========================================= */

            @media(max-width:600px) {

                .aj-track-overlay {

                    padding:10px;

                }


                .aj-track-box {

                    padding:20px;

                    border-radius:20px;

                    max-height:
                        calc(100vh - 20px);

                }


                .aj-track-header h2 {

                    font-size:25px;

                }


                .aj-track-description {

                    font-size:16px;

                }


                .aj-track-result-top {

                    flex-direction:column;

                    align-items:flex-start;

                }


                .aj-track-footer {

                    flex-direction:column;

                    align-items:flex-start;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }



    // =========================================================
    // OPEN TRACKING
    // =========================================================

    function openBookingTracking(
        bookingId = ""
    ) {

        let modal =
            document.getElementById(
                "ajBookingTrackModal"
            );


        if (!modal) {

            createTrackingModal();


            modal =
                document.getElementById(
                    "ajBookingTrackModal"
                );

        }


        if (!modal) {

            return;

        }


        modal.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        const input =
            document.getElementById(
                "ajTrackBookingId"
            );


        if (input) {

            if (bookingId) {

                input.value =
                    bookingId;

            }


            setTimeout(
                function () {

                    input.focus();

                },
                100
            );

        }


        // -----------------------------------------------------
        // अगर Booking ID दी गई है तो सीधे search
        // -----------------------------------------------------

        if (bookingId) {

            setTimeout(
                function () {

                    searchBooking();

                },
                150
            );

        }

    }



    // =========================================================
    // CLOSE TRACKING
    // =========================================================

    function closeBookingTracking() {

        const modal =
            document.getElementById(
                "ajBookingTrackModal"
            );


        if (!modal) {

            return;

        }


        modal.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";

    }



    // =========================================================
    // SEARCH BOOKING
    // =========================================================

    async function searchBooking() {

        const input =
            document.getElementById(
                "ajTrackBookingId"
            );


        const button =
            document.getElementById(
                "ajTrackSearchBtn"
            );


        const loading =
            document.getElementById(
                "ajTrackLoading"
            );


        const result =
            document.getElementById(
                "ajTrackResult"
            );


        if (
            !input ||
            !result
        ) {

            return;

        }


        const bookingId =
            input.value
                .trim();


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!bookingId) {

            result.innerHTML = `

                <div class="aj-track-error">

                    ⚠️ कृपया Booking ID डालें।

                </div>

            `;

            input.focus();

            return;

        }


        // -----------------------------------------------------
        // LOADING
        // -----------------------------------------------------

        result.innerHTML =
            "";


        if (loading) {

            loading.style.display =
                "block";

        }


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "⏳ Checking...";

        }


        try {

            // =================================================
            // FIREBASE DYNAMIC IMPORT
            // इससे normal script.js में import error नहीं आएगा।
            // =================================================

            const firebase =
                await import(
                    "./firebase-config.js"
                );


            const db =
                firebase.db;


            const docFn =
                firebase.doc;


            const getDocFn =
                firebase.getDoc;


            // -------------------------------------------------
            // CHECK FIREBASE FUNCTIONS
            // -------------------------------------------------

            if (
                !db ||
                !docFn ||
                !getDocFn
            ) {

                throw new Error(
                    "Firebase functions उपलब्ध नहीं हैं।"
                );

            }


            // -------------------------------------------------
            // BOOKING DOCUMENT
            // -------------------------------------------------

            const bookingRef =
                docFn(
                    db,
                    "bookings",
                    bookingId
                );


            const snapshot =
                await getDocFn(
                    bookingRef
                );


            // -------------------------------------------------
            // NOT FOUND
            // -------------------------------------------------

            if (
                !snapshot.exists()
            ) {

                result.innerHTML = `

                    <div
                        class="aj-track-not-found"
                    >

                        <div
                            class="aj-track-not-found-icon"
                        >
                            🔍
                        </div>

                        <h3>
                            Booking नहीं मिली
                        </h3>

                        <p>
                            कृपया Booking ID दोबारा
                            check करके डालें।
                        </p>

                        <p
                            style="
                                margin-top:10px;
                                font-weight:700;
                            "
                        >
                            ID:
                            ${escapeTrackingHTML(
                                bookingId
                            )}
                        </p>

                    </div>

                `;

                return;

            }


            // -------------------------------------------------
            // BOOKING DATA
            // -------------------------------------------------

            const booking =
                snapshot.data();


            renderTrackingResult(
                bookingId,
                booking,
                result
            );


            // -------------------------------------------------
            // SAVE LAST BOOKING
            // -------------------------------------------------

            saveBookingId(
                bookingId
            );

        }

        catch (error) {

            console.error(
                "AJ SEVA TRACK BOOKING ERROR:",
                error
            );


            result.innerHTML = `

                <div
                    class="aj-track-error"
                >

                    <strong>
                        ⚠️ Booking status load नहीं हो सका।
                    </strong>

                    <br><br>

                    Firebase connection या
                    Firestore Rules check करें।

                </div>

            `;

        }

        finally {

            if (loading) {

                loading.style.display =
                    "none";

            }


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "🔎 Check Booking Status";

            }

        }

    }



    // =========================================================
    // RENDER BOOKING RESULT
    // =========================================================

    function renderTrackingResult(
        bookingId,
        booking,
        result
    ) {

        const status =
            getBookingStatus(
                booking
            );


        const statusText =
            getStatusText(
                status
            );


        const statusClass =
            getStatusClass(
                status
            );


        const statusIcon =
            getStatusIcon(
                status
            );


        const name =
            getCustomerName(
                booking
            );


        const mobile =
            getCustomerMobile(
                booking
            );


        const title =
            getBookingTitle(
                booking
            );


        const amount =
            getBookingAmount(
                booking
            );


        const payment =
            getPaymentStatus(
                booking
            );


        const date =
            getBookingDate(
                booking
            );


        const bookingType =
            getBookingType(
                booking
            );


        result.innerHTML = `

            <div
                class="aj-track-result-card"
            >

                <div
                    class="aj-track-result-top"
                >

                    <div>

                        <div
                            style="
                                color:#64748b;
                                font-size:12px;
                                margin-bottom:4px;
                            "
                        >
                            BOOKING ID
                        </div>

                        <div
                            class="aj-track-result-title"
                        >
                            ${escapeTrackingHTML(
                                bookingId
                            )}
                        </div>

                    </div>


                    <span
                        class="
                            aj-track-status
                            ${statusClass}
                        "
                    >

                        ${statusIcon}

                        ${escapeTrackingHTML(
                            statusText
                        )}

                    </span>

                </div>


                <div
                    class="aj-track-details"
                >

                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Customer Name
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                name
                            )}
                        </strong>

                    </div>


                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Mobile
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                mobile
                            )}
                        </strong>

                    </div>


                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Booking
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                title
                            )}
                        </strong>

                    </div>


                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Booking Type
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                bookingType
                            )}
                        </strong>

                    </div>


                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Amount
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                amount
                            )}
                        </strong>

                    </div>


                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Payment
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                formatPaymentStatus(
                                    payment
                                )
                            )}
                        </strong>

                    </div>


                    <div
                        class="aj-track-detail"
                    >

                        <small>
                            Booking Date
                        </small>

                        <strong>
                            ${escapeTrackingHTML(
                                date
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        `;

    }



    // =========================================================
    // GET BOOKING STATUS
    // =========================================================

    function getBookingStatus(
        booking
    ) {

        return String(

            booking.status ||

            booking.bookingStatus ||

            booking.booking_status ||

            "new"

        )

        .toLowerCase()

        .trim();

    }



    // =========================================================
    // STATUS TEXT
    // =========================================================

    function getStatusText(
        status
    ) {

        switch (
            status
        ) {

            case "new":

                return "नई Booking";


            case "pending":

                return "Pending";


            case "confirmed":

                return "Confirmed";


            case "completed":

                return "Completed";


            case "cancelled":

                return "Cancelled";


            case "canceled":

                return "Cancelled";


            default:

                return (
                    status
                        .charAt(0)
                        .toUpperCase()
                    +
                    status.slice(1)
                );

        }

    }



    // =========================================================
    // STATUS CLASS
    // =========================================================

    function getStatusClass(
        status
    ) {

        if (
            status === "canceled"
        ) {

            return "cancelled";

        }


        if (
            [
                "new",
                "pending",
                "confirmed",
                "completed",
                "cancelled"
            ].includes(
                status
            )
        ) {

            return status;

        }


        return "pending";

    }



    // =========================================================
    // STATUS ICON
    // =========================================================

    function getStatusIcon(
        status
    ) {

        switch (
            status
        ) {

            case "confirmed":

                return "✅";


            case "completed":

                return "🎉";


            case "cancelled":

            case "canceled":

                return "❌";


            case "pending":

                return "⏳";


            case "new":

                return "📋";


            default:

                return "🔵";

        }

    }



    // =========================================================
    // CUSTOMER NAME
    // =========================================================

    function getCustomerName(
        booking
    ) {

        return (

            booking.name ||

            booking.customerName ||

            booking.customer ||

            booking.passenger ||

            booking.passengerName ||

            "Customer"

        );

    }



    // =========================================================
    // CUSTOMER MOBILE
    // =========================================================

    function getCustomerMobile(
        booking
    ) {

        return (

            booking.mobile ||

            booking.phone ||

            booking.phoneNumber ||

            "—"

        );

    }



    // =========================================================
    // BOOKING TITLE
    // =========================================================

    function getBookingTitle(
        booking
    ) {

        return (

            booking.serviceName ||

            booking.service ||

            booking.travelName ||

            booking.travelPackage ||

            booking.packageName ||

            booking.package ||

            booking.ticketType ||

            booking.title ||

            "Booking"

        );

    }



    // =========================================================
    // BOOKING TYPE
    // =========================================================

    function getBookingType(
        booking
    ) {

        const type =
            String(

                booking.type ||

                booking.bookingType ||

                booking.category ||

                ""

            )
            .toLowerCase();


        if (
            type.includes("travel")
        ) {

            return "Travel";

        }


        if (
            type.includes("ticket")
        ) {

            return "Ticket";

        }


        return "Service";

    }



    // =========================================================
    // AMOUNT
    // =========================================================

    function getBookingAmount(
        booking
    ) {

        const amount =
            Number(

                booking.totalAmount ??

                booking.amount ??

                booking.price ??

                booking.total ??

                0

            );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return "₹0";

        }


        return (
            "₹" +
            amount.toLocaleString(
                "en-IN"
            )
        );

    }



    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    function getPaymentStatus(
        booking
    ) {

        return (

            booking.paymentStatus ||

            booking.payment ||

            "pending"

        );

    }



    // =========================================================
    // PAYMENT TEXT
    // =========================================================

    function formatPaymentStatus(
        status
    ) {

        const value =
            String(
                status || ""
            )
            .toLowerCase();


        if (
            value === "paid" ||
            value === "success" ||
            value === "successful" ||
            value === "user_confirmed"
        ) {

            return "Paid";

        }


        if (
            value === "failed"
        ) {

            return "Failed";

        }


        return "Pending";

    }



    // =========================================================
    // BOOKING DATE
    // =========================================================

    function getBookingDate(
        booking
    ) {

        const value =
            booking.createdAt ||
            booking.date ||
            booking.bookingDate ||
            booking.createdDate;


        if (!value) {

            return "—";

        }


        try {

            // Firebase Timestamp
            if (
                value.seconds
            ) {

                return new Date(
                    value.seconds * 1000
                ).toLocaleString(
                    "en-IN"
                );

            }


            // JavaScript Date
            if (
                value instanceof Date
            ) {

                return value.toLocaleString(
                    "en-IN"
                );

            }


            // String / number
            const date =
                new Date(
                    value
                );


            if (
                !isNaN(
                    date.getTime()
                )
            ) {

                return date.toLocaleString(
                    "en-IN"
                );

            }

        }

        catch (error) {

            console.log(
                "Date format error:",
                error
            );

        }


        return String(
            value
        );

    }



    // =========================================================
    // ESCAPE HTML
    // =========================================================

    function escapeTrackingHTML(
        value
    ) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }


        return String(
            value
        )

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



    // =========================================================
    // SAVE LAST BOOKING ID
    // =========================================================

    function saveBookingId(
        bookingId
    ) {

        if (!bookingId) {

            return;

        }


        try {

            localStorage.setItem(
                "ajLastBookingId",
                String(
                    bookingId
                )
            );

        }

        catch (error) {

            console.log(
                "LocalStorage error:",
                error
            );

        }

    }



    // =========================================================
    // LAST BOOKING TRACKING
    // =========================================================

    function setupLastBookingTracking() {

        try {

            const lastId =
                localStorage.getItem(
                    "ajLastBookingId"
                );


            if (
                lastId
            ) {

                console.log(
                    "AJ SEVA Last Booking ID:",
                    lastId
                );

            }

        }

        catch (error) {

            console.log(
                "Last booking error:",
                error
            );

        }

    }



    // =========================================================
    // PUBLIC FUNCTIONS
    // =========================================================

    window.openBookingTracking =
        openBookingTracking;


    window.closeBookingTracking =
        closeBookingTracking;


    window.searchAJBooking =
        searchBooking;


    window.ajSaveBookingId =
        saveBookingId;



    // =========================================================
    // ESC KEY
    // =========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                const modal =
                    document.getElementById(
                        "ajBookingTrackModal"
                    );


                if (
                    modal &&
                    modal.classList.contains(
                        "show"
                    )
                ) {

                    closeBookingTracking();

                }

            }

        }
    );



    // =========================================================
    // CONSOLE
    // =========================================================

    console.log(
        "AJ SEVA script.js ready."
    );

})();