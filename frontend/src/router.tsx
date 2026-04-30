import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { createBrowserHistory, parseHref } from '@tanstack/history'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const base = (import.meta.env.BASE_URL ?? '/') as string
  const baseWithTrailing = base.endsWith('/') ? base : `${base}/`
  const baseWithoutTrailing = baseWithTrailing.slice(0, -1)

  const history = createBrowserHistory({
    parseLocation: () => {
      const win = window
      const full = `${win.location.pathname}${win.location.search}${win.location.hash}`
      let path = full
      if (baseWithTrailing !== '/' && full.startsWith(baseWithTrailing)) {
        path = full.slice(baseWithoutTrailing.length) || '/'
      } else if (baseWithTrailing !== '/' && full === baseWithoutTrailing) {
        path = '/'
      }
      return parseHref(path, win.history.state)
    },
    createHref: (href) => {
      if (!baseWithoutTrailing || baseWithoutTrailing === '/') return href
      return href.startsWith('/') ? `${baseWithoutTrailing}${href}` : `${baseWithoutTrailing}/${href}`
    },
  })

  const router = createTanStackRouter({
    routeTree,
    history,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
