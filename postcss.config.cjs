const tailwindcss = require('@tailwindcss/postcss');
const oklabFunction = require('@csstools/postcss-oklab-function');
const cascadeLayers = require('@csstools/postcss-cascade-layers');
const autoprefixer = require('autoprefixer');

function unwrapWhere(selector) {
  let result = selector;
  let safety = 0;
  while (result.indexOf(':where(') !== -1 && safety < 20) {
    safety++;
    const idx = result.indexOf(':where(');
    let depth = 0;
    let endIdx = -1;
    for (let i = idx + 7; i < result.length; i++) {
      if (result[i] === '(') depth++;
      else if (result[i] === ')') {
        if (depth === 0) {
          endIdx = i;
          break;
        }
        depth--;
      }
    }
    if (endIdx === -1) break;
    const inner = result.slice(idx + 7, endIdx);
    const before = result.slice(0, idx);
    const after = result.slice(endIdx + 1);
    if (inner.indexOf(',') !== -1 && before.trim() === '' && after.trim() === '') {
      result = inner;
    } else if (inner.indexOf(',') === -1) {
      result = before + inner + after;
    } else {
      // Expand comma-separated parts inside :where(a, b) cleanly
      const parts = inner.split(',').map(p => before + p.trim() + after);
      result = parts.join(', ');
    }
  }
  return result;
}

const legacyCompatPlugin = () => ({
  postcssPlugin: 'cozy-legacy-css-compat',
  Once(root) {
    root.walkRules(rule => {
      if (rule.selector && rule.selector.indexOf(':where(') !== -1) {
        rule.selector = unwrapWhere(rule.selector);
      }

      let hasTransform = false;
      let translateDecl = null;
      const insetDecls = [];

      rule.walkDecls(decl => {
        if (decl.prop === 'transform') hasTransform = true;
        if (decl.prop === 'translate') translateDecl = decl;
        if (decl.prop === 'inset') insetDecls.push(decl);
      });

      // Fallback for CSS `inset` (Chrome < 87 / Safari < 14.1)
      insetDecls.forEach(decl => {
        const parts = decl.value.trim().split(/\s+/);
        let t = parts[0];
        let r = parts[1] !== undefined ? parts[1] : t;
        let b = parts[2] !== undefined ? parts[2] : t;
        let l = parts[3] !== undefined ? parts[3] : r;
        decl.cloneBefore({ prop: 'top', value: t });
        decl.cloneBefore({ prop: 'right', value: r });
        decl.cloneBefore({ prop: 'bottom', value: b });
        decl.cloneBefore({ prop: 'left', value: l });
      });

      // Replace CSS `translate` with hardware-accelerated transform3d so both Chrome 64+ and modern browsers translate cleanly once
      if (translateDecl && !hasTransform) {
        const raw = translateDecl.value.trim();
        if (raw && raw !== 'none') {
          const val = raw.indexOf('--tw-translate') !== -1
            ? 'translate3d(var(--tw-translate-x, 0), var(--tw-translate-y, 0), 0)'
            : (() => {
                const parts = raw.split(/\s+/);
                const x = parts[0] || '0';
                const y = parts[1] || '0';
                return `translate3d(${x}, ${y}, 0)`;
              })();
          translateDecl.cloneBefore({ prop: '-webkit-transform', value: val });
          translateDecl.cloneBefore({ prop: 'transform', value: val });
          translateDecl.remove();
        }
      }
    });
  },
});
legacyCompatPlugin.postcss = true;

module.exports = {
  plugins: [
    tailwindcss(),
    oklabFunction({ preserve: false }),
    cascadeLayers(),
    legacyCompatPlugin(),
    autoprefixer({
      overrideBrowserslist: [
        'Android >= 6',
        'Chrome >= 64',
        'iOS >= 12',
        'Safari >= 12',
        'Samsung >= 9',
      ],
    }),
  ],
};
