# Lucky Spinning Wheel

မြန်မာဘာသာဖြင့် ကံစမ်းမဲပြုလုပ်နိုင်သော React + Firebase ဝဘ်အက်ပ်။ Admin/အလှူရှင်/ဒိုင်က မဲအစီအစဉ်နှင့် ဆုငွေခွဲဝေမှုကို သတ်မှတ်နိုင်ပြီး၊ အတည်ပြုပြီးသား မဲဝင်သူက မိမိရရှိထားသော အကြိမ်အရေအတွက်အတိုင်း ကိုယ်တိုင် wheel လှည့်နိုင်သည်။ မဲရလဒ်၊ ဆုထပ်မထွက်မှုနှင့် အကြိမ်ကန့်သတ်ချက်ကို Firebase server function က ဆုံးဖြတ်သည်။

## လုပ်ဆောင်ချက်များ

- Email/Password နှင့် Google Sign-In ဖြင့် Register/Sign-In; အသစ်ဝင်သူအား Admin အတည်ပြုမှ မဲဝင်ခွင့်ရသည်။
- မဲအစီအစဉ်တစ်ခုစီအတွက် မဲတန်ဖိုး၊ မဲကန့်သတ်ချက်၊ ပုံ၊ ဘဏ်နှင့် mobile wallet ငွေလွှဲအချက်အလက်၊ ပုံသေဆုနှင့် ပစ္စည်းတန်ဖိုး သတ်မှတ်နိုင်သည်။
- ငွေဆုကန် (MMK) နှင့် နှစ်သိမ့်ဆုအရေအတွက် ထည့်ပါ။ ပုံသေငွေဆုများကို နုတ်ပြီး ကျန်ငွေကို နှစ်သိမ့်ဆုများအကြား ကျပ်ပြည့်ညီမျှစွာ ခွဲပေးသည်။ မခွဲဝေနိုင်သည့် ကျပ်ကျန်ကို ပထမဆု slot များတွင် တစ်ကျပ်စီ အစဉ်လိုက် ထည့်သည်။ နှစ်သိမ့်ဆုအရေအတွက် 0 ဖြစ်လျှင် ကျန်ငွေကို မပေးသေးဘဲ raffle လက်ကျန်အဖြစ်ထားသည်။
- အတည်ပြုထားသော entry တစ်ခုစီ၏ `ticketCount` သည် လှည့်ခွင့်အများဆုံးဖြစ်ပြီး server က `spinsUsed` ကို တိုးပေးသည်။ ဒိုင်/organizer ကလည်း ကျန်လှည့်ခွင့်ရှိသော မဲများထဲမှ server ကျပန်းရွေးပြီး လှည့်ပေးနိုင်သည်။
- ဆုတစ်ခုချင်းစီကို တစ်ကြိမ်သာ ပေးအပ်နိုင်သည်။ ဆု slot ကို server transaction ဖြင့် သုံးပြီးသားအဖြစ် မှတ်တမ်းတင်သဖြင့် တစ်ပြိုင်နက်လှည့်မှုများတွင် လည်း ဆုထပ်မထွက်ပါ။ ဆု slot အားလုံးကုန်ပြီးနောက် ကျန်လှည့်မှုများကို ဆုမရသောရလဒ်အဖြစ် မှတ်တမ်းတင်သည်.
- အတည်ပြုထားသော လှူဒါန်းငွေ/ပစ္စည်း၊ မဲလက်မှတ်ဝင်ငွေနှင့် ဆုပေးချေမှုကို Admin ledger တွင် အဝင်/အထွက်မှတ်တမ်းတင်ပြီး၊ ငွေသား၊ ပစ္စည်းအရေအတွက်နှင့် ပစ္စည်းတန်ဖိုးလက်ကျန်ကို ကြည့်နိုင်သည်။ ညှိနှိုင်းမှတ်တမ်းကို ကိုယ်တိုင်ထည့်နိုင်သည်။
- စီစဉ်သူ/ဒိုင်၊ အလှူရှင်၊ မဲဝင်သူ၊ မဲအစီအစဉ်၊ ဆုနှင့် လှူဒါန်းပစ္စည်းပုံများကို Firebase Storage တွင်တင်နိုင်သည် (ပုံတစ်ပုံ 5MB အောက်)။ ပုံများနှင့် အတည်ပြုပြီးသော ဆုရလဒ်အချို့သည် အများမြင်နိုင်သည်။ ကိုယ်ရေးလျှို့ဝှက်ပုံ မတင်ပါနှင့်။

## ဆုငွေခွဲဝေမှု ဥပမာ

