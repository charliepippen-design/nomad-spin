import type { Dictionary } from '../en';
import type { LocaleBundle } from '../../i18n/dictionary';
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
import { cities } from './cities.generated';
import { guides as guideList } from './guides.generated';

// Typed as Dictionary on purpose: a key missing here is a compile error.
const dictionary: Dictionary = {
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

const bundle: LocaleBundle = { dictionary, cities, guides: guideList };
export default bundle;
