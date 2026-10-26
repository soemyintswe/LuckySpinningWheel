# Lucky Spinning Wheel

မြန်မာဘာသာဖြင့် ကံစမ်းမဲအစီအစဉ်များ ဖန်တီးခြင်း၊ register/အတည်ပြုခြင်း၊ ဆု wheel လှည့်ခြင်းနှင့် ငွေ/ပစ္စည်းစာရင်း၊ report ထုတ်ခြင်းတို့ ပါဝင်သော React + Firebase app ဖြစ်သည်။ လက်ရှိ setup ကို Firebase Spark အခမဲ့အစီအစဉ်နှင့် အသုံးပြုရန် ပြင်ဆင်ထားသည်။

## ပါဝင်သည့်လုပ်ဆောင်ချက်များ

- Email/password နှင့် Google account sign-in. အသစ်စာရင်းသွင်းသူများကို Admin က အတည်ပြုသည်။
- မဲအစီအစဉ်ကို တစ်ကြိမ်တည်း သို့မဟုတ် သတ်မှတ်ထားသည့် အကြိမ်ရေ၊ ရက်ကွာခြားမှု၊ ဖွင့်ချိန်/ဖောက်ချိန်ဖြင့် ဖန်တီးနိုင်သည်။
- ငွေသားဆုကန်၊ ပုံသေဆုအဆင့်၊ ပစ္စည်းတန်ဖိုး၊ အရေအတွက်၊ နှစ်သိမ့်ဆုအရေအတွက် သတ်မှတ်နိုင်သည်။ ပုံသေငွေဆုများနုတ်ပြီး ကျန်ငွေကို နှစ်သိမ့်ဆုများအကြား ကျပ်ပြည့်ညီမျှ ခွဲဝေပေးသည်။
- အတည်ပြုထားသော မဲစာရင်းတစ်ခု၏ `ticketCount` သည် လှည့်ခွင့်အများဆုံးဖြစ်သည်။ Firestore transaction တစ်ခုစီတွင် `spinsUsed` နှင့် မဲဖောက်ကြိမ်ရေကို တစ်ပြိုင်နက်တိုးစေပြီး `claimedSlots` ဖြင့် ဆုတစ်ဆုကို တစ်ကြိမ်သာရစေသည်။
- ဆုမလွှဲမချင်း လက်ကျန်စာရင်းတွင် ရှိနေသည်။ Admin က လွှဲပြီးကြောင်း သို့မဟုတ် အကြောင်းပြချက်ဖြင့် ပြန်သိမ်းကြောင်း မှတ်တမ်းတင်နိုင်ပြီး ငွေ/ပစ္စည်းစာရင်းကို transaction ဖြင့် တစ်ပြိုင်နက်ပြင်ဆင်သည်။
- အလှူရှင်၊ ပစ္စည်း၊ ကံစမ်းသူ၊ မဲအစီအစဉ်နှင့် ဆုများအတွက် image URL ထည့်နိုင်သည်။ Google Drive အပါအဝင် အများကြည့်နိုင်သော direct image URL သာလိုအပ်သည်။ ဤ app သည် ပုံ upload မလုပ်ပါ။
- Admin report ကို UTF-8 CSV အဖြစ် download လုပ်နိုင်သည်။

## မဲဖောက်မှု fairness болон security хязгаарлалт

