// Tv-OS — vanilla launcher
// Zero frameworks. We own: focus state, remote keyboard handling, LS2 bridge.
// Every tile is a native <button> so browser focus + :focus CSS "just works."
// Target engine is Chromium 87 (webOS TV 22); keep syntax ES2017-level.

(function () {
	'use strict';

	// ---- Data (user curates). On non-root webOS we cannot discover apps,
	// so the list is explicit. app IDs are the webOS LS2 ids; wrong id =
	// launch fails (the debug line shows the error). Edit APPS / INPUTS.
	const APPS = [
		{id: 'youtube.leanback.v4', label: 'YouTube'},
		{id: 'netflix', label: 'Netflix'},
		{id: 'amazon', label: 'Prime Video'},
		{id: 'com.disney.disneyplus-prod', label: 'Disney+'},
		{id: 'com.webos.app.livetv', label: 'Live TV'}
	];
	const INPUTS = [
		{id: 'com.webos.app.hdmi1', label: 'HDMI 1'},
		{id: 'com.webos.app.hdmi2', label: 'HDMI 2'},
		{id: 'com.webos.app.hdmi3', label: 'HDMI 3'}
	];

	// ---- Debug helper. Writes to the overlay div so we can read state off
	// the TV screen without web inspector.
	const dbg = (msg) => {
		const el = document.getElementById('debug');
		if (el) el.textContent = msg;
	};

	// ---- LS2 bridge — launch another webOS app by id.
	// The webOS WebView injects a native WebOSServiceBridge (older name:
	// PalmServiceBridge) into every web app. window.webOS.service does NOT
	// exist unless LG's separate webOSTV.js library is loaded, which we do
	// not ship — so we call the native bridge directly, the same way
	// webOSTV.js and Enact's LS2Request do. In a plain browser there is no
	// bridge and we fall back to console.info so browser previews still run.
	const LUNA_TIMEOUT_MS = 5000;
	const inflight = new Set(); // keep bridges reachable until they answer

	const lunaCall = (uri, params, onDone) => {
		const Bridge = window.WebOSServiceBridge || window.PalmServiceBridge;
		if (typeof Bridge !== 'function') return false;
		const bridge = new Bridge();
		let settled = false;
		const finish = (res) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			inflight.delete(bridge);
			// One-shot call: release the native handle, as LS2Request does.
			if (bridge.cancel) bridge.cancel();
			onDone(res);
		};
		const timer = setTimeout(() => {
			finish({returnValue: false, errorText: 'no reply in ' + LUNA_TIMEOUT_MS + ' ms'});
		}, LUNA_TIMEOUT_MS);
		bridge.onservicecallback = (msg) => {
			let res;
			try { res = JSON.parse(msg); } catch (e) { res = {returnValue: false, errorText: String(msg)}; }
			finish(res || {returnValue: false, errorText: 'empty reply'});
		};
		inflight.add(bridge);
		bridge.call(uri, JSON.stringify(params));
		return true;
	};

	// OK in Magic Remote pointer mode may arrive as both a keydown and a
	// click, and a held OK repeats — one launch per 800 ms is plenty.
	let lastLaunchAt = 0;
	const launchApp = (appId) => {
		const now = Date.now();
		if (now - lastLaunchAt < 800) return;
		lastLaunchAt = now;
		const sent = lunaCall('luna://com.webos.applicationManager/launch', {id: appId}, (res) => {
			if (res.returnValue === false || res.errorCode) {
				dbg('launch failed: ' + appId + ' / ' + (res.errorText || res.errorCode));
			} else {
				dbg('launched: ' + appId);
			}
		});
		if (!sent) {
			console.info('[dev] launchApp', appId);
			dbg('(dev) would launch: ' + appId);
		}
	};

	// ---- Clock — updates every 15 s to avoid per-second re-renders, and
	// not at all while the app is hidden (see visibilitychange in boot).
	const pad = (n) => String(n).padStart(2, '0');
	const formatTime = (d) => pad(d.getHours()) + ':' + pad(d.getMinutes());
	const formatDate = (d) => d.toLocaleDateString(undefined, {
		weekday: 'long', day: 'numeric', month: 'short'
	});
	const tickClock = () => {
		const now = new Date();
		const t = document.getElementById('clock');
		const dt = document.getElementById('date');
		if (t) t.textContent = formatTime(now);
		if (dt) dt.textContent = '·  ' + formatDate(now);
	};
	let clockTimer = 0;
	const startClock = () => {
		tickClock();
		clearInterval(clockTimer);
		clockTimer = setInterval(tickClock, 15000);
	};

	// ---- Tile DOM factory. Returns a <button> so native focus + :focus CSS
	// trigger our focused style with zero fiddling.
	const makeTile = ({id, label}, variant) => {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'tile';
		btn.dataset.variant = variant;
		btn.dataset.appId = id;
		const inner = document.createElement('div');
		inner.className = 'inner';
		const lbl = document.createElement('div');
		lbl.className = 'label';
		lbl.textContent = label;
		inner.appendChild(lbl);
		btn.appendChild(inner);
		btn.addEventListener('click', () => launchApp(id));
		return btn;
	};

	// ---- Build grid.
	const renderRow = (containerId, items, variant) => {
		const container = document.getElementById(containerId);
		if (!container) return [];
		return items.map((item) => container.appendChild(makeTile(item, variant)));
	};

	// ---- Focus / spatial navigation.
	// Tiles never change after boot, so the row grid is built once. Arrow
	// keys move within or between rows; Enter/OK triggers click. webOS
	// remote keyCodes: 37 Left, 38 Up, 39 Right, 40 Down, 13 OK, 461 Back.
	let rows = [];
	let lastFocused = null;

	const isTile = (el) => !!el && el.classList && el.classList.contains('tile');

	const findPosition = (el) => {
		for (let r = 0; r < rows.length; r++) {
			const c = rows[r].indexOf(el);
			if (c !== -1) return {r, c};
		}
		return null;
	};

	// Keep the focused tile, ring and glow fully inside its row. The
	// browser's own focus scroll counts a tile with 32px showing as visible
	// and leaves it cut off at the row edge, so we scroll the row ourselves
	// (instantly; only transform + opacity animate). The scroller's padding
	// (--focus-bleed) is the room kept on each side.
	const reveal = (el) => {
		const sc = el.parentElement;
		const room = parseFloat(getComputedStyle(sc).paddingLeft) || 0;
		const max = el.offsetLeft - room;
		const min = el.offsetLeft + el.offsetWidth + room - sc.clientWidth;
		if (sc.scrollLeft > max) sc.scrollLeft = max;
		else if (sc.scrollLeft < min) sc.scrollLeft = min;
	};

	const focusTile = (el) => {
		if (!el) return;
		el.focus({preventScroll: true});
		reveal(el);
		dbg('focus: ' + (el.dataset.appId || 'none'));
	};

	// Put focus back where the user left it (or on YouTube) when the app
	// boots, comes back to the foreground, or is relaunched.
	const restoreFocus = () => {
		if (isTile(document.activeElement)) return;
		focusTile(lastFocused || (rows[0] && rows[0][0]));
	};

	const moveFocus = (dx, dy) => {
		const pos = findPosition(document.activeElement);
		if (!pos) { restoreFocus(); return; }
		const nr = Math.min(Math.max(pos.r + dy, 0), rows.length - 1);
		const nextRow = rows[nr];
		if (!nextRow || nextRow.length === 0) return;
		const nc = Math.min(Math.max(pos.c + dx, 0), nextRow.length - 1);
		focusTile(nextRow[nc]);
	};

	const onKey = (ev) => {
		const code = ev.keyCode || ev.which;
		switch (code) {
			case 37: ev.preventDefault(); moveFocus(-1, 0); break; // Left
			case 39: ev.preventDefault(); moveFocus( 1, 0); break; // Right
			case 38: ev.preventDefault(); moveFocus( 0, -1); break; // Up
			case 40: ev.preventDefault(); moveFocus( 0, 1); break; // Down
			case 13: // Enter / OK
			case 16777221: // OK on some webOS builds (Enact maps it to enter too)
				// preventDefault stops the button's native Enter->click, so
				// exactly one click comes from here.
				ev.preventDefault();
				if (!ev.repeat && isTile(document.activeElement)) document.activeElement.click();
				break;
			case 461: // Back. disableBackHistoryAPI hands it to us; we are
				// the home screen, so there is nowhere to go back to.
				ev.preventDefault();
				break;
			default:
				break;
		}
	};

	// Magic Remote pointer: a tile under the moving pointer takes focus
	// (no scroll jump), and pointing at empty space drops focus so OK
	// cannot launch a tile the user is not looking at. Only real movement
	// counts: the first event just records the position, and same-position
	// events (Chromium fakes them when content scrolls under a parked,
	// hidden pointer) are ignored, so 5-way focus is never stolen.
	let lastX = null;
	let lastY = null;
	const onPointerMove = (ev) => {
		const first = lastX === null;
		if (ev.clientX === lastX && ev.clientY === lastY) return;
		lastX = ev.clientX;
		lastY = ev.clientY;
		if (first) return;
		const tile = ev.target.closest ? ev.target.closest('.tile') : null;
		const active = document.activeElement;
		if (tile) {
			if (tile !== active) tile.focus({preventScroll: true});
		} else if (isTile(active)) {
			active.blur();
		}
	};

	// ---- Boot
	const boot = () => {
		rows = [
			renderRow('apps-row', APPS, 'app'),
			renderRow('inputs-row', INPUTS, 'input')
		];
		startClock();
		document.addEventListener('keydown', onKey);
		document.addEventListener('mousemove', onPointerMove);
		document.addEventListener('focusin', (ev) => {
			if (isTile(ev.target)) lastFocused = ev.target;
		});

		// Pause the clock while hidden (another app is in front); on return,
		// tick at once and make sure a tile is focused.
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				clearInterval(clockTimer);
			} else {
				startClock();
				restoreFocus();
			}
		});
		// Fired when the already-running launcher is launched again.
		document.addEventListener('webOSRelaunch', restoreFocus);
		// The platform may focus the window after boot (or after a system
		// overlay closes); recover if DOM focus was lost meanwhile.
		window.addEventListener('focus', restoreFocus);

		// Focus YouTube now. Tiles are in the DOM and styles.css has loaded
		// (scripts wait for pending stylesheets), so no delay is needed.
		restoreFocus();
		dbg(rows[0].length ? 'ready · ' + APPS.length + ' apps · ' + INPUTS.length + ' inputs' : 'no tiles rendered');
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
