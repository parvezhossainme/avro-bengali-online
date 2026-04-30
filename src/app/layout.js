import './globals.css';

export const metadata = {
  title: 'AvroPad',
  description: 'Bangla typing tool for the web',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="/vendor/jquery.atwho/src/jquery.atwho.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}