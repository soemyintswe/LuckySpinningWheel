const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { randomInt } = require('node:crypto')

initializeApp()
const db = getFirestore()
exports.spinRaffle = onCall({ region: 'asia-southeast1', maxInstances: 4 }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
  const uid = request.auth.uid
  const admin = (await db.collection('admins').doc(uid).get()).exists
  const raffleId = String(request.data?.raffleId || '')
  const requestedEntryId = String(request.data?.entryId || '')
  const spinId = String(request.data?.spinId || '')
  if (!raffleId || raffleId.length > 150 || !/^[A-Za-z0-9_-]{12,100}$/.test(spinId)) throw new HttpsError('invalid-argument', 'မဲအစီအစဉ် သို့မဟုတ် လှည့်မှု ID မမှန်ပါ။')
  if (!admin && !requestedEntryId) throw new HttpsError('permission-denied', 'မိမိအတည်ပြုပြီးသော မဲစာရင်းဖြင့်သာ လှည့်နိုင်ပါသည်။')
  const raffleRef = db.collection('raffles').doc(raffleId)
  const attemptRef = raffleRef.collection('spinAttempts').doc(spinId)
  const winnerRef = db.collection('winners').doc()
  let result

  await db.runTransaction(async tx => {
    const prior = await tx.get(attemptRef)
    if (prior.exists) { result = prior.data().result; return }
    const raffleSnap = await tx.get(raffleRef)
    if (!raffleSnap.exists || !['active','scheduled'].includes(raffleSnap.data().status)) throw new HttpsError('failed-precondition', 'မဲအစီအစဉ် ဖွင့်ထားခြင်း မရှိပါ။')
    const [entriesSnap, winnersSnap] = await Promise.all([
      tx.get(db.collection('participants').where('raffleId', '==', raffleId).where('status', '==', 'approved')),
      tx.get(db.collection('winners').where('raffleId', '==', raffleId))
    ])
    const raffle = raffleSnap.data()
    const now = Date.now()
    if (raffle.openAt && now < Date.parse(raffle.openAt)) throw new HttpsError('failed-precondition', 'မဲဖွင့်ချိန် မရောက်သေးပါ။')
    if (raffle.drawAt && now < Date.parse(raffle.drawAt)) throw new HttpsError('failed-precondition', 'သတ်မှတ်ထားသော ဖောက်မည့်အချိန် မရောက်သေးပါ။')
    const entries = entriesSnap.docs.map(d => ({ id:d.id, ref:d.ref, data:d.data(), remaining:Math.max(0,(Number(d.data().ticketCount)||0)-(Number(d.data().spinsUsed)||0)) })).filter(e => e.remaining > 0)
    if (!entries.length) throw new HttpsError('failed-precondition', 'အသုံးပြုနိုင်သော မဲလှည့်ခွင့် မရှိတော့ပါ။')
    let chosen
    if (requestedEntryId) {
      chosen = entries.find(e => e.id === requestedEntryId)
      if (!chosen) throw new HttpsError('failed-precondition', 'ဤမဲစာရင်းတွင် လှည့်ခွင့်ကျန်မရှိပါ။')
      if (!admin && chosen.data.userId !== uid) throw new HttpsError('permission-denied', 'အခြားသူ၏ မဲလှည့်ခွင့်ကို အသုံးပြု၍မရပါ။')
    } else {
      if (!admin) throw new HttpsError('permission-denied', 'ဒိုင်ခွင့်ပြုချက်လိုအပ်ပါသည်။')
      let pick = randomInt(entries.reduce((n,e)=>n+e.remaining,0))
      chosen = entries.find(e => (pick -= e.remaining) < 0)
    }

    let slots = Array.isArray(raffle.drawSlots) ? raffle.drawSlots : null
    const rawPool=Number(raffle.cashPool||0)
    if(!Number.isFinite(rawPool)||rawPool<0) throw new HttpsError('failed-precondition','ဆုငွေကန်တန်ဖိုး မှန်ကန်မှုမရှိပါ။')
    let cashPool = Math.floor(rawPool)
    if (!slots) {
      const fixed = (Array.isArray(raffle.prizes)?raffle.prizes:[]).map((p,i)=>({
        ...p, prizeSlotId:`fixed-${i}`, prizeIndex:i, kind:'fixed',
        value:Math.max(0,Math.floor(Number(p.value)||0)),
        valueType:p.valueType==='cash'?'cash':'goods', quantity:Math.max(1,Math.floor(Number(p.quantity)||1))
      }))
      const fixedCash = fixed.reduce((n,p)=>n+(p.valueType==='cash'?p.value:0),0)
      if (!Object.prototype.hasOwnProperty.call(raffle,'cashPool')) cashPool = fixedCash
      if (fixedCash>cashPool) throw new HttpsError('failed-precondition','သတ်မှတ်ထားသော ဆုငွေစုစုပေါင်းသည် ဆုငွေကန်ထက် ကျော်နေပါသည်။')
      const consolationCount = Math.max(0,Math.floor(Number(raffle.consolationCount)||0))
      if(consolationCount>1000) throw new HttpsError('failed-precondition','နှစ်သိမ့်ဆု 1,000 ဆုထက် မပိုရပါ။')
      const remainder = cashPool-fixedCash
      if(consolationCount>0&&remainder<consolationCount) throw new HttpsError('failed-precondition','နှစ်သိမ့်ဆုတစ်ဆုစီ အနည်းဆုံး 1 ကျပ်ရရန် ဆုငွေမလုံလောက်ပါ။')
      const base = consolationCount?Math.floor(remainder/consolationCount):0
      const extra = consolationCount?remainder%consolationCount:0
      const consolation = Array.from({length:consolationCount},(_,i)=>({
        prizeSlotId:`consolation-${i}`,prizeIndex:fixed.length+i,kind:'consolation',
        name:`နှစ်သိမ့်ဆု ${i+1}`,item:'ငွေသား',value:base+(i<extra?1:0),
        valueType:'cash',quantity:1,imageUrl:''
      }))
      slots=[...fixed,...consolation]
      if (!slots.length) throw new HttpsError('failed-precondition','ဖောက်ပေးမည့်ဆု မသတ်မှတ်ရသေးပါ။')
    }
    const awarded = new Set(winnersSnap.docs.map(d=>d.data().prizeSlotId||`fixed-${d.data().prizeIndex}`))
    const available = slots.filter(s=>!awarded.has(s.prizeSlotId))
    const remainingSpins = entries.reduce((n,e)=>n+e.remaining,0)
    const prize = available.length && randomInt(remainingSpins)<available.length ? available[randomInt(available.length)] : null
    const person=chosen.data
    result={
      attemptId:spinId,won:!!prize,winnerName:person.name||'အမည်မသိ',winnerImage:person.avatarUrl||'',
      prizeName:prize?.name||'',prizeItem:prize?.item||'',prizeValue:prize?.value||0,
      prizeType:prize?.valueType||'',prizeImage:prize?.imageUrl||'',raffleTitle:raffle.title||'',
      participantId:chosen.id,spinsUsed:(Number(person.spinsUsed)||0)+1,
      spinsLeft:Math.max(0,(Number(person.ticketCount)||0)-(Number(person.spinsUsed)||0)-1)
    }
    const attempt={...result,userId:person.userId,raffleId,createdAt:FieldValue.serverTimestamp()}
    const awardedCash=winnersSnap.docs.reduce((n,d)=>n+(d.data().deliveryStatus==='delivered'&&d.data().prizeType==='cash'?Number(d.data().prizeValue)||0:0),0)
    tx.update(chosen.ref,{spinsUsed:result.spinsUsed})
    tx.update(raffleRef,{drawLocked:true,drawSlots:slots,drawSpinsUsed:(Number(raffle.drawSpinsUsed)||0)+1,remainingCash:Math.max(0,cashPool-awardedCash)})
    if(prize){
      const winner={...attempt,prizeIndex:prize.prizeIndex,prizeSlotId:prize.prizeSlotId,prizeName:prize.name||'ဆု',prizeItem:prize.item||'',prizeValue:prize.value,prizeQuantity:prize.quantity||1,prizeType:prize.valueType,prizeImage:prize.imageUrl||'',winnerName:person.name||'အမည်မသိ',winnerImage:person.avatarUrl||'',deliveryStatus:'pending',deliveryHistory:[{status:'awarded',at:new Date().toISOString(),by:uid}],createdBy:uid}
      tx.create(winnerRef,winner)
    }
    tx.create(attemptRef,{...attempt,result})
  })
  return result
})

