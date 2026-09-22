import test from 'node:test';
import assert from 'node:assert/strict';
import {shapeObject,customShapeObject,shapeMarkup,shapeSettings,repeatShapeControl} from '../dist/shapes.js';

test('preset shapes normalize drag direction and render editable markup',()=>{const shape=shapeObject({x:120,y:90},{x:20,y:10},{shape:'diamond',fill:'#ff0000',fillOpacity:40});assert.deepEqual({x:shape.x,y:shape.y,w:shape.w,h:shape.h},{x:20,y:10,w:100,h:80});const markup=shapeMarkup(shape,14);assert.match(markup,/fill="#ff0000"/);assert.match(markup,/vector-hit/);});
test('custom shapes retain reusable local points',()=>{const shape=customShapeObject([{x:10,y:10},{x:80,y:20},{x:60,y:90},{x:10,y:10}],{color:'#123456'});assert.equal(shape.type,'shape');assert.equal(shape.shape,'custom');assert.ok(shape.points.every(p=>p.x>=0&&p.y>=0));assert.match(shapeMarkup(shape),/polygon/);});
test('shape settings reject invalid values',()=>{assert.deepEqual(shapeSettings({shape:'bad',color:'no',fill:'bad',stroke:100,fillOpacity:-3}),{shape:'rectangle',color:'#292536',fill:'#ffffff',stroke:20,fillOpacity:0});});
test('saved custom templates stamp at any dragged size',()=>{const shape=shapeObject({x:10,y:20},{x:210,y:120},{shape:'custom',customShape:{id:'saved-1',points:[{x:0,y:0},{x:1,y:.5},{x:0, y:1}]}});assert.equal(shape.templateId,'saved-1');assert.equal(shape.baseW,1);assert.equal(shape.baseH,1);assert.match(shapeMarkup(shape),/200,50/);});
test('repeat shape control clearly exposes its persistent placement state',()=>{assert.match(repeatShapeControl(true),/data-shape-repeat checked/);assert.doesNotMatch(repeatShapeControl(false),/checked/);assert.match(repeatShapeControl(false),/Keep placing/);});
