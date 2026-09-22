const pointInRect=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
const length=points=>points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);

function segmentHitsRect(a,b,r){
  if(pointInRect(a,r)||pointInRect(b,r))return true;
  const dx=b.x-a.x,dy=b.y-a.y,p=[-dx,dx,-dy,dy],q=[a.x-r.x,r.x+r.w-a.x,a.y-r.y,r.y+r.h-a.y];
  let low=0,high=1;
  for(let i=0;i<4;i++){
    if(p[i]===0){if(q[i]<0)return false;continue}
    const ratio=q[i]/p[i];
    if(p[i]<0)low=Math.max(low,ratio);else high=Math.min(high,ratio);
    if(low>high)return false;
  }
  return true;
}

const clear=(a,b,rects)=>!rects.some(rect=>segmentHitsRect(a,b,rect));
const collisions=(points,rects)=>points.slice(1).reduce((sum,p,i)=>sum+rects.filter(rect=>segmentHitsRect(points[i],p,rect)).length,0);
const distanceToSegment=(point,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1))),x=a.x+t*dx,y=a.y+t*dy;return Math.hypot(point.x-x,point.y-y);};
const dedupe=points=>points.filter((point,index)=>!index||point.x!==points[index-1].x||point.y!==points[index-1].y);
const compress=points=>points.filter((point,index)=>{if(!index||index===points.length-1)return true;const before=points[index-1],after=points[index+1];return !((before.x===point.x&&point.x===after.x)||(before.y===point.y&&point.y===after.y));});

class MinHeap{
  constructor(){this.items=[]}
  push(item){const items=this.items;items.push(item);let index=items.length-1;while(index){const parent=(index-1)>>1;if(items[parent].cost<=item.cost)break;items[index]=items[parent];index=parent;}items[index]=item;}
  pop(){const items=this.items;if(!items.length)return null;const first=items[0],last=items.pop();if(items.length){let index=0;while(true){let child=index*2+1;if(child>=items.length)break;if(child+1<items.length&&items[child+1].cost<items[child].cost)child++;if(items[child].cost>=last.cost)break;items[index]=items[child];index=child;}items[index]=last;}return first;}
}

function fallbackRoute(start,end,rects){
  const mx=(start.x+end.x)/2,my=(start.y+end.y)/2,candidates=[[start,{x:mx,y:start.y},{x:mx,y:end.y},end],[start,{x:start.x,y:my},{x:end.x,y:my},end]];
  for(const rect of rects)candidates.push([start,{x:start.x,y:rect.y-1},{x:end.x,y:rect.y-1},end],[start,{x:start.x,y:rect.y+rect.h+1},{x:end.x,y:rect.y+rect.h+1},end],[start,{x:rect.x-1,y:start.y},{x:rect.x-1,y:end.y},end],[start,{x:rect.x+rect.w+1,y:start.y},{x:rect.x+rect.w+1,y:end.y},end]);
  return compress(candidates.sort((a,b)=>(collisions(a,rects)*1e7+length(a)+a.length*18)-(collisions(b,rects)*1e7+length(b)+b.length*18))[0]);
}

function smartRoute(start,end,obstacles){
  const margin=26,rects=[...obstacles].sort((a,b)=>distanceToSegment({x:a.x+a.w/2,y:a.y+a.h/2},start,end)-distanceToSegment({x:b.x+b.w/2,y:b.y+b.h/2},start,end)).slice(0,24).map(rect=>({x:rect.x-margin,y:rect.y-margin,w:rect.w+margin*2,h:rect.h+margin*2}));
  if(clear(start,end,rects))return [start,end];
  const xs=[start.x,end.x],ys=[start.y,end.y];
  for(const rect of rects){xs.push(rect.x-1,rect.x+rect.w+1);ys.push(rect.y-1,rect.y+rect.h+1)}
  const ux=[...new Set(xs)].sort((a,b)=>a-b),uy=[...new Set(ys)].sort((a,b)=>a-b),nodes=[],byGrid=new Map();
  for(let yi=0;yi<uy.length;yi++)for(let xi=0;xi<ux.length;xi++){const point={x:ux[xi],y:uy[yi]},endpoint=(point.x===start.x&&point.y===start.y)||(point.x===end.x&&point.y===end.y);if(endpoint||!rects.some(rect=>pointInRect(point,rect))){const index=nodes.length;nodes.push(point);byGrid.set(`${xi}:${yi}`,index)}}
  const edges=nodes.map(()=>[]);
  for(let yi=0;yi<uy.length;yi++){let previous=null;for(let xi=0;xi<ux.length;xi++){const current=byGrid.get(`${xi}:${yi}`);if(current===undefined)continue;if(previous!==null&&clear(nodes[previous],nodes[current],rects)){const cost=Math.abs(nodes[current].x-nodes[previous].x);edges[previous].push([current,cost,'h']);edges[current].push([previous,cost,'h'])}previous=current}}
  for(let xi=0;xi<ux.length;xi++){let previous=null;for(let yi=0;yi<uy.length;yi++){const current=byGrid.get(`${xi}:${yi}`);if(current===undefined)continue;if(previous!==null&&clear(nodes[previous],nodes[current],rects)){const cost=Math.abs(nodes[current].y-nodes[previous].y);edges[previous].push([current,cost,'v']);edges[current].push([previous,cost,'v'])}previous=current}}
  const startIndex=nodes.findIndex(point=>point.x===start.x&&point.y===start.y),endIndex=nodes.findIndex(point=>point.x===end.x&&point.y===end.y),heap=new MinHeap(),distance=new Map(),previous=new Map();
  heap.push({index:startIndex,dir:'n',cost:0});distance.set(`${startIndex}:n`,0);
  let finish=null;
  while(heap.items.length){const current=heap.pop(),key=`${current.index}:${current.dir}`;if(current.cost!==distance.get(key))continue;if(current.index===endIndex){finish=key;break}for(const [next,segment,dir] of edges[current.index]){const bend=current.dir!=='n'&&current.dir!==dir?32:0,nextCost=current.cost+segment+bend,nextKey=`${next}:${dir}`;if(nextCost<(distance.get(nextKey)??Infinity)){distance.set(nextKey,nextCost);previous.set(nextKey,key);heap.push({index:next,dir,cost:nextCost})}}}
  if(!finish)return fallbackRoute(start,end,rects);
  const route=[];for(let key=finish;key;key=previous.get(key)){route.push(nodes[Number(key.split(':')[0])]);if(key===`${startIndex}:n`)break}
  const result=compress(route.reverse());
  if(result[0]?.x!==start.x||result[0]?.y!==start.y)result.unshift(start);
  if(result.at(-1)?.x!==end.x||result.at(-1)?.y!==end.y)result.push(end);
  return compress(result);
}

