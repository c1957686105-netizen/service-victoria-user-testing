import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";
import { and, eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
export const dynamic="force-dynamic";
const sessionSchema=z.object({id:z.string().uuid(),code:z.string().max(30),revision:z.number().int().positive().max(1000000),version:z.string().max(100),createdAt:z.string().datetime(),updatedAt:z.string().datetime(),status:z.enum(["in_progress","completed","withdrawn"]),consent:z.object({at:z.string().datetime(),version:z.string()}),events:z.array(z.unknown()).max(15000),tasks:z.array(z.unknown()).max(3)}).passthrough();
const response=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin || origin===new URL(request.url).origin;}
export async function GET() {
 const user=await getChatGPTUser();if(!user)return response({error:"Sign in to view study records."},401);
 try {const rows=await getDb().select().from(sessions).where(eq(sessions.ownerId,user.userId)).orderBy(desc(sessions.updatedAt)).limit(500);return response({sessions:rows.map(r=>JSON.parse(r.document))});}
 catch {return response({error:"Study storage is currently unavailable."},503);}
}
export async function POST(request:Request) {
 if(!sameOrigin(request))return response({error:"Invalid origin"},403);
 const user=await getChatGPTUser();if(!user)return response({error:"Sign in to save to the study database. Your local copy is retained."},401);
 const raw=await request.text();if(raw.length>2000000)return response({error:"Session is too large."},413);
 let input;try {input=sessionSchema.parse(JSON.parse(raw));}catch{return response({error:"Invalid study record."},400);}
 try {const db=getDb();const existing=await db.select({ownerId:sessions.ownerId}).from(sessions).where(eq(sessions.id,input.id)).get();if(existing&&existing.ownerId!==user.userId)return response({error:"Not allowed"},403);
 const document=JSON.stringify(input);await db.insert(sessions).values({id:input.id,ownerId:user.userId,revision:input.revision,document,createdAt:input.createdAt,updatedAt:input.updatedAt}).onConflictDoUpdate({target:sessions.id,set:{document,revision:input.revision,updatedAt:input.updatedAt},where:and(eq(sessions.ownerId,user.userId),sql`${sessions.revision} < ${input.revision}`)});
 return response({saved:true,id:input.id,revision:input.revision});}catch{return response({error:"Study storage is currently unavailable. Keep the local copy."},503);}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return response({error:"Invalid origin"},403);
 const user=await getChatGPTUser();if(!user)return response({error:"Sign in required"},401);
 const id=new URL(request.url).searchParams.get("id");if(!id||!z.string().uuid().safeParse(id).success)return response({error:"Invalid ID"},400);
 try{await getDb().delete(sessions).where(and(eq(sessions.id,id),eq(sessions.ownerId,user.userId)));return response({deleted:true});}catch{return response({error:"Could not delete the saved record."},503);}
}
