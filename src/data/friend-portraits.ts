// Public profile portraits selected from each creator's site/profile or speaker page, 2026-10-12.
// Keep the original URLs and publishing pages together so attribution survives future image changes.
// Images are served from their original hosts; no generated likenesses or third-party news photos.
interface Portrait {
  src: string;
  source: string;
  sourceName: string;
  position?: string;
  photographer?: string;
}
export const friendPortraits: Record<string, Portrait> = {
  aviz: {
    src: 'https://ugc.production.linktr.ee/67be7cb1-12f3-4430-8e53-2329fea94189_455744501-405820559193940-6730676586471920500-n.jpeg?io=true&size=avatar-v3_0',
    source: 'https://linktr.ee/aviz85', sourceName: 'Linktree',
  },
  yuval: {
    src: 'https://blog.yuv.ai/content/images/2025/08/yuval-2.jpeg',
    source: 'https://blog.yuv.ai/', sourceName: 'YUV.AI', position: '50% 30%',
  },
  amitay: {
    src: 'https://builderslab.ai/assets/amitay-CEDuna_G.png',
    source: 'https://builderslab.ai/', sourceName: 'Builders Lab',
  },
  danny: {
    src: 'https://www.dannyshaket.com/assets/misc/37201860-3.jpg',
    source: 'https://www.dannyshaket.com/', sourceName: 'Danny Shaket', position: '50% 30%',
  },
  ben: {
    src: 'https://www.aiforwork.ing/assets/ben-800.webp',
    source: 'https://www.aiforwork.ing/', sourceName: 'AI for Work', position: '50% 30%',
  },
  shachar: {
    src: 'https://ugc.production.linktr.ee/tLJzXmvNQviZgjBhodeA_wer8MVDW6KA4Vo34?io=true&size=avatar-v3_0',
    source: 'https://linktr.ee/sgolan20', sourceName: 'Linktree',
  },
  omri: {
    src: 'https://substackcdn.com/image/fetch/%24s_%213Iez%21%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F39d39d45-5bd3-4779-9398-99f6ac7178ac_541x541.png',
    source: 'https://www.epicnews.io/about', sourceName: 'epicNews',
  },
  eyal: {
    src: 'https://eyalgruss.com/media/me.jpg',
    source: 'https://eyalgruss.com/', sourceName: 'Eyal Gruss',
  },
  doron: {
    src: 'https://www.everything-ai.agency/_next/image?q=75&url=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Fai-studio-490019.firebasestorage.app%2Fo%2Fspeakers%252Fdoron-tsur%252Fprofile_1786543607630.webp%3Falt%3Dmedia%26token%3D65b74367-f726-432f-a523-e47664b54234&w=3840',
    source: 'https://www.everything-ai.agency/he/speakers/doron-tsur', sourceName: 'Everything AI', position: '50% 30%',
  },
  tal: {
    src: 'https://sushilab.ai/assets/tal-BXjacl_T.png',
    source: 'https://sushilab.ai/about', sourceName: 'SushiLab.ai',
  },
  eilon: {
    src: 'https://eilon.co/wp-content/uploads/2023/08/%D7%AA%D7%9E%D7%95%D7%A0%D7%AA-%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C-%D7%90%D7%99%D7%99%D7%9C%D7%95%D7%9F-%D7%92%D7%A8%D7%95%D7%A4%D7%A8.png.webp',
    source: 'https://eilon.co/', sourceName: 'Eilon Grupper', position: '50% 30%',
  },
  daniel: {
    src: 'https://designai.co.il/wp-content/uploads/2025/09/Mask-group-6.png',
    source: 'https://designai.co.il/workshop-for-product-n-design/', sourceName: 'Design AI',
  },
  ran: {
    src: 'https://internet-israel.com/wp-content/uploads/2023/01/%D7%A8%D7%9F-%D7%91%D7%A8-%D7%96%D7%99%D7%A7-%D7%AA%D7%9E%D7%95%D7%A0%D7%94-%D7%A8%D7%A9%D7%9E%D7%99%D7%AA-2023-%D7%92%D7%95%D7%93%D7%9C-%D7%A7%D7%98%D7%9F-%D7%A8%D7%99%D7%91%D7%95%D7%A2-1024x1001.jpg',
    source: 'https://internet-israel.com/', sourceName: 'Internet Israel', photographer: 'דנה ברק',
  },
  tom: {
    src: 'https://substackcdn.com/image/fetch/f_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A/substack-post-media.s3.amazonaws.com/public/images/76e0ed7f-bd93-46f9-bbc1-edb702489185_5317x3472.jpeg',
    source: 'https://substack.com/@tomeven', sourceName: 'Substack', position: '50% 35%',
  },
};
