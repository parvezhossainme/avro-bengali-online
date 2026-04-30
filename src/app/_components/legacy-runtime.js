import Script from 'next/script';

const scripts = [
  { src: '/vendor/jquery/dist/jquery.js', strategy: 'beforeInteractive' },
  { src: '/vendor/Caret.js/dist/jquery.caret.min.js', strategy: 'beforeInteractive' },
  { src: '/vendor/jquery.atwho/dist/js/jquery.atwho.js', strategy: 'beforeInteractive' },
  { src: '/vendor/jquery-autosize/jquery.autosize.js', strategy: 'beforeInteractive' },
  { src: '/vendor/jquery-touchswipe/jquery.touchSwipe.js', strategy: 'beforeInteractive' },
  { src: '/vendor/device.js/lib/device.js', strategy: 'beforeInteractive' },
  { src: '/js/avro.min.js', strategy: 'beforeInteractive' },
  { src: '/js/main.js', strategy: 'afterInteractive' },
];

export default function LegacyRuntime() {
  return scripts.map(({ src, strategy }) => (
    <Script key={src} src={src} strategy={strategy} />
  ));
}
