import test from 'node:test';
import assert from 'node:assert/strict';
import {SHAPE_LIBRARY_KEY,loadShapeLibrary,saveShapeLibrary,sanitizeShapeLibrary,templateFromShape,uniqueShapeName} from '../dist/shape-library.js';

const customShape={type:'shape',shape:'custom',baseW:200,baseH:100,points:[{x:0,y:0},{x:200,y:50},{x:0,y:100}],color:'#123456',fill:'#abcdef',stroke:4,fillOpacity:35};

test('custom shape templates normalize geometry and retain style',()=>{const item=templateFromShape(customShape,'Badge','badge');assert.equal(item.id,'badge');assert.deepEqual(item.points,[{x:0,y:0},{x:1,y:.5},{x:0,y:1}]);assert.deepEqual(item.style,{color:'#123456',fill:'#abcdef',stroke:4,fillOpacity:35});});
test('shape names stay unique without overwriting saved work',()=>{const items=[{id:'1',name:'Badge'},{id:'2',name:'Badge (2)'}];assert.equal(uniqueShapeName(' Badge ',items),'Badge (3)');assert.equal(uniqueShapeName('Badge',items,'1'),'Badge');});
test('long duplicate names keep their numeric suffix',()=>{const name='A'.repeat(40),second='A'.repeat(36)+' (2)';assert.equal(uniqueShapeName(name,[{id:'1',name},{id:'2',name:second}]),'A'.repeat(36)+' (3)');});
test('library persistence survives invalid device data',()=>{let saved='not-json';const storage={getItem:key=>key===SHAPE_LIBRARY_KEY?saved:null,setItem:(key,value)=>{assert.equal(key,SHAPE_LIBRARY_KEY);saved=value;}};assert.deepEqual(loadShapeLibrary(storage),[]);const item=templateFromShape(customShape,'Badge','badge');assert.equal(saveShapeLibrary([item],storage).length,1);assert.equal(loadShapeLibrary(storage)[0].name,'Badge');});
test('library sanitizes unsafe records and clamps point coordinates',()=>{const clean=sanitizeShapeLibrary([{id:'safe',name:'  Star  ',points:[{x:-2,y:0},{x:.5,y:.5},{x:3,y:1}],style:{stroke:99}},{id:'bad',name:'Bad',points:[]}]);assert.equal(clean.length,1);assert.equal(clean[0].name,'Star');assert.deepEqual(clean[0].points,[{x:0,y:0},{x:.5,y:.5},{x:1,y:1}]);assert.equal(clean[0].style.stroke,20);});
