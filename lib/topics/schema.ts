import { z } from 'zod'

export const SlideConceptSchema = z.object({
  type: z.literal('concept'),
  heading: z.string(),
  body: z.string(),
  icon: z.string().optional(),
  narrationText: z.string(),
})

export const SlideCodeSchema = z.object({
  type: z.literal('code'),
  lang: z.string(),
  lines: z.array(z.string()),
  highlight: z.array(z.number()).optional(),
  narrationText: z.string(),
  keyTerms: z.array(z.string()).optional(),
})

export const SlideDiagramSchema = z.object({
  type: z.literal('diagram'),
  svgMarkup: z.string(),
  caption: z.string(),
  narrationText: z.string(),
})

export const SlideVideoSchema = z.object({
  type: z.literal('video'),
  url: z.string().url(),
  caption: z.string(),
  narrationText: z.string(),
})

export const SlideCarouselSchema = z.object({
  type: z.literal('carousel'),
  items: z.array(z.object({ label: z.string(), body: z.string() })),
  narrationText: z.string(),
})

export const SlideQuizSchema = z.object({
  type: z.literal('quiz'),
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.number().min(0).max(3),
  explanation: z.string(),
})

export const SlideSchema = z.discriminatedUnion('type', [
  SlideConceptSchema,
  SlideCodeSchema,
  SlideDiagramSchema,
  SlideVideoSchema,
  SlideCarouselSchema,
  SlideQuizSchema,
])

export const LessonSchema = z.object({
  index: z.number(),
  title: z.string(),
  slides: z.array(SlideSchema).min(4).max(10),
  audioUrls: z.array(z.string()).optional().default([]),
})

export const TopicSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  estimatedMins: z.number(),
  prerequisites: z.array(z.string()),
  requestCount: z.number().default(1),
  lessons: z.array(LessonSchema),
  audioReady: z.boolean().default(false),
})

export type Slide = z.infer<typeof SlideSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Topic = z.infer<typeof TopicSchema>
export type SlideType = Slide['type']
