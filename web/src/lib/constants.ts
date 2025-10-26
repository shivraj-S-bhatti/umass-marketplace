// Constants for the UMass Marketplace application

export enum Condition {
  NEW = 'New',
  LIKE_NEW = 'Like New',
  GOOD = 'Good',
  FAIR = 'Fair',
  DOES_THE_JOB = 'Does the job!',
}

export const CONDITIONS = Object.values(Condition) as string[]

export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Home & Garden',
  'Beauty & Health',
  'Other',
] as const

export const STATUSES = [
  'ACTIVE',
  'ON_HOLD',
  'SOLD',
] as const

