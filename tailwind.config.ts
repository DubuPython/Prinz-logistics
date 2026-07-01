import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Reverted from 'selector' to 'class' to prevent compiler crashes on Tailwind v3.3
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;