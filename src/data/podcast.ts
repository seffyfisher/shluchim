// Approved, published audio only. This file never creates or syndicates audio.
export const PODCAST = {
  name: 'שְׁלוּחִים',
  spotifyShowId: '6ueCCm5YS5Oth66FbwkjO8',
  spotifyUrl: 'https://open.spotify.com/show/6ueCCm5YS5Oth66FbwkjO8',
  appleUrl: 'https://podcasts.apple.com/us/podcast/id6823130897',
  feedUrl: 'https://www.spreaker.com/show/7465546/episodes/feed',
} as const;

export interface Episode {
  /** Exact GUID from the official RSS, verified separately from the Spotify ID. */
  rssGuid: string;
  number?: number;
  title: string;
  description?: string;
  spotifyId: string;
  spotifyUrl: string;
  spreakerUrl?: string;
  published: string;
  duration: string;
  durationIso: string;
  language: string;
  aiNarrated: boolean;
  postPath?: string;
  postTitle?: string;
  /** Further Hebrew source posts of the same episode (an episode can be based on several posts). */
  morePosts?: readonly { path: string; title: string }[];
}

export const EPISODES = {
  'wake-up-sky-1': {
    rssGuid: 'https://api.spreaker.com/episode/75804362',
    number: 1,
    title: 'עורו, שמיים. | פרק 1',
    description: 'הבן שלי קורא לצ׳אט הקולי ״שמיים״. אחרי שעתיים וחצי של עבודה בקול במשרד, התחלתי להבין אותו.',
    spotifyId: '1Ccf2UKMMvEhrCb4mvnKJt',
    spotifyUrl: 'https://open.spotify.com/episode/1Ccf2UKMMvEhrCb4mvnKJt',
    spreakerUrl: 'https://www.spreaker.com/episode/wrw-smyym-prq-1--75804362',
    published: '2026-10-15',
    duration: '5:14',
    durationIso: 'PT5M14S',
    language: 'he',
    aiNarrated: true,
    postPath: 'posts/2026-10-13-wake-up-sky/',
    postTitle: 'עורו, שמיים.',
  },
  'dial-bot-2': {
    rssGuid: 'https://api.spreaker.com/episode/75971655',
    number: 2,
    title: 'איך השְׁלוּחִים שלי מרימים טלפון (איפה אתם?)',
    description: 'רציתי שלוח שמתקשר בעברית וקובע לי דברים. בדרך היו שתי פלטפורמות, חודש בלי מספר, זר פרחים שלא הוזמן ושיחה ראשונה שקטה לגמרי. בסוף יצא ממנו דני, הסטנדאפיסט הגרוע ביותר בישראל.',
    spotifyId: '6hTt8Fs8nll2Ug9vHFwSMl',
    spotifyUrl: 'https://open.spotify.com/episode/6hTt8Fs8nll2Ug9vHFwSMl',
    spreakerUrl: 'https://www.spreaker.com/episode/yk-hselwhiym-sly-ykwlym-ksyw-gm-lhwzy-syhwt-ywz-wt-btlpwn-prq-2--75971655',
    published: '2026-10-25',
    duration: '9:40',
    durationIso: 'PT9M40S',
    language: 'he',
    aiNarrated: true,
    postPath: 'posts/2026-10-12-dial-bot/',
    postTitle: 'איך השְׁלוּחִים שלי יכולים עכשיו גם להוציא שיחות יוצאות בטלפון.',
  },
  'knock-3': {
    rssGuid: 'https://api.spreaker.com/episode/76189862',
    number: 3,
    title: 'השלוח שדופק בדלת | פרק 3',
    description: 'מתקינים, ועכשיו מה? השָׁלוּחַ שלמד לדפוק בדלת, ואז גם מרכז אחד לכל התזכורות. שגרת צ׳ק־אין שמדפיקה אותך לפעולה, וצילום מסך במקום עוד משימה ששוכחים. אחר כך שלוח אחד שמרים את כל התזכורות במקום עשרות התראות.',
    spotifyId: '6uNHeTuZMUp2SRauPVPHCV',
    spotifyUrl: 'https://open.spotify.com/episode/6uNHeTuZMUp2SRauPVPHCV',
    spreakerUrl: 'https://www.spreaker.com/episode/hslwh-sdwpq-bdlt-prq-3--76189862',
    published: '2026-11-05',
    duration: '6:04',
    durationIso: 'PT6M4S',
    language: 'he',
    aiNarrated: true,
    postPath: 'posts/2026-09-21-thin-work-checkin-bot/',
    postTitle: 'מתקינים, ועכשיו מה? השלוח שלמד לדפוק בדלת.',
    morePosts: [{ path: 'posts/2026-10-06-reminders-shaliach/', title: 'שלוח אחד לכל התזכורות.' }],
  },
  'warehouse-4': {
    rssGuid: 'https://api.spreaker.com/episode/76410074',
    number: 4,
    title: 'המחסן של כאילו | פרק 4',
    description: 'הרעיון הכי טוב שלכם מהשבוע קבור עכשיו באיזו שיחה עם AI. בהצלחה למצוא אותו. אצלי הכול נכנס למחסן אחד מחוץ לכלי ה־AI, ליניאר במקרה שלי, ואני פשוט אומר לשלוח ״תרשום לי במחסן״.',
    spotifyId: '0ozEsrv46dmQR80Lnk6RRn',
    spotifyUrl: 'https://open.spotify.com/episode/0ozEsrv46dmQR80Lnk6RRn',
    spreakerUrl: 'https://www.spreaker.com/episode/hmhsn-sl-k-ylw-prq-4--76410074',
    published: '2026-11-16',
    duration: '6:49',
    durationIso: 'PT6M49S',
    language: 'he',
    aiNarrated: true,
    postPath: 'posts/2026-10-15-central-warehouse/',
    postTitle: 'המחסן של כאילו',
  },
} as const satisfies Record<string, Episode>;

