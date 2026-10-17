import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchServices,initialApp,addEvent,taskDuration,sessionCSV} from '../lib/study.ts';
test('rental searches recover from the introduced empty state and respect topic scope',()=>{
 assert.equal(initialApp(1).forcedNoResults,true);
 assert.ok(searchServices('I need a rental agreement').some(s=>s.id==='agreements'));
 assert.ok(searchServices('lease').some(s=>s.id==='agreements'));
 assert.equal(searchServices('rental agreement','Education').length,0);
 assert.equal(searchServices('xyznonexistent').length,0);
});
test('feedback after task completion cannot extend measured task duration',()=>{
 const s={code:'QA-ONLY',version:'test',step:'taskReview',taskIndex:0,tasks:[{id:'find',startedAt:'2026-10-17T01:00:00.000Z',endedAt:'2026-10-17T01:01:00.000Z',visibleMs:45000}],events:[]};
 addEvent(s,'task_feedback',{answer:'A "quoted", multiline\nanswer'});
 assert.equal(taskDuration(s.tasks[0]),60000);
 assert.equal(s.events[0].elapsedMs,60000);
 assert.equal(s.events[0].visibleMs,45000);
 assert.equal(s.events[0].screen,null);
 const csv=sessionCSV(s);
 assert.ok(csv.startsWith('\uFEFF'));
 assert.ok(csv.includes('task_feedback'));
 assert.ok(csv.includes('"60000","45000"'));
});
