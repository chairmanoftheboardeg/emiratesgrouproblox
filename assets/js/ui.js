// /assets/js/ui.js
// Small animation helper + optional page loader
(function(){
  const els = document.querySelectorAll(".fadeUp");
  if(els.length){
    const io = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting){
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach(el=>io.observe(el));
  }

  window.EGR_UI = {
    showLoader: (strong=false) => {
      let el = document.getElementById("pageLoader");
      if(!el) return;
      el.classList.remove("hide");
      el.dataset.strong = strong ? "1" : "0";
    },
    hideLoader: () => {
      const el = document.getElementById("pageLoader");
      if(!el) return;
      el.classList.add("hide");
    }
  };
})();
