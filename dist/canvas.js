const guideTypes=['none','grid','lines','dots','isometric','perspective','symmetry'];
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)));
const color=value=>/^#[\da-f]{6}$/i.test(value||'')?value:'#7b61ff';

export function canvasSettings(values={}){
 return {background:/^#[\da-f]{6}$/i.test(values.background||'')?values.background:'#ffffff',transparent:!!values.transparent,guide:guideTypes.includes(values.guide)?values.guide:'none',guideColor:color(values.guideColor),guideOpacity:clamp(Number.isFinite(Number(values.guideOpacity))?values.guideOpacity:22,5,100),guideThickness:clamp(Number.isFinite(Number(values.guideThickness))?values.guideThickness:1,0.5,4),guideSpacing:clamp(Number.isFinite(Number(values.guideSpacing))?values.guideSpacing:40,12,160),snap:!!values.snap};
}

function rgba(hex,opacity){const value=parseInt(hex.slice(1),16);return `rgba(${value>>16},${value>>8&255},${value&255},${opacity/100})`;}

export function paperStyle(values={}){
 const s=canvasSettings(values),line=rgba(s.guideColor,s.guideOpacity),t=s.guideThickness,g=s.guideSpacing;
 let guideImage='none',guideSize='auto';
 if(s.guide==='grid'){guideImage=`linear-gradient(to right, ${line} ${t}px, transparent ${t}px),linear-gradient(to bottom, ${line} ${t}px, transparent ${t}px)`;guideSize=`${g}px ${g}px`;}
 if(s.guide==='lines'){guideImage=`linear-gradient(to bottom, transparent calc(100% - ${t}px), ${line} ${t}px)`;guideSize=`${g}px ${g}px`;}
 if(s.guide==='dots'){guideImage=`radial-gradient(circle, ${line} ${Math.max(1,t)}px, transparent ${Math.max(1,t)+.6}px)`;guideSize=`${g}px ${g}px`;}
 if(s.guide==='isometric'){guideImage=`repeating-linear-gradient(30deg, transparent 0 ${g-1}px, ${line} ${g-1}px ${g}px),repeating-linear-gradient(150deg, transparent 0 ${g-1}px, ${line} ${g-1}px ${g}px),repeating-linear-gradient(90deg, transparent 0 ${g-1}px, ${line} ${g-1}px ${g}px)`;guideSize='auto';}
 if(s.guide==='perspective'){guideImage=`repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 14.7deg, ${line} 14.7deg 15deg)`;guideSize='100% 100%';}
 if(s.guide==='symmetry'){guideImage=`linear-gradient(to right, transparent calc(50% - ${t/2}px), ${line} calc(50% - ${t/2}px), ${line} calc(50% + ${t/2}px), transparent calc(50% + ${t/2}px)),linear-gradient(to bottom, transparent calc(50% - ${t/2}px), ${line} calc(50% - ${t/2}px), ${line} calc(50% + ${t/2}px), transparent calc(50% + ${t/2}px))`;guideSize='100% 100%';}
 const checker='repeating-conic-gradient(#e8e8ec 0 25%,#fff 0 50%)';
 if(!s.transparent)return {backgroundColor:s.background,backgroundImage:guideImage,backgroundSize:guideSize,backgroundPosition:'0 0'};
 const guideLayers={grid:2,isometric:3,symmetry:2}[s.guide]||1;
 return {backgroundColor:'#fff',backgroundImage:guideImage==='none'?checker:`${guideImage},${checker}`,backgroundSize:guideImage==='none'?'20px 20px':`${Array(guideLayers).fill(guideSize).join(',')},20px 20px`,backgroundPosition:'0 0'};
}

export function snapPosition(values,x,y,altKey=false){const s=canvasSettings(values);if(!s.snap||s.guide==='none'||altKey)return {x,y};const snap=n=>Math.round(n/s.guideSpacing)*s.guideSpacing;if(s.guide==='lines')return {x,y:snap(y)};if(s.guide==='symmetry')return {x,y};return {x:snap(x),y:snap(y)};}

export function flipCanvas(board,axis){if(!['horizontal','vertical'].includes(axis))throw new Error('Unknown flip axis');const b=board.bounds,cx=b.x+b.w/2,cy=b.y+b.h/2;for(const object of board.objects){if(object.type==='arrow'){for(const endpoint of [object.start,object.end]){if(endpoint.objectId)continue;if(axis==='horizontal')endpoint.x=2*cx-endpoint.x;else endpoint.y=2*cy-endpoint.y;}continue}if(axis==='horizontal'){object.x=2*cx-object.x-object.w;object.flipX=!object.flipX;}else{object.y=2*cy-object.y-object.h;object.flipY=!object.flipY;}}}

export function fitCanvasToArtwork(board,padding=80){if(!board.objects.length)return false;const rects=board.objects.map(object=>{if(object.type!=='arrow')return {x:object.x,y:object.y,w:object.w,h:object.h};const xs=[object.start.x,object.end.x],ys=[object.start.y,object.end.y];return {x:Math.min(...xs),y:Math.min(...ys),w:Math.abs(xs[1]-xs[0]),h:Math.abs(ys[1]-ys[0])};});const minX=Math.min(...rects.map(r=>r.x)),minY=Math.min(...rects.map(r=>r.y)),maxX=Math.max(...rects.map(r=>r.x+r.w)),maxY=Math.max(...rects.map(r=>r.y+r.h));board.bounds={x:Math.floor(minX-padding),y:Math.floor(minY-padding),w:Math.max(320,Math.ceil(maxX-minX+padding*2)),h:Math.max(240,Math.ceil(maxY-minY+padding*2))};return true;}
