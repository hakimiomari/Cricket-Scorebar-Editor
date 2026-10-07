/* Match announcement poster: two players, flags, VS, match details, promo lines, call to action, brand and sticker. */
(function(){
  const I=App.icon, B=App.brushSvg;
  const TEXT={
    ps:{ headline:'د کرکټ شوقیانو لپاره', sub:'د هند او ویسټ انډیز ترمنځ د T20 لړۍ', badge:'لومړۍ T20 لوبه',
         a:'هند', b:'ویسټ انډیز', time:'د ماښام ۶:۰۰', venue:'لکنو', date:'درېشنبه، ۶ اکتوبر ۲۰۲۶',
         l1:'د تازه خبرونو، تحلیلونو او د لوبې تازه معلوماتو لپاره', l2:'زموږ سره پاتې شئ او په تبصرو کې خپل نظر ورکړئ!',
         share:'له دوستانو سره یې شریک کړئ', comment:'تبصره وکړئ', like:'لایک وکړئ', subscribe:'سبسکرایب کړئ',
         brand1:'کرکټ', brand2:'پښتو خبرونه', sticker:'تل له موږ سره اوسئ ♡' },
    en:{ headline:'FOR CRICKET FANS', sub:'India vs West Indies T20 Series', badge:'1st T20 Match',
         a:'India', b:'West Indies', time:'6:00 PM', venue:'Lucknow', date:'Tuesday, 6 October 2026',
         l1:'For the latest news, analysis and live match updates', l2:'Stay with us and share your views in the comments!',
         share:'Share with friends', comment:'Comment', like:'Like', subscribe:'Subscribe',
         brand1:'CRICKET', brand2:'News', sticker:'Stay with us ♡' }
  };
  const sample=(lang)=>{ const L=App.LANGS[lang]?lang:'ps', t=TEXT[L], d=App.LANGS[L]; return {
    lang:L, size:'1536x1024', font:d.font, dir:d.dir, digits:d.digits, textScale:100,
    headline:t.headline, sub:t.sub, badge:t.badge,
    show:{ sub:true, badge:true, vs:true, info:true, promo:true, cta:true, sticker:true },
    a:{ name:t.a, short:'IND', color:'#1a56c4', flag:'india', img:null, player:null, size:88, x:0, flip:false },
    b:{ name:t.b, short:'WI', color:'#7a1537', flag:'mono', img:null, player:null, size:88, x:0, flip:false },
    vs:'VS',
    info:{ time:t.time, venue:t.venue, date:t.date },
    promo:{ l1:t.l1, l2:t.l2 },
    cta:{ share:t.share, comment:t.comment, like:t.like, sub:t.subscribe },
    brand:{ ...App.brandDefaults(), l1:t.brand1, l2:t.brand2 },
    sticker:t.sticker,
    bg:App.bgDefaults(30),
    scale:'2'
  }; };

  App.register({
    id:'match', tab:'Match poster', sample,
    size: S => App.parseSize(S.size),
    filename: S => `match-poster-${S.a.name}-vs-${S.b.name}`,
    template: `
<div class="poster mp">
  ${App.posterBase()}
  <div class="splash a"></div><div class="splash b"></div>
  <div class="player a"></div><div class="player b"></div>
  <div class="content">
    <div class="top">
      <div class="brush headline">${B()}<span class="t" dir="auto"></span></div>
      <div class="sub" dir="auto"></div>
      <div class="brush badge">${B()}<span class="t" dir="auto"></span></div>
    </div>
    <div class="grp">
      <div class="middle">
        <div class="teamcard a"><div class="flagbox"></div><div class="tname" dir="auto"></div></div>
        <div class="vs lat"></div>
        <div class="teamcard b"><div class="flagbox"></div><div class="tname" dir="auto"></div></div>
      </div>
      <div class="info">
        <div class="pill time"><i>${I('clock')}</i><span dir="auto"></span></div>
        <div class="pill venue"><i>${I('pin')}</i><span dir="auto"></span></div>
        <div class="pill date"><i>${I('calendar')}</i><span dir="auto"></span></div>
      </div>
      <div class="promo">
        <div class="line l1"><i>${I('fire')}</i><span dir="auto"></span></div>
        <div class="line l2"><i>${I('chat')}</i><span dir="auto"></span></div>
      </div>
      <div class="cta">
        <div class="item share"><i>${I('share')}</i><span dir="auto"></span></div>
        <div class="item comment"><i>${I('comment')}</i><span dir="auto"></span></div>
        <div class="item like"><i>${I('like')}</i><span dir="auto"></span></div>
        <div class="item subscribe"><i>${I('bell')}</i><span dir="auto"></span></div>
      </div>
    </div>
  </div>
  ${App.brandHTML()}
  <div class="sticker"><span dir="auto"></span></div>
</div>`,
    groups:[
      App.posterGroup(),
      { legend:'Headline', fields:[
        {k:'headline', label:'Headline'},
        {k:'sub', label:'Subtitle'}, {k:'show.sub', label:'', type:'check', text:'Show subtitle'},
        {k:'badge', label:'Badge'}, {k:'bg.badgeColor', label:'Badge colour', type:'color'}, {k:'show.badge', label:'', type:'check', text:'Show badge'},
        {k:'vs', label:'Centre text', placeholder:'VS'}, {k:'show.vs', label:'', type:'check', text:'Show centre text'},
        {type:'hint', text:'The headline brush uses the accent colour from the Background panel.'} ]},
      { legend:'Left team', fields:[ ...App.teamFields('a'), ...App.playerFields('a') ]},
      { legend:'Right team', fields:[ ...App.teamFields('b'), ...App.playerFields('b') ]},
      { legend:'Match details', toggle:'show.info', fields:[ {k:'info.time', label:'Time'}, {k:'info.venue', label:'Venue'}, {k:'info.date', label:'Date'},
        {type:'hint', text:'Leave a field empty to drop that pill.'} ]},
      { legend:'Promo lines', toggle:'show.promo', fields:[ {k:'promo.l1', label:'Line 1'}, {k:'promo.l2', label:'Line 2'} ]},
      { legend:'Call to action', toggle:'show.cta', fields:[ {k:'cta.share', label:'Share'}, {k:'cta.comment', label:'Comment'}, {k:'cta.like', label:'Like'}, {k:'cta.sub', label:'Subscribe'} ]},
      App.brandGroup(),
      { legend:'Corner sticker', toggle:'show.sticker', fields:[ {k:'sticker', label:'Text'} ]},
      App.bgGroup()
    ],
    render(S, root){
      const {q, orient}=App.posterSetup(S, root); const T=App.truthy, D=s=>App.digits(s, S.digits);
      ['a','b'].forEach(k=>{
        const t=S[k];
        App.splash(q('.splash.'+k), t.color, T(S.bg.splash));
        App.renderPlayer(q('.player.'+k), t, orient);
        const card=q('.teamcard.'+k); App.renderFlag(card.querySelector('.flagbox'), t); App.teamName(card.querySelector('.tname'), t);
      });
      App.setBrush(q('.headline'), S.headline, S.bg.accent, '#111111');
      q('.sub').textContent=S.sub; q('.sub').hidden=!(T(S.show.sub) && S.sub);
      App.setBrush(q('.badge'), T(S.show.badge)?S.badge:'', S.bg.badgeColor||'#d81f2a', '#ffffff');
      q('.vs').textContent=S.vs; q('.vs').hidden=!(T(S.show.vs) && S.vs);
      q('.info').hidden=!T(S.show.info);
      ['time','venue','date'].forEach(k=>{ const p=q('.pill.'+k); p.querySelector('span').textContent=D(S.info[k]); p.hidden=!String(S.info[k]||'').trim(); });
      q('.promo').hidden=!T(S.show.promo);
      ['l1','l2'].forEach(k=>{ const l=q('.promo .'+k); l.querySelector('span').textContent=S.promo[k]; l.hidden=!String(S.promo[k]||'').trim(); });
      q('.cta').hidden=!T(S.show.cta);
      ['share','comment','like','sub'].forEach(k=>{ const it=q('.cta .'+(k==='sub'?'subscribe':k)); it.querySelector('span').textContent=S.cta[k]; it.hidden=!String(S.cta[k]||'').trim(); });
      App.renderBrand(q('.brand'), S);
      q('.sticker').hidden=!(T(S.show.sticker) && S.sticker); q('.sticker span').textContent=S.sticker;
    }
  });
})();