ဆုငွေကန် 1,000,000 ကျပ်၊ ပုံသေဆု 300,000 + 200,000 + 100,000 ကျပ်၊ နှစ်သိမ့်ဆု 4 ဆုဟု သတ်မှတ်ပါက ကျန် 400,000 ကို 4 ဖြင့်စားပြီး နှစ်သိမ့်ဆုတစ်ဆုလျှင် 100,000 ကျပ် ရမည်။ ကျန်ကျပ်ရှိပါက ပထမနှစ်သိမ့်ဆု slot များထဲသို့ ကျပ်တစ်ကျပ်စီ ထည့်ပေးသည်။ UI က မဲမဖန်တီးမီ ခွဲဝေမှုကို preview ပြသည်။

ဤဆုငွေကန်သည် ငွေသားဆုများအတွက်ဖြစ်သည်။ ပစ္စည်းဆုများကို သီးခြားတန်ဖိုးနှင့် အရေအတွက်ဖြင့် inventory ledger တွင် မှတ်တမ်းတင်သည်။ Payment gateway နှင့် bank transfer အတည်ပြုမှု အလိုအလျောက်မပါဝင်သေးပါ။ Admin က လွှဲငွေစစ်ဆေးပြီးမှ မဲစာရင်း သို့မဟုတ် အလှူကို အတည်ပြုပါ။

## နည်းပညာနှင့် လိုအပ်ချက်များ

- Node.js 22 LTS, npm.
- Firebase Authentication: Email/Password နှင့် Google Sign-In; Cloud Firestore, Firebase Storage, Cloud Functions v2, Firebase Hosting.
- `package.json` နှင့် `package-lock.json` တွင် web dependencies သတ်မှတ်ထားသည်။ `functions/package.json` နှင့် lock ဖိုင်တွင် Cloud Functions dependencies သတ်မှတ်ထားသည်။ Python `requirements.txt` မလိုပါ။
- Cloud Functions deploy အတွက် Firebase project billing လိုအပ်နိုင်သည်။ လက်ရှိ quota နှင့် plan ကို Firebase Console တွင်စစ်ဆေးပါ။

## Local development

1. Firebase Console တွင် project ဖန်တီးပါ။ Authentication > Sign-in method မှ Email/Password နှင့် Google provider ဖွင့်ပါ။ Google provider တွင် support email သတ်မှတ်ပြီး Authentication settings > Authorized domains တွင် local/production domain များထည့်ပါ။
2. Firestore database နှင့် Storage bucket ဖန်တီးပါ။ Project settings > Your apps မှ Web app ဖန်တီး၍ config ယူပါ။
3. `.env.example` ကို `.env` အဖြစ်ကူးပြီး Firebase Web config (`VITE_FIREBASE_*`) တန်ဖိုးများဖြည့်ပါ။ `.env` ကို GitHub ပေါ် မတင်ပါနှင့်။
4. Root project မှ `npm ci`၊ ထို့နောက် `functions` folder မှ `npm ci` လုပ်ပါ။ Firebase CLI ကို install/login ဝင်ပြီး `firebase use --add` ဖြင့် project ကိုရွေးပါ။
5. Project owner သည် Google ဖြင့် (သို့) Email ဖြင့် ပထမ Admin account ကို register လုပ်ပြီး Authentication Users မှ UID ယူပါ။ Firestore Console တွင် `admins/{UID}` document ကို project owner အဖြစ် ကိုယ်တိုင်ဖန်တီးပါ။ Rules က client-side Admin promotion ကို တားထားသည်။
6. `firebase deploy --only firestore:rules,storage,functions` ဖြင့် backend rules/functions တင်ပါ။ `npm run dev` ဖြင့် local app စပါ။
7. Build စစ်ရန် `npm run build`; Functions syntax စစ်ရန် `node --check functions/index.js`; dependency audit စစ်ရန် root နှင့် `functions` folder နှစ်ခုစလုံးတွင် `npm audit --omit=dev` လုပ်ပါ။

## Google account တစ်ခုမှ အခြားသူထံ ပေးအပ်ခြင်း

App code တွင် သတ်မှတ်ထားသော Firebase/GitHub account မရှိပါ။ Project ကို အခြားပိုင်ရှင်ထံ လွှဲပေးရာတွင်:

