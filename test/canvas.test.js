import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canvasSettings,paperStyle,infinitePaperStyle,centeredCamera,snapPosition,flipCanvas,fitCanvasToArtwork} from '../dist/canvas.js';
import {createBoard,addObject,clone} from '../dist/model.js';

test('canvas settings validate guide values and produce distinct patterns',()=>{const safe=canvasSettings({guide:'bad',background:'nope',guideColor:'red',guideOpacity:300,guideSpacing:2,guideThickness:20});assert.deepEqual(safe,{background:'#ffffff',transparent:false,guide:'none',guideColor:'#7b61ff',guideOpacity:100,guideThickness:4,guideSpacing:12,snap:false});const grid=paperStyle({...safe,guide:'grid'}),lines=paperStyle({...safe,guide:'lines'});assert.notEqual(grid.backgroundImage,lines.backgroundImage);assert.match(grid.backgroundImage,/linear-gradient/);assert.match(lines.backgroundImage,/linear-gradient/);});

test('transparent paper keeps its checkerboard beneath the selected guide',()=>{const style=paperStyle({transparent:true,guide:'grid',guideSpacing:32});assert.match(style.backgroundImage,/repeating-conic-gradient/);assert.match(style.backgroundSize,/32px 32px/);assert.match(style.backgroundSize,/20px 20px/);});

test('infinite guides stay anchored to world coordinates while panning and zooming',()=>{const style=infinitePaperStyle({guide:'grid',guideSpacing:40,guideThickness:1},{x:123,y:-45,z:1.5});assert.equal(style.backgroundSize,'60px 60px,60px 60px');assert.equal(style.backgroundPosition,'123px -45px,123px -45px');const perspective=infinitePaperStyle({guide:'perspective'},{x:123,y:-45,z:1});assert.match(perspective.backgroundImage,/at 123px -45px/);});

test('center camera returns the infinite canvas origin to the viewport center',()=>{assert.deepEqual(centeredCamera(1200,800,.5),{x:600,y:400,z:.5});assert.deepEqual(centeredCamera(1200,800,99),{x:600,y:400,z:4});});

test('infinite canvas UI removes expansion edges and exposes a Home shortcut',()=>{const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),main=readFileSync(new URL('../dist/main.js',import.meta.url),'utf8');assert.doesNotMatch(html,/data-expand=/);assert.match(html,/id="center-view"/);assert.match(html,/<kbd>Home<\/kbd>/);assert.match(main,/e\.key==='Home'/);assert.match(main,/textContent='Infinite'/);});

test('snapping follows the selected guide and Alt bypasses it',()=>{assert.deepEqual(snapPosition({guide:'grid',guideSpacing:40,snap:true},51,69),{x:40,y:80});assert.deepEqual(snapPosition({guide:'lines',guideSpacing:40,snap:true},51,69),{x:51,y:80});assert.deepEqual(snapPosition({guide:'grid',guideSpacing:40,snap:true},51,69,true),{x:51,y:69});});

test('canvas flips are reversible and preserve object membership',()=>{const board=createBoard(),object=addObject(board,{type:'text',x:-100,y:-50,w:200,h:80,text:'Flip',fontSize:28}),before=clone(board);flipCanvas(board,'horizontal');assert.equal(object.x,-100);assert.equal(object.flipX,true);flipCanvas(board,'vertical');assert.equal(object.y,-30);assert.equal(object.flipY,true);flipCanvas(board,'vertical');flipCanvas(board,'horizontal');delete object.flipX;delete object.flipY;assert.deepEqual(board,before);});

test('fit to artwork updates canvas bounds without moving objects',()=>{const board=createBoard(),a=addObject(board,{type:'text',x:100,y:200,w:200,h:80,text:'A',fontSize:28}),b=addObject(board,{type:'text',x:700,y:600,w:100,h:50,text:'B',fontSize:28}),positions=[a.x,a.y,b.x,b.y];assert.equal(fitCanvasToArtwork(board,50),true);assert.deepEqual(board.bounds,{x:50,y:150,w:800,h:550});assert.deepEqual([a.x,a.y,b.x,b.y],positions);assert.equal(fitCanvasToArtwork(createBoard()),false);});
