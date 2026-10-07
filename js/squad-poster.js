/* Squad announcement: team header, numbered player cards with roles and C / WK tags, optional captain cutout. */
(function(){
  const B=App.brushSvg;
  const TEXT={
    ps:{ headline:'د هند لوبډله', sub:'د ویسټ انډیز پر وړاندې د T20 لړۍ', badge:'۱۵ کسیزه لوبډله', team:'هند', brand1:'کرکټ', brand2:'پښتو خبرونه',
         players:[
          'روهیت شرما | بیټسمن (c)','شبمن ګیل | بیټسمن','ویرات کوهلي | بیټسمن','سوریا کمار یادو | بیټسمن','ریشب پنت | ویکټ کیپر (wk)',
          'هاردیک پانډیا | آل راونډر','رویندرا جدیجا | آل راونډر','اکشر پټیل | آل راونډر','کلدیپ یادو | بالر','جسپریت بمراه | بالر',
          'محمد سراج | بالر','ارشدیپ سینګ | بالر','شریاس ایر | بیټسمن','سنجو سیمسن | ویکټ کیپر (wk)','یوزویندرا چهل | بالر' ] },
    en:{ headline:'INDIA SQUAD', sub:'T20 Series vs West Indies', badge:'15-member squad', team:'India', brand1:'CRICKET', brand2:'News',
         players:[
          'Rohit Sharma | Batter (c)','Shubman Gill | Batter','Virat Kohli | Batter','Suryakumar Yadav | Batter','Rishabh Pant | Wicket-keeper (wk)',
          'Hardik Pandya | All-rounder','Ravindra Jadeja | All-rounder','Axar Patel | All-rounder','Kuldeep Yadav | Bowler','Jasprit Bumrah | Bowler',
          'Mohammed Siraj | Bowler','Arshdeep Singh | Bowler','Shreyas Iyer | Batter','Sanju Samson | Wicket-keeper (wk)','Yuzvendra Chahal | Bowler' ] }
  };
  const sample=(lang)=>{ const L=App.LANGS[lang]?lang:'ps', t=TEXT[L], d=App.LANGS[L]; return {
    lang:L, size:'1080x1350', font:d.font, dir:d.dir, digits:d.digits, textScale:100,
    headline:t.headline, sub:t.sub, badge:t.badge,
    show:{ sub:true, badge:true, numbers:true, roles:true },
    team:{ name:t.team, short:'IND', color:'#1a56c4', flag:'india', img:null },
    hero:{ show:true, player:null, size:70, x:0, flip:false },
    players:t.players.join('\n'),
    cols:'auto', labels:{ c:'C', wk:'WK' },
    brand:{ ...App.brandDefaults(), l1:t.brand1, l2:t.brand2 },
    bg:App.bgDefaults(40),
    scale:'2'
  }; };
  function parsePlayers(txt){
    return String(txt||'').split(/\n+/).map(l=>l.trim()).filter(Boolean).map(line=>{
      const tags=new Set();
      line=line.replace(/\((c|wk|c\/wk|wk\/c)\)/gi,(m,t)=>{ t=t.toLowerCase(); if(t.includes('c')) tags.add('c'); if(t.includes('wk')) tags.add('wk'); return ''; });
      const parts=line.split('|').map(s=>s.trim());
      return { name:parts[0]||'', role:parts[1]||'', tags:[...tags] };
    });
  }
  App.register({
    id:'squad', tab:'Squad', sample,
    size: S => App.parseSize(S.size),
    filename: S => `squad-${S.team.name}`,
    template: `
<div class="poster sq">
  ${App.posterBase()}
  <div class="splash b"></div>
  <div class="hero"></div>
  <div class="content">
    <div class="head">
      <div class="flagbox"></div>
      <div class="titles">
        <div class="brush headline">${B()}<span class="t" dir="auto"></span></div>
        <div class="sub" dir="auto"></div>
        <div class="brush badge">${B()}<span class="t" dir="auto"></span></div>
      </div>
    </div>
    <div class="grid"></div>
    <div class="foot"><div class="logo"></div><span class="l1" dir="auto"></span><span class="l2" dir="auto"></span></div>
  </div>
</div>`,
    groups:[
      App.posterGroup(),
      { legend:'Headline', fields:[
        {k:'headline', label:'Headline'},
        {k:'sub', label:'Subtitle'}, {k:'show.sub', label:'', type:'check', text:'Show subtitle'},
        {k:'badge', label:'Badge'}, {k:'bg.badgeColor', label:'Badge colour', type:'color'}, {k:'show.badge', label:'', type:'check', text:'Show badge'} ]},
      { legend:'Team', fields:[ ...App.teamFields('team') ]},
      { legend:'Players', wide:true, fields:[
        {k:'players', label:'One per line', type:'textarea', rows:10, placeholder:'Name | Role (c)'},
        {k:'cols', label:'Columns', type:'select', options:[['auto','Automatic'],['1','1'],['2','2'],['3','3']]},
        {label:'Tag labels', pair:[{k:'labels.c', label:'Captain tag', placeholder:'C'},{k:'labels.wk', label:'Keeper tag', placeholder:'WK'}]},
        {k:'show.numbers', label:'', type:'check', text:'Show numbers'},
        {k:'show.roles', label:'', type:'check', text:'Show roles'},
        {type:'hint', text:'Format each line as "Name | Role". Add (c) for the captain and (wk) for the wicket-keeper, or (c/wk) for both.'} ]},
      { legend:'Captain cutout', toggle:'hero.show', fields:[ ...App.playerFields('hero', 'Image') ]},
      App.brandGroup(),
      App.bgGroup()
    ],
    render(S, root){
      const {q, orient}=App.posterSetup(S, root); const T=App.truthy, D=s=>App.digits(s, S.digits);
      App.splash(q('.splash.b'), S.team.color, T(S.bg.splash));
      const heroOn = T(S.hero.show) && !!S.hero.player;
      App.renderPlayer(q('.hero'), S.hero, orient); q('.hero').hidden=!heroOn;
      App.renderFlag(q('.head .flagbox'), S.team);
      App.setBrush(q('.headline'), S.headline, S.bg.accent, '#111111');
      q('.sub').textContent=S.sub; q('.sub').hidden=!(T(S.show.sub) && S.sub);
      App.setBrush(q('.badge'), T(S.show.badge)?S.badge:'', S.bg.badgeColor||'#d81f2a', '#ffffff');
      const list=parsePlayers(S.players); const grid=q('.grid'); grid.innerHTML='';
      const rows = orient==='landscape' ? 6 : 8;
      const cols = S.cols==='auto' ? Math.min(3, Math.max(1, Math.ceil(list.length/rows))) : Number(S.cols)||1;
      grid.style.setProperty('--cols', cols); grid.style.setProperty('--gw', heroOn ? '' : '100%');
      if(!heroOn) grid.style.width='100%'; else grid.style.width='';
      list.forEach((p,i)=>{
        const card=document.createElement('div'); card.className='card';
        const tags=p.tags.map(t=>`<span class="tag">${App.esc(t==='c'?(S.labels.c||'C'):(S.labels.wk||'WK'))}</span>`).join('');
        card.innerHTML=`${T(S.show.numbers)?`<span class="num">${D(i+1)}</span>`:''}<div class="ptxt"><div class="pname" dir="auto">${App.esc(p.name)}${tags}</div>${T(S.show.roles)&&p.role?`<div class="prole" dir="auto">${App.esc(p.role)}</div>`:''}</div>`;
        const n=card.querySelector('.num'); if(n){ n.style.background=S.team.color; n.style.color=App.textOn(S.team.color); }
        grid.appendChild(card);
      });
      const b=S.brand||{}; const foot=q('.foot'); foot.hidden=!T(b.show);
      foot.querySelector('.logo').style.backgroundImage=App.bgUrl(b.logo); foot.querySelector('.logo').hidden=!b.logo;
      foot.querySelector('.l1').textContent=b.l1||''; foot.querySelector('.l2').textContent=b.l2||'';
    }
  });
})();
