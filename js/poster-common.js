/* Pieces shared by the poster-style graphics (match, squad, victory, live). */
(function(){
  App.posterBase = () => `<div class="layer bgimg"></div><div class="layer bglights"></div><div class="layer crowd"></div><div class="layer pitch"></div><div class="layer bgdim"></div>`;
  App.brandHTML = (cls='brand') => `<div class="${cls}"><div class="logo"></div><i>${App.icon('crown')}</i><div class="l1" dir="auto"></div><div class="l2" dir="auto"></div></div>`;
  App.renderBrand = function(el, S){
    const b=S.brand||{}; el.hidden=!App.truthy(b.show);
    const logo=el.querySelector('.logo'); logo.hidden=!b.logo; logo.style.backgroundImage=App.bgUrl(b.logo);
    const ic=el.querySelector('i'); if(ic) ic.hidden=!!b.logo;
    el.querySelector('.l1').textContent=b.l1||''; const l2=el.querySelector('.l2'); l2.textContent=b.l2||''; l2.hidden=!b.l2;
  };
  /* Applies size, orientation, direction, font, accent and background layers. Returns {q, sz, orient}. */
  App.posterSetup = function(S, root, tsMult=1){
    const sz=App.parseSize(S.size), o=App.orient(sz); root.dataset.orient=o; root.dir=S.dir||'rtl';
    root.style.setProperty('--pf', App.fontStack(S.font));
    root.style.setProperty('--ts', (((Number(S.textScale)||100)/100)*tsMult).toFixed(3));
    const bg=S.bg||{}; root.style.setProperty('--ac', bg.accent||'#ffd400');
    const q=s=>root.querySelector(s);
    root.style.background = bg.mode==='color' ? (bg.color||'#0b1a3a') : '#0b1a3a';
    const hasImg = bg.mode==='image' && !!bg.img;
    q('.bgimg').hidden=!hasImg; q('.bgimg').style.backgroundImage=App.bgUrl(hasImg?bg.img:null);
    ['.bglights','.crowd','.pitch'].forEach(s=>{ const el=q(s); if(el) el.hidden = bg.mode!=='stadium'; });
    q('.bgdim').style.opacity=(Number(bg.dim)||0)/100;
    return {q, sz, orient:o};
  };
  App.splash = (el, color, show) => { if(!el) return; el.hidden=!show; el.style.setProperty('--c', App.rgba(color,.95)); el.style.setProperty('--c2', App.rgba(color,.5)); };
  /* Player cutout height depends on orientation: in tall formats the cutout sits in a band, not the full height. */
  App.playerHeight = (orient, size) => { const s=Number(size)||80; const f = orient==='portrait'?.5 : orient==='story'?.4 : 1; return (s*f).toFixed(1)+'cqh'; };
  App.renderPlayer = (el, p, orient) => {
    if(!el) return; el.hidden=!p.player; el.style.backgroundImage=App.bgUrl(p.player);
    el.style.setProperty('--ph', App.playerHeight(orient, p.size)); el.style.setProperty('--px', (Number(p.x)||0)+'cqw');
    el.classList.toggle('flip', App.truthy(p.flip));
  };
  App.teamName = (el, t) => { el.textContent=t.name||''; el.style.background=`linear-gradient(${App.mix(t.color,255,.1)}, ${App.mix(t.color,0,.25)})`; el.style.color=App.textOn(t.color); };
  App.brandDefaults = () => ({ show:true, l1:'کرکټ', l2:'پښتو خبرونه', logo:null });
  App.bgDefaults = (dim=30) => ({ mode:'stadium', img:null, color:'#0b1a3a', dim, accent:'#ffd400', badgeColor:'#d81f2a', splash:true });
})();
