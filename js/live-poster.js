/* Live score update card for social posts: LIVE badge, both innings, status line, batters, bowler, this over. */
(function(){
  const I=App.icon;
  const TEXT={
    ps:{ live:'ژوندۍ', title:'لومړۍ T20 لوبه', series:'هند v ویسټ انډیز • لکنو', a:'هند', b:'ویسټ انډیز', note:'لا بیټنګ نه ده کړې',
         status:'هند په ۱۵.۲ اوورونو کې ۱۲۸/۱', crr:'اوسنی رن ریټ', rr:'اړین رن ریټ', bat:'بیټسمنان', bowl:'بالر', over:'دا اوور',
         bat1:'ویرات کوهلي', bat2:'اجنکیا رهانې', bowler:'اندرې رسل', foot:'د لوبې بشپړ تفصیل زموږ په پاڼه کې ولولئ', brand1:'کرکټ', brand2:'پښتو خبرونه' },
    en:{ live:'LIVE', title:'1st T20 Match', series:'India v West Indies • Lucknow', a:'India', b:'West Indies', note:'Yet to bat',
         status:'India 128/1 after 15.2 overs', crr:'Current RR', rr:'Required RR', bat:'Batters', bowl:'Bowler', over:'This over',
         bat1:'Virat Kohli', bat2:'Ajinkya Rahane', bowler:'Andre Russell', foot:'Full scorecard on our page', brand1:'CRICKET', brand2:'News' }
  };
  const sample=(lang)=>{ const L=App.LANGS[lang]?lang:'ps', t=TEXT[L], d=App.LANGS[L]; return {
    lang:L, size:'1080x1080', font:d.font, dir:d.dir, digits:d.digits, textScale:100,
    live:t.live, title:t.title, series:t.series,
    a:{ name:t.a, short:'IND', color:'#1a56c4', flag:'india', img:null, score:'128/1', overs:'15.2', note:'' },
    b:{ name:t.b, short:'WI', color:'#7a1537', flag:'mono', img:null, score:'', overs:'', note:t.note },
    batting:'a',
    status:t.status,
    show:{ status:true, rates:true, bat:true, bowl:true, over:true },
    rates:{ crrLabel:t.crr, crr:'8.35', rrLabel:t.rr, rr:'' },
    labels:{ bat:t.bat, bowl:t.bowl, over:t.over },
    bat:[ {name:t.bat1, runs:'41', balls:'29'}, {name:t.bat2, runs:'40', balls:'34'} ],
    striker:'1',
    bowl:{ name:t.bowler, fig:'0-23', overs:'2.2', over:'0 1 4 W wd 6' },
    footNote:t.foot,
    brand:{ ...App.brandDefaults(), l1:t.brand1, l2:t.brand2 },
    bg:App.bgDefaults(45),
    scale:'2'
  }; };
  const trow = k => `<div class="trow ${k}"><div class="flagbox"></div><span class="nm" dir="auto"></span><span class="note" dir="auto"></span><span class="sc"></span><span class="ov"></span></div>`;
  const prow = k => `<div class="prow ${k}"><i class="arrow">${I('play')}</i><span class="nm" dir="auto"></span><span class="r"></span><span class="b"></span></div>`;
  App.register({
    id:'live', tab:'Live score', sample,
    size: S => App.parseSize(S.size),
    filename: S => `live-${S.a.name}-vs-${S.b.name}`,
    template: `
<div class="poster lv">
  ${App.posterBase()}
  <div class="splash a"></div><div class="splash b"></div>
  <div class="content">
    <div class="topbar"><span class="livepill" dir="auto"></span><span class="title" dir="auto"></span><span class="series" dir="auto"></span></div>
    <div class="teams">${trow('a')}${trow('b')}</div>
    <div class="status" dir="auto"></div>
    <div class="rates"><span class="crr"><span class="lbl" dir="auto"></span><b></b></span><span class="rr"><span class="lbl" dir="auto"></span><b></b></span></div>
    <div class="panels">
      <div class="panel batp"><h4 dir="auto"></h4>${prow('b0')}${prow('b1')}</div>
      <div class="panel bowlp"><h4 dir="auto"></h4>${prow('bw')}<div class="over"><span class="lbl" dir="auto"></span><span class="balls"></span></div></div>
    </div>
    <div class="footnote" dir="auto"></div>
    <div class="foot"><div class="logo"></div><span class="l1" dir="auto"></span><span class="l2" dir="auto"></span></div>
  </div>
</div>`,
    groups:[
      App.posterGroup(),
      { legend:'Header', fields:[ {k:'live', label:'Live badge', placeholder:'LIVE'}, {k:'title', label:'Match title'}, {k:'series', label:'Series / venue'}, {k:'footNote', label:'Footer line'} ]},
      { legend:'Team A', fields:[ ...App.teamFields('a'),
        {label:'Score / overs', pair:[{k:'a.score', placeholder:'128/1', label:'Team A score'},{k:'a.overs', placeholder:'15.2', label:'Team A overs'}]},
        {k:'a.note', label:'Note', placeholder:'Yet to bat'} ]},
      { legend:'Team B', fields:[ ...App.teamFields('b'),
        {label:'Score / overs', pair:[{k:'b.score', placeholder:'', label:'Team B score'},{k:'b.overs', placeholder:'', label:'Team B overs'}]},
        {k:'b.note', label:'Note', placeholder:'Yet to bat'} ]},
      { legend:'Match situation', fields:[
        {k:'batting', label:'Batting now', type:'select', options:[['a','Team A'],['b','Team B'],['none','Innings break']]},
        {k:'status', label:'Status line'}, {k:'show.status', label:'', type:'check', text:'Show status line'},
        {k:'show.rates', label:'', type:'check', text:'Show run rates'},
        {label:'Current RR', pair:[{k:'rates.crrLabel', label:'Current run rate label'},{k:'rates.crr', placeholder:'8.35', label:'Current run rate'}]},
        {label:'Required RR', pair:[{k:'rates.rrLabel', label:'Required run rate label'},{k:'rates.rr', placeholder:'9.10', label:'Required run rate'}]},
        {type:'hint', text:'Leave a run-rate value empty to hide it.'} ]},
      { legend:'Batters', toggle:'show.bat', fields:[
        {k:'labels.bat', label:'Panel title'},
        {k:'bat.0.name', label:'Batter 1'}, {label:'Runs / balls', pair:[{k:'bat.0.runs', label:'Batter 1 runs'},{k:'bat.0.balls', label:'Batter 1 balls'}]},
        {k:'bat.1.name', label:'Batter 2'}, {label:'Runs / balls', pair:[{k:'bat.1.runs', label:'Batter 2 runs'},{k:'bat.1.balls', label:'Batter 2 balls'}]},
        {k:'striker', label:'On strike', type:'select', options:[['0','Batter 1'],['1','Batter 2']]} ]},
      { legend:'Bowler', toggle:'show.bowl', fields:[
        {k:'labels.bowl', label:'Panel title'},
        {k:'bowl.name', label:'Bowler'}, {label:'Figures / overs', pair:[{k:'bowl.fig', placeholder:'0-23', label:'Bowler figures'},{k:'bowl.overs', placeholder:'2.2', label:'Bowler overs'}]},
        {k:'show.over', label:'', type:'check', text:'Show this over'},
        {k:'labels.over', label:'Over label'}, {k:'bowl.over', label:'Balls', placeholder:'0 1 4 W wd 6'},
        {type:'hint', text:'Balls separated by spaces: 0 or . for a dot, W wicket, wd, nb, lb, 1–6.'} ]},
      App.brandGroup(),
      App.bgGroup()
    ],
    render(S, root){
      const {q, orient}=App.posterSetup(S, root, orient0(S)); const T=App.truthy, D=s=>App.digits(s, S.digits);
      App.splash(q('.splash.a'), S.a.color, T(S.bg.splash)); App.splash(q('.splash.b'), S.b.color, T(S.bg.splash));
      q('.livepill').textContent=S.live; q('.livepill').hidden=!S.live; q('.title').textContent=S.title; q('.series').textContent=S.series;
      ['a','b'].forEach(k=>{ const t=S[k], r=q('.trow.'+k); r.classList.toggle('bat', S.batting===k);
        App.renderFlag(r.querySelector('.flagbox'), t); r.querySelector('.nm').textContent=t.name;
        const hasScore=String(t.score||'').trim(); r.querySelector('.sc').textContent=D(t.score); r.querySelector('.sc').hidden=!hasScore;
        r.querySelector('.ov').textContent=t.overs?'('+D(t.overs)+')':''; r.querySelector('.ov').hidden=!(hasScore && t.overs);
        r.querySelector('.note').textContent=t.note||''; r.querySelector('.note').hidden=!(t.note && !hasScore); });
      q('.status').textContent=D(S.status); q('.status').hidden=!(T(S.show.status) && S.status);
      const rates=q('.rates'); const crrOn=!!String(S.rates.crr||'').trim(), rrOn=!!String(S.rates.rr||'').trim();
      rates.hidden=!(T(S.show.rates) && (crrOn||rrOn));
      q('.rates .crr').hidden=!crrOn; q('.rates .crr .lbl').textContent=S.rates.crrLabel; q('.rates .crr b').textContent=D(S.rates.crr);
      q('.rates .rr').hidden=!rrOn; q('.rates .rr .lbl').textContent=S.rates.rrLabel; q('.rates .rr b').textContent=D(S.rates.rr);
      const batOn=T(S.show.bat), bowlOn=T(S.show.bowl); q('.panels').hidden=!(batOn||bowlOn);
      q('.batp').hidden=!batOn; q('.batp h4').textContent=S.labels.bat;
      S.bat.forEach((p,i)=>{ const r=q('.prow.b'+i); r.classList.toggle('on', String(i)===String(S.striker)); r.hidden=!p.name;
        r.querySelector('.nm').textContent=p.name; r.querySelector('.r').textContent=D(p.runs); r.querySelector('.b').textContent=D(p.balls); });
      q('.bowlp').hidden=!bowlOn; q('.bowlp h4').textContent=S.labels.bowl;
      const bw=q('.prow.bw'); bw.querySelector('.nm').textContent=S.bowl.name; bw.querySelector('.r').textContent=D(S.bowl.fig); bw.querySelector('.b').textContent=D(S.bowl.overs);
      const over=q('.over'); over.hidden=!(T(S.show.over) && String(S.bowl.over||'').trim()); over.querySelector('.lbl').textContent=S.labels.over; App.renderBalls(over.querySelector('.balls'), S.bowl.over, 12);
      q('.footnote').textContent=S.footNote||''; q('.footnote').hidden=!String(S.footNote||'').trim();
      const b=S.brand||{}; const foot=q('.foot'); foot.hidden=!T(b.show);
      foot.querySelector('.logo').style.backgroundImage=App.bgUrl(b.logo); foot.querySelector('.logo').hidden=!b.logo;
      foot.querySelector('.l1').textContent=b.l1||''; foot.querySelector('.l2').textContent=b.l2||'';
    }
  });
  function orient0(S){ return App.orient(App.parseSize(S.size))==='landscape' ? .8 : 1; }
})();
