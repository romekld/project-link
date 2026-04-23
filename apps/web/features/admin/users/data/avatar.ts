import { createAvatar } from '@dicebear/core'
import { lorelei } from '@dicebear/collection'

export type AvatarSex = 'M' | 'F'

type AvatarSeedInput = {
  userId?: string
  firstName?: string
  lastName?: string
  role?: string
  sex?: AvatarSex
}

type AvatarRenderOptions = {
  seed?: string
}

const PASTEL_BACKGROUND_COLORS = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'c7f0d8',
] as const

const NATURAL_MOUTH_VARIANTS = [
  'happy03',
  'happy05',
  'happy10',
  'happy14',
  'happy16',
] as const

const SOLID_BACKGROUND_TYPE = ['solid'] as const

function buildAvatarSeed({ userId, firstName, lastName, role, sex }: AvatarSeedInput) {
  const seed = [role, sex, userId, firstName, lastName].filter(Boolean).join(':')
  return seed || undefined
}

export function createRandomAvatarSeed() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function buildAvatarOptions(sex?: AvatarSex) {
  const isMale = sex === 'M'

  return {
    backgroundColor: [...PASTEL_BACKGROUND_COLORS],
    backgroundType: [...SOLID_BACKGROUND_TYPE],
    // Keep SVG IDs stable; randomness should come from seed + style options.
    randomizeIds: false,
    // Prevent unnatural outputs such as feminine-looking avatars with beards.
    beardProbability: isMale ? 20 : 0,
    earringsProbability: isMale ? 0 : 38,
    hairAccessoriesProbability: isMale ? 0 : 24,
    glassesProbability: isMale ? 12 : 16,
    frecklesProbability: isMale ? 8 : 12,
    // Favor friendly/neutral expressions over extreme variants.
    mouth: [...NATURAL_MOUTH_VARIANTS],
    hairProbability: 100,
    mouthProbability: 100,
  }
}

export function createUserAvatarDataUri(
  input: AvatarSeedInput,
  options: AvatarRenderOptions = {}
) {
  const resolvedSeed = options.seed ?? buildAvatarSeed(input) ?? createRandomAvatarSeed()

  return createAvatar(lorelei, {
    seed: resolvedSeed,
    ...buildAvatarOptions(input.sex),
  }).toDataUri()
}
