/** Shared by the full-screen landing pages (Welcome, Components overview). Not part of the library */
import pkg from '../../../package.json';

export const VERSION = `nexui@${pkg.version}`;

/**
 * Storybook pages by their short URL (see manager.ts): a Storybook id, or a component's id for its first page.
 * Landing pages run in the preview iframe; links open these in the manager
 */
export const PAGES = {
  welcome: '',
  catalog: 'components-overview',
  getStarted: 'getting-started-use-in-react-vue-angular',
  icons: 'icons',
  animations: 'animations',
  lottie: 'nexlottie',
  effects: 'effects-particles--hero',
  onboarding: 'onboarding-tour',
};

/**
 * Link into the Storybook manager, which sits next to the preview's iframe.html (use with target="_top").
 * preview.ts opens it in place, without reloading Storybook
 */
export function managerHref(page: string) {
  return `./${page}`;
}

/** The site's sections, for the landing nav and Welcome's "Pick a place to start" cards */
export const SECTIONS = [
  {
    id: 'catalog',
    label: 'Components',
    icon: 'compass',
    path: PAGES.catalog,
    text: 'Forms, data, overlays, menus and more, grouped like the sidebar.',
  },
  {
    id: 'icons',
    label: 'Icons',
    icon: 'shapes',
    path: PAGES.icons,
    text: 'The full Lucide set in five styles. Search, customize and copy.',
  },
  {
    id: 'animations',
    label: 'Animations',
    icon: 'sparkles',
    path: PAGES.animations,
    text: 'Drop-in nex-anim-* classes for entrances, attention and loops.',
  },
  {
    id: 'lottie',
    label: 'NexLottie',
    icon: 'clapperboard',
    path: PAGES.lottie,
    text: 'Hundreds of Lottie files with export to MP4, GIF and dotLottie.',
  },
  {
    id: 'effects',
    label: 'Effects',
    icon: 'waypoints',
    path: PAGES.effects,
    text: 'Particles, aurora, starfield, confetti and more, behind any content.',
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    icon: 'signpost',
    path: PAGES.onboarding,
    text: 'Product tours and checklists that guide new users step by step.',
  },
];
