import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSelectionBox,pointInEllipse,pointInPolygon,selectByRegion,magicSelect} from '../dist/selection.js';

const items=[
 {id:'inside',bounds:{x:20,y:20,w:20,h:20}},
 {id:'edge',bounds:{x:90,y:40,w:30,h:20}},
 {id:'outside',bounds:{x:140,y:140,w:20,h:20}}
];

test('selection boxes normalize drags in every direction',()=>{
 assert.deepEqual(normalizeSelectionBox({x:100,y:80},{x:20,y:10}),{x:20,y:10,w:80,h:70});
});

test('rectangle selection includes intersecting object bounds',()=>{
 assert.deepEqual(selectByRegion(items,'rectangle',{box:{x:0,y:0,w:100,h:100}}),['inside','edge']);
});

test('ellipse and freehand selection use their actual silhouettes',()=>{
 assert.equal(pointInEllipse({x:50,y:50},{x:0,y:0,w:100,h:100}),true);
 assert.equal(pointInEllipse({x:0,y:0},{x:0,y:0,w:100,h:100}),false);
 const polygon=[{x:0,y:0},{x:110,y:0},{x:55,y:110}];
 assert.equal(pointInPolygon({x:55,y:40},polygon),true);
 assert.deepEqual(selectByRegion(items,'freehand',{points:polygon}),['inside']);
});

test('magic selection matches type and visual style',()=>{
 const source={id:'a',type:'shape',shape:'rectangle',color:'#111111',fill:'#ffffff',fillOpacity:20};
 const objects=[source,{...source,id:'b'},{...source,id:'c',shape:'ellipse'},{id:'d',type:'text',color:'#111111',fontSize:28}];
 assert.deepEqual(magicSelect(objects,source),['a','b']);
});
