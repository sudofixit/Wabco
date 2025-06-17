import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://wabco-mobility.com' 
    : 'http://localhost:3000'

  // Get all locations and services from database
  const [locations, services] = await Promise.all([
    prisma.location.findMany({
      select: { id: true, updatedAt: true }
    }),
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, title: true, updatedAt: true }
    })
  ])

  // Generate slug function for services
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tire`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/service`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/location`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Dynamic location pages
  const locationPages = locations.map((location) => ({
    url: `${baseUrl}/location/${location.id}`,
    lastModified: new Date(location.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic service booking pages
  const servicePages = services.flatMap((service) => {
    const slug = generateSlug(service.title)
    return [
      {
        url: `${baseUrl}/service/${slug}/booking`,
        lastModified: new Date(service.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/service/${slug}/quote`,
        lastModified: new Date(service.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      }
    ]
  })

  return [
    ...staticPages,
    ...locationPages,
    ...servicePages,
  ]
} 