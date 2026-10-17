import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canRecord,reportMarkdown,evidenceId,defaultProtocol} from '../lib/research.ts';
test('external recording requires affirmative consent and a recording method',()=>{
 assert.equal(canRecord(undefined,'overhead'),false);
 assert.equal(canRecord({consent:'declined',status:'not_started'},'overhead'),false);
 assert.equal(canRecord({consent:'granted',status:'not_started'},'none'),false);
 assert.equal(canRecord({consent:'granted',status:'not_started'},'overhead'),true);
});
test('evidence exports preserve independent outcome, assistance, recording refusal and iteration trace',()=>{
 const s={code:'QA-123',version:'study-test',status:'completed',createdAt:'2026-10-17',background:{},protocol:{...defaultProtocol,purpose:'pilot'},recording:{consent:'declined',status:'not_started'},tasks:[{id:'find',outcome:'completed',assessment:'not_completed',startedAt:'2026-10-17T01:00:00Z',endedAt:'2026-10-17T01:01:00Z',visibleMs:30000,path:['M01','M02'],assistance:true}],notes:[{id:'QA-123-O01',at:'2026-10-17',task:'find',text:'Confused by the label',screen:'M02',eventSeq:3,dimension:'copy',behaviour:'misinterpretation',assistance:true}],reflection:{},iterations:[{id:'QA-123-D01',status:'planned',evidence:'QA-123-O01',finding:'Label unclear',decision:'change',change:'Rename label',rationale:'Match language',nextVersion:'V4',followUp:'Retest'}]};
 const text=reportMarkdown(s);
 for(const expected of ['Purpose: pilot','Consent: declined','Self-reported outcome: completed','Researcher assessment: not_completed','Assistance: yes','QA-123-O01','QA-123-D01 · planned','Total elapsed (ms): 60000','Visible unpaused time (ms): 30000'])assert.ok(text.includes(expected),expected);
 assert.equal(evidenceId(s),'QA-123-O02');
});
test('legacy records export without inventing protocol or recording consent',()=>{
 const text=reportMarkdown({code:'OLD',version:'1',status:'completed',createdAt:'2026-10-17',tasks:[],notes:[],background:{},reflection:{}});
 assert.ok(text.includes('Not recorded (legacy session)'));
 assert.ok(!text.includes('## Recording'));
 assert.equal(defaultProtocol.recordingMethod,undefined);
});
