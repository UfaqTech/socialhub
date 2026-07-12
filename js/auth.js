/**
 * UfaqTech SocialHub - Authentication & Session Management
 * Handles login, admin verification, route guarding, and logout.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // Detect current page path
    const path = window.location.pathname;
    const isLoginPage = path.includes("index.html") || path === "/" || path.endsWith("/");

    if (isLoginPage) {
        initLoginFlow();
    } else {
        await checkAdminSession();
        initLogoutFlow();
    }
});

/**
 * 1. LOGIN PAGE FLOW
 * Handles form submission and verifies admin authorization before redirection.
 */
function initLoginFlow() {
    const loginForm = document.getElementById("login-form");
    const btnSubmit = document.getElementById("btn-submit");
    const alertBox = document.getElementById("alert-box");
    const alertMessage = document.getElementById("alert-message");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // UI Loading State Trigger
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span>Verifying...</span>`;
        alertBox.classList.add("hidden");

        try {
            // Step A: Authenticate user via Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            // Step B: Check if authenticated user exists in admin_profiles and is_active
            const { data: adminProfile, error: profileError } = await supabase
                .from('admin_profiles')
                .select('id, full_name, role, is_active')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !adminProfile || !adminProfile.is_active) {
                // Instantly sign out unauthorized or deactivated accounts
                await supabase.auth.signOut();
                throw new Error("Access Denied: Your account is not authorized or has been deactivated.");
            }

            // Success: Redirect to Control Center Dashboard
            window.location.href = "dashboard.html";

        } catch (error) {
            // Render error inside the alert notification box
            alertMessage.textContent = error.message || "Invalid credentials or connection error.";
            alertBox.classList.remove("hidden");
            
            // Restore original button state
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<span>Verify & Access Dashboard</span> <i class="fa-solid fa-arrow-right text-xs"></i>`;
        }
    });
}

/**
 * 2. DASHBOARD ROUTE GUARD FLOW
 * Checks session on load. Redirects unauthorized users back to login screen.
 */
async function checkAdminSession() {
    const adminNameDisplay = document.getElementById("admin-name-display");
    const adminRoleDisplay = document.getElementById("admin-role-display");
    const adminAvatarBox = document.getElementById("admin-avatar-box");

    // Fetch active session token data
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // No session found, bounce back to login
        window.location.href = "index.html";
        return;
    }

    try {
        // Query database to ensure admin record is still completely valid and active
        const { data: adminProfile, error: profileError } = await supabase
            .from('admin_profiles')
            .select('full_name, role, is_active')
            .eq('id', session.user.id)
            .single();

        if (profileError || !adminProfile || !adminProfile.is_active) {
            await supabase.auth.signOut();
            window.location.href = "index.html";
            return;
        }

        // DOM Updates: Inject active admin data into Sidebar
        if (adminNameDisplay) adminNameDisplay.textContent = adminProfile.full_name;
        if (adminRoleDisplay) {
            adminRoleDisplay.textContent = adminProfile.role;
            // Super admin highlight logic coloration
            if (adminProfile.role === 'admin') {
                adminRoleDisplay.className = "text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold";
            }
        }
        
        // Setup visual avatar initial letters if icon profile is missing
        if (adminAvatarBox && adminProfile.full_name) {
            const initials = adminProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            adminAvatarBox.innerHTML = `<span class="font-bold text-xs text-blue-400 font-mono">${initials}</span>`;
        }

        // Store active role globally for feature module route locking checks
        window.currentAdminRole = adminProfile.role;

    } catch (err) {
        window.location.href = "index.html";
    }
}

/**
 * 3. LOGOUT FLOW
 * Clears current session tokens and signs out gracefully.
 */
function initLogoutFlow() {
    const btnLogout = document.getElementById("btn-logout");
    if (!btnLogout) return;

    btnLogout.addEventListener("click", async () => {
        const confirmLogout = confirm("Are you sure you want to terminate the active admin session?");
        if (!confirmLogout) return;

        btnLogout.disabled = true;
        btnLogout.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Terminating...</span>`;

        await supabase.auth.signOut();
        window.location.href = "index.html";
    });
}