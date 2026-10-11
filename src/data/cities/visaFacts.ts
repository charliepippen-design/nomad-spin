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

/** Same national e-visa for every Vietnam row. Label matches Da Nang and Ho Chi Minh City. */
export const VIETNAM_EVISA_TYPE = 'E-Visa';
export const VIETNAM_EVISA_DAYS = 90;

/**
 * Convention: the visa field is the default entry anyone can use without applying
 * (exemption, visa on arrival or e-visa). Nomad visas and permits go only in the note.
 * One official visa rule per country, applied to every row of that country so
 * rows can't contradict each other. Values and sources come from the hub data
 * error list (batch 2). Each rule names its official source.
 */
export interface CountryVisaRule {
  visaType: string;
  visaDays: number;
  visaNote?: string;
  /** Official source pages the rule was checked against. */
  sources: string[];
}

export const SCHENGEN_SHORT_STAY = 'Schengen short stay: 90 days in any 180.';

export const COUNTRY_VISA_RULES: Record<string, CountryVisaRule> = {
  DE: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: `${SCHENGEN_SHORT_STAY} Germany has no digital nomad visa. Freelance residence permit (s.21 AufenthG); the length is set by the local immigration office.`,
    sources: [
      'https://www.auswaertiges-amt.de/en/visa-service/231148-231148',
      'https://www.gesetze-im-internet.de/aufenthg_2004/__21.html',
    ],
  },
  PL: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: `${SCHENGEN_SHORT_STAY} Poland has no digital nomad visa; a national D visa or a residence permit needs a qualifying purpose.`,
    sources: ['https://www.gov.pl/web/udsc-en/visas'],
  },
  MX: {
    visaType: 'Visa Exemption',
    visaDays: 180,
    visaNote: 'Maximum stay; the immigration officer sets the days at entry. Temporary residence is a consular application.',
    sources: ['https://www.inm.gob.mx/micrositio/1/docs/mj/LMig.pdf', 'https://www.sectur.gob.mx/guia-de-viaje/visa/'],
  },
  BR: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'US, Canadian and Australian citizens need an e-visa (since 10 Apr 2025). Digital nomad visa: VITEM XIV.',
    sources: [
      'https://www.gov.br/mre/pt-br/consulado-nova-york/noticias-do-consulado/2025/visitor-visa-requirement-for-nationals-of-australia-canada-and-the-usa-obrigatoriedade-de-visto-para-cidadaos-da-australia-canada-e-eua',
      'https://www.gov.br/mre/pt-br/consulado-lisboa/servicos-consulares/vistos-destinados-a-estrangeiros-para-entrada-no-brasil/visto-temporario-xiv-2013-nomade-digital-vitem-xiv',
    ],
  },
  CL: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'Chile has no dedicated digital nomad visa; longer stays need a temporary residence permit.',
    sources: ['https://serviciomigraciones.cl/residencia-temporal/'],
  },
  ID: {
    visaType: 'Visa on Arrival',
    visaDays: 30,
    sources: ['https://imigrasi.go.id/wna/daftar-visa-indonesia/B1'],
  },
  CO: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'PIP up to 90 days, extendable to 180 days per calendar year.',
    sources: [
      'https://www.migracioncolombia.gov.co/tramites-y-servicios/tramites-generales/permiso-de-ingreso-y-permanencia-pip',
    ],
  },
  JP: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'Designated Activities (digital nomad) status, separate application.',
    sources: [
      'https://www.mofa.go.jp/ca/fna/pagewe_000001_00046.html',
      'https://www.moj.go.jp/isa/applications/status/designatedactivities10_00001.html?lang=en',
    ],
  },
  KR: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'K-ETA may apply. F-1-D Workation (digital nomad) visa, separate application.',
    sources: [
      'https://overseas.mofa.go.kr/us-en/brd/m_4500/view.do?seq=761106',
      'https://overseas.mofa.go.kr/sg-en/brd/m_2444/view.do?seq=761493',
    ],
  },
  TW: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'Digital nomad visitor visa (BOCA), separate application. The Gold Card is a skilled-talent permit, not the default route.',
    sources: ['https://www.boca.gov.tw/cp-158-7718-c0382-2.html', 'https://goldcard.nat.gov.tw/en/'],
  },
  PE: {
    visaType: 'Visa Exemption',
    visaDays: 183,
    visaNote: 'Maximum per year; the immigration officer sets the days at entry.',
    sources: ['https://www.gob.pe/institucion/migraciones/campa%C3%B1as/64003-informacion-fundamental-para-turistas-en-peru'],
  },
  BG: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: `${SCHENGEN_SHORT_STAY} Digital nomad residence permit (Foreigners Act amendment, State Gazette 52/2025), 1 year, renewable once, needs a D visa first.`,
    // State Gazette 52/2025 (Foreigners Act amendment): art. 24(1) item 23 adds digital nomads;
    // art. 24s(2): the permit is valid one year and can be extended once for one more year.
    // State Gazette 109/2025: prolonged-residence application form, filed on a visa under art. 15(1) (D visa).
    // MFA: Schengen rules (90 days in any 180) apply, land border checks lifted 1 Jan 2025.
    sources: [
      'https://dv.parliament.bg/DVWeb/showMaterialDV.jsp?idMat=235575',
      'https://dv.parliament.bg/DVPics/2025/109_25/7494_3.pdf',
      'https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria',
    ],
  },
  GR: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: `${SCHENGEN_SHORT_STAY} Digital Nomad Visa up to 1 year, then a residence permit.`,
    sources: ['https://workfromgreece.gr/', 'https://www.mfa.gr/'],
  },
  HR: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: `${SCHENGEN_SHORT_STAY} Temporary stay for digital nomads, up to 18 months (MUP).`,
    sources: ['https://mup.gov.hr/aliens-281621/stay-and-work/digital-nomads/286833'],
  },
  ES: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: `${SCHENGEN_SHORT_STAY} Digital nomad route: ${SPAIN_DN_VISA_NOTE}`,
    sources: [
      'https://www.exteriores.gob.es/Consulados/londres/en/ServiciosConsulares/Paginas/Consular/Digital-Nomad-Visa.aspx',
      'https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074',
    ],
  },
  MY: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'Days depend on nationality. DE Rantau Nomad Pass (MDEC), separate application.',
    sources: ['https://mdec.my/derantau', 'https://www.imi.gov.my/'],
  },
  TR: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: '90 days in any 180; depending on nationality this is visa-free entry, an e-visa or a consular visa. Longer stays need a short-term residence permit (Law 6458).',
    sources: ['https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa'],
  },
  AL: {
    visaType: 'Visa Exemption',
    visaDays: 90,
    visaNote: 'Longer visa-free stay for some passports; unique permit for digital mobile workers',
    // Law 79/2021 "On Aliens" art. 29: a visa-free alien stays 90 days within 180 unless an
    // agreement or Council of Ministers decision provides otherwise. Art. 68: unique permit for
    // digital mobile workers, first issued for one year. MFA page lists the visa regime by nationality.
    sources: [
      'https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/',
      'https://mb.gov.al/wp-content/uploads/2024/10/Ligj-per-te-Huajt-%E2%80%93-nr.-79.2021_English.pdf',
    ],
  },
};

