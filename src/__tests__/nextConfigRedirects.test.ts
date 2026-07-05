import nextConfig from '../../next.config.js'

// FOUNDATIONS §3.5 / sprint Story 0.4: the web app is the public acquisition
// surface. next.config redirects run BEFORE middleware, so a redirect on '/'
// would make the landing page unreachable to anonymous visitors (middleware
// handles '/' for authenticated users). This suite guards against the redirect
// creeping back, while keeping the legacy-surface redirects in place.
describe('next.config redirects', () => {
  async function getRedirectSources(): Promise<string[]> {
    if (!nextConfig.redirects) {
      throw new Error('next.config.js no longer defines redirects()')
    }
    const redirects = await nextConfig.redirects()
    return redirects.map(r => r.source)
  }

  it('does not redirect the root path (landing page must stay reachable)', async () => {
    expect(await getRedirectSources()).not.toContain('/')
  })

  it('keeps the legacy-surface redirects that suppress guardrail-violating routes', async () => {
    expect(await getRedirectSources()).toEqual(expect.arrayContaining(['/feed', '/dashboard']))
  })
})
