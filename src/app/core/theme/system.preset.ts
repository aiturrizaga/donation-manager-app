import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const SystemPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '0.125rem',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.5rem',
    },
  },
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    formField: {
      borderRadius: '{border.radius.md}',
      sm: {
        fontSize: '0.75rem',
        paddingX: '0.75rem',
        paddingY: '0.375rem',
      },
      lg: {
        fontSize: '0.875rem',
        paddingX: '1.25rem',
        paddingY: '0.625rem',
      },
    },
    overlay: {
      modal: { borderRadius: '{border.radius.xl}' },
      popover: { borderRadius: '{border.radius.md}' },
      select: { borderRadius: '{border.radius.md}' },
    },
    content: {
      borderRadius: '{border.radius.md}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.950}',
          inverseColor: '#ffffff',
          hoverColor: '{zinc.800}',
          activeColor: '{zinc.900}',
        },
        highlight: {
          background: '{zinc.100}',
          focusBackground: '{zinc.200}',
          color: '{zinc.900}',
          focusColor: '{zinc.900}',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
      dark: {
        primary: {
          color: '{zinc.50}',
          inverseColor: '{zinc.950}',
          hoverColor: '{zinc.200}',
          activeColor: '{zinc.300}',
        },
        highlight: {
          background: 'rgba(255,255,255,0.06)',
          focusBackground: 'rgba(255,255,255,0.12)',
          color: '{zinc.50}',
          focusColor: '{zinc.50}',
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
});
