import type { Lang } from './ui';

/**
 * Labels for the on-post podcast block (PodcastListen) and its Spotify player, per post language.
 * The audio itself is Hebrew-only, so the English and Arabic blocks say so plainly.
 * Hebrew strings are the original wording and must not change without Seffy's OK.
 */
export interface PodcastUi {
  heading: string;
  episode: string;
  minutes: string;
  note: string;
  spotifyLink: string;
  newTab: string;
  podcastPage: string;
  player: {
    load: string;
    privacy: string;
    noscript: string;
    loading: string;
    error: string;
    retry: string;
    loaded: string;
    titlePrefix: string;
  };
}

export const PODCAST_UI: Record<Lang, PodcastUi> = {
  he: {
    heading: 'מעדיפים להקשיב?',
    episode: 'פרק',
    minutes: 'דקות',
    note: 'המעשיה הזאת גם בגרסת שמע. הקריינות מופקת בעזרת בינה מלאכותית.',
    spotifyLink: 'האזנה לפרק ב־Spotify',
    newTab: ' (בטאב חדש)',
    podcastPage: 'לעמוד הפודקסט',
    player: {
      load: 'טעינת נגן Spotify',
      privacy: 'הנגן של Spotify נטען רק לאחר לחיצה. ההאזנה מתחילה בנגן.',
      noscript: 'אפשר להאזין דרך הקישורים שמתחת לנגן.',
      loading: 'טוענים את הנגן של Spotify…',
      error: 'הנגן מתעכב או לא זמין. אפשר לנסות שוב, או להאזין בקישור הישיר שמתחת.',
      retry: 'לנסות לטעון שוב',
      loaded: 'מסגרת הנגן נטענה. אם אין נגן, אפשר להאזין בקישור הישיר שמתחת.',
      titlePrefix: 'Spotify: ',
    },
  },
  en: {
    heading: 'Prefer to listen?',
    episode: 'Episode',
    minutes: 'minutes',
    note: 'This story is also available as audio, in Hebrew. The narration is produced with the help of AI.',
    spotifyLink: 'Listen to the episode on Spotify',
    newTab: ' (opens in a new tab)',
    podcastPage: 'Go to the podcast page (Hebrew)',
    player: {
      load: 'Load the Spotify player',
      privacy: 'The Spotify player loads only after you click. Listening starts in the player.',
      noscript: 'You can listen through the links below the player.',
      loading: 'Loading the Spotify player…',
      error: 'The player is slow or unavailable. You can try again, or listen with the direct link below.',
      retry: 'Try loading again',
      loaded: 'The player frame has loaded. If there is no player, you can listen with the direct link below.',
      titlePrefix: 'Spotify: ',
    },
  },
  ar: {
    heading: 'تفضّل الاستماع؟',
    episode: 'الحلقة',
    minutes: 'دقائق',
    note: 'هذه الحكاية متوفرة أيضًا بنسخة صوتية، بالعبرية. التعليق الصوتي مُنتَج بمساعدة الذكاء الاصطناعي.',
    spotifyLink: 'الاستماع إلى الحلقة على Spotify',
    newTab: ' (في تبويب جديد)',
    podcastPage: 'إلى صفحة البودكاست (بالعبرية)',
    player: {
      load: 'تحميل مشغّل Spotify',
      privacy: 'لا يُحمَّل مشغّل Spotify إلا بعد النقر. يبدأ الاستماع داخل المشغّل.',
      noscript: 'يمكنك الاستماع عبر الروابط الموجودة أسفل المشغّل.',
      loading: 'جارٍ تحميل مشغّل Spotify…',
      error: 'المشغّل بطيء أو غير متاح. يمكنك المحاولة مرة أخرى، أو الاستماع عبر الرابط المباشر أدناه.',
      retry: 'إعادة محاولة التحميل',
      loaded: 'تم تحميل إطار المشغّل. إذا لم يظهر مشغّل، يمكنك الاستماع عبر الرابط المباشر أدناه.',
      titlePrefix: 'Spotify: ',
    },
  },
};
