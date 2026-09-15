export async function resolveLidToRealJid(jid){
  if(!jid) return jid
  if(jid.includes('@s.whatsapp.net') &&!jid.includes('@lid')) return jid
  return jid.split(':')[0]+'@s.whatsapp.net'
}
export function formatTime(ms){
  if(ms<=0) return 'Ahora.'
  let s=Math.floor(ms/1000)
  let d=Math.floor(s/86400); s%=86400
  let h=Math.floor(s/3600); s%=3600
  let m=Math.floor(s/60); s%=60
  const parts=[]
  if(d) parts.push(d+'d')
  if(h) parts.push(h+'h')
  if(m) parts.push(m+'m')
  if(s) parts.push(s+'s')
  return parts.join(', ')
}