1. ပိုင်ရှင်အသစ်သည် မိမိ Google account ဖြင့် Firebase project အသစ်တည်ဆောက်ပါ (သို့) လက်ရှိ project ပိုင်ရှင်က Google Cloud/Firebase IAM မှ Owner role ကို တရားဝင်ပေးအပ်ပါ။ Google Auth provider နှင့် Authorized domains များကို ပြင်ဆင်ပါ.
2. ပိုင်ရှင်အသစ်၏ Firebase Web config ဖြင့် `.env` အသစ်တည်ဆောက်ပါ။ Firebase project၊ Google OAuth domain၊ DNS နှင့် Hosting တို့သည် project တစ်ခုချင်းစီအလိုက် သီးခြားဖြစ်သည်.
3. Firestore နှင့် Storage rules, Cloud Functions ကို project အသစ်သို့ deploy လုပ်ပါ။ ပိုင်ရှင်အသစ် Google ဖြင့် sign-in ဝင်ပြီး UID ရလာလျှင် Firebase Console မှ `admins/{UID}` document ဖြင့် Admin ခွင့် bootstrap လုပ်ပါ.
4. Hosting custom domain လွှဲရာတွင် DNS verification နှင့် HTTPS certificate ကို hosting အသစ်တွင် သတ်မှတ်ပါ။ GitHub repository ကို fork လုပ်ခြင်း သို့မဟုတ် Settings > Transfer ownership ဖြင့် ပေးအပ်နိုင်သည်.

Firebase Auth ဝင်ထားသူတွင် `admins/{uid}` document မရှိပါက Admin ခွင့်မရပါ။ `.env`, service account/private key, Google OAuth secret များကို GitHub သို့ မတင်ပါနှင့်။

## Deploy: Firebase project `luckydraw-mksdev` and `lucky.mksdev.asia`

`firebase.json` တွင် Hosting rewrite, Firestore rules, Storage rules နှင့် Cloud Functions သတ်မှတ်ထားသည်။ Firebase CLI ကို `soemyintswe@gmail.com` အကောင့်ဖြင့် ချိတ်ပြီး `luckydraw-mksdev` project ကို ရွေးချယ်ပါ (မရှိသေးလျှင် ဖန်တီးပါ)။ ထို့နောက် `npm run build`, `firebase deploy` လုပ်ပါ။ Project ID သည် တစ်ကမ္ဘာလုံးတွင် မတူညီရပါမည်။ အခြား account က အရင်ပိုင်ထားပြီးဖြစ်ပါက project Owner က `soemyintswe@gmail.com` ကို Owner အဖြစ် ဖိတ်ခေါ်ပေးရပါမည်။ Firebase Console > Hosting > Add custom domain တွင် `lucky.mksdev.asia` ထည့်ပြီး ပေးသော verification/DNS records ကို `mksdev.asia` DNS provider တွင် သတ်မှတ်ပါ။ လက်ရှိကွန်ပျူတာ၏ Firebase CLI သည် `mks.edu.services@gmail.com` ဖြင့် ဝင်ထားသဖြင့် `soemyintswe@gmail.com` OAuth နှင့် project ပိုင်ဆိုင်မှုကို အတည်ပြုပြီး deploy လုပ်ရန် ကျန်ရှိနေပါသည်။

## Repository guide

- `src/main.jsx`, `src/style.css`: Burmese GUI နှင့် Firebase client integration.
- `functions/index.js`: auth callback, entry/donation approval, transactional draw နှင့် cash/in-kind ledger.
- `firestore.rules`, `storage.rules`: client data access နှင့် image upload rules.
- `PROJECT_WORK_LOG.md`: ဆက်လုပ်မည့် agent/developer အတွက် project လုပ်ငန်းမှတ်တမ်း.
- `docs/ARCHITECTURE.md`: Firestore schema, draw/award rules, account handover.

## License

MIT License. See [LICENSE](LICENSE).

## Recurring rounds, prize custody, and reports

- One setup can create 1–24 separate rounds, spaced by a chosen number of days. Each round stores its opening time and draw time; times are entered in the browser's local timezone and stored as ISO timestamps. Entry approval and prize spins are enforced by server time checks. A round without a draw time may be spun any time after opening.
- Winning a prize reserves it for the winner. It remains in inventory and the cash balance until an Admin marks it transferred. If it cannot be delivered, Admin can reclaim it with a reason; reclaiming an untransferred prize releases the reservation, and reclaiming an already delivered prize posts a ledger return. The original win remains in the winner history.
- Admin > Reports exports a UTF-8 CSV containing participant entries, donations, prize outcomes/delivery status, and ledger transactions.

## Sign-in providers

Email/password and Google sign-in are implemented. Facebook sign-in is implemented in the UI but requires an owner to enable Facebook in Firebase Authentication and enter the Facebook App ID/secret in Firebase Console. Viber and Telegram details are supported as contact fields; they are not direct Firebase sign-in providers in this app. Direct identity sign-in would require a separately configured, verified custom authentication integration. Do not ask users for Viber/Telegram passwords.
