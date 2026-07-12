/**
 * UfaqTech SocialHub - Link Moderation Core Module (Visual Card Previews, Live Editor, Meta Fetcher & User Profile Inspector)
 */
if (!window.AppModules) window.AppModules = {};

window.AppModules.links = async function() {
    const mainContent = document.getElementById("main-content");
    let currentFilter = 'all';

    // 1. Toggle Link Form Modal Visibility
    const toggleModalVisibility = () => {
        const modal = document.getElementById("edit-link-modal");
        if (!modal) return;
        if (modal.classList.contains("hidden")) {
            modal.classList.remove("hidden");
            setTimeout(() => { modal.classList.remove("opacity-0"); }, 10);
            updateLivePreview();
        } else {
            modal.classList.add("opacity-0");
            setTimeout(() => { modal.classList.add("hidden"); }, 200);
        }
    };

    // 2. Prefill Form Data for Editing
    const initEditorDataPrefill = (link) => {
        document.getElementById("edit-id").value = link.id;
        document.getElementById("edit-image").value = link.image_url || '';
        document.getElementById("edit-title").value = link.title || '';
        document.getElementById("edit-desc").value = link.description || '';
        document.getElementById("edit-url").value = link.url || '';
        document.getElementById("edit-platform").value = link.platform || '';
        document.getElementById("edit-category").value = link.category || '';
        document.getElementById("edit-members").value = link.member_count || 0;
        
        toggleModalVisibility();
    };

    // 3. Dynamic Live Card Preview Renderer Engine
    const updateLivePreview = () => {
        const previewCard = document.getElementById("preview-card-container");
        if (!previewCard) return;

        const title = document.getElementById("edit-title").value.trim() || 'Untitled Group Node';
        const desc = document.getElementById("edit-desc").value.trim() || 'Provide link metadata context descriptions parameters.';
        const url = document.getElementById("edit-url").value.trim() || 'https://ufaqtech.com';
        const img = document.getElementById("edit-image").value.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';
        
        const platformSelect = document.getElementById("edit-platform");
        const platform = platformSelect.options[platformSelect.selectedIndex]?.text || 'Network';
        
        const categorySelect = document.getElementById("edit-category");
        const category = categorySelect.options[categorySelect.selectedIndex]?.text || 'general';
        
        const members = document.getElementById("edit-members").value || '0';

        previewCard.innerHTML = `
            <div class="bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between shadow-2xl transition duration-300 w-full max-w-sm mx-auto">
                <div class="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-900">
                    <img src="${img}" alt="Live Preview Visual" class="w-full h-full object-cover opacity-70" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'">
                    <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[8px] uppercase font-bold border tracking-wider bg-blue-500/10 border-blue-500/20 text-blue-400">LIVE PREVIEW</span>
                    <span class="absolute top-3 right-3 text-[10px] font-mono text-gray-300 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded-lg uppercase tracking-wider font-semibold">
                        ${platform}
                    </span>
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between bg-slate-900/30">
                    <div>
                        <h4 class="font-bold text-white tracking-wide truncate text-sm mb-1">${title}</h4>
                        <p class="text-xs text-gray-400 line-clamp-2 h-8 overflow-hidden mb-3 leading-relaxed">${desc}</p>
                        <div class="mb-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/40 flex items-center gap-2 overflow-hidden">
                            <i class="fa-solid fa-link text-blue-400 text-[10px] flex-shrink-0"></i>
                            <span class="text-[10px] text-blue-400 font-mono truncate flex-1">${url}</span>
                        </div>
                    </div>
                    <div class="border-t border-slate-800/60 pt-3 flex items-center justify-between text-xs text-gray-400">
                        <span class="font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px]">${category}</span>
                        <span class="flex items-center gap-1.5 font-medium text-slate-300">
                            <i class="fa-solid fa-users text-blue-400 text-[10px]"></i> ${members} members
                        </span>
                    </div>
                </div>
            </div>
        `;
    };

    // 4. Populate Dynamic Categories Dropdown Option List
    const loadCategoriesDropdownOptions = async () => {
        const categorySelect = document.getElementById("edit-category");
        if (!categorySelect) return;

        try {
            const { data: categoriesData, error } = await supabase
                .from('categories')
                .select('name, slug')
                .order('name', { ascending: true });

            if (error) throw error;

            if (categoriesData && categoriesData.length > 0) {
                categorySelect.innerHTML = `
                    <option value="" disabled selected>Select Category Matrix</option>
                    ${categoriesData.map(cat => `<option value="${cat.slug}">${cat.name}</option>`).join('')}
                `;
            } else {
                categorySelect.innerHTML = `<option value="" disabled>No categories registered</option>`;
            }
        } catch (err) {
            console.error("Failed to compile category elements:", err);
            categorySelect.innerHTML = `<option value="" disabled>Error loading options</option>`;
        }
    };

    // 5. Dynamic User Profile Inspector Logic Pipeline
    const showUserProfileDetails = async (userId) => {
        const userModal = document.getElementById("user-details-modal");
        const modalBody = document.getElementById("user-modal-body");
        if (!userModal || !modalBody) return;

        // Open modal & invoke loading skeleton animation frame
        userModal.classList.remove("hidden");
        setTimeout(() => { userModal.classList.remove("opacity-0"); }, 10);
        
        modalBody.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 gap-2">
                <i class="fa-solid fa-circle-notch animate-spin text-blue-500 text-base"></i>
                <span class="text-[10px] uppercase font-mono tracking-widest text-gray-500">Querying User Cluster...</span>
            </div>
        `;

        // Check if link has no valid user_id relation mapping
        if (!userId || userId === 'null' || userId === 'undefined' || userId === '') {
            modalBody.innerHTML = `
                <div class="text-center p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                    <div class="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 text-sm">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <p class="text-xs text-gray-300 font-semibold mb-1">System / Administrator Post</p>
                    <p class="text-[10px] text-gray-500 leading-relaxed font-mono">This link asset container was deployed directly via root admin panel bypass hook.</p>
                </div>
            `;
            return;
        }

        try {
            // Fetch public core fields from profiles structure mapping table
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;

            if (profile) {
                modalBody.innerHTML = `
                    <div class="flex flex-col items-center text-center pb-2">
                        <div class="w-14 h-14 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xl mb-2 shadow-lg shadow-blue-600/5">
                            <i class="fa-solid fa-user-astronaut"></i>
                        </div>
                        <h4 class="font-bold text-white text-xs tracking-wide uppercase">${profile.full_name || 'Generic Submitter'}</h4>
                        <span class="text-[10px] font-mono text-gray-500 mt-0.5">@${profile.username || 'unknown-node'}</span>
                    </div>
                    
                    <div class="space-y-2 bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl font-mono text-[10px] tracking-wide">
                        <div class="flex justify-between border-b border-slate-900/60 pb-1.5">
                            <span class="text-gray-500 uppercase">Account UUID</span>
                            <span class="text-gray-300 text-right select-all truncate max-w-[150px]" title="${userId}">${userId}</span>
                        </div>
                        <div class="flex justify-between border-b border-slate-900/60 pb-1.5">
                            <span class="text-gray-500 uppercase">Email Address</span>
                            <span class="text-gray-300 text-right select-all">${profile.email || 'hidden/unavailable'}</span>
                        </div>
                        <div class="flex justify-between items-center pt-0.5">
                            <span class="text-gray-500 uppercase">System Status</span>
                            <span class="px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                                profile.role === 'admin' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                            }">
                                ${profile.role || 'Standard Member'}
                            </span>
                        </div>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <div class="space-y-2 bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl font-mono text-[10px]">
                        <div class="text-center p-1 text-amber-400 font-bold mb-1"><i class="fa-solid fa-circle-exclamation mr-1"></i> Orphan Record Mapping Context</div>
                        <div class="flex justify-between border-b border-slate-900/60 pb-1.5">
                            <span class="text-gray-500">Raw ID:</span>
                            <span class="text-gray-300 break-all select-all">${userId}</span>
                        </div>
                        <p class="text-[9px] text-gray-500 leading-relaxed text-center pt-1">The authorization account exists in master credentials cluster, but profile setup parameters row was flushed or never generated.</p>
                    </div>
                `;
            }
        } catch (err) {
            modalBody.innerHTML = `
                <div class="p-3 bg-red-600/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-[10px]">
                    <p class="font-bold mb-1"><i class="fa-solid fa-bug"></i> Core System Mapping Fault:</p>
                    <p>${err.message}</p>
                </div>
            `;
        }
    };

    // 6. Fetch and Render Main Links Grid Matrix
    const fetchCards = async () => {
        const gridContainer = document.getElementById("links-grid-container");
        if (!gridContainer) return;

        try {
            let query = supabase.from('links').select('*').order('id', { ascending: false });
            if (currentFilter !== 'all') {
                query = query.eq('status', currentFilter);
            }
            
            const { data: linksData, error } = await query;
            if (error) throw error;

            if (!linksData || linksData.length === 0) {
                gridContainer.innerHTML = `<div class="col-span-full p-12 text-center text-gray-500 text-xs">No active links mapping found inside selection matrix.</div>`;
                return;
            }

            gridContainer.innerHTML = linksData.map(link => {
                const previewImg = link.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500';
                
                return `
                    <div class="bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800/80 flex flex-col justify-between group hover:border-slate-700/60 transition-all duration-300 shadow-xl relative">
                        <div class="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center border-b border-slate-900">
                            <img src="${previewImg}" alt="Link Visual Preview" class="w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500">
                            
                            <!-- Left Status Badge -->
                            <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] uppercase font-bold border tracking-wider ${
                                link.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                link.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }">${link.status}</span>
                            
                            <!-- Right Platform Badge -->
                            <span class="absolute top-3 right-3 text-[10px] font-mono text-gray-300 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2 py-0.5 rounded-lg uppercase tracking-wider font-semibold">
                                ${link.platform}
                            </span>

                            <!-- ✅ CLICKABLE USER INSPECTOR BADGE BUTTON (Bottom Right corner inside image container) -->
                            <button data-user-id="${link.user_id || ''}" data-action="view-user" class="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-mono text-gray-300 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 hover:border-blue-500 hover:text-blue-400 rounded-lg transition-all duration-150 flex items-center gap-1 z-10" title="Inspect Submitter Profile Core">
                                <i class="fa-solid fa-user text-[9px]"></i> <span>Profile</span>
                            </button>
                        </div>
                        
                        <div class="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h4 class="font-bold text-white tracking-wide truncate text-sm mb-1">${link.title || 'Untitled Node'}</h4>
                                <p class="text-xs text-gray-400 line-clamp-2 h-8 overflow-hidden mb-2 leading-relaxed">${link.description || 'No description asset record found.'}</p>
                                
                                <div class="mb-4 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 flex items-center gap-2 overflow-hidden">
                                    <i class="fa-solid fa-arrow-up-right-from-square text-blue-400 text-[10px] flex-shrink-0"></i>
                                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-mono truncate transition flex-1">
                                        ${link.url}
                                    </a>
                                </div>
                            </div>
                            
                            <div class="border-t border-slate-800/60 pt-3 flex items-center justify-between text-xs text-gray-400">
                                <span class="font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px]">${link.category}</span>
                                <span class="flex items-center gap-1.5 font-medium text-slate-300">
                                    <i class="fa-solid fa-users text-blue-400 text-[10px]"></i> ${link.member_count || 0} members
                                </span>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-800/40 flex gap-1 justify-end items-center">
                                <button data-id="${link.id}" data-action="edit" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white rounded-lg text-xs border border-slate-700/80 transition shadow"><i class="fa-solid fa-pen-to-square"></i></button>
                                ${link.status !== 'approved' ? `<button data-id="${link.id}" data-action="approve" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs transition shadow-md"><i class="fa-solid fa-check"></i></button>` : ''}
                                ${link.status !== 'rejected' ? `<button data-id="${link.id}" data-action="reject" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs transition shadow-md"><i class="fa-solid fa-ban"></i></button>` : ''}
                                <button data-id="${link.id}" data-action="delete" class="px-2.5 py-1 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg text-xs transition"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Bind grid click interactions (Includes updated Profile Action router)
            gridContainer.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const action = btn.getAttribute('data-action');
                    
                    if (action === 'view-user') {
                        const userId = btn.getAttribute('data-user-id');
                        await showUserProfileDetails(userId);
                    } else {
                        const id = btn.getAttribute('data-id');
                        if (action === 'edit') {
                            const targetedLink = linksData.find(l => l.id == id);
                            if (targetedLink) initEditorDataPrefill(targetedLink);
                        } else {
                            await handleAction(id, action);
                        }
                    }
                });
            });
        } catch (err) {
            gridContainer.innerHTML = `<div class="col-span-full p-12 text-center text-red-400 text-xs font-mono">${err.message}</div>`;
        }
    };

    // 7. Handle State Actions (Approve / Reject / Delete)
    const handleAction = async (id, action) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (action === 'delete') {
                if(!confirm("Are you sure you want to permanently delete this link card?")) return;
                const { error } = await supabase.from('links').delete().eq('id', id);
                if (error) throw error;
                await supabase.from('audit_logs').insert({ admin_id: user.id, action: 'DELETE_LINK_CARD', target_id: id, details: 'Permanently deleted link metadata.' });
            } else {
                const statusValue = action === 'approve' ? 'approved' : 'rejected';
                const { error } = await supabase.from('links').update({ status: statusValue }).eq('id', id);
                if (error) throw error;
                await supabase.from('audit_logs').insert({ admin_id: user.id, action: `MODERATE_LINK_${action.toUpperCase()}`, target_id: id, details: `Updated link verification state to ${statusValue}.` });
            }
            fetchCards();
        } catch (err) {
            alert(`Execution Error: ${err.message}`);
        }
    };

    // 8. Core Layout Renderer (Advanced Split Dashboard Layout + User Modals Layers)
    const renderLayout = () => {
        mainContent.innerHTML = `
            <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div class="flex gap-2 bg-slate-900/60 p-1.5 border border-slate-800/60 rounded-xl">
                    <button id="filter-all" class="px-4 py-1.5 text-xs font-medium rounded-lg transition ${currentFilter==='all'?'bg-blue-600 text-white':'text-gray-400 hover:text-white'}">All</button>
                    <button id="filter-pending" class="px-4 py-1.5 text-xs font-medium rounded-lg transition ${currentFilter==='pending'?'bg-amber-600 text-white':'text-gray-400 hover:text-white'}">Pending</button>
                    <button id="filter-approved" class="px-4 py-1.5 text-xs font-medium rounded-lg transition ${currentFilter==='approved'?'bg-emerald-600 text-white':'text-gray-400 hover:text-white'}">Approved</button>
                    <button id="filter-rejected" class="px-4 py-1.5 text-xs font-medium rounded-lg transition ${currentFilter==='rejected'?'bg-red-600 text-white':'text-gray-400 hover:text-white'}">Rejected</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="links-grid-container">
                <div class="col-span-full p-12 text-center text-gray-500 text-xs">Loading link grids...</div>
            </div>

            <!-- Fully Responsive Ultra-Wide Dual-Column Screen Form Modal -->
            <div id="edit-link-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-200 p-4 overflow-y-auto">
                <div class="glass-panel w-full max-w-4xl p-5 md:p-6 rounded-2xl border border-slate-800 bg-[#0e1424] shadow-2xl my-auto overflow-hidden">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h3 class="text-xs md:text-sm font-bold text-white tech-heading uppercase tracking-wider">
                            <i class="fa-solid fa-sliders text-blue-400 mr-2"></i>Link Modification Hub
                        </h3>
                        <button id="close-modal-btn" class="text-gray-400 hover:text-white transition text-sm"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <form id="edit-link-form" class="lg:col-span-7 space-y-3.5">
                            <input type="hidden" id="edit-id">
                            <div>
                                <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Group / Destination Target Link (URL)</label>
                                <div class="flex gap-2">
                                    <input type="url" id="edit-url" required placeholder="https://chat.whatsapp.com/..." class="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono">
                                    <button type="button" id="btn-fetch-meta" class="px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition flex items-center gap-1 shadow-md shadow-blue-600/20">
                                        <i class="fa-solid fa-wand-magic-sparkles text-[11px]"></i><span>Fetch</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Image Preview Asset URL</label>
                                <input type="text" id="edit-image" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none">
                            </div>
                            <div>
                                <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Link Display Heading Title</label>
                                <input type="text" id="edit-title" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none">
                            </div>
                            <div>
                                <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Description Structural Summary</label>
                                <textarea id="edit-desc" rows="2" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none"></textarea>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Platform Identity</label>
                                    <select id="edit-platform" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none">
                                        <option value="" disabled selected>Select Platform</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Telegram">Telegram</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Discord">Discord</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="Website">Website</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Category Select Mapping</label>
                                    <select id="edit-category" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none">
                                        <option value="" disabled selected>Loading Matrix...</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Member Metrics Enrollment Count</label>
                                <input type="number" id="edit-members" required class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 focus:outline-none">
                            </div>
                            <button type="submit" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-md shadow-emerald-600/10 mt-3">Commit Payload Updates</button>
                        </form>
                        
                        <div class="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 self-stretch min-h-[280px]">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 self-start"><i class="fa-solid fa-eye text-blue-400 mr-1.5"></i>Visualizer Monitoring</span>
                            <div id="preview-card-container" class="w-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ✅ SUBMITTER DYNAMIC CORE INFORMATION MODAL LAYER -->
            <div id="user-details-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-200 p-4">
                <div class="glass-panel w-full max-w-sm p-5 rounded-2xl border border-slate-800/80 bg-[#0e1424] shadow-2xl relative">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-4">
                        <h3 class="text-xs font-bold text-white tech-heading uppercase tracking-wider">
                            <i class="fa-solid fa-fingerprint text-blue-400 mr-1.5"></i>Account Origin Audit
                        </h3>
                        <button id="close-user-modal-btn" class="text-gray-400 hover:text-white transition text-sm"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div id="user-modal-body" class="space-y-4">
                        <!-- User core layout data renders here inside sync loop -->
                    </div>
                </div>
            </div>
        `;
        
        // Setup configuration listeners
        ['all', 'pending', 'approved', 'rejected'].forEach(status => {
            document.getElementById(`filter-${status}`).addEventListener('click', () => {
                currentFilter = status;
                renderLayout();
                fetchCards();
            });
        });

        // Close form modal listener
        document.getElementById("close-modal-btn").addEventListener("click", toggleModalVisibility);

        // ✅ Close User Details Modal Action Listener Hook
        document.getElementById("close-user-modal-btn").addEventListener("click", () => {
            const userModal = document.getElementById("user-details-modal");
            userModal.classList.add("opacity-0");
            setTimeout(() => { userModal.classList.add("hidden"); }, 200);
        });

        loadCategoriesDropdownOptions();

        // Attach layout preview triggers
        ['edit-url', 'edit-image', 'edit-title', 'edit-desc', 'edit-members'].forEach(fieldId => {
            document.getElementById(fieldId).addEventListener('input', updateLivePreview);
        });
        ['edit-platform', 'edit-category'].forEach(selectId => {
            document.getElementById(selectId).addEventListener('change', updateLivePreview);
        });

        // Scraper Action Request Configuration Engine
        document.getElementById("btn-fetch-meta").addEventListener("click", async () => {
            const targetUrl = document.getElementById("edit-url").value.trim();
            if (!targetUrl || !targetUrl.startsWith('http')) {
                alert("Please drop a valid absolute HTTP/HTTPS network link context payload rule inside form element field first.");
                return;
            }

            const fetchBtn = document.getElementById("btn-fetch-meta");
            const originalMarkup = fetchBtn.innerHTML;
            fetchBtn.disabled = true;
            fetchBtn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin text-[11px]"></i>`;

            try {
                const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`);
                const payloadResult = await response.json();

                if (payloadResult.status === 'success' && payloadResult.data) {
                    const parsedData = payloadResult.data;
                    if (parsedData.title) document.getElementById("edit-title").value = parsedData.title;
                    if (parsedData.description) document.getElementById("edit-desc").value = parsedData.description;
                    if (parsedData.image && parsedData.image.url) document.getElementById("edit-image").value = parsedData.image.url;
                    
                    if (targetUrl.includes("chat.whatsapp.com") || targetUrl.includes("whatsapp.com")) {
                        document.getElementById("edit-platform").value = "WhatsApp";
                    } else if (targetUrl.includes("t.me") || targetUrl.includes("telegram.me")) {
                        document.getElementById("edit-platform").value = "Telegram";
                    } else if (targetUrl.includes("facebook.com")) {
                        document.getElementById("edit-platform").value = "Facebook";
                    } else if (targetUrl.includes("discord.gg") || targetUrl.includes("discord.com")) {
                        document.getElementById("edit-platform").value = "Discord";
                    } else if (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be")) {
                        document.getElementById("edit-platform").value = "YouTube";
                    } else {
                        document.getElementById("edit-platform").value = "Website";
                    }
                    updateLivePreview();
                } else {
                    alert("Could not extract active automated opengraph meta structures.");
                }
            } catch (fetchErr) {
                console.error("CORS Scraper fault exception:", fetchErr);
                alert(`Scraper Node Response Timeout Error.`);
            } finally {
                fetchBtn.disabled = false;
                fetchBtn.innerHTML = originalMarkup;
            }
        });

        // Submit modified database transaction wrapper
        document.getElementById("edit-link-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("edit-id").value;
            const payload = {
                image_url: document.getElementById("edit-image").value.trim(),
                title: document.getElementById("edit-title").value.trim(),
                description: document.getElementById("edit-desc").value.trim(),
                url: document.getElementById("edit-url").value.trim(),
                platform: document.getElementById("edit-platform").value,
                category: document.getElementById("edit-category").value,
                member_count: parseInt(document.getElementById("edit-members").value, 10) || 0
            };

            try {
                const { data: { user } } = await supabase.auth.getUser();
                const { error } = await supabase.from('links').update(payload).eq('id', id);
                if (error) throw error;
                await supabase.from('audit_logs').insert({ admin_id: user.id, action: 'EDIT_LINK_PARAMETERS', target_id: id, details: `Updated setup parameters for title: ${payload.title}.` });
                toggleModalVisibility();
                fetchCards();
            } catch (err) {
                alert(`Error saving modifications: ${err.message}`);
            }
        });
    };

    renderLayout();
    await fetchCards();
};