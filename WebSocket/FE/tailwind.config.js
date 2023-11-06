/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts,tsx,jsx}"],
  theme: {
    extend: {
      backgroundColor: {
        main: "#083c59",
        icon: "#0075FF",
      },
      translate: {
        50: "-50%",
      },
      colors: {
        main: "#083c59",
        icon: "#0075FF",
      },
    },
  },
  plugins: [],
};
