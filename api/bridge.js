/** SmartOMR 2.0 — HTTPS same-origin bridge: browser -> Vercel -> Apps Script.
 * Environment variables (Vercel Settings -> Environment Variables):
 *   GAS_EXEC_URL : URL /exec của Web App Apps Script
 *   BRIDGE_SECRET: phải giống BRIDGE_SECRET trong Apps Script Script Properties
 */
const ALLOWED = new Set(['login','bootstrap','saveConfig','saveKeys','saveRoster','saveResult','listResults','logout']);

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Chỉ nhận POST.'});
  }
  const exec=process.env.GAS_EXEC_URL||'';
  const secret=process.env.BRIDGE_SECRET||'';
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(exec)||secret.length<24){
    return res.status(503).json({ok:false,code:'NOT_CONFIGURED',error:'Chưa cấu hình GAS_EXEC_URL hoặc BRIDGE_SECRET trên Vercel.'});
  }
  try{
    // Không cho một trang web khác dùng trình duyệt khách để gọi trực tiếp cầu nối này.
    const origin=req.headers.origin||'';
    const host=req.headers.host||'';
    if(origin&&new URL(origin).host!==host)return res.status(403).json({ok:false,error:'Nguồn gọi không hợp lệ.'});
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!body||!ALLOWED.has(body.action))return res.status(400).json({ok:false,error:'Hành động API không hợp lệ.'});
    if(JSON.stringify(body).length>650000)return res.status(413).json({ok:false,error:'Dữ liệu quá lớn.'});
    // Bí mật chỉ có trên server; không được đưa vào HTML, URL, localStorage hay trả về client.
    const upstream={...body,bridgeSecret:secret};
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),25000);
    let response;
    try{
      response=await fetch(exec,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(upstream),redirect:'follow',signal:ctrl.signal});
    }finally{clearTimeout(timer);}
    const raw=await response.text();
    let json;
    try{json=JSON.parse(raw);}catch(_e){
      return res.status(502).json({ok:false,code:'UPSTREAM_HTML',error:'Apps Script không trả JSON. Kiểm tra URL /exec, quyền “Anyone”, quyền cấp phép và phiên bản triển khai.'});
    }
    if(!response.ok)return res.status(502).json({ok:false,code:'UPSTREAM_HTTP',error:'Apps Script trả mã HTTP '+response.status});
    return res.status(json.ok?200:(json.code==='UNAUTHORIZED'||json.code==='BAD_PIN'?401:400)).json(json);
  }catch(error){
    return res.status(502).json({ok:false,code:'BRIDGE_ERROR',error:error.name==='AbortError'?'Apps Script quá thời gian phản hồi. Hãy thử lại.':'Kết nối Google Apps Script thất bại: '+error.message});
  }
}