exports.reviewEntry = onCall({ region: 'asia-southeast1', maxInstances: 2 }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
  if (!(await db.collection('admins').doc(request.auth.uid).get()).exists) throw new HttpsError('permission-denied', 'Admin ခွင့်ပြုချက်လိုအပ်သည်။')
  const entryId = String(request.data?.entryId || '')
  const status = request.data?.status
  if (!entryId || !['approved', 'rejected'].includes(status)) throw new HttpsError('invalid-argument', 'စာရင်းနှင့် အခြေအနေ မှန်ကန်စွာရွေးပါ။')
  const entryRef = db.collection('participants').doc(entryId)
  await db.runTransaction(async tx => {
    const entrySnap = await tx.get(entryRef)
    if (!entrySnap.exists) throw new HttpsError('not-found', 'စာရင်း မတွေ့ပါ။')
    const entry = entrySnap.data()
    if (entry.status === status) return
    if (entry.status !== 'pending') throw new HttpsError('failed-precondition', 'ဤစာရင်းကို စစ်ဆေးပြီးပါပြီ။')
    if (status === 'rejected') { tx.update(entryRef, { status }); return }
    const raffleRef = db.collection('raffles').doc(String(entry.raffleId || ''))
    const raffleSnap = await tx.get(raffleRef)
    if (!raffleSnap.exists || !['active','scheduled'].includes(raffleSnap.data().status)) throw new HttpsError('failed-precondition', 'မဲအစီအစဉ် မဖွင့်ထားပါ။')
    if (raffleSnap.data().drawLocked) throw new HttpsError('failed-precondition', 'မဲလှည့်ပြီးပါပြီ။ နောက်ထပ်စာရင်းကို ခွင့်မပြုတော့ပါ။')
    const raffle = raffleSnap.data()
    if (raffle.openAt && Date.now() < Date.parse(raffle.openAt)) throw new HttpsError('failed-precondition', 'မဲစာရင်းဖွင့်ချိန် မရောက်သေးပါ။')
    if (raffle.drawAt && Date.now() > Date.parse(raffle.drawAt)) throw new HttpsError('failed-precondition', 'မဲစာရင်းပိတ်ပြီးပါပြီ။')
    const count = Math.max(0, Number(entry.ticketCount) || 0)
    if ((Number(raffle.ticketCount) || 0) + count > (Number(raffle.maxTickets) || 0)) throw new HttpsError('resource-exhausted', 'လက်ကျန်မဲအရေအတွက် မလုံလောက်ပါ။')
    tx.update(entryRef, { status })
    tx.update(raffleRef, { ticketCount: (Number(raffle.ticketCount) || 0) + count })
    const ticketIncome = (Number(raffle.ticketPrice) || 0) * count
    if (ticketIncome > 0) tx.create(db.collection('ledger').doc(), { direction:'in', assetType:'cash', itemLabel:`မဲလက်မှတ် · ${raffle.title || ''}`, amount:ticketIncome, quantity:0, unitValue:ticketIncome, source:'ticket', relatedId:entryId, createdBy:request.auth.uid, createdAt:FieldValue.serverTimestamp() })
  })
  return { status }
})

