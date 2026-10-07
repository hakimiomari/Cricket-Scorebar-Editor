/* Cricket graphics studio - shared engine.
   Each graphic registers a "section": sample state, a form schema, an HTML template and a render(S, root) function.
   The engine builds the editor, binds inputs to state by dotted path, scales the preview, autosaves, and exports PNGs. */
window.App = (function(){
  'use strict';

  /* ---------- tiny helpers ---------- */
  const $ = id => document.getElementById(id);
  const get = (o,p) => String(p).split('.').reduce((x,k)=>x==null?x:x[k], o);
  const set = (o,p,v) => { const ks=String(p).split('.'); const last=ks.pop();
    const t=ks.reduce((x,k)=>{ if(x[k]==null || typeof x[k]!=='object') x[k]={}; return x[k]; }, o); t[last]=v; };
  const truthy = v => v===true || v==='true';
  const esc = s => String(s??'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const clamp = (n,a,b) => Math.min(b, Math.max(a, n));

  function hexToRgb(h){ h=String(h||'#000000').trim(); if(/^#[0-9a-f]{3}$/i.test(h)) h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];
    const n=parseInt(h.slice(1,7),16); return isNaN(n)?[0,0,0]:[n>>16&255,n>>8&255,n&255]; }
  function mix(h,t,amt){ const [r,g,b]=hexToRgb(h); const f=x=>Math.round(x+(t-x)*amt); return `rgb(${f(r)},${f(g)},${f(b)})`; }
  function rgba(h,a){ const [r,g,b]=hexToRgb(h); return `rgba(${r},${g},${b},${a})`; }
  function textOn(h){ const [r,g,b]=hexToRgb(h); return (r*299+g*587+b*114)/1000 > 150 ? '#1a2550' : '#ffffff'; }

  const AR='۰۱۲۳۴۵۶۷۸۹';
  const digits = (s,mode) => mode==='arabic' ? String(s??'').replace(/[0-9]/g, d=>AR[+d]) : String(s??'');

  /* ---------- shared option lists ---------- */
  const FONTS=[
    ['noto-sans-arabic','Noto Sans Arabic (Pashto, Dari, Urdu)'],
    ['noto-kufi','Noto Kufi Arabic (bold display)'],
    ['noto-naskh','Noto Naskh Arabic (traditional)'],
    ['lalezar','Lalezar (poster display)'],
    ['barlow','Barlow Semi Condensed (Latin)']
  ];
  const FONT_STACKS={
    'noto-sans-arabic':'"Noto Sans Arabic","Noto Kufi Arabic",Arial,sans-serif',
    'noto-kufi':'"Noto Kufi Arabic","Noto Sans Arabic",Arial,sans-serif',
    'noto-naskh':'"Noto Naskh Arabic","Noto Sans Arabic",serif',
    'lalezar':'"Lalezar","Noto Kufi Arabic","Noto Sans Arabic",sans-serif',
    'barlow':'"Barlow Semi Condensed","Arial Narrow","Helvetica Neue",Arial,sans-serif'
  };
  const fontStack = k => FONT_STACKS[k] || FONT_STACKS['noto-sans-arabic'];

  const SIZES=[
    ['1536x1024','Landscape 3:2 (1536 × 1024)'],
    ['1920x1080','Landscape 16:9 (1920 × 1080)'],
    ['1080x1080','Square 1:1 (1080 × 1080)'],
    ['1080x1350','Portrait 4:5 (1080 × 1350)'],
    ['1080x1920','Story 9:16 (1080 × 1920)']
  ];
  const parseSize = s => { const [w,h]=String(s||'').split('x').map(Number); return {w:w||1536, h:h||1024}; };
  const orient = sz => { const r=sz.w/sz.h; return r>1.2?'landscape' : r>=.85?'square' : r>=.7?'portrait' : 'story'; };

  /* Languages: each sets direction, font and digits; modules supply sample text per language. */
  const LANGS={
    ps:{ label:'پښتو (Pashto)', dir:'rtl', font:'noto-sans-arabic', digits:'latin' },
    en:{ label:'English', dir:'ltr', font:'barlow', digits:'latin' }
  };
  const LANG_OPTIONS=Object.keys(LANGS).map(k=>[k, LANGS[k].label]);

  const FLAG_OPTIONS=[
    ['india','India'],['pakistan','Pakistan'],['afghanistan','Afghanistan'],['bangladesh','Bangladesh'],['england','England'],
    ['mono','Solid block with initials'],['image','Uploaded image']
  ];

  /* ---------- shared drawing bits ---------- */
  function ballEl(tok){
    const b=document.createElement('span'); b.className='ball'; const t=tok.trim(); const u=t.toUpperCase();
    if(t==='0'||t==='.'){ b.classList.add('dot'); }
    else if(u==='W'){ b.classList.add('w'); b.textContent='W'; }
    else if(/^(WD|NB|LB|B|RO)$/.test(u)){ b.classList.add('x'); b.textContent=u.toLowerCase(); }
    else if(t==='4'){ b.classList.add('four'); b.textContent='4'; }
    else if(t==='6'){ b.classList.add('six'); b.textContent='6'; }
    else b.textContent=t;
    return b;
  }
  function renderBalls(container, over, max=10){
    container.innerHTML=''; String(over||'').split(/\s+/).filter(Boolean).slice(0,max).forEach(t=>container.appendChild(ballEl(t)));
  }
  const BRUSH='M6 14 L48 6 L120 12 L210 4 L300 10 L392 6 L398 40 L390 62 L396 90 L330 96 L250 88 L160 95 L80 90 L10 96 L2 60 L8 38 Z';
  const brushSvg = () => `<svg class="bsvg" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path d="${BRUSH}"/></svg>`;
  function setBrush(el, text, fill, ink){
    el.querySelector('.t').textContent=text; el.querySelector('path').style.fill=fill; el.style.color=ink;
    el.hidden = !String(text||'').trim();
  }
  const bgUrl = img => img ? `url("${img}")` : 'none';

  /* ---------- reusable form groups ---------- */
  function posterGroup(extra=[]){ return { legend:'Poster', fields:[
    {k:'lang', label:'Language', type:'select', options:LANG_OPTIONS},
    {k:'size', label:'Size', type:'select', options:SIZES},
    {k:'font', label:'Font', type:'select', options:FONTS},
    {k:'dir', label:'Text direction', type:'select', options:[['rtl','Right to left (Pashto, Dari, Urdu)'],['ltr','Left to right (English)']]},
    {k:'digits', label:'Digits', type:'select', options:[['latin','Western 0-9'],['arabic','Eastern Arabic ۰-۹']]},
    {k:'textScale', label:'Text size', type:'range', min:70, max:130},
    {type:'hint', text:'Changing the language switches direction, font and digits, and translates any sample text you have not edited.'},
    ...extra ]}; }
  function bgGroup(){ return { legend:'Background', fields:[
    {k:'bg.mode', label:'Style', type:'select', options:[['stadium','Stadium lights (built in)'],['image','Uploaded photo'],['color','Solid colour']]},
    {k:'bg.img', label:'Photo', type:'image'},
    {k:'bg.color', label:'Colour', type:'color'},
    {k:'bg.dim', label:'Darken', type:'range', min:0, max:85},
    {k:'bg.accent', label:'Accent', type:'color'},
    {k:'bg.splash', label:'Splashes', type:'check', text:'Team-colour paint splashes'} ]}; }
  function brandGroup(){ return { legend:'Brand', toggle:'brand.show', fields:[
    {k:'brand.l1', label:'Name', type:'text'},
    {k:'brand.l2', label:'Tagline', type:'text'},
    {k:'brand.logo', label:'Logo', type:'image'},
    {type:'hint', text:'An uploaded logo replaces the crown icon.'} ]}; }
  function teamFields(key, extra=[]){ return [
    {k:key+'.name', label:'Name', type:'text'},
    {k:key+'.color', label:'Colour', type:'color'},
    {k:key+'.flag', label:'Flag', type:'select', options:FLAG_OPTIONS},
    {k:key+'.short', label:'Initials', placeholder:'WI'},
    {k:key+'.img', label:'Flag image', type:'image'},
    {type:'hint', text:'Initials appear on the solid-block flag; the colour tints the block and the paint splash.'},
    ...extra ]; }
  function playerFields(key, label='Player cutout'){ return [
    {k:key+'.player', label, type:'image'},
    {k:key+'.size', label:'Size', type:'range', min:30, max:110},
    {k:key+'.x', label:'Offset', type:'range', min:-25, max:30},
    {k:key+'.flip', label:'Mirror', type:'check', text:'Flip horizontally'},
    {type:'hint', text:'Use a PNG with a transparent background for a clean cutout.'} ]; }

  /* ---------- form builder ---------- */
  const idFor = (sec,k) => `${sec}__${String(k).replace(/\./g,'_')}`;
  function inputHTML(sec, f, extra=''){
    const id=f.k?idFor(sec,f.k):''; const ph=`placeholder="${esc(f.placeholder||'')}"`;
    switch(f.type||'text'){
      case 'text': return `<input type="text" id="${id}" data-k="${f.k}" dir="auto" ${ph} ${extra}>`;
      case 'textarea': return `<textarea id="${id}" data-k="${f.k}" dir="auto" rows="${f.rows||6}" ${ph} ${extra}></textarea>`;
      case 'color': return `<div class="inline"><input type="color" id="${id}" data-k="${f.k}" ${extra}></div>`;
      case 'select': return `<select id="${id}" data-k="${f.k}" ${extra}>${f.options.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('')}</select>`;
      case 'check': return `<label class="chk"><input type="checkbox" id="${id}" data-k="${f.k}" ${extra}> ${esc(f.text||'')}</label>`;
      case 'range': return `<div class="inline range"><input type="range" id="${id}" data-k="${f.k}" min="${f.min}" max="${f.max}" step="${f.step||1}" ${extra}><output></output></div>`;
      case 'image': return `<div class="inline"><input type="file" id="${id}" accept="image/*" data-img="${f.k}" ${extra}><button type="button" class="btn mini" data-clear="${f.k}">Clear</button></div>`;
    }
    return '';
  }
  function fieldHTML(sec, f){
    if(f.type==='hint') return `<p class="hint">${esc(f.text)}</p>`;
    if(f.pair){
      const lab = f.label!=null ? `<label for="${idFor(sec,f.pair[0].k)}">${esc(f.label)}</label>` : '<span></span>';
      return `${lab}<div class="two">${f.pair.map(p=>inputHTML(sec,p,`aria-label="${esc(p.label||p.placeholder||'')}"`)).join('')}</div>`;
    }
    const lab = f.label!=null ? (f.type==='check' ? `<span class="lbl">${esc(f.label)}</span>` : `<label for="${idFor(sec,f.k)}">${esc(f.label)}</label>`) : '<span></span>';
    return `${lab}${inputHTML(sec,f)}`;
  }
  function groupHTML(sec, g){
    const legend = g.toggle
      ? `<legend><input type="checkbox" data-k="${g.toggle}" id="${idFor(sec,g.toggle)}"><label for="${idFor(sec,g.toggle)}">${esc(g.legend)}</label></legend>`
      : `<legend>${esc(g.legend)}</legend>`;
    return `<fieldset${g.wide?' class="wide"':''}>${legend}<div class="row">${g.fields.map(f=>fieldHTML(sec,f)).join('')}</div></fieldset>`;
  }
  function designGroupHTML(sec){
    return `<fieldset><legend>Export and design file</legend><div class="row">
      <label for="${idFor(sec,'scale')}">Resolution</label>
      <select id="${idFor(sec,'scale')}" data-k="scale"><option value="1">1×</option><option value="2">2×</option><option value="3">3×</option></select>
      <span></span><div class="inline">
        <button type="button" class="btn mini" data-act="save">Save design (JSON)</button>
        <label class="btn mini file-btn">Load design<input type="file" accept="application/json,.json" data-act="load" hidden></label>
        <button type="button" class="btn mini" data-act="reset">Reset to sample</button>
      </div>
      <p class="hint">Edits are autosaved in this browser. Save a JSON file to keep a design or move it to another computer. Uploaded images never leave this page.</p>
    </div></fieldset>`;
  }

  /* ---------- persistence ---------- */
  const KEY = id => 'cg:'+id;
  function stripImages(o){ if(Array.isArray(o)) return o.map(stripImages); if(o && typeof o==='object'){ const r={}; for(const k in o) r[k]=stripImages(o[k]); return r; }
    return (typeof o==='string' && o.startsWith('data:')) ? null : o; }
  function saveLocal(sec){
    try{ localStorage.setItem(KEY(sec.id), JSON.stringify(sec.S)); }
    catch(e){ try{ localStorage.setItem(KEY(sec.id), JSON.stringify(stripImages(sec.S))); }catch(e2){} }
  }
  function loadLocal(id){ try{ const v=localStorage.getItem(KEY(id)); return v?JSON.parse(v):null; }catch(e){ return null; } }
  function deepMerge(base, over){
    if(over==null) return base;
    if(Array.isArray(base)) return Array.isArray(over) ? over.map((v,i)=> base[i]!=null && typeof base[i]==='object' ? deepMerge(base[i],v) : v) : base;
    if(typeof base==='object'){ const r={...base}; if(typeof over==='object') for(const k in over) r[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k]; return r; }
    return over;
  }
  function downloadBlob(blob, name){
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 2000);
  }

  /* ---------- sections ---------- */
  const sections=[]; let active=null; let saveTimer=null;
  const say = t => { $('status').textContent=t; };
  function register(sec){ sections.push(sec); }

  function mount(sec){
    const wrap=document.createElement('section'); wrap.className='sec'; wrap.id='sec-'+sec.id; wrap.hidden=true;
    wrap.innerHTML = `<div class="stage"><div class="fitbox"><div class="fit">${sec.template}</div></div></div>
      <p class="caption"></p><div class="editor">${sec.groups.map(g=>groupHTML(sec.id,g)).join('')}${designGroupHTML(sec.id)}</div>`;
    $('sections').appendChild(wrap);
    sec.el=wrap; sec.stage=wrap.querySelector('.stage'); sec.fitbox=wrap.querySelector('.fitbox'); sec.fit=wrap.querySelector('.fit');
    sec.node=sec.fit.firstElementChild; sec.editor=wrap.querySelector('.editor'); sec.caption=wrap.querySelector('.caption');
    const saved=loadLocal(sec.id); sec.S = deepMerge(sec.sample(saved && saved.lang), saved);
    bind(sec); fill(sec); update(sec);
  }

  function defaultOnImage(path, S){
    const parts=String(path).split('.'); const leaf=parts.pop(); const parent=parts.length?get(S,parts.join('.')):S;
    if(leaf==='img' && parent && 'flag' in parent) parent.flag='image';
    if(path==='bg.img' && S.bg) S.bg.mode='image';
  }

  function bind(sec){
    sec.editor.querySelectorAll('[data-k]').forEach(el=>{
      el.addEventListener('input', ()=>{
        const prevLang=sec.S.lang;
        set(sec.S, el.dataset.k, el.type==='checkbox'?el.checked:el.value);
        if(el.type==='range') el.nextElementSibling.value=el.value;
        if(el.dataset.k==='lang' && sec.S.lang!==prevLang){ switchLanguage(sec, prevLang, sec.S.lang); fill(sec); }
        if(sec.onChange) sec.onChange(el.dataset.k, sec.S);
        update(sec);
      });
    });
    sec.editor.querySelectorAll('input[type=file][data-img]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const f=inp.files && inp.files[0]; if(!f) return;
        const rd=new FileReader();
        rd.onload=()=>{ set(sec.S, inp.dataset.img, rd.result); defaultOnImage(inp.dataset.img, sec.S);
          if(sec.onImage) sec.onImage(inp.dataset.img, sec.S); inp.value=''; fill(sec); update(sec); say('Image added.'); };
        rd.readAsDataURL(f);
      });
    });
    sec.editor.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click', ()=>{ set(sec.S, b.dataset.clear, null); fill(sec); update(sec); }));
    sec.editor.querySelector('[data-act=save]').addEventListener('click', ()=>{
      downloadBlob(new Blob([JSON.stringify(sec.S,null,2)],{type:'application/json'}), `${sec.id}-design.json`); say('Design saved.'); });
    sec.editor.querySelector('[data-act=load]').addEventListener('change', e=>{
      const f=e.target.files && e.target.files[0]; if(!f) return; const rd=new FileReader();
      rd.onload=()=>{ try{ const d=JSON.parse(rd.result); sec.S=deepMerge(sec.sample(d && d.lang), d); fill(sec); update(sec); say('Design loaded.'); }catch(err){ say('That file is not a saved design.'); } e.target.value=''; };
      rd.readAsText(f);
    });
    sec.editor.querySelector('[data-act=reset]').addEventListener('click', ()=>{ sec.S=sec.sample(sec.S.lang); fill(sec); update(sec); say('Sample restored.'); });
  }

  /* Switch direction, font and digits for the new language, and translate text that still matches the old sample. */
  function switchLanguage(sec, from, to){
    const L=LANGS[to]; if(!L) return;
    const oldS=sec.sample(from), newS=sec.sample(to);
    (function walk(cur, o, n){
      if(!cur || typeof cur!=='object' || !n || typeof n!=='object') return;
      for(const k in n){
        if(typeof n[k]==='string'){ if(typeof cur[k]==='string' && o && cur[k]===o[k]) cur[k]=n[k]; }
        else if(n[k] && typeof n[k]==='object') walk(cur[k], o && o[k], n[k]);
      }
    })(sec.S, oldS, newS);
    sec.S.dir=L.dir; sec.S.font=L.font; sec.S.digits=L.digits;
    say(to==='en' ? 'Switched to English, left to right.' : 'Switched language and text direction.');
  }

  function fill(sec){
    sec.editor.querySelectorAll('[data-k]').forEach(el=>{
      const v=get(sec.S, el.dataset.k);
      if(el.type==='checkbox') el.checked=truthy(v);
      else if(el.type==='color') el.value = /^#[0-9a-f]{6}$/i.test(v||'') ? v : '#000000';
      else el.value = v ?? '';
      if(el.type==='range') el.nextElementSibling.value=el.value;
    });
  }

  function update(sec){
    const sz=sec.size(sec.S);
    sec.node.style.width=sz.w+'px'; sec.node.style.height = sz.h ? sz.h+'px' : '';
    sec.render(sec.S, sec.node);
    if(sec.afterFill) sec.afterFill(sec.S, sec.editor);
    const stageBg = sec.stageBg ? sec.stageBg(sec.S) : null;
    sec.stage.style.background = stageBg || '';
    fitPreview(sec);
    const pad=sec.pad||0, k=Number(sec.S.scale)||2, h=sz.h||sec.node.offsetHeight;
    sec.caption.textContent = `Export: ${Math.round((sz.w+2*pad)*k)} × ${Math.round((h+2*pad)*k)} px`;
    clearTimeout(saveTimer); saveTimer=setTimeout(()=>saveLocal(sec), 400);
  }

  function fitPreview(sec){
    if(sec.el.hidden) return;
    const w=sec.fitbox.clientWidth, bw=sec.node.offsetWidth, bh=sec.node.offsetHeight;
    const maxH=Math.max(260, window.innerHeight*0.72);
    const k=Math.min(1, w/bw, maxH/bh);
    sec.fit.style.width=bw+'px'; sec.fit.style.transform=`scale(${k})`; sec.fit.style.height=(bh*k)+'px';
    sec.fit.style.marginLeft=Math.max(0,(w-bw*k)/2)+'px';
  }

  function activate(id){
    const sec=sections.find(s=>s.id===id) || sections[0]; if(!sec) return;
    active=sec; sections.forEach(s=>{ s.el.hidden = s!==sec; });
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on', t.dataset.id===sec.id));
    try{ localStorage.setItem('cg:tab', sec.id); }catch(e){}
    if(location.hash !== '#'+sec.id) history.replaceState(null,'','#'+sec.id);
    fitPreview(sec); say('');
  }

  /* ---------- export ---------- */
  async function renderCanvas(sec){
    const host=$('exportHost'); host.innerHTML='';
    const pad=sec.pad||0, sz=sec.size(sec.S);
    const wrap=document.createElement('div'); wrap.style.cssText=`display:inline-block;padding:${pad}px;width:${sz.w+2*pad}px;`;
    const clone=sec.node.cloneNode(true); wrap.appendChild(clone); host.appendChild(wrap);
    const bg = sec.exportBg ? sec.exportBg(sec.S) : null;
    try{ await document.fonts.ready; }catch(e){}
    const h=(sz.h||clone.offsetHeight)+2*pad;
    const canvas=await html2canvas(wrap, { backgroundColor: bg||null, scale:Number(sec.S.scale)||2, logging:false, useCORS:true,
      width:sz.w+2*pad, height:h, windowWidth:sz.w+2*pad+200, windowHeight:h+200 });
    host.innerHTML=''; return canvas;
  }
  const toBlob = c => new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('blob')),'image/png'));
  const dlReady = (window.claude && typeof window.claude.use==='function') ? window.claude.use('downloads').catch(()=>null) : Promise.resolve(null);

  async function download(){
    if(!active) return; const btn=$('dlBtn'); btn.disabled=true; say('Rendering…');
    try{
      const blob=await toBlob(await renderCanvas(active));
      const name=(active.filename ? active.filename(active.S) : active.id).replace(/[^\p{L}\p{N}_-]+/gu,'-').replace(/^-+|-+$/g,'') + '.png';
      const dl=await dlReady;
      if(dl){ try{ await dl.save({filename:name, data:blob}); say('Saved.'); }
              catch(e){ say(e && e.code==='declined' ? 'Download cancelled.' : 'Could not save the file here.'); } }
      else { downloadBlob(blob, name); say('Downloaded.'); }
    }catch(e){ console.error(e); say('Rendering failed. Try a smaller resolution.'); }
    btn.disabled=false;
  }
  async function copy(){
    if(!active) return; const btn=$('copyBtn'); btn.disabled=true; say('Rendering…');
    try{
      if(!(navigator.clipboard && window.ClipboardItem)){ say('Clipboard images are not supported in this browser. Use Download PNG.'); }
      else { const item=new ClipboardItem({'image/png': renderCanvas(active).then(toBlob)}); await navigator.clipboard.write([item]); say('Image copied to clipboard.'); }
    }catch(e){
      try{ const blob=await toBlob(await renderCanvas(active)); await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]); say('Image copied to clipboard.'); }
      catch(e2){ say('Copy was blocked here. Use Download PNG instead.'); }
    }
    btn.disabled=false;
  }

  /* ---------- boot ---------- */
  function start(){
    sections.forEach(mount);
    const tabs=$('tabs');
    sections.forEach(s=>{ const b=document.createElement('button'); b.type='button'; b.className='tab'; b.dataset.id=s.id; b.textContent=s.tab; b.addEventListener('click',()=>activate(s.id)); tabs.appendChild(b); });
    let first=location.hash.slice(1); if(!sections.some(s=>s.id===first)){ try{ first=localStorage.getItem('cg:tab'); }catch(e){} }
    activate(first);
    window.addEventListener('hashchange', ()=>{ const id=location.hash.slice(1); if(sections.some(s=>s.id===id) && (!active||active.id!==id)) activate(id); });
    $('dlBtn').addEventListener('click', download); $('copyBtn').addEventListener('click', copy);
    window.addEventListener('resize', ()=>{ if(active) fitPreview(active); });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ if(active) update(active); });
  }

  return { $, get, set, truthy, esc, clamp, mix, rgba, textOn, digits, fontStack, parseSize, orient, FONTS, SIZES, FLAG_OPTIONS,
           ballEl, renderBalls, brushSvg, setBrush, bgUrl, posterGroup, bgGroup, brandGroup, teamFields, playerFields,
           LANGS, register, start, say, renderCanvas:()=>active?renderCanvas(active):Promise.reject(new Error('no section')) };
})();
