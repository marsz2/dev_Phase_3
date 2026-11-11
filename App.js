// J S K Enterprises - browser application module.
// IMPORTANT: Supabase publishable/anon key is intended for browser use with RLS.
// NEVER put a Supabase service_role key or an admin password in this file.
// const SUPABASE_URL = "https://nuauobedjaonqzdlvjmt.supabase.co"; 
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51YXVvYmVkamFvbnF6Z


// J S K Enterprises - Supabase-backed browser application.
// Replace both values with Supabase > Project Settings > API > Project URL and anon/public key.
// The anon key is designed for browser use. NEVER place the service_role key here.

// J S K Enterprises - Supabase-backed browser application.
// Use the Project URL and anon/publishable key from THE SAME Supabase project.
// Never put a service_role/secret key in browser code.

// J S K Enterprises - Supabase-backed browser application.
// Use the Project URL and anon/publishable key from THE SAME Supabase project.
// Never put a service_role/secret key in browser code.

// J S K Enterprises - Supabase-backed browser application.
// Use the Project URL and anon/publishable key from THE SAME Supabase project.
// Never put a service_role/secret key in browser code.
const SUPABASE_URL = "https://dqeqjepezknhgmherldg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bAEIVCxLxNPc0RlPQsQQpQ_RSrYY4wX";


const SUPABASE_CONFIGURED =
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL.trim()) &&
  SUPABASE_ANON_KEY.trim().length > 20 &&
  !/PASTE_|YOUR_|PLACEHOLDER/i.test(SUPABASE_ANON_KEY);

const supabase = (window.supabase && SUPABASE_CONFIGURED)
  ? window.supabase.createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : null;