exports.updatePrizeDelivery = onCall({ region: 'asia-southeast1', maxInstances: 2 }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
  const uid=request.auth.uid
  if (!(await db.collection('admins').doc(uid).get()).exists) throw new HttpsError('permission-denied', 'Admin ခွင့်ပြုချက်လိုအပ်သည်။')
  const winnerId=String(request.data?.winnerId||''), status=request.data?.status, reason=String(request.data?.reason||'').trim()
  if (!winnerId || !['delivered','reclaimed'].includes(status)) throw new HttpsError('invalid-argument','ဆုလွှဲပြောင်းမှု အခြေအနေ မမှန်ပါ။')
  if (status==='reclaimed' && reason.length<3) throw new HttpsError('invalid-argument','ဆုကို ပြန်သိမ်းရသည့် အကြောင်းပြချက်ကို ထည့်ပါ။')
  const winnerRef=db.collection('winners').doc(winnerId), ledgerInRef=db.collection('ledger').doc(), ledgerOutRef=db.collection('ledger').doc()
  await db.runTransaction(async tx=>{
    const winnerSnap=await tx.get(winnerRef)
    if(!winnerSnap.exists) throw new HttpsError('not-found','ဆုရရှိသူ မတွေ့ပါ။')
    const winner=winnerSnap.data(), current=winner.deliveryStatus||'pending'
    if(current===status) return
    if(current==='reclaimed') throw new HttpsError('failed-precondition','ပြန်လည်သိမ်းဆည်းပြီးသော ဆုကို ပြန်ဖွင့်၍မရပါ။')
    if(status==='delivered'&&current!=='pending') throw new HttpsError('failed-precondition','ဤဆုကို လွှဲပြောင်းပြီးဖြစ်သည်။')
    const raffleRef=db.collection('raffles').doc(String(winner.raffleId||''))
    const raffleSnap=await tx.get(raffleRef)
    const records=await tx.get(db.collection('winners').where('raffleId','==',winner.raffleId))
    const previouslyDelivered=records.docs.reduce((n,d)=>n+(d.id!==winnerId&&d.data().deliveryStatus==='delivered'&&d.data().prizeType==='cash'?Number(d.data().prizeValue)||0:0),0)
    const value=Math.max(0,Number(winner.prizeValue)||0), isCash=winner.prizeType==='cash'
    const isGoods=!isCash
    const itemLabel=winner.prizeItem||winner.prizeName||'ဆု'
    const history=[...(winner.deliveryHistory||[]),{status,reason:reason||'',at:new Date().toISOString(),by:uid}]
    tx.update(winnerRef,{deliveryStatus:status,deliveryHistory:history,deliveryUpdatedAt:FieldValue.serverTimestamp(),deliveryReason:reason||''})
    if(status==='delivered'&&(value>0||isGoods)) tx.create(ledgerOutRef,{direction:'out',assetType:isCash?'cash':'goods',itemLabel,amount:value,quantity:isCash?0:Number(winner.prizeQuantity||1),unitValue:value/(isCash?1:Number(winner.prizeQuantity||1)),source:'prize',relatedId:winnerId,createdBy:uid,createdAt:FieldValue.serverTimestamp()})
    if(status==='reclaimed'&&current==='delivered'&&(value>0||isGoods)) tx.create(ledgerInRef,{direction:'in',assetType:isCash?'cash':'goods',itemLabel,amount:value,quantity:isCash?0:Number(winner.prizeQuantity||1),unitValue:value/(isCash?1:Number(winner.prizeQuantity||1)),source:'prize_return',relatedId:winnerId,createdBy:uid,createdAt:FieldValue.serverTimestamp(),note:reason})
    if(raffleSnap.exists&&isCash){
      const deliveredTotal=previouslyDelivered+(current==='delivered'?-value:0)+(status==='delivered'?value:0)
      tx.update(raffleRef,{remainingCash:Math.max(0,(Number(raffleSnap.data().cashPool)||0)-deliveredTotal)})
    }
  })
  return {status}
})

