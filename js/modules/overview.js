/**
 * UfaqTech SocialHub - Overview Core Analytics Module
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.overview = async function() {
    const mainContent = document.getElementById("main-content");
    
    // Render initial grid template skeleton
    mainContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="overview-stats-grid">
            ${Array(4).fill(0).map(() => `
                <div class="glass-card rounded-2xl p-6 animate-pulse">
                    <div class="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
                    <div class="h-8 bg-slate-800 rounded w-1/2"></div>
                </div>
            `).join('')}
        </div>
        <div class="glass-panel rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white tech-heading mb-4"><i class="fa-solid fa-bolt text-blue-500 mr-2"></i>System Stream Status</h3>
            <p class="text-sm text-gray-400">Welcome to the UfaqTech Security Dashboard. All continuous node pipelines are fully operational.</p>
        </div>
    `;

    try {
        // Run parallel queries to fetch count aggregates
        const [usersCount, totalLinks, pendingLinks, unresolvedReports] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('links').select('*', { count: 'exact', head: true }),
            supabase.from('links').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('reports').select('*', { count: 'exact', head: true }).eq('is_resolved', false)
        ]);

        // Inject factual dynamic metrics back into DOM layout
        document.getElementById("overview-stats-grid").innerHTML = `
            <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div class="text-gray-400 text-xs font-medium uppercase tracking-wider">Total User Base</div>
                <div class="text-3xl font-bold text-white mt-2 tech-heading">${usersCount.count || 0}</div>
                <i class="fa-solid fa-users absolute right-4 bottom-4 text-slate-800 text-4xl pointer-events-none"></i>
            </div>
            <div class="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div class="text-gray-400 text-xs font-medium uppercase tracking-wider">Indexed Hyperlinks</div>
                <div class="text-3xl font-bold text-white mt-2 tech-heading">${totalLinks.count || 0}</div>
                <i class="fa-solid fa-link absolute right-4 bottom-4 text-slate-800 text-4xl pointer-events-none"></i>
            </div>
            <div class="glass-card rounded-2xl p-6 border-l-2 border-amber-500/40 relative overflow-hidden">
                <div class="text-amber-400 text-xs font-medium uppercase tracking-wider">Pending Moderation</div>
                <div class="text-3xl font-bold text-amber-400 mt-2 tech-heading">${pendingLinks.count || 0}</div>
                <i class="fa-solid fa-clock absolute right-4 bottom-4 text-slate-800 text-4xl pointer-events-none"></i>
            </div>
            <div class="glass-card rounded-2xl p-6 border-l-2 border-red-500/40 relative overflow-hidden">
                <div class="text-red-400 text-xs font-medium uppercase tracking-wider">Unresolved Flags</div>
                <div class="text-3xl font-bold text-red-400 mt-2 tech-heading">${unresolvedReports.count || 0}</div>
                <i class="fa-solid fa-circle-exclamation absolute right-4 bottom-4 text-slate-800 text-4xl pointer-events-none"></i>
            </div>
        `;
    } catch (error) {
        console.error("Overview modules error execution:", error);
    }
};