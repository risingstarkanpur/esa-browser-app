/** Offline build: CSS is compiled once into css/tailwind.css (no CDN needed at runtime). */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        void: 'var(--bg-void)',
        surface: 'var(--bg-surface)',
        card: 'var(--bg-card)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        ok: 'var(--emerald)',
        danger: 'var(--rose)',
        ink: 'var(--text-main)',
        dim: 'var(--text-dim)',
        line: 'var(--border-light)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
