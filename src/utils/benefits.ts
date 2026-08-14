import type { Benefit, ClassifiedBenefit, UnclassifiedBenefit } from '@/types/canvas'

export type ClassifiedBenefitType = ClassifiedBenefit['benefitType']

export function isClassifiedBenefit(benefit: Benefit): benefit is ClassifiedBenefit {
  return benefit.benefitType !== 'unclassified'
}

export function isUnclassifiedBenefit(benefit: Benefit): benefit is UnclassifiedBenefit {
  return benefit.benefitType === 'unclassified'
}

export function isBenefitOfType(
  benefit: Benefit,
  type: ClassifiedBenefitType,
): benefit is ClassifiedBenefit {
  return benefit.benefitType === type
}
