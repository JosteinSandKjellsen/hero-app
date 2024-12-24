export const APP_CONFIG = {
  api: {
    baseUrl: '/api',
    endpoints: {
      heroName: '/hero-name'
    }
  },
  images: {
    superheroes: {
      basePath: '/images/superheroes'
    }
  }
} as const;