exports.reviewDonation = onCall({ region: 'asia-southeast1', maxInstances: 2 }, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'အကောင့်ဝင်ရန် လိုအပ်ပါသည်။')
  if (!(await db.collection('admins').doc(request.auth.uid).get()).exists) throw new HttpsError('permission-denied', 'Admin ခွင့်ပြုချက်လိုအပ်သည်။')
  const donationId = String(request.data?.donationId || '')
  const status = request.data?.status
  if (!donationId || !['approved', 'rejected'].includes(status)) throw new HttpsError('invalid-argument', 'အလှူစာရင်းနှင့် အခြေအနေ မှန်ကန်စွာရွေးပါ။')
  const donationRef = db.collection('donations').doc(donationId)
  await db.runTransaction(async tx => {
    const snap = await tx.get(donationRef)
    if (!snap.exists) throw new HttpsError('not-found', 'အလှူစာရင်း မတွေ့ပါ။')
    const donation = snap.data()
    if (donation.status === status) return
    if (donation.status !== 'pending') throw new HttpsError('failed-precondition', 'ဤအလှူကို စစ်ဆေးပြီးပါပြီ။')
    const amount = Number(donation.value) || 0
    const quantity = Number(donation.quantity) || 0
    if (donation.kind === 'goods' && quantity <= 0) throw new HttpsError('failed-precondition', 'ပစ္စည်းအရေအတွက်ကို စစ်ဆေးပါ။')
    if (donation.kind !== 'goods' && amount <= 0) throw new HttpsError('failed-precondition', 'အလှူငွေပမာဏကို စစ်ဆေးပါ။')
    tx.update(donationRef, { status })
    if (status === 'approved') tx.create(db.collection('ledger').doc(), {
      direction:'in', assetType:donation.kind === 'goods' ? 'goods' : 'cash',
      itemLabel:donation.item || 'အလှူငွေ', amount,
      quantity:donation.kind === 'goods' ? quantity : 0,
      unitValue:Number(donation.unitValue)||Number(donation.value)||0,
      source:'donation', relatedId:donationId, createdBy:request.auth.uid, createdAt:FieldValue.serverTimestamp()
    })
  })
  return { status }
})
