import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultPanelStates,normalizePanelState,revealPanelState,toolHasProperties} from '../dist/panels.js';

test('workspace starts as a quiet canvas with optional independent panels',()=>{const states=defaultPanelStates(1400,900);assert.equal(states.layers.mode,'dock');assert.equal(states.layers.dock,'right');assert.equal(states.properties.mode,'float');assert.equal(states.layers.visible,false);assert.equal(states.properties.visible,false);assert.notEqual(states.layers,states.properties);});

test('compact workspaces keep optional panels sized without covering the whole canvas',()=>{const states=defaultPanelStates(600,700);assert.equal(states.layers.visible,false);assert.equal(states.properties.visible,false);assert.ok(states.layers.width<=600*.86);});

test('saved panel layouts are sanitized and clamped on restore',()=>{const fallback=defaultPanelStates(1000,700).properties,state=normalizePanelState({mode:'invalid',dock:'corner',width:9000,height:-5,x:9000,y:-20,visible:false,collapsed:1},fallback,{width:1000,height:700});assert.equal(state.mode,'dock');assert.equal(state.dock,'right');assert.equal(state.width,720);assert.equal(state.height,180);assert.equal(state.x,272);assert.equal(state.y,8);assert.equal(state.visible,false);assert.equal(state.collapsed,true);});

test('revealing properties expands the panel without losing its custom layout',()=>{const state={mode:'float',dock:'left',width:420,height:510,x:84,y:96,visible:false,collapsed:true},revealed=revealPanelState(state);assert.deepEqual(revealed,{...state,visible:true,collapsed:false});assert.equal(state.visible,false);});

test('only tools with editable settings automatically reveal properties',()=>{for(const tool of ['select','text','arrow','pen','shape'])assert.equal(toolHasProperties(tool),true);for(const tool of ['hand','image'])assert.equal(toolHasProperties(tool),false);});

test('object drag cursor only appears while Select is active',()=>{const css=readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8');assert.match(css,/\.board-object,\.vector-object \.vector-hit\{cursor:inherit\}/);assert.match(css,/#viewport\[data-tool=select\] \.board-object:not\(\.locked\)[^{]*\{cursor:move\}/);});
