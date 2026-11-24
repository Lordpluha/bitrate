import { z } from 'zod'
import { findContactDetails } from '../ai/contact-details'
import { PROMOTION_VALIDATION } from '../promotion.errors'

/** Text the artist writes for AI must carry no contact details (ADR-0076: minimal data). */
export const noContactDetails = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((text) => findContactDetails(text).length === 0, {
      message: PROMOTION_VALIDATION.CONTACT_DETAILS,
    })
