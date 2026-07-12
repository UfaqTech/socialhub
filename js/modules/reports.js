/**
 * UfaqTech SocialHub - Report Management Center Module
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.reports = async function() {
    const mainContent = document.getElementById("main-content");

    mainContent.innerHTML = `
        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800/60">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800/80 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <th class="p-4">Report Reason Details</th>
                            <th class="p-4">Target Reference Link ID</th>
                            <th class="p-4">Status Check</th>
                            <th class="p-4 text-right">Moderator Resolution Action</th>
                        </tr>
                    </thead>
                    <tbody id="reports-table-body" class="text-sm divide-y divide-slate-800/40">
                        <tr><td colspan="4" class="p-8 text-center text-gray-500 text-xs">Polling unresolved report vectors...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const fetchReports = async () => {
        const tbody = document.getElementById("reports-table-body");
        try {
            const { data: reports, error } = await supabase.from('reports').select('*').order('is_resolved', { ascending: true });
            if (error) throw error;

            if(!reports || reports.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500 text-xs">No user feedback flags or platform infractions found.</td></tr>`;
                return;
            }

            tbody.innerHTML = reports.map(rep => `
                <tr class="hover:bg-slate-900/20 transition">
                    <td class="p-4">
                        <div class="font-medium text-white max-w-sm break-words">${rep.reason}</div>
                    </td>
                    <td class="p-4 font-mono text-xs text-blue-400">${rep.link_id}</td>
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${rep.is_resolved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400':'bg-red-500/10 border-red-500/20 text-red-400'}">
                            ${rep.is_resolved ? 'Resolved Clean':'Active Flag Alert'}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        ${!rep.is_resolved ? `<button data-id="${rep.id}" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition shadow-md shadow-blue-600/10">Mark as Resolved</button>` : `<span class="text-xs text-gray-500 italic">No Action Needed</span>`}
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    await resolveReport(id);
                });
            });

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-400 text-xs">${err.message}</td></tr>`;
        }
    };

    const resolveReport = async (id) => {
        try {
            const { error } = await supabase.from('reports').update({ is_resolved: true }).eq('id', id);
            if (error) throw error;
            fetchReports();
        } catch (err) { alert(err.message); }
    };

    await fetchReports();
};