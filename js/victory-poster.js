/* Victory post: headline, result line, mini scorecard, player of the match, confetti. */
(function(){
  const I=App.icon, B=App.brushSvg;
  const TEXT={
    ps:{ headline:'هند وګټله!', sub:'لومړۍ T20 لوبه | لکنو', result:'هند د ۲۵ منډو په توپیر وګټله', a:'هند', b:'ویسټ انډیز',
         potmTitle:'د لوبې ستوری', potmName:'ویرات کوهلي', potmLine:'۸۲ منډې (۵۰ توپونه)', brand1:'کرکټ', brand2:'پښتو خبرونه' },
    en:{ headline:'INDIA WIN!', sub:'1st T20 Match | Lucknow', result:'India won by 25 runs', a:'India', b:'West Indies',
         potmTitle:'Player of the Match', potmName:'Virat Kohli', potmLine:'82 runs (50 balls)', brand1:'CRICKET', brand2:'News' }
  };
  const sample=(lang)=>{ const L=App.LANGS[lang]?lang:'ps', t=TEXT[L], d=App.LANGS[L]; return {
    lang:L, size:'1080x1080', font:d.font, dir:d.dir, digits:d.digits, textScale:100,
    headline:t.headline, sub:t.sub, result:t.result,
    show:{ sub:true, result:true, card:true, trophy:true, confetti:true },
    a:{ name:t.a, short:'IND', color:'#1a56c4', flag:'india', img:null, score:'186/5', overs:'20' },
    b:{ name:t.b, short:'WI', color:'#7a1537', flag:'mono', img:null, score:'161/9', overs:'20' },
    winner:'a',
    potm:{ show:true, title:t.potmTitle, name:t.potmName, line:t.potmLine, player:null, size:78, x:0, flip:false },
    brand:{ ...App.brandDefaults(), l1:t.brand1, l2:t.brand2 },
    bg:App.bgDefaults(35),
    scale:'2'
  }; };
  const COLORS=['#ffd400','#ff4d6d','#4ea2ff','#3ddc84','#ff9f1c','#ffffff'];
  function confetti(el, seed){
    el.innerHTML=''; let s=seed||7; const rnd=()=>{ s=(s*9301+49297)%233280; return s/233280; };
    for(let i=0;i<46;i++){ const p=document.createElement('span');
      p.style.left=(rnd()*100).toFixed(1)+'%'; p.style.top=(rnd()*70).toFixed(1)+'%';
      p.style.background=COLORS[i%COLORS.length]; p.style.transform=`rotate(${Math.round(rnd()*360)}deg) scale(${(0.6+rnd()).toFixed(2)})`;
      p.style.opacity=(0.5+rnd()*0.5).toFixed(2); el.appendChild(p); }
  }
  const row = k => `<div class="trow ${k}"><div class="flagbox"></div><span class="nm" dir="auto"></span><span class="sc"></span><span class="ov"></span><i class="cup">${I('trophy')}</i></div>`;
  App.register({
    id:'victory', tab:'Victory', sample,
    size: S => App.parseSize(S.size),
    filename: S => `victory-${S[S.winner==='b'?'b':'a'].name}`,
    template: `
<div class="poster vc">
  ${App.posterBase()}
  <div class="splash a"></div><div class="splash b"></div>
  <div class="confetti"></div>
  <div class="potm"><div class="img"></div></div>
  <div class="content">
    <div class="top">
      <i class="trophy">${I('trophy')}</i>
      <div class="brush headline">${B()}<span class="t" dir="auto"></span></div>
      <div class="sub" dir="auto"></div>
      <div class="result" dir="auto"></div>
    </div>
    <div class="card">${row('a')}${row('b')}</div>
  </div>
  <div class="potmcard"><div class="ttl" dir="auto"></div><div class="nm" dir="auto"></div><div class="ln" dir="auto"></div></div>
  ${App.brandHTML()}
</div>`,
    groups:[
      App.posterGroup(),
      { legend:'Headline', fields:[
        {k:'headline', label:'Headline'},
        {k:'sub', label:'Subtitle'}, {k:'show.sub', label:'', type:'check', text:'Show subtitle'},
        {k:'result', label:'Result line'}, {k:'show.result', label:'', type:'check', text:'Show result line'},
        {k:'show.trophy', label:'', type:'check', text:'Show trophy icon'},
        {k:'show.confetti', label:'', type:'check', text:'Show confetti'} ]},
      { legend:'Team A', fields:[ ...App.teamFields('a'), {label:'Score / overs', pair:[{k:'a.score', placeholder:'186/5', label:'Team A score'},{k:'a.overs', placeholder:'20', label:'Team A overs'}]} ]},
      { legend:'Team B', fields:[ ...App.teamFields('b'), {label:'Score / overs', pair:[{k:'b.score', placeholder:'161/9', label:'Team B score'},{k:'b.overs', placeholder:'20', label:'Team B overs'}]} ]},
      { legend:'Scorecard', toggle:'show.card', fields:[ {k:'winner', label:'Winner', type:'select', options:[['a','Team A'],['b','Team B']]},
        {type:'hint', text:'The winner is listed first with a trophy and a highlighted score. Paint splashes use the winner\'s colour.'} ]},
      { legend:'Player of the match', toggle:'potm.show', fields:[
        {k:'potm.title', label:'Title'}, {k:'potm.name', label:'Name'}, {k:'potm.line', label:'Figures'}, ...App.playerFields('potm', 'Cutout') ]},
      App.brandGroup(),
      App.bgGroup()
    ],
    render(S, root){
      const {q, orient}=App.posterSetup(S, root); const T=App.truthy, D=s=>App.digits(s, S.digits);
      const win = S.winner==='b'?'b':'a', lose = win==='a'?'b':'a';
      App.splash(q('.splash.a'), S[win].color, T(S.bg.splash)); App.splash(q('.splash.b'), S[win].color, T(S.bg.splash));
      q('.confetti').hidden=!T(S.show.confetti); if(T(S.show.confetti)) confetti(q('.confetti'), 11);
      q('.trophy').hidden=!T(S.show.trophy);
      App.setBrush(q('.headline'), S.headline, S.bg.accent, '#111111');
      q('.sub').textContent=S.sub; q('.sub').hidden=!(T(S.show.sub) && S.sub);
      q('.result').textContent=D(S.result); q('.result').hidden=!(T(S.show.result) && S.result);
      const card=q('.card'); card.hidden=!T(S.show.card);
      [win,lose].forEach((k,i)=>{ const r=card.querySelectorAll('.trow')[i]; const t=S[k]; r.classList.toggle('win', i===0);
        App.renderFlag(r.querySelector('.flagbox'), t); r.querySelector('.nm').textContent=t.name; r.querySelector('.sc').textContent=D(t.score);
        r.querySelector('.ov').textContent=t.overs?'('+D(t.overs)+')':''; });
      const pm=S.potm, pmOn=T(pm.show);
      q('.potm').hidden=!(pmOn && pm.player); App.renderPlayer(q('.potm .img'), pm, orient);
      const pc=q('.potmcard'); pc.hidden=!(pmOn && (pm.name||pm.line));
      pc.querySelector('.ttl').textContent=pm.title||''; pc.querySelector('.nm').textContent=pm.name||''; pc.querySelector('.ln').textContent=D(pm.line||'');
      App.renderBrand(q('.brand'), S);
    }
  });
})();
