/**
 * UfaqTech SocialHub - User Profiles Security Module
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.users = async function() {
    const mainContent = document.getElementById("main-content");

    mainContent.innerHTML = `
        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800/60">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800/80 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <th class="p-4">Full Identity Name</th>
                            <th class="p-4">Email Metadata</th>
                            <th class="p-4">Platform Tier</th>
                            <th class="p-4">Status Security Checks</th>
                            <th class="p-4 text-right">Restrict Settings</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body" class="text-sm divide-y divide-slate-800/40">
                        <tr><td colspan="5" class="p-8 text-center text-gray-500 text-xs">Parsing network nodes profiles...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const fetchUsers = async () => {
        const tbody = document.getElementById("users-table-body");
        try {
            const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;

            if(!profiles || profiles.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500 text-xs">Zero base user profiles registered inside table records.</td></tr>`;
                return;
            }

            tbody.innerHTML = profiles.map(user => `
                <tr class="hover:bg-slate-900/20 transition">
                    <td class="p-4 font-medium text-white flex items-center gap-3">
                        <div class="w-7 h-7 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-gray-400 uppercase">
                            ${user.full_name ? user.full_name.substring(0,2) : 'U'}
                        </div>
                        <span>${user.full_name || 'Anonymous User'}</span>
                    </td>
                    <td class="p-4 font-mono text-xs text-gray-400">${user.email}</td>
                    <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-semibold border bg-slate-900 border-slate-800 text-slate-400 uppercase tracking-wide">${user.role}</span></td>
                    <td class="p-4 space-x-1">
                        ${user.is_banned ? `<span class="px-1.5 py-0.5 text-[9px] font-bold bg-red-500/10 border border-red-500/20 text-red-400 rounded uppercase">Banned</span>` : ''}
                        ${user.shadow_banned ? `<span class="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded uppercase">Shadow</span>` : ''}
                        ${!user.is_banned && !user.shadow_banned ? `<span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded uppercase">Active Verified</span>` : ''}
                    </td>
                    <td class="p-4 text-right space-x-1 whitespace-nowrap">
                        <button data-id="${user.id}" data-value="${user.is_banned}" data-type="ban" class="px-2.5 py-1 text-xs rounded transition border ${user.is_banned ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-gray-300'}">
                            <i class="fa-solid fa-gavel mr-1"></i>${user.is_banned ? 'Unban' : 'Ban'}
                        </button>
                        <button data-id="${user.id}" data-value="${user.shadow_banned}" data-type="shadow" class="px-2.5 py-1 text-xs rounded transition border ${user.shadow_banned ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-gray-300'}">
                            <i class="fa-solid fa-eye-slash mr-1"></i>Ghost
                        </button>
                    </td>
                </tr>
            `).join('');

            // Bind Event Listeners on dynamic action tags
            tbody.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    const currentValue = btn.getAttribute('data-value') === 'true';
                    const type = btn.getAttribute('data-type');
                    await toggleRestriction(id, type, currentValue);
                });
            });

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400 text-xs">${err.message}</td></tr>`;
        }
    };

    const toggleRestriction = async (id, type, currentValue) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const updatePayload = type === 'ban' ? { is_banned: !currentValue } : { shadow_banned: !currentValue };
            
            const { error } = await supabase.from('profiles').update(updatePayload).eq('id', id);
            if (error) throw error;

            await supabase.from('audit_logs').insert({ admin_id: user.id, action: `TOGGLE_USER_${type.toUpperCase()}`, target_id: id, details: `Set parameter flag condition metadata status level validation state to ${!currentValue}.` });
            fetchUsers();
        } catch (err) {
            alert(`RLS Authorization Block Notice: ${err.message}`);
        }
    };

    await fetchUsers();
};