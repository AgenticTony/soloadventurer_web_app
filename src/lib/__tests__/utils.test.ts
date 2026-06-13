import { cn } from '../utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('returns an empty string for no input', () => {
    expect(cn()).toBe('')
  })

  // Discriminator: twMerge must resolve conflicting Tailwind utilities
  // (last wins). If cn() ever drops twMerge — e.g. the import is removed —
  // this assertion fails. The case with teeth.
  it('dedupes conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
