import common from './common.json';
import data from './data.json';
import home from './home.json';
import globe from './globe.json';
import staticPages from './static.json';
import legal from './legal.json';
import methodology from './methodology.json';
import tools from './tools.json';
import city from './city.json';
import guides from './guides.json';

/**
 * English interface text, the source every other language is translated from.
 * One JSON file per area of the site; keys are flat inside a file.
 */
export const en = {
  common,
  data,
  home,
  globe,
  static: staticPages,
  legal,
  methodology,
  tools,
  city,
  guides,
};

/** Shape every published language must fill completely (checked by src/test/i18n.test.ts). */
export type Dictionary = { [N in keyof typeof en]: Record<keyof (typeof en)[N], string> };
