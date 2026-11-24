const canvas = document.querySelector("#model");
const fallback = document.querySelector(".model-fallback");
const footer = document.querySelector(".model-foot");
const buttons = [...document.querySelectorAll("[data-zone]")];
const zones = [
  {title:"갈라졌다가 다시 만나는 길", text:"공연에서 익힌 대포·외줄·봉으로 이어진 공장 동선. 구간을 골라 발판 높이와 갈림길 확대", photo:"live-first", alt:"첫 대포에서 다음 착지 지점을 바라본 모습", includes:() => true},
  {title:"이동봉을 기다릴지, 아래로 갈지", text:"순환봉 기다리기, 하층 연속봉 타기, 대포로 고정 발판에 착지하기. 세 경로 모두 하차장에서 합류", photo:"live-conveyor", alt:"컨베이어 옆에서 본 하층 계단과 고정 착지대", includes:([a,b,start,end]) => start >= 8 && end <= 13},
  {title:"두 묘기의 순서를 뒤집은 반환교", text:"한쪽은 외줄에서 봉으로, 반대쪽은 봉에서 외줄로. 익숙한 순서를 골라 건넌 뒤 건너편에서 합류", photo:"live-return", alt:"반환교 선택 발판에서 본 양쪽 봉과 착지대", includes:([a,b]) => [a,b].every(([x,y,z]) => x >= 53 && x <= 82 && z <= -64 && z >= -77)},
  {title:"양쪽에서 접근하는 마지막 작업장", text:"중앙 설비 양쪽으로 흩어져 배선에 접근한 뒤 하나의 출구로 합류", photo:"live-exit", alt:"최종 작업장의 공유 배선과 중앙 출구", includes:([a,b,start]) => start >= 71}
];
function updatePanel(index) {
  const zone = zones[index];
  document.querySelector("#zone-detail h4").textContent = zone.title;
  document.querySelector("#zone-detail p").textContent = zone.text;
  const img = document.querySelector("#zone-image");
  img.src = "assets/" + zone.photo + ".webp";
  img.alt = zone.alt;
  img.parentElement.href = img.src;
  buttons.forEach((b,i) => b.setAttribute("aria-pressed",i === index));
}
function createViewer(data, ctx) {
  let lines, slabs, center, points, yaw, tilt, magnification;
  const project = ([x,y,z]) => {
    x -= center[0]; y -= center[1]; z -= center[2];
    const across = x*Math.cos(yaw) - z*Math.sin(yaw);
    const along = x*Math.sin(yaw) + z*Math.cos(yaw);
    return [across, along*Math.sin(tilt) - y*Math.cos(tilt), along*Math.cos(tilt)+y*Math.sin(tilt)];
  };
  function render() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.round(width*dpr), ph = Math.round(height*dpr);
    if (canvas.width !== pw || canvas.height !== ph) {canvas.width = pw; canvas.height = ph;}
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle = "#192622";ctx.fillRect(0,0,width,height);
    const projected = points.map(project);
    const min = [0,1].map(axis => Math.min(...projected.map(p => p[axis])));
    const max = [0,1].map(axis => Math.max(...projected.map(p => p[axis])));
    const scale = Math.min((width-56)/Math.max(10,max[0]-min[0]),(height-70)/Math.max(10,max[1]-min[1])) * magnification;
    const sx = width/2 - scale*(min[0]+max[0])/2;
    const sy = height/2 - scale*(min[1]+max[1])/2;
    const screen = p => {const [x,y,d] = project(p); return [sx+x*scale,sy+y*scale,d];};
    function stroke(a,b,color,weight) {
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]);
      ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.stroke();
    }
    const extent = Math.max(...points.map(p=>Math.max(Math.abs(p[0]-center[0]),Math.abs(p[2]-center[2]))));
    const step = extent>130?20:extent>30?8:2;
    const radius = Math.ceil(extent/step)*step + step*4;
    const ground = Math.min(...points.map(p=>p[1]))-3;
    for(let v=-radius;v<=radius;v+=step){
      stroke(screen([center[0]+v,ground,center[2]-radius]),screen([center[0]+v,ground,center[2]+radius]),"#31403a",.65);
      stroke(screen([center[0]-radius,ground,center[2]+v]),screen([center[0]+radius,ground,center[2]+v]),"#31403a",.65);
    }
    const faces=[];
    for(const [x,y,z,dx,dy,dz] of slabs){
      const corners=[[-1,-1],[-1,1],[1,1],[1,-1]];
      const top=corners.map(([a,b])=>screen([x+a*dx/2,y+dy/2,z+b*dz/2]));
      const bottom=corners.map(([a,b])=>screen([x+a*dx/2,y-dy/2,z+b*dz/2]));
      faces.push([top,"#9da99a"]);
      for(let j=0;j<4;j++){const k=(j+1)%4;faces.push([[top[j],bottom[j],bottom[k],top[k]],j%2?"#53675a":"#728370"]);}
    }
    const depth=poly=>poly.reduce((sum,p)=>sum+p[2],0)/poly.length;
    faces.sort((a,b)=>depth(a[0])-depth(b[0]));
    for(const [poly,color] of faces){
      ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle="#22332a";ctx.lineWidth=.55;ctx.stroke();
    }
    ctx.lineCap="round";ctx.lineJoin="round";
    const coords = lines.map(([a,b])=>[screen(a),screen(b)]);
    coords.forEach(([a,b])=>stroke(a,b,"#402f26",4.4));
    coords.forEach(([a,b])=>stroke(a,b,"#ff8469",2.35));
    for(const [a] of coords){ctx.beginPath();ctx.arc(a[0],a[1],1.55,0,Math.PI*2);ctx.fillStyle="#ffe3bb";ctx.fill();}
    const ordered=[...lines].sort((a,b)=>a[2]-b[2] || a[3]-b[3]);
    const tags=[[ordered[0][0],"진입"],[ordered.at(-1)[1],"합류"]];
    tags.forEach(([pt,label],i)=>{
      if(lines===data.lines && i===1)label="출구";
      const [px,py]=screen(pt);ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fillStyle="#ffe8bf";ctx.fill();
      const lx=Math.min(width-42,Math.max(3,px-18)),ly=Math.max(4,Math.min(height-22,py+(i?8:-28)));
      ctx.fillStyle="#eff2e8";ctx.fillRect(lx,ly,37,19);ctx.fillStyle="#263529";ctx.font="bold 12px Pretendard, sans-serif";ctx.textAlign="center";ctx.fillText(label,lx+18.5,ly+13.5);
    });
  }
  function select(index) {
    lines=index?data.lines.filter(zones[index].includes):data.lines;
    points=lines.flatMap(([a,b])=>[a,b]);
    const min=[0,1,2].map(a=>Math.min(...points.map(p=>p[a])));
    const max=[0,1,2].map(a=>Math.max(...points.map(p=>p[a])));
    center=min.map((n,i)=>(n+max[i])/2);
    slabs=data.slabs.filter(([x,y,z])=>x>=min[0]-5&&x<=max[0]+5&&z>=min[2]-5&&z<=max[2]+5&&y>=min[1]-8&&y<=max[1]+7);
    yaw=index===1?.68:index===2?-.45:.25;tilt=.67;magnification=1;
    canvas.dataset.region=String(index); render();
  }
  let active=1;
  buttons.forEach((b,i)=>b.addEventListener("click",()=>{active=i;updatePanel(i);select(i);}));
  document.querySelector("#home-view").onclick=()=>select(active);
  document.querySelector("#top-view").onclick=()=>{yaw=0;tilt=Math.PI/2;render();};
  document.querySelector("#turn").onclick=()=>{yaw+=Math.PI/6;render();};
  function rotate(dx,dy){yaw+=dx;tilt=Math.min(Math.PI/2,Math.max(.12,tilt+dy));render();}
  let drag=null;
  canvas.addEventListener("pointerdown",e=>{if(!e.isPrimary)return;drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!drag||!e.isPrimary)return;rotate((e.clientX-drag[0])*.012,(drag[1]-e.clientY)*.009);drag=[e.clientX,e.clientY];});
  canvas.addEventListener("lostpointercapture",()=>{drag=null;});
  canvas.addEventListener("keydown",e=>{
    const movements={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]};
    if(movements[e.key]){e.preventDefault();rotate(...movements[e.key]);}
  });
  canvas.hidden=false;fallback.hidden=true;footer.hidden=false;select(active);updatePanel(active);
  new ResizeObserver(render).observe(canvas);
}
try{
  const response=await fetch("assets/escape-spatial.json");
  if(!response.ok)throw new Error("model data missing");
  const data=await response.json();
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("canvas unavailable");
  createViewer(data,ctx);
}catch{
  canvas.hidden=true;fallback.hidden=false;footer.hidden=true;
  document.querySelector(".region-buttons").hidden=true;
  document.querySelector("#zone-detail h4").textContent="전체 동선 기획도";
  document.querySelector("#zone-detail p").textContent="전체 기획도에서 갈림길과 합류 지점 확인";
}