export function routePoints(start,end,mode='straight',obstacles=[],controlPoints=[]){
  const controls=Array.isArray(controlPoints)?controlPoints.filter(point=>Number.isFinite(point?.x)&&Number.isFinite(point?.y)):[];
  if(mode==='straight')return [start,end];
  if(mode==='curve')return [start,...controls,end];
  if(mode==='smart'||mode==='smartCurve'){
    const anchors=mode==='smartCurve'?[start,...controls,end]:[start,end],result=[];
    for(let i=1;i<anchors.length;i++){const leg=smartRoute(anchors[i-1],anchors[i],obstacles);result.push(...(i>1?leg.slice(1):leg));}
    return mode==='smartCurve'?dedupe(result):compress(result);
  }
  const mx=(start.x+end.x)/2,my=(start.y+end.y)/2,candidates=[[start,{x:mx,y:start.y},{x:mx,y:end.y},end],[start,{x:start.x,y:my},{x:end.x,y:my},end]];
  return compress(candidates.sort((a,b)=>(collisions(a,obstacles)*1e6+length(a))-(collisions(b,obstacles)*1e6+length(b)))[0]);
}

function automaticCurve(a,b){const horizontal=Math.abs(b.x-a.x)>=Math.abs(b.y-a.y),amount=(horizontal?b.x-a.x:b.y-a.y)*.45;return horizontal?`M ${a.x} ${a.y} C ${a.x+amount} ${a.y}, ${b.x-amount} ${b.y}, ${b.x} ${b.y}`:`M ${a.x} ${a.y} C ${a.x} ${a.y+amount}, ${b.x} ${b.y-amount}, ${b.x} ${b.y}`;}
function smoothCurve(points){if(points.length===2)return automaticCurve(points[0],points[1]);let path=`M ${points[0].x} ${points[0].y}`;for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)],c1={x:p1.x+(p2.x-p0.x)/6,y:p1.y+(p2.y-p0.y)/6},c2={x:p2.x-(p3.x-p1.x)/6,y:p2.y-(p3.y-p1.y)/6};path+=` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;}return path;}
function roundedPath(points,radius){if(points.length===2)return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;let path=`M ${points[0].x} ${points[0].y}`;for(let i=1;i<points.length-1;i++){const before=points[i-1],corner=points[i],after=points[i+1],inLength=Math.hypot(corner.x-before.x,corner.y-before.y),outLength=Math.hypot(after.x-corner.x,after.y-corner.y),r=Math.min(radius,inLength*.42,outLength*.42),entry={x:corner.x+(before.x-corner.x)*r/inLength,y:corner.y+(before.y-corner.y)*r/inLength},exit={x:corner.x+(after.x-corner.x)*r/outLength,y:corner.y+(after.y-corner.y)*r/outLength};path+=` L ${entry.x} ${entry.y} Q ${corner.x} ${corner.y} ${exit.x} ${exit.y}`;}const end=points.at(-1);return path+` L ${end.x} ${end.y}`;}

export function pathData(points,mode='straight'){
  if(!points.length)return '';
  if(mode==='curve')return smoothCurve(points);
  if(mode==='smartCurve')return points.length===2?automaticCurve(points[0],points[1]):roundedPath(points,24);
  if(mode==='smart')return roundedPath(points,14);
  return `M ${points[0].x} ${points[0].y}`+points.slice(1).map(point=>` L ${point.x} ${point.y}`).join('');
}

export function pathBounds(points,padding=20){return {x:Math.min(...points.map(point=>point.x))-padding,y:Math.min(...points.map(point=>point.y))-padding,w:Math.max(1,Math.max(...points.map(point=>point.x))-Math.min(...points.map(point=>point.x))+padding*2),h:Math.max(1,Math.max(...points.map(point=>point.y))-Math.min(...points.map(point=>point.y))+padding*2)};}
