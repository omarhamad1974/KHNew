/* Tailwind settings for the compiled stylesheet (scripts/build-tailwind.js).
   The theme is NOT repeated here: it is read from tailwind-config.js, the same file the Tailwind CDN uses, so there is one place to change it. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const sandbox = { tailwind: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'tailwind-config.js'), 'utf8'), sandbox);
// Files whose class names count: every public page (also the generated -ar pages) and every public script. Admin files are left out.
const ls = ext => fs.readdirSync(ROOT).filter(f => f.endsWith(ext) && !/^admin/.test(f) && !['news-import.js', 'slider-import.js', 'sections-map.js', 'tailwind-config.js'].includes(f)).map(f => path.join(ROOT, f));
module.exports = { ...sandbox.tailwind.config, content: [...ls('.html'), ...ls('.js')] };
