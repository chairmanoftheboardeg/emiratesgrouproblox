// /assets/js/cms.js
// Public reads rely on RLS enforcing is_published=true.
async function cmsSelect(table, options = {}){
  if(!window.sb) throw new Error("Supabase client not initialised.");
  let q = window.sb.from(table).select("*");

  if(options.eq){
    for(const [k,v] of Object.entries(options.eq)) q = q.eq(k,v);
  }
  if(options.orderBy){
    q = q.order(options.orderBy, { ascending: options.ascending ?? true });
  }
  const { data, error } = await q;
  if(error) throw error;
  return data || [];
}

window.EGR_CMS = {
  divisions: () => cmsSelect("cms_divisions", { orderBy:"sort_order", ascending:true }),
  leadership: () => cmsSelect("cms_leadership", { orderBy:"sort_order", ascending:true }),
  fleet: (operator) => cmsSelect("cms_fleet", { eq:{ operator }, orderBy:"sort_order", ascending:true }),
  timeline: () => cmsSelect("cms_timeline", { orderBy:"milestone_date", ascending:true }),
  faq: () => cmsSelect("cms_faq", { orderBy:"sort_order", ascending:true }),
  news: () => cmsSelect("cms_news", { orderBy:"created_at", ascending:false }),
  media: () => cmsSelect("cms_media", { orderBy:"sort_order", ascending:true }),
  innovations: () => cmsSelect("cms_innovations", { orderBy:"sort_order", ascending:true })
};
