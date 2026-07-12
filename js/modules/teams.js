/**
 * UfaqTech SocialHub - Admin Team Operations Management Flow
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.teams = async function() {
    const mainContent = document.getElementById("main-content");

    // Guard Clause Framework Verification Rule mapping
    if (window.currentAdminRole !== 'admin') {
        mainContent.innerHTML = `
            <div class="glass-panel rounded-2xl p-8 text-center max-w-xl mx-auto border border-red-500/20 bg-red-500/5">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 text-red-400 text-xl mb-3"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <h3 class="text-base font-bold text-white tech-heading">Security System Access Violation</h3>
                <p class="text-xs text-gray-400 mt-2">Managing structural admin permissions operations require absolute Level-1 [Super Admin] root authentication validation level scopes.</p>
            </div>
        `;
        return;
    }

    mainContent.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="glass-panel rounded-2xl p-6 h-fit border border-slate-800/60">
                <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider tech-heading">Provision Team Node mapping</h3>
                <form id="team-creation-form" class="space-y-4">
                    <div>
                        <label class="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Target Account UUID</label>
                        <input type="text" id="team-uuid" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="Paste Auth Account UUID here">
                    </div>
                    <div>
                        <label class="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Full Name</label>
                        <input type="text" id="team-name" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="M Awais">
                    </div>
                    <div>
                        <label class="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Email Reference Address</label>
                        <input type="email" id="team-email" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500" placeholder="awais@ufaqtech.com">
                    </div>
                    <div>
                        <label class="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">Operation Role Allocation Tier</label>
                        <select id="team-role" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500">
                            <option value="viewer">Viewer (Read Only)</option>
                            <option value="worker">Worker (Standard Moderator)</option>
                            <option value="manager">Manager (High Level Operator)</option>
                            <option value="admin">Admin (Absolute Master Root)</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition shadow-md shadow-blue-600/10">Authorize Target Record mapping</button>
                </form>
            </div>
            
            <div class="lg:col-span-2 glass-panel rounded-2xl border border-slate-800/60 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-800/80 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <th class="p-4">Identity Name</th>
                                <th class="p-4">Role Tier</th>
                                <th class="p-4">Condition Status</th>
                                <th class="p-4 text-right">Node Controls</th>
                            </tr>
                        </thead>
                        <tbody id="teams-table-body" class="text-sm divide-y divide-slate-800/40">
                            <tr><td colspan="4" class="p-8 text-center text-gray-500 text-xs">Querying system directory...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const fetchTeam = async () => {
        const tbody = document.getElementById("teams-table-body");
        try {
            const { data: admins, error } = await supabase.from('admin_profiles').select('*').order('id', { ascending: true });
            if (error) throw error;

            tbody.innerHTML = admins.map(adm => `
                <tr class="hover:bg-slate-900/20 transition">
                    <td class="p-4">
                        <div class="font-medium text-white">${adm.full_name}</div>
                        <div class="text-[11px] font-mono text-gray-400 mt-0.5">${adm.email}</div>
                    </td>
                    <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border border-slate-700 bg-slate-900 text-slate-300">${adm.role}</span></td>
                    <td class="p-4">
                        <span class="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${adm.is_active?'bg-emerald-500/10 border-emerald-500/20 text-emerald-400':'bg-red-500/10 border-red-500/20 text-red-400'}">${adm.is_active?'Active Operational':'Deactivated Gate'}</span>
                    </td>
                    <td class="p-4 text-right space-x-1 whitespace-nowrap">
                        <button data-id="${adm.id}" data-active="${adm.is_active}" data-action="toggle-gate" class="px-2 py-1 text-xs border border-slate-700 hover:border-slate-600 rounded bg-slate-900 text-gray-300 hover:text-white transition">Toggle Status</button>
                        <button data-id="${adm.id}" data-action="purge-node" class="px-2 py-1 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded text-xs border border-red-500/20 transition"><i class="fa-solid fa-user-minus"></i></button>
                    </td>
                </tr>
            `).join('');

            // Bind Actions listeners
            tbody.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    const action = btn.getAttribute('data-action');
                    if (action === 'toggle-gate') {
                        const state = btn.getAttribute('data-active') === 'true';
                        await updateAdminState(id, !state);
                    } else {
                        await deleteAdminNode(id);
                    }
                });
            });

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-400 text-xs">${err.message}</td></tr>`;
        }
    };

    const updateAdminState = async (id, targetState) => {
        try {
            const { error } = await supabase.from('admin_profiles').update({ is_active: targetState }).eq('id', id);
            if (error) throw error;
            fetchTeam();
        } catch (err) { alert(err.message); }
    };

    const deleteAdminNode = async (id) => {
        if (!confirm("Confirm hard purge wipe operations on target administrator entry mapping?")) return;
        try {
            const { error } = await supabase.from('admin_profiles').delete().eq('id', id);
            if (error) throw error;
            fetchTeam();
        } catch (err) { alert(err.message); }
    };

    // Bind insertion creation mapping workflow trigger logic parameters
    document.getElementById("team-creation-form").addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById("team-uuid").value.trim();
        const full_name = document.getElementById("team-name").value.trim();
        const email = document.getElementById("team-email").value.trim();
        const role = document.getElementById("team-role").value;

        try {
            const { error } = await supabase.from('admin_profiles').insert({ id, full_name, email, role, is_active: true });
            if (error) throw error;
            document.getElementById("team-creation-form").reset();
            fetchTeam();
        } catch (err) { alert(`Insertion RLS Violation Execution Error: ${err.message}`); }
    });

    await fetchTeam();
};