Client သည် `crypto.getRandomValues()` ကိုသုံး၍ ရလဒ်ရွေးကာ Firestore transaction ကိုရေးသည်။ Security Rules က အတည်ပြုထားသော မဲစာရင်း၊ တစ်ကြိမ်လျှင် ခွင့်တစ်ကြိမ်သာလျှော့ခြင်း၊ သတ်မှတ်ထားသည့် အများဆုံးအကြိမ်နှင့် ဆုတစ်ဆုထပ်မရခြင်းတို့ကို စစ်ဆေးသည်။ သို့သော် Spark တွင် Cloud Functions မသုံးသဖြင့် ပြုပြင်ထားသော browser က random ရလဒ်ကို လှည့်စားနိုင်သည်။ ထို့ကြောင့် ဤဗားရှင်းကို **server ဘက်မှ အတည်ပြုထားသော၊ လိမ်လည်ပြင်ဆင်မှုမဖြစ်နိုင်သော မဲဖောက်စနစ်ဟု မယူဆရပါ**။ တန်ဖိုးမြင့် သို့မဟုတ် အများပြည်သူဆိုင်ရာ မဲဖောက်မှုအတွက် server ဘက်မှ မဲဖောက်ခြင်း သို့မဟုတ် လွတ်လပ်စွာစစ်ဆေးနိုင်သော ဝန်ဆောင်မှု လိုအပ်သည်။

## Local development

Тохиргоо: Node.js 22 LTS, npm. Firebase Auth болон Firestore ашиглана. Functions, Storage bucket, төлбөрийн холболт шаардлагагүй.

1. Dependencies татах: `npm ci`
2. `.env.example`-ээс `.env` үүсгээд Firebase Web config (`VITE_FIREBASE_*`) утгуудаа бөглөнө. `.env`-ийг GitHub-д commit хийж болохгүй.
3. Firebase Console-д Email/Password, Google providers-ийг идэвхжүүлж Firestore database, rules-ийг тохируулна. `lucky.mksdev.asia`-г ашиглах бол Auth authorized domains-д нэмнэ.
4. Анхны owner/admin хэрэглэгчээр нэвтэрсний дараа Firestore Console-д зөв хэрэглэгчийн UID дор `admins/{UID}` document үүсгэнэ. Үүнийг зөвхөн project owner удирдана.
5. Rules/indexes: `firebase deploy --only firestore:rules,firestore:indexes`
6. Local app: `npm run dev` (ихэвчлэн `http://localhost:5173`). Build: `npm run build`.

Firebase web API key нь browser config бөгөөд `.env`-д байх нь хэвийн; Firestore Rules нь өгөгдлийг хамгаалах гол хил юм. Service account key, OAuth secret болон нууц credential-уудыг repository-д хэзээ ч бүү оруул.

## Зураг оруулах

Зургийг Google Drive эсвэл өөр HTTPS хостод байршуулж, “anyone with the link” харах эрхтэй URL-ийг оруулна. Drive link-ийг thumbnail URL руу хувиргахыг оролдоно. Хост зураг харуулахыг хориглосон, link өөрчлөгдсөн, эсвэл нууцлалтай болсон тохиолдолд зураг харагдахгүй. Image URL нь public бол түүнд хамаарах зургийг бусад хэрэглэгч үзэж болно.

## Project handover

Шинэ эзэмшигч Firebase project дээрээ Auth providers, Firestore database/rules/indexes, authorized domains болон өөрийн `.env` тохируулна. Admin UID-г зөвхөн project owner үүсгэнэ. Custom domain шилжүүлэхийн тулд Firebase Hosting domain болон DNS эзэмшигчийн эрхийг тусад нь тохируулна. GitHub repository-г account-аар fork эсвэл transfer хийж болно. Өөр хүний Firebase project рүү `.env`-г дамжуулахгүй; шинэ project-ийн Web config-оор сольж хэрэглэнэ.

## Repository files

- `src/main.jsx`, `src/style.css`: UI болон Firebase client logic.
- `firestore.rules`, `firestore.indexes.json`: data access болон query indexes.
- `functions/`: хуучин server-side хувилбарын source; Spark deployment-д ашиглахгүй.
- `PROJECT_WORK_LOG.md`: хөгжүүлэлт, сонголт, хязгаарлалт болон дараагийн ажлын тэмдэглэл.
- `docs/ARCHITECTURE.md`: collection загвар болон draw transaction.
- `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`: repository governance.
