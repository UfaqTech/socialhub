/**
 * UfaqTech SocialHub - Category Manager Core Module (CRUD Engine)
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.categories = async function() {
    const mainContent = document.getElementById("main-content");

    // 1. Toggle Modal Visibility Utility
    const toggleModalVisibility = () => {
        const modal = document.getElementById("category-modal");
        if (!modal) return;
        if (modal.classList.contains("hidden")) {
            modal.classList.remove("hidden");
            setTimeout(() => { modal.classList.remove("opacity-0"); }, 10);
        } else {
            modal.classList.add("opacity-0");
            setTimeout(() => { modal.classList.add("hidden"); }, 200);
        }
    };

    // 2. Open Modal for Creating New Category
    const initCreateMode = () => {
        document.getElementById("modal-title-text").textContent = "Register New Category Matrix";
        document.getElementById("category-id").value = "";
        document.getElementById("category-name").value = "";
        document.getElementById("category-slug").value = "";
        document.getElementById("category-icon").value = "fa-tags"; // default fallback icon
        toggleModalVisibility();
    };

    // 3. Open Modal for Editing Existing Category
    const initEditMode = (category) => {
        document.getElementById("modal-title-text").textContent = "Modify Category Parameters";
        document.getElementById("category-id").value = category.id;
        document.getElementById("category-name").value = category.name || '';
        document.getElementById("category-slug").value = category.slug || '';
        document.getElementById("category-icon").value = category.icon_name || 'fa-tags';
        toggleModalVisibility();
    };

    // 4. Fetch and Render Categories List
    const fetchCategories = async () => {
        const tableBody = document.getElementById("categories-table-body");
        if (!tableBody) return;

        try {
            const { data: categoriesData, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            if (!categoriesData || categoriesData.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="p-8 text-center text-gray-500 text-xs font-medium">
                            No functional classification categories registered inside database cluster.
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = categoriesData.map(cat => {
                // Safe checking for font-awesome format
                const currentIcon = cat.icon_name || 'fa-tags';
                
                return `
                    <tr class="border-b border-slate-800/50 hover:bg-slate-900/20 transition-all duration-150">
                        <td class="p-4 text-xs font-mono text-gray-500">${cat.id}</td>
                        <td class="p-4 flex items-center gap-3">
                            <div class="w-7 h-7 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-xs">
                                <i class="fa-solid ${currentIcon}"></i>
                            </div>
                            <span class="text-xs font-semibold text-white tracking-wide">${cat.name}</span>
                        </td>
                        <td class="p-4 text-xs text-gray-400 font-mono">${cat.slug}</td>
                        <td class="p-4 text-right">
                            <div class="flex gap-1.5 justify-end">
                                <button data-id="${cat.id}" data-action="edit" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white rounded-lg text-[11px] border border-slate-700/60 transition shadow" title="Edit Properties"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button data-id="${cat.id}" data-action="delete" class="px-2 py-1 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg text-[11px] transition" title="Purge Record"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind CRUD Action Buttons Elements
            tableBody.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    const action = btn.getAttribute('data-action');
                    
                    if (action === 'edit') {
                        const targetItem = categoriesData.find(c => c.id == id);
                        if (targetItem) initEditMode(targetItem);
                    } else if (action === 'delete') {
                        await handleDeleteAction(id);
                    }
                });
            });

        } catch (err) {
            tableBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-red-400 text-xs font-mono">${err.message}</td></tr>`;
        }
    };

    // 5. Delete Category Process Pipeline
    const handleDeleteAction = async (id) => {
        if (!confirm("Are you absolutely sure you want to drop this category mapping entry? Links attached to this configuration could break visual status mappings!")) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;

            // Log activity to system ledger
            await supabase.from('audit_logs').insert({ 
                admin_id: user.id, 
                action: 'DELETE_CATEGORY_NODE', 
                target_id: String(id), 
                details: 'Permanently dropped category sorting configuration entity.' 
            });

            fetchCategories();
        } catch (err) {
            alert(`RLS Constraints Violation Block Error: ${err.message}`);
        }
    };

    // 6. Core Layout Template Structure Generator
    const renderLayout = () => {
        mainContent.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-sm font-bold text-white uppercase tracking-wider tech-heading">Category Matrix Registry</h3>
                    <p class="text-[11px] text-gray-400 mt-0.5">Control indexing parameters & classification endpoints mapping hooks</p>
                </div>
                <button id="btn-add-category" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-600/15">
                    <i class="fa-solid fa-plus text-[10px]"></i>
                    <span>Add New Category</span>
                </button>
            </div>

            <div class="glass-panel border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl bg-slate-900/10">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                <th class="p-4 w-20">Matrix ID</th>
                                <th class="p-4">Category Identity Name</th>
                                <th class="p-4">Slug Signature Path</th>
                                <th class="p-4 text-right w-28">Control Act</th>
                            </tr>
                        </thead>
                        <tbody id="categories-table-body" class="divide-y divide-slate-800/30">
                            <tr>
                                <td colspan="4" class="p-8 text-center text-gray-500 text-xs">Initializing database channels...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="category-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-200">
                <div class="glass-panel w-full max-w-sm p-6 rounded-2xl border border-slate-800 bg-[#0e1424] shadow-2xl">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h3 id="modal-title-text" class="text-xs font-bold text-white tech-heading uppercase tracking-wider">Modify Category Parameters</h3>
                        <button id="close-cat-modal-btn" class="text-gray-400 hover:text-white transition text-sm"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <form id="category-mutation-form" class="space-y-4">
                        <input type="hidden" id="category-id">
                        
                        <div>
                            <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Display Name</label>
                            <input type="text" id="category-name" required placeholder="e.g. Technology Development" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none placeholder:text-gray-600">
                        </div>

                        <div>
                            <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Unique Slug Identifier</label>
                            <input type="text" id="category-slug" required placeholder="e.g. tech-development" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono placeholder:text-gray-600">
                        </div>

                        <div>
                            <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">FontAwesome Icon Layout Class</label>
                            <input type="text" id="category-icon" required placeholder="e.g. fa-laptop-code" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono placeholder:text-gray-600">
                        </div>

                        <button type="submit" class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition shadow-md shadow-blue-600/10 mt-2">Commit Target Configurations</button>
                    </form>
                </div>
            </div>
        `;

        // Bind Main Module Structure Event Triggers Hook Logic
        document.getElementById("btn-add-category").addEventListener("click", initCreateMode);
        document.getElementById("close-cat-modal-btn").addEventListener("click", toggleModalVisibility);
        
        // Auto Slug Sync Generation Engine Assist
        document.getElementById("category-name").addEventListener("input", (e) => {
            const idField = document.getElementById("category-id").value;
            // Only auto-generate if we are creating a new category, not editing
            if (!idField) {
                document.getElementById("category-slug").value = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
        });

        // Intercept Form Submit Data Action
        document.getElementById("category-mutation-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("category-id").value;
            
            const payload = {
                name: document.getElementById("category-name").value.trim(),
                slug: document.getElementById("category-slug").value.trim(),
                icon_name: document.getElementById("category-icon").value.trim()
            };

            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (id) {
                    // Execute Database Table Rewrite (Update action)
                    const { error } = await supabase.from('categories').update(payload).eq('id', id);
                    if (error) throw error;
                    
                    await supabase.from('audit_logs').insert({ 
                        admin_id: user.id, 
                        action: 'UPDATE_CATEGORY_PARAMS', 
                        target_id: String(id), 
                        details: `Updated attributes payload configurations parameters for name: ${payload.name}` 
                    });
                } else {
                    // Execute Database Table Append Insertion Row (Create action)
                    const { error } = await supabase.from('categories').insert([payload]);
                    if (error) throw error;

                    await supabase.from('audit_logs').insert({ 
                        admin_id: user.id, 
                        action: 'CREATE_CATEGORY_NODE', 
                        target_id: payload.slug, 
                        details: `Registered completely new structural indexing sorting node context: ${payload.name}` 
                    });
                }

                toggleModalVisibility();
                fetchCategories();
            } catch (err) {
                alert(`Transaction Error Logging Event Request: ${err.message}`);
            }
        });
    };

    // Run lifecycle initial setup execution sequence
    renderLayout();
    await fetchCategories();
};