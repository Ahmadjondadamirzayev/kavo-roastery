import heroBarImg from '../assets/images/obsidian_hero_bar_1795271463494.jpg';
import latteArtImg from '../assets/images/obsidian_latte_art_1795271463478.jpg';
import icedMacchiatoImg from '../assets/images/obsidian_iced_macchiato_1795271463345.jpg';
import mochaCortadoImg from '../assets/images/obsidian_mocha_cortado_1795271464227.jpg';
import hotEspressoImg from '../assets/images/coffee_hot_espresso_1795267521191.jpg';
import icedColdBrewImg from '../assets/images/coffee_iced_coldbrew_1795267521843.jpg';
import v60PourOverImg from '../assets/images/coffee_v60_pourover_1795267521137.jpg';
import specialtyBeansImg from '../assets/images/coffee_specialty_beans_1795267522312.jpg';

export const COFFEE_MEDIA = {
  heroBar: heroBarImg,
  latteArt: latteArtImg,
  icedMacchiato: icedMacchiatoImg,
  mochaCortado: mochaCortadoImg,
  hotEspresso: hotEspressoImg,
  icedColdBrew: icedColdBrewImg,
  v60PourOver: v60PourOverImg,
  specialtyBeans: specialtyBeansImg,
} as const;

const SLUG_IMAGE_MAP: Record<string, string> = {
  'double-ristretto-espresso': hotEspressoImg,
  'velvet-flat-white': latteArtImg,
  'artisanal-cappuccino': latteArtImg,
  'gibraltar-cortado': mochaCortadoImg,
  'single-origin-americano': hotEspressoImg,
  'belgian-dark-mocha': mochaCortadoImg,
  'artisanal-crema-latte': latteArtImg,
  'spiced-cardamom-latte': latteArtImg,
  'kyoto-cold-brew': icedColdBrewImg,
  'iced-caramel-macchiato': icedMacchiatoImg,
  'iced-espresso-tonic': icedColdBrewImg,
  'shakerato-freddo': icedMacchiatoImg,
  'yirgacheffe-v60': v60PourOverImg,
  'pink-bourbon-chemex': v60PourOverImg,
  'kenya-aeropress': v60PourOverImg,
  'guji-natural-beans': specialtyBeansImg,
  'colombia-pink-bourbon-beans': specialtyBeansImg,
  'gesha-reserve-beans': specialtyBeansImg,
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  hot: latteArtImg,
  iced: icedMacchiatoImg,
  brew: v60PourOverImg,
  beans: specialtyBeansImg,
};

/**
 * Resolves any catalog image URL (bundled Vite asset, slug override, or external HTTPS)
 * so production deployments never suffer from broken /assets/ or /src/assets/ paths.
 */
export function resolveCoffeeImage(
  rawUrl: string | undefined,
  slug?: string,
  category?: string,
): string {
  if (slug && SLUG_IMAGE_MAP[slug]) {
    return SLUG_IMAGE_MAP[slug];
  }
  if (rawUrl) {
    if (rawUrl.includes('obsidian_hero_bar')) return heroBarImg;
    if (rawUrl.includes('obsidian_latte_art')) return latteArtImg;
    if (rawUrl.includes('obsidian_iced_macchiato')) return icedMacchiatoImg;
    if (rawUrl.includes('obsidian_mocha_cortado')) return mochaCortadoImg;
    if (rawUrl.includes('coffee_hot_espresso')) return hotEspressoImg;
    if (rawUrl.includes('coffee_iced_coldbrew')) return icedColdBrewImg;
    if (rawUrl.includes('coffee_v60_pourover')) return v60PourOverImg;
    if (rawUrl.includes('coffee_specialty_beans')) return specialtyBeansImg;
    if (rawUrl.startsWith('https://') || rawUrl.startsWith('data:') || rawUrl.startsWith('/assets/')) {
      return rawUrl;
    }
  }
  if (category && CATEGORY_IMAGE_MAP[category]) {
    return CATEGORY_IMAGE_MAP[category];
  }
  return latteArtImg;
}
