import assert from 'node:assert/strict'
import fs from 'node:fs'
import { TelegramGateway } from '../src/backend/telegram.js'
import { withMeta } from '../src/backend/protocol.js'
import { compareHelpArticlesNewest, fitHelpPhoto } from '../src/backend/help-articles.js'

// Execute the actual service with isolated storage and Telegram fixtures.
const source=fs.readFileSync(new URL('../src/backend/user-service.js',import.meta.url),'utf8')
  .replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\s*\n/gm,'')
  .replace(/^export /gm,'')
let articles=[],magazine
const topics=[
  {id:10,title:'Aide & améliorations MamiNa'},
  {id:20,title:'AIDE & AMÉLIORATIONS MAMINA'},
  {id:30,title:'Famileo'},
]
const message=(id,topicId,meta,text='',media=null)=>({
  id,text:withMeta(text,meta),media,
  replyToMessage:{threadId:topicId},date:new Date('2026-10-01'),
})
const roots=id=>({kind:'root',type:'help-article',articleKey:id,layout:'portrait',visibility:'visible'})
const raw=new Map([
  [10,[message(11,10,roots('a'),'Premier',{}),message(12,10,{kind:'help-content',articleKey:'a'},'Texte A')]],
  [20,[message(21,20,roots('b'),'Second',{}),message(22,20,{kind:'help-content',articleKey:'b'},'Texte B')]],
])
const storage={
  TelegramGateway,compareHelpArticlesNewest,
  settings:{get:async()=> 'MamiNa',set:async()=>{}},
  getAsset:async()=>({}),putAsset:async()=>{},
  putMagazine:async r=>{magazine=r},
  replaceArticles:async(id,r)=>{articles=r},
  deleteMessagesByMagazine:async()=>{},putTopicState:async()=>{},
  listArticles:async()=>articles,
  stripMeta:text=>text.split('\n').filter(l=>!l.startsWith('MAMINA::')).join('\n').trim(),
}
const Service=new Function(...Object.keys(storage),source+'\nreturn UserMaminaService')(...Object.values(storage))
const service=Object.create(Service.prototype)
service.dialog={peer:{id:1}}
service.gateway={
  topics:async()=>topics,
  topicMessages:async(peer,id)=>raw.get(id)||[],
}
service.readMap=async()=>new Map()
service.persistResolvedMessages=async()=>{}
await service.syncHelpTopic(topics[1])
assert.equal(magazine.pageCount,2)
assert.deepEqual(articles.map(a=>a.bodyText),['Texte A','Texte B'])
assert.deepEqual((await service.helpArticleAdminRows()).map(a=>a.articleKey),['b','a'])
const context=await service._articleRootContext(magazine,'a',20)
assert.equal(context.rootId,11)
assert.equal(context.topicId,10)

raw.get(20).push(message(23,20,{kind:'help-state',articleKey:'a',visibility:'hidden'}))
await service.syncHelpTopic(topics[1])
assert.deepEqual(articles.map(a=>a.articleKey),['b'])
const adminRows=await service.helpArticleAdminRows()
assert.equal(adminRows.length,2)
assert.equal(adminRows.find(a=>a.articleKey==='a').visibility,'hidden')
raw.get(10).push(message(24,10,{kind:'help-state',articleKey:'a',visibility:'visible'}))
await service.syncHelpTopic(topics[0])
assert.equal(articles.length,2)
console.log('CHECK HELP OK · sujets homonymes, contenu, liste admin, masquage/restauration, sujet des contributions')

const dates=[
  {articleKey:'older',date:'2026-09-29T12:00:00Z',rootMessageId:90},
  {articleKey:'newer',date:'2026-10-01T12:00:00Z',rootMessageId:10},
  {articleKey:'same-date',date:'2026-10-01T12:00:00Z',rootMessageId:11},
  {articleKey:'unknown',date:'',rootMessageId:100},
]
assert.deepEqual(dates.sort(compareHelpArticlesNewest).map(a=>a.articleKey),['same-date','newer','older','unknown'])
for(const frame of [{x:36,y:50,w:600,h:800},{x:120,y:40,w:960,h:720}]){
  for(const [width,height] of [[400,300],[300,400],[400,400],[1600,1201]]){
    const photo=fitHelpPhoto(frame,width,height)
    assert.ok(Math.abs(photo.w/photo.h-width/height)<1e-10)
    assert.ok(photo.x>=frame.x&&photo.y>=frame.y)
    assert.ok(photo.x+photo.w<=frame.x+frame.w+1e-10)
    assert.ok(photo.y+photo.h<=frame.y+frame.h+1e-10)
  }
}
assert.deepEqual(fitHelpPhoto({x:120,y:40,w:960,h:720},400,300),{x:120,y:40,w:960,h:720})
console.log('CHECK HELP OK · dates décroissantes et photos entières sans déformation dans les deux dispositions')
