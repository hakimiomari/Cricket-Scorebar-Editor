/* Broadcast scorebar (1200 px wide, chroma-key or transparent export). */
(function(){
  const arrow='<span class="arrow"><svg viewBox="0 0 16 16"><path d="M2 1 L14 8 L2 15 Z" fill="#10325a"/></svg></span>';
  const sample=()=>({
    a:{ name:'IND', score:'128-1', overs:'15.2', color:'#1b7fb5', flag:'india', img:null },
    b:{ name:'WI', color:'#8a1538', flag:'mono', img:null },
    showFlags:false,
    crr:{ show:true, label:'CURRENT RUN RATE', value:'8.35' },
    req:{ show:false, label:'NEED', value:'152 OFF 29' },
    bat:[ {name:'KOHLI', runs:'41', balls:'29'}, {name:'RAHANE', runs:'40', balls:'34'} ],
    striker:'1',
    bowl:{ show:true, name:'RUSSELL', fig:'0-23', overs:'2.2', label:'THIS OVER', over:'0 1' },
    strip:{ show:false, l:'INDIA vs WEST INDIES', c:'INDIA NEED 152 RUNS TO WIN', r:'T20I' },
    bg:'#1bd91b', bgCustom:'#1bd91b', scale:'2'
  });

  App.register({
    id:'scorebar', tab:'Scorebar', pad:18,
    sample,
    size: ()=>({ w:1200, h:null }),
    exportBg: S => { const bg=S.bg==='custom'?S.bgCustom:S.bg; return bg==='transparent'?null:bg; },
    stageBg: S => { const bg=S.bg==='custom'?S.bgCustom:S.bg; return bg==='transparent'?null:bg; },
    filename: S => `scorebar-${(S.a.name||'A').toLowerCase()}-vs-${(S.b.name||'B').toLowerCase()}`,
    onImage: (k,S) => { if(k==='a.img'||k==='b.img') S.showFlags=true; },
    afterFill: (S, ed) => { ed.querySelector('[data-k="bgCustom"]').disabled = S.bg!=='custom'; },
    template: `
<div class="bar">
  <div class="main">
    <div class="seg team"><div class="bg teamBg"></div>
      <div class="in">
        <div class="flags"><div class="flagframe flagB"></div><div class="flagframe flagA"></div></div>
        <span class="opp"><span class="nameB"></span> v</span>
        <span class="box"><span class="bt nameA"></span><span class="scoreA"></span></span>
        <span class="ov oversA"></span>
      </div>
      <div class="in line2">
        <span class="crrWrap"><span class="crrLabel"></span><b class="crrVal"></b></span>
        <span class="sep">|</span>
        <span class="reqWrap"><span class="reqLabel"></span><b class="reqVal"></b></span>
      </div>
    </div>
    <div class="seg batters">
      <div class="brow b0">${arrow}<span class="bn"></span><span class="br"></span><span class="bb"></span></div>
      <div class="brow b1">${arrow}<span class="bn"></span><span class="br"></span><span class="bb"></span></div>
    </div>
    <div class="seg bowler">
      <div class="brow"><span class="bn bowlName"></span><span class="br bowlFig"></span><span class="bb bowlOv"></span></div>
      <div class="brow"><span class="bn overLabel"></span><span class="balls"></span></div>
    </div>
  </div>
  <div class="bottom strip"><div class="l"></div><div class="c"></div><div class="r"></div></div>
</div>`,
    groups:[
      { legend:'Batting team', fields:[
        {k:'a.name', label:'Short name'},
        {label:'Score / overs', pair:[{k:'a.score', placeholder:'128-1', label:'Score'},{k:'a.overs', placeholder:'15.2', label:'Overs'}]},
        {k:'a.color', label:'Block colour', type:'color'},
        {k:'a.flag', label:'Flag', type:'select', options:App.FLAG_OPTIONS},
        {k:'a.img', label:'Upload flag', type:'image'} ]},
      { legend:'Bowling team', fields:[
        {k:'b.name', label:'Short name'},
        {k:'b.flag', label:'Flag', type:'select', options:App.FLAG_OPTIONS},
        {k:'b.img', label:'Upload flag', type:'image'},
        {k:'b.color', label:'Initials colour', type:'color'},
        {k:'showFlags', label:'Flags', type:'check', text:'Show flags in the bar'} ]},
      { legend:'Second line', fields:[
        {k:'crr.show', label:'Run rate', type:'check', text:'Show current run rate'},
        {label:'Label / value', pair:[{k:'crr.label', label:'Run rate label'},{k:'crr.value', placeholder:'8.35', label:'Run rate value'}]},
        {k:'req.show', label:'Required', type:'check', text:'Show runs required'},
        {label:'Label / value', pair:[{k:'req.label', label:'Required label'},{k:'req.value', placeholder:'152 OFF 29', label:'Required value'}]},
        {type:'hint', text:'Turn both off to leave the second line empty.'} ]},
      { legend:'Batters', fields:[
        {k:'bat.0.name', label:'Batter 1'},
        {label:'Runs / balls', pair:[{k:'bat.0.runs', label:'Batter 1 runs'},{k:'bat.0.balls', label:'Batter 1 balls'}]},
        {k:'bat.1.name', label:'Batter 2'},
        {label:'Runs / balls', pair:[{k:'bat.1.runs', label:'Batter 2 runs'},{k:'bat.1.balls', label:'Batter 2 balls'}]},
        {k:'striker', label:'On strike', type:'select', options:[['0','Batter 1'],['1','Batter 2']]} ]},
      { legend:'Bowler panel', toggle:'bowl.show', fields:[
        {k:'bowl.name', label:'Bowler'},
        {label:'Figures / overs', pair:[{k:'bowl.fig', placeholder:'0-23', label:'Bowler figures'},{k:'bowl.overs', placeholder:'2.2', label:'Bowler overs'}]},
        {k:'bowl.label', label:'Over label'},
        {k:'bowl.over', label:'Balls', placeholder:'0 1 4 W wd 6'},
        {type:'hint', text:'Type the balls separated by spaces: 0 or . for a dot, W for a wicket, wd, nb, lb, 1–6.'} ]},
      { legend:'Bottom strip', toggle:'strip.show', fields:[
        {k:'strip.l', label:'Left'},{k:'strip.c', label:'Centre'},{k:'strip.r', label:'Right'} ]},
      { legend:'Background', fields:[
        {k:'bg', label:'Background', type:'select', options:[['#1bd91b','Green screen'],['#0000ff','Blue screen'],['#000000','Black'],['transparent','Transparent (PNG)'],['custom','Custom colour']]},
        {k:'bgCustom', label:'Custom colour', type:'color'},
        {type:'hint', text:'The export adds an 18 px margin so the drop shadow is not clipped (1× is 1236 px wide).'} ]}
    ],
    render(S, root){
      const q=s=>root.querySelector(s); const T=App.truthy; const c=S.a.color;
      q('.teamBg').style.background=`linear-gradient(${App.mix(c,255,.12)}, ${App.mix(c,0,.2)})`;
      q('.nameA').textContent=S.a.name; q('.scoreA').textContent=S.a.score; q('.oversA').textContent=S.a.overs; q('.nameB').textContent=S.b.name;
      q('.flags').hidden=!T(S.showFlags); App.renderFlag(q('.flagA'), S.a); App.renderFlag(q('.flagB'), S.b);
      const cs=T(S.crr.show), rs=T(S.req.show);
      q('.crrWrap').hidden=!cs; q('.reqWrap').hidden=!rs; q('.sep').hidden=!(cs&&rs); q('.line2').hidden=!(cs||rs);
      q('.crrLabel').textContent=S.crr.label; q('.crrVal').textContent=S.crr.value; q('.reqLabel').textContent=S.req.label; q('.reqVal').textContent=S.req.value;
      S.bat.forEach((p,i)=>{ const r=q('.b'+i); r.classList.toggle('on', String(i)===String(S.striker));
        r.querySelector('.bn').textContent=p.name; r.querySelector('.br').textContent=p.runs; r.querySelector('.bb').textContent=p.balls; });
      q('.seg.bowler').hidden=!T(S.bowl.show);
      q('.bowlName').textContent=S.bowl.name; q('.bowlFig').textContent=S.bowl.fig; q('.bowlOv').textContent=S.bowl.overs; q('.overLabel').textContent=S.bowl.label;
      App.renderBalls(q('.balls'), S.bowl.over);
      const strip=q('.strip'); strip.hidden=!T(S.strip.show); strip.style.background=`linear-gradient(${App.mix(c,0,.1)}, ${App.mix(c,0,.4)})`;
      const l=strip.querySelector('.l'); l.innerHTML='';
      String(S.strip.l||'').split(/(\bvs\b)/i).forEach(part=>{ if(/^vs$/i.test(part)){ const s=document.createElement('span'); s.className='vs'; s.textContent=part; l.appendChild(s); } else l.appendChild(document.createTextNode(part)); });
      strip.querySelector('.c').textContent=S.strip.c; strip.querySelector('.r').textContent=S.strip.r;
    }
  });
})();
