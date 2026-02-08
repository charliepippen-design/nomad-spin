import { Helmet } from 'react-helmet-async';
import type { City } from '@/data/cities';
import { getCityImageUrl } from '@/data/cityImages';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  city?: City | null;
}

export default function SEO({
  title = 'Digital Nomad Spin | Find Your Next Destination',
  description = 'Stop overthinking. Spin the globe. Find your next destination. Discover nomad-friendly cities with curated stays, flights, eSIMs, and insurance.',
  image = '/og-preview.png',
  city,
}: SEOProps) {
  // Dynamic overrides when a city is selected
  const finalTitle = city
    ? `${city.name}, ${city.country} — Digital Nomad Guide | Nomad Spin`
    : title;
  const finalDescription = city
    ? `Explore ${city.name}: $${city.costUSD}/mo, ${city.internetMbps}Mbps WiFi, safety ${city.safety}/10. Find stays, flights, and eSIMs for digital nomads.`
    : description;
  const finalImage = city
    ? getCityImageUrl(city.id, city.region, 1200)
    : image;

  const jsonLd = city
    ? {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: `${city.name}, ${city.country}`,
        description: finalDescription,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: city.lat,
          longitude: city.lng,
        },
        touristType: ['Digital Nomad', 'Remote Worker'],
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Nomad Spin',
        description: finalDescription,
        applicationCategory: 'TravelApplication',
        operatingSystem: 'Web',
      };

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
