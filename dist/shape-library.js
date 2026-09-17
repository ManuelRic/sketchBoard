import {shapeSettings} from './shapes.js';

export const SHAPE_LIBRARY_KEY='plane.custom-shapes.v1';
export const SHAPE_LIBRARY_LIMIT=24;
const MAX_POINTS=180;
const cleanName=value=>String(value||'Custom shape').trim().replace(/\s+/g,' ').slice(0,40)||'Custom shape';
const finite=value=>Number.isFinite(Number(value));

function compactPoints(points,max=MAX_POINTS){
  if(points.length<=max)return points;
  const result=[];
  for(let i=0;i<max;i++)result.push(points[Math.round(i*(points.length-1)/(max-1))]);
  return result;
}

export function uniqueShapeName(name,items=[],excludeId=''){
  const base=cleanName(name),used=new Set(items.filter(item=>item.id!==excludeId).map(item=>item.name.toLocaleLowerCase()));
  if(!used.has(base.toLocaleLowerCase()))return base;
  let index=2;
  while(true){const suffix=` (${index})`,candidate=base.slice(0,40-suffix.length)+suffix;if(!used.has(candidate.toLocaleLowerCase()))return candidate;index++;}
}

export function templateFromShape(shape,name,id=`shape-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`){
  if(shape?.type!=='shape'||shape.shape!=='custom'||!Array.isArray(shape.points)||shape.points.length<3)throw new Error('Select a custom shape before saving.');
  const width=Math.max(1,Number(shape.baseW)||Number(shape.w)||1),height=Math.max(1,Number(shape.baseH)||Number(shape.h)||1);
  const points=compactPoints(shape.points.filter(point=>finite(point?.x)&&finite(point?.y)).map(point=>({x:Math.max(0,Math.min(1,Number(point.x)/width)),y:Math.max(0,Math.min(1,Number(point.y)/height))})));
  if(points.length<3)throw new Error('This custom shape does not have enough points to save.');
  const style=shapeSettings(shape);
  return {id:String(id).slice(0,80),name:cleanName(name),points,style:{color:style.color,fill:style.fill,stroke:style.stroke,fillOpacity:style.fillOpacity},createdAt:Date.now()};
}

export function sanitizeShapeLibrary(value,limit=SHAPE_LIBRARY_LIMIT){
  let source=value;
  if(typeof source==='string'){try{source=JSON.parse(source)}catch{return []}}
  if(!Array.isArray(source))return [];
  const ids=new Set(),result=[];
  for(const item of source){
    if(result.length>=limit)break;
    if(!item||typeof item.id!=='string'||ids.has(item.id)||!Array.isArray(item.points))continue;
    const points=compactPoints(item.points.filter(point=>finite(point?.x)&&finite(point?.y)).map(point=>({x:Math.max(0,Math.min(1,Number(point.x))),y:Math.max(0,Math.min(1,Number(point.y)))})));
    if(points.length<3)continue;
    const style=shapeSettings(item.style||{});
    ids.add(item.id);
    result.push({id:item.id.slice(0,80),name:cleanName(item.name),points,style:{color:style.color,fill:style.fill,stroke:style.stroke,fillOpacity:style.fillOpacity},createdAt:finite(item.createdAt)?Number(item.createdAt):0});
  }
  return result;
}

export function loadShapeLibrary(storage=globalThis.localStorage){
  try{return sanitizeShapeLibrary(storage?.getItem(SHAPE_LIBRARY_KEY))}catch{return []}
}

export function saveShapeLibrary(items,storage=globalThis.localStorage){
  const clean=sanitizeShapeLibrary(items);
  if(items.length>SHAPE_LIBRARY_LIMIT)throw new Error(`You can save up to ${SHAPE_LIBRARY_LIMIT} custom shapes.`);
  try{storage?.setItem(SHAPE_LIBRARY_KEY,JSON.stringify(clean))}catch{throw new Error('Your shape library could not be saved on this device.');}
  return clean;
}
