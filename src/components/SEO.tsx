import { Helmet } from 'react-helmet-async';
import type { City } from '@/data/cities';
import { getCityImageUrl } from '@/data/cityImages';

const BASE_URL = 'https://www.digitalnomadspin.com';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  city?: City | null;
}

export default function SEO({
  title = 'Digital Nomad Spin | Find Your Next Destination',
  description = 'Stop overthinking. Spin the globe. Find your next destination. Discover nomad-friendly cities with curated stays, flights, eSIMs, and insurance.',
  image = `${BASE_URL}/og-preview.png`,
  path = '/',
  city,
}: SEOProps) {
  const pageUrl = `${BASE_URL}${path}`;
  // The homepage stays a WebApplication even after a spin. City JSON-LD belongs on /destinations/:slug.
  const citySeo = path === '/' ? null : city;
  const finalTitle = citySeo
    ? `${citySeo.name}, ${citySeo.country} | Digital Nomad Guide | Nomad Spin`
    : title;
  const finalDescription = citySeo
    ? `Explore ${citySeo.name}: $${citySeo.costUSD}/mo, ${citySeo.internetMbps}Mbps WiFi, safety ${citySeo.safety}/10. Find stays, flights, and eSIMs for digital nomads.`
    : description;
  const finalImage = citySeo
    ? getCityImageUrl(citySeo.id, citySeo.region, 1200)
    : image.startsWith('http')
      ? image
      : `${BASE_URL}${image}`;

  const jsonLd = citySeo
    ? {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: `${citySeo.name}, ${citySeo.country}`,
        description: finalDescription,
        url: pageUrl,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: citySeo.lat,
          longitude: citySeo.lng,
        },
        touristType: ['Digital Nomad', 'Remote Worker'],
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Nomad Spin',
        description: finalDescription,
        url: pageUrl,
        applicationCategory: 'TravelApplication',
        operatingSystem: 'Web',
      };

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
