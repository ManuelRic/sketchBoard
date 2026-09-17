import test from 'node:test';
import assert from 'node:assert/strict';
import {routePoints,pathData,pathBounds} from '../dist/connectors.js';

test('smart connectors route around an obstructing object',()=>{const start={x:0,y:50},end={x:300,y:50},obstacle={x:120,y:10,w:60,h:80},points=routePoints(start,end,'smart',[obstacle]);assert.ok(points.length>2);assert.deepEqual(points[0],start);assert.deepEqual(points.at(-1),end);assert.ok(points.some(p=>p.y<obstacle.y||p.y>obstacle.y+obstacle.h));});
test('connector modes produce line and curve paths with safe bounds',()=>{const points=[{x:-20,y:10},{x:80,y:60}];assert.match(pathData(points,'straight'),/ L /);assert.match(pathData(points,'curve'),/ C /);assert.deepEqual(pathBounds(points,10),{x:-30,y:0,w:120,h:70});});
