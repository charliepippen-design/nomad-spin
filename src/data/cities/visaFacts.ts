import type { City } from './types';

/** High-certainty Spain telework path. visaDays stays the initial consular visa. */
export const SPAIN_DN_VISA_NOTE =
  '1-yr consular telework visa; in-Spain residence permit up to 3 years, renew 2 (Ley 14/2013 art. 74 quinquies).';

export const SPAIN_DN_LEGAL_NOTES = [
  'Telework visa: up to 1 year at a Spanish consulate. https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Digital-Nomad-Visa.aspx',
  'Residence authorization up to 3 years, renewals of 2 years: Ley 14/2013 art. 74 quinquies. https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074',
  'Income is a share of the Spanish minimum wage (200% of SMI for the main applicant on official pages). Check the current euro amount and fees before you apply.',
];

/** High-certainty Portugal remote-work path. visaDays stays 365 (not changed to the 2-year permit). */
export const PORTUGAL_DN_VISA_NOTE =
  'Temp-stay visa under 1 year, or D8 residency visa (4 months) then a 2-year permit, renew 3 (Lei 23/2007 art. 75).';

/** Medium-certainty label fix is not applied. Tell readers to check the official source. */
export const PORTUGAL_D7_LABEL_NOTE =
  'This row is labeled D7/Digital Nomad Visa. D7 is a separate passive-income visa. Check official MNE and AIMA sources before you treat that label as the remote-work route.';

export const PORTUGAL_DN_LEGAL_NOTES = [
  'Visa types: https://vistos.mne.gov.pt/en/national-visas/general-information/type-of-visa',
  'Temporary residence permit: 2 years from issue, renewable for successive 3-year periods (Lei 23/2007 art. 75). https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2007-67564445',
  'AIMA remote-work residence permit (art. 88(1)): https://aima.gov.pt/pt/trabalhar/autorizacao-de-residencia-para-o-exercicio-de-atividade-profissional-prestada-de-forma-remota-com-visto-de-residencia-para-o-exe',
  'Income threshold, fees, and AIMA timelines: check official MNE and AIMA pages. Do not use a euro figure from a secondary site.',
];

export const THAILAND_TOURISM_VISA_TYPE = 'Tourism Visa Exemption';
export const THAILAND_TOURISM_VISA_DAYS = 30;

export const THAILAND_TOURISM_VISA_NOTE =
  'Tourism only, and the length depends on your passport: 30 days for 60 countries and territories, 15 days for two, and visa on arrival for three (Thailand PRD, Royal Gazette 31 Aug 2026, effective 15 Sep 2026). The former 60-day exemption was revoked. Longer stays: Destination Thailand Visa (DTV). Confirm eligibility on the official notice.';

export const THAILAND_LEGAL_NOTES = [
  'Tourism visa exemption, effective 15 Sep 2026 (the 60-day scheme was revoked): https://thailand.prd.go.th/en/content/category/detail/id/48/iid/538547',
  'Length depends on passport. The exemption is for tourism. The Destination Thailand Visa (DTV) is a separate long-stay path; confirm length and eligibility on the official checklist.',
];

function isDigitalNomadLabel(visaType: string): boolean {
  return /digital nomad/i.test(visaType);
}

/**
 * Attach official visa notes for Spain, Portugal, and Thailand.
 * Does not change Spain or Portugal visaDays (that remap is not high certainty).
 * Every Thailand row becomes the passport-dependent 30-day tourism exemption.
 */
export function applyOfficialVisaFacts<T extends City>(city: T): T {
  if (city.countryCode === 'ES' && isDigitalNomadLabel(city.meta.visaType)) {
    return {
      ...city,
      meta: { ...city.meta, visaNote: SPAIN_DN_VISA_NOTE },
      legalNotes: SPAIN_DN_LEGAL_NOTES,
    };
  }

  if (city.countryCode === 'PT' && isDigitalNomadLabel(city.meta.visaType)) {
    const d7Label = /d7/i.test(city.meta.visaType);
    const visaNote = d7Label
      ? `${PORTUGAL_DN_VISA_NOTE} ${PORTUGAL_D7_LABEL_NOTE}`
      : PORTUGAL_DN_VISA_NOTE;
    return {
      ...city,
      meta: { ...city.meta, visaNote },
      legalNotes: PORTUGAL_DN_LEGAL_NOTES,
    };
  }

  if (city.countryCode === 'TH') {
    return {
      ...city,
      meta: {
        ...city.meta,
        visaType: THAILAND_TOURISM_VISA_TYPE,
        visaDays: THAILAND_TOURISM_VISA_DAYS,
        visaNote: THAILAND_TOURISM_VISA_NOTE,
      },
      visa: { type: THAILAND_TOURISM_VISA_TYPE, days: THAILAND_TOURISM_VISA_DAYS },
      legalNotes: THAILAND_LEGAL_NOTES,
    };
  }

  return city;
}
