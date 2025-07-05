/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        custom: ["The Bold Font", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extraLight: "200",
        light: "300",
        regular: "400",
        medium: "500",
        semiBold: "600",
        bold: "700",
        extraBold: "800",
        black: "900",
      },
      colors: {
        green: "#17412D",
        "light-green": "#70d460",
        background: "#C6D8CB",
        "lighter-green": "#d4edd8",
        "green-dark": "#123725",
        white: "#ffffff",
        "white-light": "#f8fff9",
        grey: "#21262b",
        "light-grey": "#c7cfd7",
        "lighter-grey": "#e7f0e9",
        blue: "#081747",
        "light-blue": "#7e9bf5",
        yellow: "#FFC805",
        "border-white": "rgba(255, 255, 255, 0.06)",
      },
    },
  },
  plugins: [],
};