/** Row-level note additions on top of the country rule. */
const ROW_VISA_NOTE_EXTRA: Record<string, string> = {
  'fukuoka-jp': "Fukuoka's startup visa is for founders, not a general nomad route.",
};

function isDigitalNomadLabel(visaType: string): boolean {
  return /digital nomad/i.test(visaType);
}

/**
 * Attach official visa notes for Spain, Portugal, and Thailand.
 * Does not change Spain or Portugal visaDays (that remap is not high certainty).
 * Every Thailand row becomes the passport-dependent 30-day tourism exemption.
 * Every Vietnam 90-day row uses the E-Visa label already on Da Nang and Ho Chi Minh City.
 * Countries in COUNTRY_VISA_RULES get one official type, day count and note on every row.
 */
export function applyOfficialVisaFacts<T extends City>(city: T): T {
  if (city.countryCode === 'ES') {
    const rule = COUNTRY_VISA_RULES.ES;
    return {
      ...city,
      meta: { ...city.meta, visaType: rule.visaType, visaDays: rule.visaDays, visaNote: rule.visaNote },
      visa: { type: rule.visaType, days: rule.visaDays },
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

  if (
    city.countryCode === 'VN' &&
    city.meta.visaDays === VIETNAM_EVISA_DAYS &&
    city.meta.visaType !== VIETNAM_EVISA_TYPE
  ) {
    return {
      ...city,
      meta: { ...city.meta, visaType: VIETNAM_EVISA_TYPE },
      visa: { type: VIETNAM_EVISA_TYPE, days: VIETNAM_EVISA_DAYS },
    };
  }

  const rule = COUNTRY_VISA_RULES[city.countryCode];
  if (rule) {
    const extra = ROW_VISA_NOTE_EXTRA[city.id];
    const visaNote = [rule.visaNote, extra].filter(Boolean).join(' ') || undefined;
    const meta = { ...city.meta, visaType: rule.visaType, visaDays: rule.visaDays };
    if (visaNote) meta.visaNote = visaNote;
    else delete meta.visaNote;
    return {
      ...city,
      meta,
      visa: { type: rule.visaType, days: rule.visaDays },
    };
  }

  return city;
}
