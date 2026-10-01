import assert from 'node:assert/strict'
import fs from 'node:fs'
import { TelegramGateway } from '../src/backend/telegram.js'
import { withMeta } from '../src/backend/protocol.js'

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
  TelegramGateway,
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
assert.equal((await service.helpArticleAdminRows()).length,2)
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
