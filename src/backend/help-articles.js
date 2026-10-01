// Keep complete source photos inside either Help layout, without cropping.
export function fitHelpPhoto(frame,width,height){
  const scale=Math.min(frame.w/width,frame.h/height)
  const w=Math.min(frame.w,width*scale),h=Math.min(frame.h,height*scale)
  return {x:frame.x+(frame.w-w)/2,y:frame.y+(frame.h-h)/2,w,h}
}

export function compareHelpArticlesNewest(a,b){
  const timestamp=row=>Date.parse(row.date||'')||0
  return timestamp(b)-timestamp(a)||Number(b.rootMessageId||0)-Number(a.rootMessageId||0)
}
