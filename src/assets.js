// Public asset URLs are shared by exports. Preview serves these same files locally.
export const assetBase='https://lightsonsunset.github.io/remote-falcon-template/assets/';
export const artwork={
  christmas:{logo:'christmas-header.webp',detail:'santa-hat.webp'},
  halloween:{logo:'halloween-header.webp',detail:'spider.webp'}
};
export const assetURL=(theme,kind)=>assetBase+artwork[theme][kind];
