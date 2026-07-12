/**
 * UfaqTech SocialHub - Security System Audit Logs Dynamic Records Module
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.audit = async function() {
    const mainContent = document.getElementById("main-content");

    mainContent.innerHTML = `
        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800/60">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-800/80 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <th class="p-4">Action Event Tag Trigger</th>
                            <th class="p-4">Target Identity UUID Reference</th>
                            <th class="p-4">Operation Parameters Details</th>
                            <th class="p-4 text-right">Timestamp Matrix</th>
                        </tr>
                    </thead>
                    <tbody id="audit-table-body" class="text-sm divide-y divide-slate-800/40">
                        <tr><td colspan="4" class="p-8 text-center text-gray-500 text-xs">Streaming pipeline historic ledger records nodes...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const fetchLogs = async () => {
        const tbody = document.getElementById("audit-table-body");
        try {
            const { data: logs, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(40);
            if (error) throw error;

            if(!logs || logs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500 text-xs">System compliance verification registry is currently clear. No entries generated yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = logs.map(log => `
                <tr class="hover:bg-slate-900/20 transition font-mono text-xs">
                    <td class="p-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${
                            log.action.includes('DELETE') ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            log.action.includes('TOGGLE') ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }">${log.action}</span>
                    </td>
                    <td class="p-4 text-gray-400">${log.target_id || '---'}</td>
                    <td class="p-4 text-gray-300 font-sans">${log.details || 'No structural breakdown log captured.'}</td>
                    <td class="p-4 text-right text-slate-500 text-[11px]">${new Date(log.created_at).toLocaleString()}</td>
                </tr>
            `).join('');

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-400 text-xs">${err.message}</td></tr>`;
        }
    };

    await fetchLogs();
};