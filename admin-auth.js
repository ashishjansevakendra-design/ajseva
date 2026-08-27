// ============================================================
// AJ SEVA ADMIN AUTHENTICATION
// Firebase Email + Password Login
// ============================================================

import {

    auth,

    onAuthStateChanged,

    signInWithEmailAndPassword,

    signOut

} from "./firebase-config.js";


// ============================================================
// LOGIN PAGE STYLE
// ============================================================

const style = document.createElement("style");

style.textContent = `

/* =========================================================
   AJ SEVA LOGIN SCREEN
========================================================= */

#ajAdminLoginScreen {

    position: fixed;

    inset: 0;

    z-index: 999999;

    background:
        linear-gradient(
            135deg,
            #172554 0%,
            #1e3a8a 50%,
            #2563eb 100%
        );

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 20px;

    box-sizing: border-box;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

}


#ajAdminLoginBox {

    width: 100%;

    max-width: 420px;

    background: #ffffff;

    border-radius: 24px;

    padding: 35px 28px;

    box-sizing: border-box;

    box-shadow:
        0 25px 70px
        rgba(0,0,0,.30);

}


.aj-login-logo {

    width: 75px;

    height: 75px;

    margin: 0 auto 15px;

    border-radius: 50%;

    background: #fff7ed;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 38px;

}


.aj-login-title {

    text-align: center;

    margin: 0;

    color: #172554;

    font-size: 28px;

    font-weight: 900;

}


.aj-login-subtitle {

    text-align: center;

    margin: 8px 0 25px;

    color: #64748b;

    font-size: 14px;

}


.aj-login-label {

    display: block;

    margin-bottom: 7px;

    color: #172554;

    font-size: 14px;

    font-weight: 700;

}


.aj-login-input {

    width: 100%;

    height: 50px;

    padding: 0 14px;

    box-sizing: border-box;

    border: 1px solid #cbd5e1;

    border-radius: 12px;

    outline: none;

    font-size: 15px;

    margin-bottom: 17px;

}


.aj-login-input:focus {

    border-color: #2563eb;

    box-shadow:
        0 0 0 3px
        rgba(37,99,235,.12);

}


#ajAdminLoginButton {

    width: 100%;

    height: 52px;

    border: none;

    border-radius: 12px;

    background: #f97316;

    color: #ffffff;

    font-size: 16px;

    font-weight: 800;

    cursor: pointer;

}


#ajAdminLoginButton:hover {

    background: #ea580c;

}


#ajAdminLoginButton:disabled {

    opacity: .7;

    cursor: not-allowed;

}


#ajLoginError {

    display: none;

    margin-bottom: 15px;

    padding: 11px 13px;

    border-radius: 10px;

    background: #fef2f2;

    border: 1px solid #fecaca;

    color: #b91c1c;

    font-size: 13px;

    line-height: 1.5;

}


.aj-admin-user {

    margin-top: 18px;

    text-align: center;

    color: #64748b;

    font-size: 12px;

}


#ajAdminLogoutButton {

    position: fixed;

    right: 20px;

    bottom: 20px;

    z-index: 99998;

    border: none;

    border-radius: 12px;

    padding: 12px 17px;

    background: #b91c1c;

    color: white;

    font-weight: 800;

    cursor: pointer;

    box-shadow:
        0 5px 20px
        rgba(0,0,0,.20);

}


#ajAdminLogoutButton:hover {

    background: #991b1b;

}


/* ADMIN PANEL HIDDEN UNTIL LOGIN */

body.aj-admin-locked
.admin-page,
body.aj-admin-locked
.admin-sidebar,
body.aj-admin-locked
.admin-header,
body.aj-admin-locked
.admin-main {

    visibility: hidden;

}


@media(max-width:500px) {

    #ajAdminLoginBox {

        padding: 28px 20px;

    }

    .aj-login-title {

        font-size: 24px;

    }

}

`;

document.head.appendChild(style);


// ============================================================
// CREATE LOGIN SCREEN
// ============================================================

function createLoginScreen() {

    if (
        document.getElementById(
            "ajAdminLoginScreen"
        )
    ) {

        return;

    }


    const screen =
        document.createElement("div");

    screen.id =
        "ajAdminLoginScreen";


    screen.innerHTML = `

        <div id="ajAdminLoginBox">

            <div class="aj-login-logo">
                🔐
            </div>

            <h1 class="aj-login-title">
                AJ SEVA ADMIN
            </h1>

            <div class="aj-login-subtitle">
                Admin Panel Login
            </div>


            <form id="ajAdminLoginForm">

                <label
                    class="aj-login-label"
                    for="ajAdminEmail"
                >
                    Admin Email
                </label>

                <input
                    id="ajAdminEmail"
                    class="aj-login-input"
                    type="email"
                    placeholder="admin@example.com"
                    autocomplete="username"
                    required
                >


                <label
                    class="aj-login-label"
                    for="ajAdminPassword"
                >
                    Password
                </label>

                <input
                    id="ajAdminPassword"
                    class="aj-login-input"
                    type="password"
                    placeholder="Password डालें"
                    autocomplete="current-password"
                    required
                >


                <div id="ajLoginError"></div>


                <button
                    id="ajAdminLoginButton"
                    type="submit"
                >
                    🔐 Login करें
                </button>

            </form>


            <div class="aj-admin-user">
                केवल अधिकृत Admin के लिए
            </div>

        </div>

    `;


    document.body.appendChild(
        screen
    );

}


