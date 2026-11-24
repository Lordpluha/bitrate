export const promotionErrors = {
  'promotion.error.disabled':
    'AI promotion is not available for your account yet.',
  'promotion.error.loadProfile': 'Could not load your promotion profile.',
  'promotion.error.saveProfile':
    'Could not save your promotion profile. Try again.',
  'promotion.error.loadAllowance': 'Could not load your AI allowance.',
  'promotion.error.loadPlan': 'Could not load the promotion plan.',
  'promotion.error.generate': 'Could not start the plan. Try again.',
  'promotion.error.updateStep':
    'Could not change the step. Reload and try again.',
  'promotion.error.regenerate': 'Could not regenerate the step. Try again.',
  'promotion.error.loadPosts': 'Could not load the post drafts.',
  'promotion.error.writePosts': 'Could not start the drafts. Try again.',
  'promotion.error.savePost': 'Could not save the draft. Try again.',
  'promotion.error.translate': 'Could not start the translation. Try again.',
  'promotion.error.saveTranslation':
    'Could not save the translation. Try again.',
  'promotion.error.loadCalendar': 'Could not load your promotion calendar.',
  'errors.promotion.ai_quota_exceeded':
    'You have used this month’s AI allowance.',
  'errors.promotion.profile_required': 'Set up your promotion profile first.',
  'errors.promotion.release_date_required':
    'Pick a release date before generating a plan.',
  'errors.promotion.plan_generating':
    'A plan is already being generated for this release.',
  'errors.promotion.plan_not_found': 'This release has no promotion plan yet.',
  'errors.promotion.plan_not_latest':
    'This plan was replaced by a newer version. Reload it.',
  'errors.promotion.step_not_found': 'This step no longer exists.',
  'errors.promotion.step_changed':
    'This step changed since you opened it. Reload and try again.',
  'errors.promotion.step_regenerating':
    'A new suggestion for this step is already being written.',
  'errors.promotion.generation_unavailable':
    'AI could not answer. Nothing was taken from your allowance. Try again.',
  'errors.promotion.generation_rejected':
    'The result did not pass its checks. Try again.',
  'errors.promotion.input_rejected':
    'Some text you wrote for AI did not pass the safety check. Change it and try again.',
  'errors.promotion.step_not_post': 'Only post steps have drafts.',
  'errors.promotion.step_closed': 'This step was rejected.',
  'errors.promotion.posts_generating':
    'Drafts for this step are already being written.',
  'errors.promotion.post_not_found': 'This draft no longer exists.',
  'errors.promotion.translation_not_found':
    'This translation no longer exists.',
  'errors.promotion.translation_busy': 'This translation is still being made.',
  'errors.promotion.disabled':
    'AI promotion is not available for your account yet.',
  'validation.promotion.contact_details':
    'Remove links, emails, phone numbers and @handles.',
  'validation.promotion.duplicate_channels': 'Each channel can be chosen once.',
  'validation.promotion.edit_empty': 'Change something before saving.',
  'validation.promotion.post_too_long':
    'The post is longer than this channel allows.',
  'validation.promotion.calendar_window': 'Pick a period of up to 120 days.',
} as const
