/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pc-rosa-pastell': '#fce4ec',
        'pc-rosa-medio': '#f06292',
        'pc-rosa-fuerte': '#d81b60',
        'pc-rosa-oscuro': '#ad1457',
        'pc-negro': '#333333',
        'pc-blanco': '#ffffff',
        'pc-amarillo': '#fff9c4',
        'pc-verde-wa': '#25d366',
        'pc-verde-wa-oscuro': '#1b9c4b',
        'pc-azul-suave': '#e3f2fd',
        'pc-gris-suave': '#f9f9f9',
      },
      fontFamily: {
        'hand-drawn': ['Handlee', 'cursive'],
        'sans': ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #333333',
        'brutal': '4px 4px 0px #333333',
        'brutal-lg': '6px 6px 0px #333333',
        'brutal-xl': '10px 10px 0px #333333',
        'brutal-rosa': '10px 10px 0px #fce4ec',
        'brutal-amarillo': '6px 6px 0px #fff9c4',
        'brutal-azul': '10px 10px 0px #e3f2fd',
      },
      borderRadius: {
        'hand-drawn-btn': '255px 15px 225px 15px / 15px 225px 15px 255px',
        'hand-drawn-card': '25px 15px 30px 20px / 20px 25px 15px 22px',
      }
    },
  },
  plugins: [],
}

