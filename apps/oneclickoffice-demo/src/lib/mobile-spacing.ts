/**
 * Mobile Spacing Constants
 * Provides consistent spacing for mobile layouts following an 8px grid system
 */

export const MOBILE_SPACING = {
  // Navigation
  NAV_HEIGHT: '96px', // 24 * 4px = 96px (h-24)
  NAV_SAFE_BOTTOM: '32px', // For iPhone Home Indicator

  // Content Padding
  PAGE_PADDING: 'p-5', // 20px
  PAGE_PADDING_BOTTOM: 'pb-28', // 112px (NAV_HEIGHT + extra space)

  // Section Spacing
  SECTION_GAP: 'space-y-8', // 32px between major sections
  CARD_GAP: 'space-y-4', // 16px between cards
  FORM_FIELD_GAP: 'space-y-5', // 20px between form fields

  // Header
  HEADER_MARGIN: 'mb-8', // 32px
  HEADER_SMALL_MARGIN: 'mb-2', // 8px for subtitle

  // Touch Targets
  TOUCH_TARGET_MIN: 'min-h-[68px]', // Minimum 68px for comfortable touch
  BUTTON_HEIGHT_LARGE: 'h-16', // 64px for primary actions
  BUTTON_HEIGHT_MEDIUM: 'h-14', // 56px for secondary actions
  INPUT_HEIGHT: 'h-14', // 56px for form inputs

  // Icon Sizes
  ICON_SMALL: 'h-5 w-5', // 20px
  ICON_MEDIUM: 'h-6 w-6', // 24px
  ICON_LARGE: 'h-10 w-10', // 40px for navigation
  ICON_XLARGE: 'h-20 w-20', // 80px for empty states
} as const;

/**
 * Design Tokens for consistent styling
 */
export const DESIGN_TOKENS = {
  // Touch Targets (in pixels)
  touch: {
    minimum: '44px',
    comfortable: '48px',
    large: '56px',
    xlarge: '64px',
  },

  // Spacing (8px grid)
  spacing: {
    xs: '4px',   // 0.5rem
    sm: '8px',   // 1rem
    md: '16px',  // 2rem
    lg: '24px',  // 3rem
    xl: '32px',  // 4rem
    xxl: '48px', // 6rem
  },

  // Typography
  fontSize: {
    xs: '12px',  // text-xs
    sm: '14px',  // text-sm
    base: '16px', // text-base
    lg: '18px',  // text-lg
    xl: '20px',  // text-xl
    '2xl': '24px', // text-2xl
    '3xl': '30px', // text-3xl
  },

  // Border Radius
  radius: {
    sm: '8px',   // rounded-lg
    md: '12px',  // rounded-xl
    lg: '16px',  // rounded-2xl
    xl: '20px',  // rounded-3xl
    full: '9999px', // rounded-full
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  // Z-Index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;
