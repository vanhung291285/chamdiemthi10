/* SmartOMR 2.1: on-device, no external API required for registration mark detection.
   Recognizes ONLY the 2018 sample's four large black corner registration squares.
   Results are image pixel coordinates in order TL, TR, BR, BL. */
(function (root) {
  'use strict';
  function detect(source) {
    const sw = source.videoWidth || source.naturalWidth || source.width;
    const sh = source.videoHeight || source.naturalHeight || source.height;
    if (!sw || !sh) return {ok:false, reason:'Camera chưa có khung hình'};
    const factor=Math.min(1,1000/Math.max(sw,sh));
    const w=Math.round(sw*factor),h=Math.round(sh*factor);
    if (w<150 || h<150) return {ok:false,reason:'Ảnh có độ phân giải quá thấp'};
    const canvas=document.createElement('canvas'); canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(source,0,0,w,h);
    const image=ctx.getImageData(0,0,w,h).data, n=w*h;
    const grayscale=new Uint8Array(n),hist=new Uint32Array(256);
    for(let i=0,j=0;i<n;i++,j+=4){
      const v=(image[j]*77+image[j+1]*150+image[j+2]*29)>>8;
      grayscale[i]=v;hist[v]++;
    }
    // Adaptive threshold based on local background, so half-shadowed paper
    // does not make the printed registration marks merge into the background.
    // Integral image computes a per-pixel local average in O(w*h).
    const stride=w+1,integral=new Float64Array((h+1)*stride);
    for(let y=0;y<h;y++){
      let rowsum=0;
      for(let x=0;x<w;x++){
        rowsum+=grayscale[y*w+x];
        integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+rowsum;
      }
    }
    const radius=Math.max(14,Math.round(Math.min(w,h)*.045));
    const dark=new Uint8Array(n);
    for(let y=0;y<h;y++){
      const y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1);
      for(let x=0;x<w;x++){
        const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1);
        const localMean=(integral[y1*stride+x1]-integral[y1*stride+x0]-integral[y0*stride+x1]+integral[y0*stride+x0])/((y1-y0)*(x1-x0));
        const limit=Math.max(16,Math.min(145,localMean*.55));
        dark[y*w+x]=grayscale[y*w+x]<limit?1:0;
      }
    }
    const seen=new Uint8Array(n),queue=new Int32Array(n),markers=[];
    const minSide=Math.min(w,h),minDim=Math.max(4,Math.round(minSide*.006));
    const maxDim=Math.round(minSide*.085);
    // 4-connected foreground components. Region threshold excludes red bubble outlines.
    for(let k=0;k<n;k++){
      if(seen[k] || !dark[k])continue;
      let head=0,tail=1;queue[0]=k;seen[k]=1;
      let minX=k%w,maxX=minX,minY=Math.floor(k/w),maxY=minY;
      while(head<tail){
        const t=queue[head++],x=t%w,y=(t/w)|0;
        if(x<minX)minX=x;if(x>maxX)maxX=x;
        if(y<minY)minY=y;if(y>maxY)maxY=y;
        const nb=[x>0?t-1:-1,x<w-1?t+1:-1,y>0?t-w:-1,y<h-1?t+w:-1];
        for(let m=0;m<4;m++){
          const z=nb[m];if(z>=0&&!seen[z]&&dark[z]){seen[z]=1;queue[tail++]=z;}
        }
      }
      const bw=maxX-minX+1,bh=maxY-minY+1,aspect=bw/bh,density=tail/(bw*bh);
      if(bw<minDim||bh<minDim||bw>maxDim||bh>maxDim||aspect<.58||aspect>1.7||density<.67)continue;
      if(minX<2||minY<2||maxX>w-3||maxY>h-3)continue;
      // Print registration marks are filled squares separated from other content.
      // Large text and black table borders usually fail the density/aspect tests.
      markers.push({x:(minX+maxX)/2,y:(minY+maxY)/2,size:(bw+bh)/2,density});
    }
    if(markers.length<4)return {ok:false,reason:'Chưa thấy đủ bốn ô vuông định vị',markers:markers.length};
    // For upright portrait sheets, extreme corner components correspond to its fiducials.
    const pick=(score,reverse=false)=>[...markers].sort((a,b)=>reverse?score(b)-score(a):score(a)-score(b))[0];
    const corners=[pick(p=>p.x+p.y),pick(p=>p.x-p.y,true),pick(p=>p.x+p.y,true),pick(p=>p.y-p.x,true)];
    if(new Set(corners).size!==4)return {ok:false,reason:'Mốc đen chưa được phân biệt rõ',markers:markers.length};
    const [tl,tr,br,bl]=corners;
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const top=dist(tl,tr),bottom=dist(bl,br),left=dist(tl,bl),right=dist(tr,br);
    const area=Math.abs(corners.reduce((sum,p,i)=>sum+p.x*corners[(i+1)%4].y-corners[(i+1)%4].x*p.y,0))/2;
    if(area<w*h*.15||top<w*.25||bottom<w*.25||left<h*.37||right<h*.37)
      return {ok:false,reason:'Phiếu chưa nằm trọn trong khung camera',markers:markers.length};
    if(Math.max(top,bottom)/Math.min(top,bottom)>2.1||Math.max(left,right)/Math.min(left,right)>2.1)
      return {ok:false,reason:'Phiếu quá nghiêng hoặc mốc chưa chính xác',markers:markers.length};
    const sizes=corners.map(p=>p.size),ratio=Math.max(...sizes)/Math.min(...sizes);
    if(ratio>2.6)return {ok:false,reason:'Bốn mốc có kích thước không đồng đều',markers:markers.length};
    return {
      ok:true,points:corners.map(p=>[p.x/factor,p.y/factor]),
      coverage:area/(w*h),markers:markers.length,width:sw,height:sh,
      reason:'Đã phát hiện đủ 4 mốc định vị'
    };
  }
  // Lightweight quality check for the actual paper region. This is NOT a recognition
  // confidence score; it rejects obvious motion blur/poor exposure before auto-capture.
  function quality(source, points) {
    const sw=source.videoWidth||source.naturalWidth||source.width;
    const sh=source.videoHeight||source.naturalHeight||source.height;
    if(!sw||!sh||!points?.length)return {ok:false,reason:'Chưa có ảnh phiếu'};
    const factor=Math.min(1,680/Math.max(sw,sh));
    const w=Math.max(1,Math.round(sw*factor)),h=Math.max(1,Math.round(sh*factor));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,w,h);
    const img=ctx.getImageData(0,0,w,h).data;
    const gray=new Uint8Array(w*h);
    for(let i=0,j=0;i<gray.length;i++,j+=4)gray[i]=(img[j]*77+img[j+1]*150+img[j+2]*29)>>8;
    const xs=points.map(p=>p[0]*factor),ys=points.map(p=>p[1]*factor);
    const x0=Math.max(3,Math.floor(Math.min(...xs))),x1=Math.min(w-4,Math.ceil(Math.max(...xs)));
    const y0=Math.max(3,Math.floor(Math.min(...ys))),y1=Math.min(h-4,Math.ceil(Math.max(...ys)));
    let light=0,count=0,edges=[];
    for(let y=y0+2;y<y1-2;y+=3){
      for(let x=x0+2;x<x1-2;x+=3){
        const k=y*w+x,g=gray[k];
        light+=g;count++;
        edges.push(Math.abs(4*g-gray[k-1]-gray[k+1]-gray[k-w]-gray[k+w]));
      }
    }
    if(count<150)return {ok:false,reason:'Phiếu quá nhỏ trong khung hình'};
    edges.sort((a,b)=>a-b);
    const sharpness=edges[Math.floor(edges.length*.93)];
    const brightness=light/count;
    const ok=sharpness>=11&&brightness>=70&&brightness<=252;
    return {ok,sharpness:Math.round(sharpness),brightness:Math.round(brightness),reason:
      brightness<70?'Ảnh quá tối; bật thêm đèn hoặc tránh che sáng':
      brightness>252?'Ảnh bị lóa hoặc quá sáng':
      sharpness<11?'Ảnh mờ hoặc đang rung; giữ chắc điện thoại và chờ lấy nét':'Ảnh đủ nét để đọc'};
  }
  root.SmartOMRDetect={find:detect,quality};
})(window);
