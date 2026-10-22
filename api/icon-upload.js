'use strict';
const {authorized}=require('../lib/draft-auth');
const {checkLimit}=require('../lib/draft-store');
const {iconUploadUrl}=require('../lib/private-artifacts');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store, private');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'POST required.'})}
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(!body||typeof body.id!=='string'||Object.keys(body).some(k=>k!=='id'))
      return res.status(400).json({ok:false,error:'Invalid icon upload request.'});
    const draft=await authorized(req,body.id);
    if(!draft)return res.status(404).json({ok:false,error:'Private project access denied.'});
    if(!draft.verifiedAt||draft.status!=='domain_verified_unpaid'||!draft.customIconNotTransferred)
      return res.status(403).json({ok:false,error:'Verify domain ownership and select a custom icon first.'});
    if(!await checkLimit('icon-upload:'+draft.id,5,3600))
      return res.status(429).json({ok:false,error:'Too many icon upload attempts.'});
    const signed=await iconUploadUrl(draft.id);
    return res.status(200).json({ok:true,uploadUrl:signed.url,expiresInSeconds:180,contentType:'image/png'});
  }catch{
    return res.status(503).json({ok:false,error:'Private icon upload is not configured or is unavailable.'});
  }
};
