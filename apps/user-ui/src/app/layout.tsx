// @ts-expect-error: allow importing CSS module without type declarations
import './global.css';

import Header from '@/shared/widgets/header';


export const metadata = {
  title: 'Welcome to user-ui',
  description: 'Eshop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Header />
      <body>{children}</body>
    </html>
  )
}
