/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mine: {
          450: '#111214',
          460: '#1A1B25',
          470: '#1B1C24',
          480: '#0E0E12',
          490: '#4FA48f',
          500: '#E9E9EB',
          510: '#C66AE1',
          520: '#1b1c24',
        530 : '#4fa48f',
        540 :'#eccc6b',
        550 :'#262626',
        },
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}