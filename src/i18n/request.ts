import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Read locale from NEXT_LOCALE cookie, defaulting to Bengali ('bn') if none is set
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'bn';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