function requireSupabaseConfig() {
  if (supabase) return true;
  const message = !window.supabase
    ? "Supabase library did not load. Check your internet connection and refresh."
    : "Supabase is not configured. Add your anon/public key in App.js before deploying.";
  console.error(message);
  const errorBox = $("loginError");
  if (errorBox) { errorBox.textContent = message; errorBox.style.display = "block"; }
  const toastBox = $("toast");
  if (toastBox) { toastBox.textContent = message; toastBox.classList.add("show"); }
  return false;
}
const STORE_DEFAULTS = { whatsapp_number:"9511228208", community_link:"https://chat.whatsapp.com/BiejjHkJqSaLBaowqVvtIO", whatsapp_message:"Hello J S K Enterprises, I am visiting your B2B Electricals items marketplace. Please share me more details", business_name:"J S K Enterprises", order_note:"Please confirm product availability and final bulk price before dispatch.", contact_email:"sumeet.khatri@gmail.com" };
let products=[], blogs=[], orders=[], settings={...STORE_DEFAULTS}, activeTab="products", editProductId=null, editBlogId=null;
const $=id=>document.getElementById(id), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(m){const e=$("toast");if(e){e.textContent=m;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2800)}}
async function uploadImage(file, folder){
  if(!file) return null;
  if(!file.type || !file.type.startsWith("image/")) throw new Error("Please select an image file.");
  if(file.size > 8 * 1024 * 1024) throw new Error("Image must be 8 MB or smaller.");
  const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
  const path=`${folder}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from("jsk-media").upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
  if(error) throw new Error("Image upload failed: "+error.message+". Check the jsk-media bucket and Storage policies.");
  return supabase.storage.from("jsk-media").getPublicUrl(path).data.publicUrl;
}

function wa(message=settings.whatsapp_message){return `https://wa.me/${String(settings.whatsapp_number).replace(/\D/g,"")}?text=${encodeURIComponent(message)}`}
function setupLinks(){["topWhatsapp","chatUsButton","contactWhatsapp","floatingWhatsapp"].forEach(id=>{if($(id))$(id).href=wa()});["communityButton","communityPopupJoin"].forEach(id=>{if($(id)){ $(id).href=settings.community_link; $(id).target="_blank"; $(id).rel="noopener"; }});if($("footerEmail"))$("footerEmail").href="mailto:"+settings.contact_email}
function setupCommunityPopup(){const popup=$("communityPopup");if(!popup||!$("productGrid"))return;const close=()=>popup.classList.remove("show");["communityPopupClose","communityPopupLater"].forEach(id=>{if($(id))$(id).addEventListener("click",close)});popup.addEventListener("click",e=>{if(e.target===popup)close()});popup.classList.add("show");}
async function loadSettings(){if(!requireSupabaseConfig()){setupLinks();return}const {data,error}=await supabase.from("store_settings").select("*").eq("id",1).maybeSingle();if(error)console.error("Store settings load failed:",error);if(!error&&data)settings={...settings,...data};setupLinks()}
async function loadProducts(){if(!requireSupabaseConfig())return;const {data,error}=await supabase.from("products").select("*").eq("is_active",true).order("sort_order").order("created_at");if(error){console.error("Products load failed:",error);toast(error.message);return}products=data||[];renderProducts()}
async function loadBlogs(){if(!requireSupabaseConfig())return;const {data,error}=await supabase.from("blogs").select("*").eq("is_published",true).order("published_at",{ascending:false});if(error){console.error("Blogs load failed:",error);toast(error.message);return}blogs=data||[];renderBlogs()}
function renderProducts(){const grid=$("productGrid");if(!grid)return;const q=($("searchProducts")?.value||"").toLowerCase(),cat=$("categoryFilter")?.value||"",cats=[...new Set(products.map(p=>p.category).filter(Boolean))];const list=products.filter(p=>(!q||(p.name+" "+p.description+" "+p.category).toLowerCase().includes(q))&&(!cat||p.category===cat));$("productCount").textContent=list.length+" items";$("categoryFilter").innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");$("categoryFilter").value=cat;$("categoryChips").innerHTML='<button class="category-chip" data-cat="">All</button>'+cats.map(c=>`<button class="category-chip" data-cat="${esc(c)}">${esc(c)}</button>`).join("");$("categoryChips").querySelectorAll("button").forEach(b=>{b.classList.toggle("active",b.dataset.cat===cat);b.onclick=()=>{$("categoryFilter").value=b.dataset.cat;renderProducts()}});grid.innerHTML=list.length?list.map(p=>`<article class="product-card product-clickable" data-product-id="${p.id}"><div class="product-image">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:`<span class="product-emoji">${esc(p.emoji||"▦")}</span>`}</div><div class="category">${esc(p.category)}</div><h3>${esc(p.name)}</h3><p class="product-desc">${esc(p.description)}</p><div class="price-row"><span class="price">₹${Number(p.price||0).toLocaleString("en-IN")}</span><span class="per-piece">per piece</span></div><div class="card-actions"><a class="btn btn-green" target="_blank" href="${wa("Hello J S K Enterprises, I am interested in "+p.name+". Please share bulk pricing.")}">WhatsApp Inquiry</a><button class="btn btn-outline details" data-detail="${p.id}">View Details</button></div></article>`).join(""):'<div class="empty" style="grid-column:1/-1">No products match your search.</div>';grid.querySelectorAll(".product-card[data-product-id]").forEach(card=>{
  card.addEventListener("click",event=>{
    if(event.target.closest("a,button")) return;
    openProduct(card.dataset.productId);
  });
  card.setAttribute("tabindex","0");
  card.setAttribute("role","button");
  card.setAttribute("aria-label","View details for "+(card.querySelector("h3")?.textContent||"product"));
  card.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openProduct(card.dataset.productId)}});
});
grid.querySelectorAll("[data-detail]").forEach(b=>b.onclick=event=>{event.stopPropagation();openProduct(b.dataset.detail)})}
function openProduct(id){const p=products.find(x=>String(x.id)===String(id));if(!p)return;$("productModalBody").innerHTML=`<div class="detail-grid"><div class="detail-img">${p.image_url?`<img src="${esc(p.image_url)}">`:`<span class="product-emoji">${esc(p.emoji||"▦")}</span>`}</div><div class="detail-content"><div class="category">${esc(p.category)}</div><h3>${esc(p.name)}</h3><div class="price">₹${Number(p.price||0).toLocaleString("en-IN")} <small>/ piece</small></div><p>${esc(p.description)}</p><div class="order-note">${esc(p.order_note||settings.order_note)}</div><button class="btn btn-green" id="placeOrderBtn" style="width:100%">Place Order Request</button></div></div>`;$("placeOrderBtn").onclick=()=>{$("orderProductId").value=p.id;$("orderProductName").value=p.name;$("productModal").classList.remove("show");$("orderModal").classList.add("show")};$("productModal").classList.add("show")}
function renderBlogs(){const root=$("blogGrid");if(!root)return;root.innerHTML=blogs.map(b=>`<article class="blog-card">${b.image_url?`<img class="blog-cover" src="${esc(b.image_url)}">`:`<div class="blog-icon">▤</div>`}<div class="category">${esc(b.category||"General")} · ${esc(b.published_at||"")}</div><h3>${esc(b.title)}</h3><p>${esc(b.excerpt)}</p><button class="btn btn-outline btn-sm" data-read="${b.id}">Read Article ↗</button></article>`).join("")||'<div class="empty" style="grid-column:1/-1">Blog posts will appear here.</div>';root.querySelectorAll("[data-read]").forEach(b=>b.onclick=()=>readBlog(b.dataset.read))}
function readBlog(id){const b=blogs.find(x=>String(x.id)===String(id));if(!b)return;$("productModalBody").innerHTML=`${b.image_url?`<img class="blog-article-image" src="${esc(b.image_url)}">`:""}<div class="category">${esc(b.category)} · ${esc(b.published_at||"")}</div><h2 style="color:var(--navy);margin:7px 0 14px">${esc(b.title)}</h2><p style="white-space:pre-wrap;line-height:1.8;color:var(--muted)">${esc(b.body)}</p>`;$("productModal").classList.add("show")}
async function saveRequest(row){const {error}=await supabase.from("orders").insert(row);if(error)throw error}
async function login(e){
  e.preventDefault();
  const errorBox=$("loginError");
  errorBox.style.display="none";
  if(!requireSupabaseConfig())return;
  const submit=e.submitter||$("loginForm").querySelector('button[type="submit"]');
  if(submit){submit.disabled=true;submit.textContent="Checking...";}
  try{
    const {data,error}=await supabase.auth.signInWithPassword({
      email:$("adminEmail").value.trim(),
      password:$("adminPassword").value
    });
    if(error)throw new Error("Login failed: "+error.message);
    if(!data.user?.id)throw new Error("Supabase login returned no user ID. Please try again.");
    console.info("Supabase authenticated user UUID:",data.user.id);
    const {data:allowed,error:roleError}=await supabase.rpc("is_admin");
    if(roleError)throw new Error("Admin authorization check failed: "+roleError.message+". Run the supplied SQL fix in this same Supabase project.");
    if(allowed!==true){
      await supabase.auth.signOut();
      throw new Error("Login succeeded, but this user's UUID is not present in public.admin_users. Add the exact UUID shown in Supabase Authentication > Users.");
    }
    location.href="masters.html";
  }catch(err){
    console.error("Administrator login error:",err);
    errorBox.textContent=err.message||"Unable to sign in. Check the browser console for details.";
    errorBox.style.display="block";
  }finally{
    if(submit){submit.disabled=false;submit.textContent="Log In to Dashboard";}
  }
}
async function logout(){if(supabase)await supabase.auth.signOut();location.href="admin.html"}
async function checkAdmin(){
  if(!requireSupabaseConfig())return false;
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError){console.error("Session validation failed:",userError);return false;}
  if(!user)return false;
  const {data,error}=await supabase.rpc("is_admin");
  if(error){console.error("is_admin RPC failed:",error);return false;}
  return data===true;
}
async function initMasters(){if(!$("dashboardView"))return;const ok=await checkAdmin();if(!ok){$("authRequired").style.display="block";return}$("authRequired").style.display="none";$("dashboardView").style.display="block";await loadSettings();try{await loadAdminData()}catch(err){console.error(err);toast(err.message);const root=$("adminContent");if(root)root.innerHTML=`<div class="notice">${esc(err.message)}</div>`;return}document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>adminTab(b.dataset.tab,b));$("logoutBtn").onclick=logout;adminTab("products",document.querySelector('[data-tab="products"]'))}
async function loadAdminData(){const [p,b,o,s]=await Promise.all([supabase.from("products").select("*").order("sort_order"),supabase.from("blogs").select("*").order("published_at",{ascending:false}),supabase.from("orders").select("*").order("created_at",{ascending:false}),supabase.from("store_settings").select("*").eq("id",1).maybeSingle()]);for(const [label,result] of [["Products",p],["Blogs",b],["Orders",o],["Store settings",s]])if(result.error)throw new Error(label+" database error: "+result.error.message);products=p.data||[];blogs=b.data||[];orders=o.data||[];if(s.data)settings={...settings,...s.data}}
function adminTab(tab,btn){activeTab=tab;document.querySelectorAll(".admin-tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));renderAdmin()}
function renderAdmin(){
  const root=$("adminContent"); if(!root)return;
  if(activeTab==="products"){
    const ordered=[...products].sort((a,b)=>(Number(a.sort_order)||999999)-(Number(b.sort_order)||999999));
    root.innerHTML=`<div class="admin-grid">
      <form class="admin-form" id="productForm"><h3>${editProductId?"Edit Product":"Add Product"}</h3>
        <div class="field"><label>Product Name *</label><input id="pName" required></div>
        <div class="field"><label>Category *</label><input id="pCategory" required></div>
        <div class="field"><label>Description *</label><textarea id="pDescription" required></textarea></div>
        <div class="field"><label>Price per piece (₹) *</label><input id="pPrice" type="number" min="0" step=".01" required></div>
        <div class="field"><label>Upload Product Image (max 8 MB)</label><input id="pImageFile" type="file" accept="image/*"></div>
        <div class="field"><label>Or Image URL (optional)</label><input id="pImage" type="url" placeholder="https://..."></div>
        <div class="field"><label>Image icon if no photo</label><input id="pEmoji" value="▦"></div>
        <div class="field"><label>Order note</label><textarea id="pNote"></textarea></div>
        <label><input id="pFeatured" type="checkbox"> Featured item</label>
        <button class="btn btn-blue" type="submit">${editProductId?"Save Product":"Add Product"}</button>
        <button type="button" class="btn btn-outline" id="clearProduct">Clear</button>
      </form>
      <div class="admin-form"><h3>Product Listing Order</h3>
        <p style="font-size:11px;color:var(--muted)">Drag product tiles to rearrange them, or enter a position number and press Enter.</p>
        <div class="product-order-grid" id="productOrderGrid">${ordered.map((p,i)=>`<div class="product-order-tile" draggable="true" data-order-id="${p.id}">
          ${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:`<div style="height:76px;display:grid;place-items:center;font-size:30px">${esc(p.emoji||"▦")}</div>`}
          <div class="order-name">${esc(p.name)}</div>
          <label class="order-position">Position <input type="number" min="1" max="${ordered.length}" value="${i+1}" data-position-id="${p.id}" aria-label="Position for ${esc(p.name)}"></label>
          <div class="product-order-actions"><button type="button" class="btn btn-outline btn-sm" data-editp="${p.id}">Edit</button><button type="button" class="btn btn-outline btn-sm delete-product" data-delp="${p.id}">Delete</button></div>
        </div>`).join("")||'<div class="empty">No products yet. Add your first product using the form.</div>'}</div>
        <p style="font-size:11px;color:var(--muted);margin-top:10px">Changes are saved to the database and reflected on the home page.</p>
      </div></div>`;
  }
  else if(activeTab==="blogs")root.innerHTML=`<div class="admin-grid"><form class="admin-form" id="blogForm"><h3>${editBlogId?"Edit Blog":"Add Blog Post"}</h3><div class="field"><label>Blog Title *</label><input id="bTitle" required></div><div class="field"><label>Category</label><input id="bCategory"></div><div class="field"><label>Short excerpt *</label><textarea id="bExcerpt" required></textarea></div><div class="field"><label>Full article *</label><textarea id="bBody" required style="min-height:150px"></textarea></div><div class="field"><label>Upload Blog Cover Image (max 8 MB)</label><input id="bImageFile" type="file" accept="image/*"></div><div class="field"><label>Or Image URL (optional)</label><input id="bImage" type="url" placeholder="https://..."></div><button class="btn btn-blue" type="submit">${editBlogId?"Save Blog":"Publish Blog"}</button><button type="button" class="btn btn-outline" id="clearBlog">Clear</button></form><div class="admin-form"><h3>Published Blogs</h3><div class="admin-list">${blogs.map(b=>`<div class="admin-item"><div class="item-info"><strong>${esc(b.title)}</strong><small>${esc(b.category||"General")}</small></div><button class="btn btn-outline btn-sm" data-editb="${b.id}">Edit</button><button class="btn btn-outline btn-sm" data-delb="${b.id}">Delete</button></div>`).join("")||'<div class="empty">No blogs yet.</div>'}</div></div></div>`;
  else if(activeTab==="orders")root.innerHTML=`<div class="admin-form"><h3>Orders & Inquiries (${orders.length})</h3>${orders.length?`<table class="order-table"><thead><tr><th>Date</th><th>Buyer</th><th>Product / Requirement</th><th>Contact / Address</th><th>Status</th><th>Action</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${esc(new Date(o.created_at).toLocaleString())}</td><td>${esc(o.name)}<br>${esc(o.phone)}</td><td>${esc(o.product_name||"General Inquiry")}</td><td>${esc(o.address)}</td><td><select data-status="${o.id}"><option ${o.status==="New"?"selected":""}>New</option><option ${o.status==="Contacted"?"selected":""}>Contacted</option><option ${o.status==="Completed"?"selected":""}>Completed</option></select></td><td><button class="btn btn-outline btn-sm" data-delo="${o.id}">Delete</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">No orders or inquiries yet.</div>'}</div>`;
  else root.innerHTML=`<form class="admin-form" id="settingsForm" style="max-width:700px"><h3>Store Settings</h3><div class="field"><label>WhatsApp Number</label><input id="sWhatsapp" required value="${esc(settings.whatsapp_number)}"></div><div class="field"><label>WhatsApp Community Link</label><input id="sCommunity" type="url" required value="${esc(settings.community_link)}"></div><div class="field"><label>Predefined WhatsApp Message</label><textarea id="sMessage" required>${esc(settings.whatsapp_message)}</textarea></div><div class="field"><label>Default order note</label><textarea id="sNote">${esc(settings.order_note)}</textarea></div><div class="field"><label>Contact email</label><input id="sEmail" type="email" value="${esc(settings.contact_email)}"></div><button class="btn btn-blue">Save Store Settings</button></form>`;
  bindAdminForms();
  bindProductOrdering();
}
async function persistProductOrder(orderedProducts){
  for(let i=0;i<orderedProducts.length;i++){
    const {error}=await supabase.from("products").update({sort_order:i+1}).eq("id",orderedProducts[i].id);
    if(error)throw error;
  }
  await loadAdminData();
  renderAdmin();
  if($("productGrid"))await loadProducts();
  toast("Product order saved");
}
function bindProductOrdering(){
  const grid=$("productOrderGrid"); if(!grid)return;
  let draggedId=null;
  grid.querySelectorAll(".product-order-tile").forEach(tile=>{
    tile.addEventListener("dragstart",e=>{draggedId=tile.dataset.orderId;tile.classList.add("dragging");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",draggedId)});
    tile.addEventListener("dragend",()=>{tile.classList.remove("dragging");grid.querySelectorAll(".product-order-tile").forEach(x=>x.classList.remove("drag-over"))});
    tile.addEventListener("dragover",e=>{e.preventDefault();e.dataTransfer.dropEffect="move";tile.classList.add("drag-over")});
    tile.addEventListener("dragleave",()=>tile.classList.remove("drag-over"));
    tile.addEventListener("drop",async e=>{e.preventDefault();tile.classList.remove("drag-over");const from=draggedId||e.dataTransfer.getData("text/plain"),to=tile.dataset.orderId;if(!from||from===to)return;const arr=[...products].sort((a,b)=>(Number(a.sort_order)||999999)-(Number(b.sort_order)||999999));const fromIndex=arr.findIndex(p=>String(p.id)===String(from)),toIndex=arr.findIndex(p=>String(p.id)===String(to));if(fromIndex<0||toIndex<0)return;const [moved]=arr.splice(fromIndex,1);arr.splice(toIndex,0,moved);try{await persistProductOrder(arr)}catch(err){console.error(err);toast("Could not save product order: "+err.message)}});
  });
  grid.querySelectorAll("[data-position-id]").forEach(input=>input.addEventListener("keydown",async e=>{if(e.key!=="Enter")return;e.preventDefault();const target=Number(input.value),arr=[...products].sort((a,b)=>(Number(a.sort_order)||999999)-(Number(b.sort_order)||999999));if(!Number.isInteger(target)||target<1||target>arr.length){toast("Enter a position from 1 to "+arr.length);return}const index=arr.findIndex(p=>String(p.id)===String(input.dataset.positionId));if(index<0)return;const [moved]=arr.splice(index,1);arr.splice(target-1,0,moved);try{await persistProductOrder(arr)}catch(err){console.error(err);toast("Could not save product order: "+err.message)}}));
}

function bindAdminForms(){const pf=$("productForm");if(pf){if(editProductId){const p=products.find(x=>String(x.id)===String(editProductId));if(p){$("pName").value=p.name;$("pCategory").value=p.category;$("pDescription").value=p.description;$("pPrice").value=p.price;$("pImage").value=p.image_url||"";$("pEmoji").value=p.emoji||"▦";$("pNote").value=p.order_note||"";$("pFeatured").checked=!!p.featured}}pf.onsubmit=async e=>{e.preventDefault();const submit=pf.querySelector('button[type="submit"]')||pf.querySelector('.btn-blue');if(submit){submit.disabled=true;submit.textContent="Saving..."}try{const selectedFile=$("pImageFile").files[0];const uploadedUrl=selectedFile?await uploadImage(selectedFile,"products"):null;const current=editProductId?products.find(x=>String(x.id)===String(editProductId)):null;const imageUrl=uploadedUrl||$("pImage").value.trim()||current?.image_url||null;const row={name:$("pName").value.trim(),category:$("pCategory").value.trim(),description:$("pDescription").value.trim(),price:Number($("pPrice").value),image_url:imageUrl,emoji:$("pEmoji").value.trim(),order_note:$("pNote").value.trim(),featured:$("pFeatured").checked,is_active:true,sort_order:current?Number(current.sort_order||1):(Math.max(0,...products.map(p=>Number(p.sort_order)||0))+1)};const res=editProductId?await supabase.from("products").update(row).eq("id",editProductId):await supabase.from("products").insert(row);if(res.error)throw res.error;editProductId=null;await loadAdminData();renderAdmin();toast("Product saved")}catch(err){console.error(err);toast(err.message||"Could not save product")}finally{if(submit){submit.disabled=false;submit.textContent=editProductId?"Save Product":"Add Product"}}};$("clearProduct").onclick=()=>{editProductId=null;renderAdmin()}}
const bf=$("blogForm");if(bf){if(editBlogId){const b=blogs.find(x=>x.id===editBlogId);if(b){$("bTitle").value=b.title;$("bCategory").value=b.category;$("bExcerpt").value=b.excerpt;$("bBody").value=b.body;$("bImage").value=b.image_url||""}}bf.onsubmit=async e=>{e.preventDefault();const submit=bf.querySelector(".btn-blue");if(submit){submit.disabled=true;submit.textContent="Publishing..."}try{const selectedFile=$("bImageFile").files[0];const uploadedUrl=selectedFile?await uploadImage(selectedFile,"blogs"):null;const current=editBlogId?blogs.find(x=>String(x.id)===String(editBlogId)):null;const imageUrl=uploadedUrl||$("bImage").value.trim()||current?.image_url||null;const row={title:$("bTitle").value.trim(),category:$("bCategory").value.trim()||"General",excerpt:$("bExcerpt").value.trim(),body:$("bBody").value.trim(),image_url:imageUrl,is_published:true,published_at:new Date().toISOString().slice(0,10)};const res=editBlogId?await supabase.from("blogs").update(row).eq("id",editBlogId):await supabase.from("blogs").insert(row);if(res.error)throw res.error;editBlogId=null;await loadAdminData();renderAdmin();toast("Blog saved")}catch(err){console.error(err);toast(err.message||"Could not save blog")}finally{if(submit){submit.disabled=false;submit.textContent=editBlogId?"Save Blog":"Publish Blog"}}};$("clearBlog").onclick=()=>{editBlogId=null;renderAdmin()}}
document.querySelectorAll("[data-editp]").forEach(b=>b.onclick=()=>{editProductId=b.dataset.editp;renderAdmin()});document.querySelectorAll("[data-delp]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this product?")){const r=await supabase.from("products").delete().eq("id",b.dataset.delp);if(r.error)toast(r.error.message);else{await loadAdminData();renderAdmin()}}});document.querySelectorAll("[data-editb]").forEach(b=>b.onclick=()=>{editBlogId=b.dataset.editb;renderAdmin()});document.querySelectorAll("[data-delb]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this blog?")){const r=await supabase.from("blogs").delete().eq("id",b.dataset.delb);if(r.error)toast(r.error.message);else{await loadAdminData();renderAdmin()}}});document.querySelectorAll("[data-status]").forEach(s=>s.onchange=async()=>{const r=await supabase.from("orders").update({status:s.value}).eq("id",s.dataset.status);if(r.error)toast(r.error.message)});document.querySelectorAll("[data-delo]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this request?")){const r=await supabase.from("orders").delete().eq("id",b.dataset.delo);if(r.error)toast(r.error.message);else{await loadAdminData();renderAdmin()}}});const sf=$("settingsForm");if(sf)sf.onsubmit=async e=>{e.preventDefault();const row={id:1,whatsapp_number:$("sWhatsapp").value.trim(),community_link:$("sCommunity").value.trim(),whatsapp_message:$("sMessage").value,order_note:$("sNote").value,contact_email:$("sEmail").value.trim()};const r=await supabase.from("store_settings").upsert(row);if(r.error)toast(r.error.message);else{settings={...settings,...row};setupLinks();toast("Settings saved")}}}
function wireCommon(){if($("themeToggle"))$("themeToggle").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("jsk_dark_mode",document.body.classList.contains("dark")?"1":"0")};if(localStorage.getItem("jsk_dark_mode")==="1")document.body.classList.add("dark");if($("closeModal"))$("closeModal").onclick=()=>$("productModal").classList.remove("show");if($("productModal"))$("productModal").addEventListener("click",e=>{if(e.target===$("productModal"))$("productModal").classList.remove("show")});if($("closeOrderModal"))$("closeOrderModal").onclick=()=>$("orderModal").classList.remove("show");if($("searchProducts"))$("searchProducts").oninput=renderProducts;if($("categoryFilter"))$("categoryFilter").onchange=renderProducts;
if($("inquiryForm"))$("inquiryForm").onsubmit=async e=>{e.preventDefault();const row={name:$("inqName").value.trim(),phone:$("inqPhone").value.trim(),address:$("inqRequirement").value.trim(),product_name:"General Inquiry",status:"New"};try{await saveRequest(row);const msg=`Hello J S K Enterprises, I am ${row.name}. Phone: ${row.phone}. Requirement: ${row.address}`;e.target.reset();window.open(wa(msg),"_blank","noopener");toast("Inquiry submitted")}catch(err){toast(err.message)}};
if($("orderForm"))$("orderForm").onsubmit=async e=>{e.preventDefault();const p=products.find(x=>String(x.id)===$("orderProductId").value);const row={product_id:p?.id||null,product_name:$("orderProductName").value,name:$("buyerName").value.trim(),phone:$("buyerPhone").value.trim(),address:$("buyerAddress").value.trim(),status:"New"};try{await saveRequest(row);e.target.reset();$("orderModal").classList.remove("show");window.location.href=wa(`Hello J S K Enterprises, I would like to place an order request. Product: ${row.product_name}. Name: ${row.name}. Phone: ${row.phone}. Delivery Address: ${row.address}.`)}catch(err){toast(err.message)}};
if($("loginForm"))$("loginForm").onsubmit=login}
async function init(){
  wireCommon();
  if(!requireSupabaseConfig())return;
  await loadSettings();
  if($("productGrid"))setupCommunityPopup();
  if($("productGrid"))await loadProducts();
  if($("blogGrid"))await loadBlogs();
  if($("loginForm")){
    const {data:{session},error}=await supabase.auth.getSession();
    if(error)console.error("Session lookup failed:",error);
    if(session&&await checkAdmin())location.href="masters.html";
  }
  await initMasters();
}
document.addEventListener("DOMContentLoaded",()=>{
  init().catch(err=>{
    console.error("Application initialization failed:",err);
    const errorBox=$("loginError");
    if(errorBox){errorBox.textContent="Application error: "+(err.message||String(err));errorBox.style.display="block";}
    else toast(err.message||"Application initialization failed. Check the console.");
  });
});
