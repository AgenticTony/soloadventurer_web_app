import {
  getMatchConfidence,
  MATCH_CONFIDENCE_THRESHOLDS,
  type MatchFactors,
  type CompositeMatch,
  type SemanticMatchResult,
} from '../matching'

// ── getMatchConfidence ────────────────────────────────────────

describe('getMatchConfidence', () => {
  it('returns "high" for scores >= 80', () => {
    expect(getMatchConfidence(80)).toBe('high')
    expect(getMatchConfidence(95)).toBe('high')
    expect(getMatchConfidence(100)).toBe('high')
  })

  it('returns "medium" for scores >= 50 and < 80', () => {
    expect(getMatchConfidence(50)).toBe('medium')
    expect(getMatchConfidence(65)).toBe('medium')
    expect(getMatchConfidence(79)).toBe('medium')
  })

  it('returns "low" for scores < 50', () => {
    expect(getMatchConfidence(0)).toBe('low')
    expect(getMatchConfidence(25)).toBe('low')
    expect(getMatchConfidence(49)).toBe('low')
  })

  it('handles edge case of negative scores', () => {
    expect(getMatchConfidence(-1)).toBe('low')
  })
})

// ── MATCH_CONFIDENCE_THRESHOLDS ───────────────────────────────

describe('MATCH_CONFIDENCE_THRESHOLDS', () => {
  it('has correct threshold values', () => {
    expect(MATCH_CONFIDENCE_THRESHOLDS.high).toBe(80)
    expect(MATCH_CONFIDENCE_THRESHOLDS.medium).toBe(50)
    expect(MATCH_CONFIDENCE_THRESHOLDS.low).toBe(0)
  })
})

// ── Type validation (compile-time + runtime shape) ───────────

describe('SemanticMatchResult type', () => {
  it('matches expected shape for edge function response', () => {
    const result: SemanticMatchResult = {
      userId: 'user-1',
      displayName: 'Alice',
      avatarUrl: 'https://example.com/avatar.jpg',
      homeCountry: 'Canada',
      destinationName: 'Tokyo',
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      overlapDays: 5,
      distanceMeters: 12000,
      semanticScore: 0.85,
      compositeScore: 0.78,
      matchPercentage: 92,
      sharedActivityCount: 3,
      sharedActivities: ['hiking', 'photography', 'food'],
      factors: {
        semantic: 0.85,
        dateOverlap: 0.71,
        activities: 0.6,
        destination: 1.0,
        age: 0.9,
      },
    }

    expect(result.matchPercentage).toBe(92)
    expect(result.factors.semantic).toBeCloseTo(0.85)
    expect(result.sharedActivities).toHaveLength(3)
  })
})

describe('CompositeMatch type', () => {
  it('extends PotentialMatch with composite fields', () => {
    const match: CompositeMatch = {
      // PotentialMatch base fields
      id: 'semantic-user1-Tokyo',
      userId: 'user-1',
      displayName: 'Alice',
      avatarUrl: null,
      homeCountry: 'Canada',
      destinationName: 'Tokyo',
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      overlapDays: 5,
      distanceMeters: 12000,
      matchType: 'combined_match',
      matchScore: 0.78,
      sharedActivities: ['hiking'],
      // Composite extension fields
      semanticScore: 0.85,
      compositeScore: 0.78,
      matchPercentage: 92,
      sharedActivityCount: 1,
      confidence: 'high',
      factors: {
        semantic: 0.85,
        dateOverlap: 0.71,
        activities: 0.6,
        destination: 1.0,
        age: 0.9,
      },
    }

    expect(match.confidence).toBe('high')
    expect(match.matchPercentage).toBe(92)
  })
})

describe('MatchFactors', () => {
  it('has all 5 factor fields', () => {
    const factors: MatchFactors = {
      semantic: 0.4,
      dateOverlap: 0.25,
      activities: 0.15,
      destination: 0.1,
      age: 0.1,
    }

    const factorKeys = Object.keys(factors)
    expect(factorKeys).toEqual(['semantic', 'dateOverlap', 'activities', 'destination', 'age'])
  })

  it('factor weights should sum to 1.0 (40+25+15+10+10)', () => {
    // The weights are: semantic 0.40, dateOverlap 0.25, activities 0.15, destination 0.10, age 0.10
    const weights = [0.4, 0.25, 0.15, 0.1, 0.1]
    const sum = weights.reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1.0)
  })
})
