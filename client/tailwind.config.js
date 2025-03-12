/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', "./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  safelist: [
    // Match text colors (text-{color}-{shade})
    {
      pattern: /text-(\w+)-(\d{3})/,
      variants: ['hover', 'focus', 'group-hover'],
    },
    // Match background colors (bg-{color}-{shade})
    {
      pattern: /bg-(\w+)-(\d{3})/,
      variants: ['hover', 'focus', 'group-hover'],
    },
    {
      pattern: /bg-(\w+)/,
      variants: ['hover', 'focus', 'group-hover'],
    },
    // Match border colors (border-{color}-{shade})
    {
      pattern: /border-(\w+)-(\d{3})/,
      variants: ['hover', 'focus'],
    },
    // Match ring colors (ring-{color}-{shade})
    {
      pattern: /ring-(\w+)-(\d{3})/,
      variants: ['hover', 'focus'],
    },
    // Match gradient start and end colors (from-{color}-{shade}, to-{color}-{shade})
    {
      pattern: /from-(\w+)-(\d{3})/,
    },
    {
      pattern: /to-(\w+)-(\d{3})/,
    },
    // Match shadow colors (shadow-{color}-{shade})
    {
      pattern: /shadow-(\w+)-(\d{3})/,
    },
  ],
  plugins: [],
};