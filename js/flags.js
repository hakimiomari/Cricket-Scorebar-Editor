/* Flag renderer shared by every graphic. team = { flag, img, color, name } */
(function(){
  function chakra(){
    let s='<svg viewBox="-12 -12 24 24" xmlns="http://www.w3.org/2000/svg"><circle r="10.5" fill="none" stroke="#1d3f8a" stroke-width="1.6"/><circle r="1.6" fill="#1d3f8a"/>';
    for(let i=0;i<24;i++){ const a=i*Math.PI/12; s+=`<line x1="0" y1="0" x2="${(10*Math.cos(a)).toFixed(2)}" y2="${(10*Math.sin(a)).toFixed(2)}" stroke="#1d3f8a" stroke-width="0.8"/>`; }
    return s+'</svg>';
  }
  function star(cx,cy,R,r){ const pts=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5; const rad=i%2?r:R; pts.push((cx+rad*Math.cos(a)).toFixed(2)+','+(cy+rad*Math.sin(a)).toFixed(2)); } return pts.join(' '); }
  function crescent(){
    return `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg"><g transform="rotate(-25 45 30)"><circle cx="43" cy="30" r="17" fill="#fff"/><circle cx="49" cy="27" r="15" fill="#01411c"/></g><polygon points="${star(66,17,6.5,2.6)}" fill="#fff"/></svg>`;
  }
  App.renderFlag = function(el, team){
    el.innerHTML=''; team=team||{};
    const d=document.createElement('div'); d.className='flagfill';
    const mode = team.flag==='image' && !team.img ? 'mono' : (team.flag||'mono');
    switch(mode){
      case 'image': d.style.backgroundImage=`url("${team.img}")`; break;
      case 'india': d.classList.add('flag-india'); d.innerHTML=chakra(); break;
      case 'pakistan': d.classList.add('flag-pak'); d.innerHTML=crescent(); break;
      case 'afghanistan': d.classList.add('flag-afg'); break;
      case 'bangladesh': d.classList.add('flag-bd'); break;
      case 'england': d.classList.add('flag-eng'); break;
      default:
        d.classList.add('flag-mono');
        d.style.background=`linear-gradient(135deg, ${App.mix(team.color||'#444444',255,.18)}, ${App.mix(team.color||'#444444',0,.3)})`;
        d.style.color=App.textOn(team.color||'#444444');
        d.textContent=String(team.short||team.name||'').replace(/[^\p{L}\p{N}]/gu,'').slice(0,3).toUpperCase();
    }
    el.appendChild(d);
  };
})();