// ============================================================
// CREATE LOGOUT BUTTON
// ============================================================

function createLogoutButton() {

    if (
        document.getElementById(
            "ajAdminLogoutButton"
        )
    ) {

        return;

    }


    const button =
        document.createElement("button");


    button.id =
        "ajAdminLogoutButton";


    button.type =
        "button";


    button.textContent =
        "🚪 Logout";


    button.style.display =
        "none";


    button.addEventListener(
        "click",
        async () => {

            const ok =
                confirm(
                    "क्या आप Admin Panel से Logout करना चाहते हैं?"
                );


            if (!ok) {

                return;

            }


            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

                alert(
                    "Logout में समस्या हुई।"
                );

            }

        }
    );


    document.body.appendChild(
        button
    );

}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    document.body
        .classList
        .add(
            "aj-admin-locked"
        );


    const screen =
        document.getElementById(
            "ajAdminLoginScreen"
        );


    const logout =
        document.getElementById(
            "ajAdminLogoutButton"
        );


    if (screen) {

        screen.style.display =
            "flex";

    }


    if (logout) {

        logout.style.display =
            "none";

    }


    const email =
        document.getElementById(
            "ajAdminEmail"
        );


    if (email) {

        setTimeout(
            () => email.focus(),
            100
        );

    }

}


// ============================================================
// SHOW ADMIN PANEL
// ============================================================

function showAdmin() {

    document.body
        .classList
        .remove(
            "aj-admin-locked"
        );


    const screen =
        document.getElementById(
            "ajAdminLoginScreen"
        );


    const logout =
        document.getElementById(
            "ajAdminLogoutButton"
        );


    if (screen) {

        screen.style.display =
            "none";

    }


    if (logout) {

        logout.style.display =
            "block";

    }

}


// ============================================================
// LOGIN ERROR MESSAGE
// ============================================================

function getLoginError(error) {

    console.error(
        "AJ SEVA LOGIN ERROR:",
        error
    );


    switch (
        error?.code
    ) {

        case "auth/invalid-credential":

            return "Email या Password गलत है।";

        case "auth/invalid-email":

            return "Email सही नहीं है।";

        case "auth/user-not-found":

            return "यह Admin Email Firebase में नहीं मिला।";

        case "auth/wrong-password":

            return "Password गलत है।";

        case "auth/too-many-requests":

            return "बहुत ज्यादा कोशिश हुई है। कुछ देर बाद फिर कोशिश करें।";

        case "auth/network-request-failed":

            return "Internet connection check करें।";

        case "auth/operation-not-allowed":

            return "Firebase Authentication में Email/Password Enable नहीं है।";

        default:

            return (
                error?.message ||
                "Login नहीं हो पाया।"
            );

    }

}


// ============================================================
// LOGIN
// ============================================================

async function loginAdmin(email, password) {

    const button =
        document.getElementById(
            "ajAdminLoginButton"
        );


    const errorBox =
        document.getElementById(
            "ajLoginError"
        );


    if (errorBox) {

        errorBox.style.display =
            "none";

        errorBox.textContent =
            "";

    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "⏳ Login हो रहा है...";

    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        console.log(
            "AJ SEVA ADMIN LOGIN SUCCESS"
        );


    } catch (error) {

        if (errorBox) {

            errorBox.textContent =
                getLoginError(
                    error
                );

            errorBox.style.display =
                "block";

        }

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "🔐 Login करें";

        }

    }

}


// ============================================================
// FORM BINDING
// ============================================================

function bindLoginForm() {

    const form =
        document.getElementById(
            "ajAdminLoginForm"
        );


    if (
        !form ||
        form.dataset.bound === "1"
    ) {

        return;

    }


    form.dataset.bound =
        "1";


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "ajAdminEmail"
                    )
                    ?.value
                    ?.trim() ||
                "";


            const password =
                document
                    .getElementById(
                        "ajAdminPassword"
                    )
                    ?.value ||
                "";


            if (!email) {

                const box =
                    document.getElementById(
                        "ajLoginError"
                    );

                if (box) {

                    box.textContent =
                        "Admin Email डालें।";

                    box.style.display =
                        "block";

                }

                return;

            }


            if (!password) {

                const box =
                    document.getElementById(
                        "ajLoginError"
                    );

                if (box) {

                    box.textContent =
                        "Password डालें।";

                    box.style.display =
                        "block";

                }

                return;

            }


            await loginAdmin(
                email,
                password
            );

        }
    );

}


// ============================================================
// AUTH STATE
// ============================================================

function startAuthWatcher() {

    onAuthStateChanged(
        auth,
        user => {

            if (user) {

                console.log(
                    "AJ SEVA ADMIN LOGGED IN:",
                    user.email
                );


                showAdmin();


            } else {

                console.log(
                    "AJ SEVA ADMIN NOT LOGGED IN"
                );


                showLogin();

            }

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "AJ SEVA ADMIN AUTH STARTING..."
        );


        createLoginScreen();

        createLogoutButton();

        bindLoginForm();

        startAuthWatcher();

    }
);


// ============================================================
// GLOBAL
// ============================================================

window.ajAdminLogout =
    async function () {

        await signOut(auth);

    };
