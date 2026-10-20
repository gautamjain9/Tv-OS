#!/usr/bin/env node
/**
 * Tv-OS build script. No webpack, no bundler.
 * Copies src/* and webos-meta/* into dist/ so ares-package can read them.
 *
 * Deliberately 50 lines of Node.js. If this ever needs to be more than
 * ~150 lines, we've overengineered and should push back.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const META = path.join(ROOT, 'webos-meta');
const DIST = path.join(ROOT, 'dist');

const log = (...a) => console.log('[build]', ...a);

const rimraf = (p) => {
	if (!fs.existsSync(p)) return;
	for (const name of fs.readdirSync(p)) {
		const full = path.join(p, name);
		const stat = fs.lstatSync(full);
		if (stat.isDirectory()) rimraf(full);
		else fs.unlinkSync(full);
	}
	fs.rmdirSync(p);
};

const copyDir = (from, to) => {
	if (!fs.existsSync(to)) fs.mkdirSync(to, {recursive: true});
	for (const name of fs.readdirSync(from)) {
		const srcPath = path.join(from, name);
		const dstPath = path.join(to, name);
		const stat = fs.lstatSync(srcPath);
		if (stat.isDirectory()) copyDir(srcPath, dstPath);
		else fs.copyFileSync(srcPath, dstPath);
	}
};

log('cleaning', DIST);
rimraf(DIST);
fs.mkdirSync(DIST, {recursive: true});

log('copying src/ ->', path.relative(ROOT, DIST));
copyDir(SRC, DIST);

log('copying webos-meta/ ->', path.relative(ROOT, DIST));
copyDir(META, DIST);

// Report sizes so we see at a glance if something blew up.
const sizeOf = (p) => fs.statSync(p).size;
const total = fs.readdirSync(DIST).reduce((acc, name) => {
	const full = path.join(DIST, name);
	if (fs.lstatSync(full).isFile()) {
		log(name, (sizeOf(full) / 1024).toFixed(2) + ' KB');
		return acc + sizeOf(full);
	}
	return acc;
}, 0);
log('total (top-level files):', (total / 1024).toFixed(2) + ' KB');
log('done');
