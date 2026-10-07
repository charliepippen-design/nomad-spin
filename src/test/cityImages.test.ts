import { describe, expect, it } from 'vitest';
import { getCityImageUrl } from '@/data/cityImages';

const DEAD_DUBAI_PHOTO = '1512453913507-36f190fea668';
const DEAD_ASIA_FALLBACK = '1506665131138-e866141fb205';

describe('city image urls', () => {
  it('points Dubai and Abu Dhabi result cards at photos that are still on the CDN', () => {
    const dubai = getCityImageUrl('dubai-ae', 'Asia', 800);
    const abuDhabi = getCityImageUrl('abu-dhabi-ae', 'Asia', 800);

    expect(dubai).toContain('photo-1512453979798-5ea266f8880c');
    expect(abuDhabi).toContain('photo-1512632578888-169bbbc64f33');
    expect(dubai).not.toContain(DEAD_DUBAI_PHOTO);
    expect(abuDhabi).not.toContain(DEAD_ASIA_FALLBACK);
    expect(getCityImageUrl('dubai-deira-ae', 'Asia')).toContain('photo-1512453979798-5ea266f8880c');
  });

  it('does not fall back to the removed Asia region photo', () => {
    const fallback = getCityImageUrl('unlisted-city-th', 'Asia', 400);
    expect(fallback).toContain('photo-1507525428034-b723cf961d3e');
    expect(fallback).not.toContain(DEAD_ASIA_FALLBACK);
  });
});