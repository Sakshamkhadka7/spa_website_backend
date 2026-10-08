const fs = require('fs'); const path = require('path'); const cp = require('child_process');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : entry.name.endsWith('.js') ? [path.join(dir, entry.name)] : []); }
for (const file of walk(path.resolve(__dirname, '../src'))) cp.execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
console.log('Syntax check passed');
