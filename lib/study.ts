export const VERSION = "mobile-midfi-v3-web-study-1.0";
export type Lang = "en" | "zh";
export type Screen = "home" | "topic" | "search" | "results" | "overview" | "help";
export const screenIds: Record<Screen,string> = {home:"M01",topic:"M02",search:"M03",results:"M04",overview:"M05",help:"M06"};
export const services = [
  {id:"agreements",title:"Starting and changing rental agreements",description:"Explore agreement types, signing, moving in and renewing a rental agreement.",audience:"For renters checking or changing a rental agreement in Victoria.",scope:["Types of rental agreements","Applying, signing and moving in","Renewing an agreement"],tags:"rent rental renting lease agreement signing moving rights",url:"https://www.consumer.vic.gov.au/housing/renting/starting-and-changing-rental-agreements"},
  {id:"bond",title:"Bond",description:"Find information on paying, lodging, managing and claiming a rental bond.",audience:"For people seeking information about rental bonds in Victoria.",scope:["Paying and lodging a bond","Updating bond details","Claims, refunds and bond issues"],tags:"rent rental renting bond deposit refund",url:"https://www.consumer.vic.gov.au/housing/renting/rent-bond-bills-and-condition-reports/bond"},
  {id:"renting",title:"Renting",description:"Browse rental information covering agreements, payments, repairs and moving out.",audience:"For people looking for an overview of renting information in Victoria.",scope:["Agreements and rental payments","Repairs and property conditions","Moving out and dispute support"],tags:"rent rental renting rights repairs housing help",url:"https://www.consumer.vic.gov.au/housing/renting"}
];
export const topics = ["Housing & renting","Driving & transport","Family & personal","Work & business","Health & support","Education"];
export const tasks = [
  {id:"find",title:{en:"Find information you can use",zh:"找到需要的信息"},scenario:{en:"You are about to sign a rental agreement in Victoria and are unsure about some of its contents. Use this app to find relevant information. Decide whether it matches your situation and what you would do next.",zh:"你即将在维多利亚州签署一份租约，对其中一些内容不太确定。请使用这个 App 寻找相关信息，判断是否适合你的情况，并决定下一步会怎么做。"},note:{en:"Explore in the way that feels natural to you. Let the researcher know what you are thinking.",zh:"按照你平时的习惯操作，并向研究者说出你的想法。"}},
  {id:"recover",title:{en:"Continue after an unsuccessful search",zh:"搜索失败后继续寻找"},scenario:{en:"Imagine your first search returned no results. Starting from this screen, try another way to find useful information about renting.",zh:"假设你刚才的搜索没有找到结果。请从这个页面继续，尝试找到有用的租房信息。"},note:{en:"This starting situation is set up for the study. It is not an error you made in the previous task.",zh:"这个起始情境由测试设置，不代表你在上一项任务中犯了错误。"}},
  {id:"support",title:{en:"Find the right place for support",zh:"找到合适的帮助渠道"},scenario:{en:"You are viewing information about rental agreements. You still have a question about the agreement itself and want to find out how to contact the organisation responsible for this information.",zh:"你正在查看租约相关信息，但对租约本身仍有疑问。请找到如何联系负责提供这项信息的机构。"},note:{en:"You only need to find a contact option. You do not need to send a message or make a call.",zh:"只需找到联系渠道，无需发送消息或拨打电话。"}}
];
export type AppState = {screen:Screen;query:string;topic:string;service:string;origin:"topic"|"results";searchOrigin:"home"|"topic"|"results";helpOrigin:Screen;helpService:string;forcedNoResults:boolean;allTopics:boolean};
export const initialApp = (task=0):AppState => ({screen:task===1?"results":task===2?"overview":"home",query:task===1?"rental agreement information":"",topic:"All topics",service:task===2?"agreements":"",origin:"results",searchOrigin:"home",helpOrigin:"home",helpService:"",forcedNoResults:task===1,allTopics:false});
export type StudyEvent = {seq:number;at:string;type:string;task:string|null;screen:string|null;elapsedMs:number|null;visibleMs:number|null;details:Record<string,unknown>};
export type TaskRecord = {id:string;startedAt:string;endedAt?:string;visibleMs:number;outcome?:"completed"|"gave_up";ease?:number;answer?:string;firstAction?:string;assistance:boolean;assessment?:string;assessmentNote?:string;path:string[]};
export type Session = {id:string;code:string;revision:number;version:string;createdAt:string;updatedAt:string;completedAt?:string;status:"in_progress"|"completed"|"withdrawn";lang:Lang;consent:{at:string;version:string};background:Record<string,string>;device:Record<string,unknown>;step:"background"|"brief"|"task"|"taskReview"|"reflection"|"done";taskIndex:number;app:AppState;paused:boolean;tasks:TaskRecord[];events:StudyEvent[];reflection:Record<string,string>;notes:{at:string;task:string|null;text:string;assistance:boolean}[]};
export function searchServices(query:string,topic="All topics") {
  if(topic!=="All topics" && topic!=="Housing & renting") return [];
  const words=query.toLowerCase().trim().split(/\s+/).filter(x=>x.length>1 && !["a","an","the","my","for","about","information","on","in","to","and","i","need","want","find"].includes(x));
  if(!words.length) return query.trim()?[]:services;
  return services.filter(s=>words.some(w=>(s.title+" "+s.tags).toLowerCase().includes(w.replace(/s$/, ""))));
}
export function addEvent(s:Session,type:string,details:Record<string,unknown>={}) {
  const t=s.tasks[s.taskIndex];
  s.events.push({seq:s.events.length+1,at:new Date().toISOString(),type,task:t?.id??null,screen:s.step==="task"?screenIds[s.app.screen]:null,elapsedMs:t?Math.max(0,Date.parse(t.endedAt??new Date().toISOString())-Date.parse(t.startedAt)):null,visibleMs:t?.visibleMs??null,details});
}
export function newSession(lang:Lang):Session {
  const now=new Date().toISOString(); const id=crypto.randomUUID();
  const s:Session={id,code:"P-"+id.slice(0,6).toUpperCase(),revision:1,version:VERSION,createdAt:now,updatedAt:now,status:"in_progress",lang,consent:{at:now,version:"consent-1"},background:{},device:{width:window.innerWidth,height:window.innerHeight,pixelRatio:window.devicePixelRatio,touch:matchMedia("(pointer: coarse)").matches,userAgent:navigator.userAgent},step:"background",taskIndex:0,app:initialApp(),paused:false,tasks:[],events:[],reflection:{},notes:[]};
  addEvent(s,"consent_given"); return s;
}
export function formatTime(ms:number) { const sec=Math.max(0,Math.round(ms/1000));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`; }
export function taskDuration(t:TaskRecord) { return Math.max(0,Date.parse(t.endedAt??new Date().toISOString())-Date.parse(t.startedAt)); }
export function csvCell(value:unknown) { let s=typeof value==="object"?JSON.stringify(value):String(value??"");if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'; }
export function sessionCSV(s:Session) { return "\uFEFF"+[["participant","version","sequence","timestamp","task","screen","event","elapsed_ms","visible_ms","details"],...s.events.map(e=>[s.code,s.version,e.seq,e.at,e.task,e.screen,e.type,e.elapsedMs,e.visibleMs,e.details])].map(r=>r.map(csvCell).join(",")).join("\r\n"); }
export function download(name:string,data:string,type="application/json") {const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
