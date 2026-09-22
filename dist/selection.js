export const selectionModes=[
 {id:'point',label:'Object',description:'Click an object or drag selected objects.'},
 {id:'magic',label:'Magic',description:'Select visible objects with matching visual style.'},
 {id:'rectangle',label:'Rectangle',description:'Drag a rectangular selection area.'},
 {id:'ellipse',label:'Ellipse',description:'Drag an elliptical selection area.'},
 {id:'freehand',label:'Freehand',description:'Draw around the objects you want.'}
];

export function normalizeSelectionBox(start,end){
 const x=Math.min(start.x,end.x),y=Math.min(start.y,end.y);
 return {x,y,w:Math.abs(end.x-start.x),h:Math.abs(end.y-start.y)};
}

const inBox=(point,box)=>point.x>=box.x&&point.x<=box.x+box.w&&point.y>=box.y&&point.y<=box.y+box.h;
const samples=bounds=>[
 {x:bounds.x+bounds.w/2,y:bounds.y+bounds.h/2},
 {x:bounds.x,y:bounds.y},{x:bounds.x+bounds.w,y:bounds.y},
 {x:bounds.x,y:bounds.y+bounds.h},{x:bounds.x+bounds.w,y:bounds.y+bounds.h}
];

export function pointInEllipse(point,box){
 if(!box.w||!box.h)return false;
 const rx=box.w/2,ry=box.h/2,cx=box.x+rx,cy=box.y+ry;
 return ((point.x-cx)/rx)**2+((point.y-cy)/ry)**2<=1;
}

export function pointInPolygon(point,polygon){
 if(!polygon||polygon.length<3)return false;
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}

export function selectByRegion(items,mode,region){
 if(!['rectangle','ellipse','freehand'].includes(mode))return [];
 const polygon=region.points||[],box=region.box;
 return items.filter(item=>{
  const points=samples(item.bounds);
  if(mode==='rectangle')return points.some(point=>inBox(point,box));
  if(mode==='ellipse')return points.some(point=>pointInEllipse(point,box));
  return points.some(point=>pointInPolygon(point,polygon));
 }).map(item=>item.id);
}

const clean=value=>String(value??'').trim().toLowerCase();
export function magicSignature(object){
 const base=[object.type,clean(object.color)];
 if(object.type==='shape')base.push(object.shape,clean(object.fill),Math.round(Number(object.fillOpacity)||0));
 if(object.type==='pen')base.push(object.brush,Math.round((Number(object.stroke)||0)*2)/2);
 if(object.type==='text')base.push(Number(object.fontSize)||0,Boolean(object.bold));
 if(object.type==='arrow')base.push(object.route||'straight',Math.round((Number(object.stroke)||0)*2)/2);
 return base.join('|');
}

export function magicSelect(objects,source){
 if(!source)return [];
 const signature=magicSignature(source);
 return objects.filter(object=>magicSignature(object)===signature).map(object=>object.id);
}
