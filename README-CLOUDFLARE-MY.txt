JERRY MIFFY MAKEUP AI STUDIO — CLOUDFLARE PAGES BUILD (25 LOOKS)

ဤ ZIP သည် မူလ 25_LOOKS_INTEGRATED project ကို Cloudflare Pages Functions အတွက် ပြောင်းထားသော build ဖြစ်သည်။ မူလ Netlify ZIP ကို မပြင်ထားပါ။

ပြင်ဆင်ထားသောအချက်များ
- Browser က API ကို /.netlify/functions/... မခေါ်တော့ဘဲ /api/consult နှင့် /api/preview ကို ခေါ်သည်။
- functions/api/consult.js နှင့် functions/api/preview.js သည် Cloudflare Pages Functions ပုံစံဖြစ်သည်။
- Gemini key ကို env.GEMINI_API_KEY မှ လုံခြုံစွာဖတ်သည်။
- 25 makeup looks နှင့် မူလ design ကို ထိန်းထားသည်။

အရေးကြီး — DEPLOY နည်း
Cloudflare Dashboard ရှိ Pages “Drag and drop” upload သည် Functions folder ကို run မလုပ်နိုင်ပါ။ ထိုနည်းဖြင့် တင်လျှင် Website ပေါ်လာနိုင်သော်လည်း Analyze/Preview API က 404 ပြန်နိုင်သည်။ Functions ပါအလုပ်လုပ်ရန် Git integration (GitHub) သို့မဟုတ် Wrangler CLI ဖြင့် deploy လုပ်ရမည်။

GitHub နည်း (အကြံပြု)
1. ZIP ကို Extract လုပ်ပါ။
2. Project ထဲက ဖိုင်အားလုံး (index.html, app.js, styles.css, makeup-looks.mjs, functions folder, wrangler.toml) ကို GitHub repository အသစ်တစ်ခု၏ root ထဲ upload လုပ်ပါ။ Folder အဆင့်တစ်ထပ်မပိုစေရ။
3. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git ကိုရွေးပြီး ထို repository ကိုချိတ်ပါ။
4. Framework preset: None. Build command: (ဗလာထားပါ). Build output directory: . (dot)
5. Deploy ပြီးနောက် Pages project → Settings → Variables and Secrets ထဲဝင်ပါ။
6. GEMINI_API_KEY ကို Secret အဖြစ်ထည့်ပါ။ Value နေရာမှာ Gemini API key ထည့်ပြီး Save လုပ်ပါ။
7. အသစ် Deploy ပြီးမှ Website ကို refresh လုပ်ပြီး Analyze နှင့် Preview ကို စမ်းပါ။

Wrangler CLI နည်း (ကွန်ပျူတာ/Terminal ရှိသူများ)
Project root မှာ `npx wrangler pages deploy . --project-name jerry-miffy-makeup-ai-studio` ကို run လုပ်ပါ။ ပထမဆုံး project ဖန်တီးရန် prompt များကို လိုက်ဖြေပါ။ Secret ထည့်ရန် `npx wrangler pages secret put GEMINI_API_KEY --project-name jerry-miffy-makeup-ai-studio` ကို run လုပ်ပြီး key ကို prompt တွင်ထည့်ပါ။

API Key လုံခြုံရေး
- GEMINI_API_KEY ကို index.html, app.js သို့မဟုတ် အခြား public file ထဲ မထည့်ပါနှင့်။
- Screenshot သို့မဟုတ် chat ထဲတွင် API key အပြည့်အစုံ မပို့ပါနှင့်။

မှတ်ချက်
- Gemini model/API availability, quota နှင့် billing ပေါ်မူတည်၍ Preview အောင်မြင်မှုကွာနိုင်သည်။
- Cloudflare ပြောင်းခြင်းသည် Gemini API ကို အခမဲ့ဖြစ်စေသည်ဟု မဆိုလိုပါ။
- မူလ Netlify site နှင့် backup ZIP ကို သီးခြားသိမ်းထားပါ။
