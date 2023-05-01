import '@/styles/globals.css'
import { trpc } from '@/utils/trpc'
import type { AppProps, AppType } from 'next/app'

const App: AppType = function ({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default trpc.withTRPC(App)