/** Only verified GUID enrichment can supply Spotify/post links to an RSS row. */
export function episodeForGuid(guid: string): Episode | undefined {
  return (Object.values(EPISODES) as Episode[]).find((episode) => episode.rssGuid === guid);
}

export function validateEpisodeEnrichment(feedGuids: string[]) {
  const seen = new Set<string>();
  for (const episode of Object.values(EPISODES) as Episode[]) {
    if (!episode.rssGuid || !feedGuids.includes(episode.rssGuid)) throw new Error('Podcast enrichment: exact verified RSS GUID missing from snapshot');
    if (seen.has(episode.rssGuid)) throw new Error('Podcast enrichment: duplicate RSS GUID');
    seen.add(episode.rssGuid);
    if (!/^[A-Za-z0-9]{22}$/.test(episode.spotifyId) || episode.spotifyUrl !== `https://open.spotify.com/episode/${episode.spotifyId}`) throw new Error('Podcast enrichment: Spotify ID and direct URL must agree');
  }
}

// Exact content collection IDs, including language. Never compare display titles.
// The audio is Hebrew-only. Every HE, EN and AR version of a source post gets the same block,
// but each translation needs its own explicit line here (the English and Arabic blocks carry
// their own labels and say the audio is in Hebrew). `npm run podcast:verify` fails when an
// episode's source post, in any language, is missing from this map.
export const POST_EPISODES: Record<string, keyof typeof EPISODES> = {
  // Episode 1
  'he/2026-10-13-wake-up-sky': 'wake-up-sky-1',
  'en/2026-10-13-wake-up-sky': 'wake-up-sky-1',
  'ar/2026-10-13-wake-up-sky': 'wake-up-sky-1',
  // Episode 2
  'he/2026-10-12-dial-bot': 'dial-bot-2',
  'en/2026-10-12-my-shluchim-can-make-phone-calls': 'dial-bot-2',
  'ar/2026-10-12-my-shluchim-can-make-phone-calls': 'dial-bot-2',
  // Episode 3 (two source posts)
  'he/2026-09-21-thin-work-checkin-bot': 'knock-3',
  'en/2026-09-21-three-daily-check-ins-moved-out': 'knock-3',
  'ar/2026-09-21-three-daily-check-ins-moved-out': 'knock-3',
  'he/2026-10-06-reminders-shaliach': 'knock-3',
  'en/2026-10-06-one-shaliach-for-all-reminders': 'knock-3',
  'ar/2026-10-06-one-shaliach-for-all-reminders': 'knock-3',
  // Episode 4
  'he/2026-10-15-central-warehouse': 'warehouse-4',
  'en/2026-10-15-central-warehouse': 'warehouse-4',
  'ar/2026-10-15-central-warehouse': 'warehouse-4',
};

export function episodeForPost(postId: string): Episode | undefined {
  const key = POST_EPISODES[postId];
  return key ? EPISODES[key] : undefined;
}

export function validatePodcastAssociations(postIds: string[]) {
  for (const [postId, key] of Object.entries(POST_EPISODES)) {
    if (!postIds.includes(postId)) throw new Error(`Podcast association: unknown post ${postId}`);
    if (!EPISODES[key]) throw new Error(`Podcast association: unknown episode ${key}`);
  }
}
