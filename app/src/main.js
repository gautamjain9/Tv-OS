// Tv-OS — vanilla launcher
// Zero frameworks. We own: focus state, remote keyboard handling, LS2 bridge.
// Every tile is a native <button> so browser focus + :focus CSS "just works."

(function () {
	'use strict';

	// ---- Data (user curates). On non-root webOS we cannot discover apps,
	// so the list is explicit. app IDs are the webOS LS2 ids; wrong id =
	// tile silently does nothing. Swap by editing APPS / INPUTS below.
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
	// window.webOS is injected by webOS WebView. In a plain browser we fall
	// back to console.info so dev work in a browser preview still runs.
	const launchApp = (appId) => {
		if (window.webOS && window.webOS.service && window.webOS.service.request) {
			window.webOS.service.request('luna://com.webos.applicationManager', {
				method: 'launch',
				parameters: {id: appId},
				onSuccess: () => dbg('launched: ' + appId),
				onFailure: (err) => dbg('launch failed: ' + appId + ' / ' + (err && err.errorText))
			});
		} else {
			console.info('[dev] launchApp', appId);
			dbg('(dev) would launch: ' + appId);
		}
	};

	// ---- Clock — updates every 15 s to avoid per-second re-renders.
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

	// ---- Tile DOM factory. Returns a <button> so native focus + :focus CSS
	// trigger our focused style with zero fiddling.
	const makeTile = ({id, label}, variant) => {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'tile';
		btn.dataset.variant = variant;
		btn.dataset.appId = id;
		btn.setAttribute('role', 'listitem');
		btn.setAttribute('tabindex', '0');
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
		if (!container) return;
		items.forEach((item) => container.appendChild(makeTile(item, variant)));
	};

	// ---- Focus / spatial navigation.
	// We maintain a flat ordered list of all focusable tiles. Arrow keys
	// move within or between rows based on row index. Enter/OK triggers
	// click. The remote on webOS sends standard keydown events with keyCodes:
	//   37 Left, 38 Up, 39 Right, 40 Down, 13 Enter, 461 Back, 403 Red, etc.
	// We also accept the webOS OK keyCode (13 is standard Enter).

	const tilesByRow = () => {
		return [
			Array.from(document.querySelectorAll('#apps-row .tile')),
			Array.from(document.querySelectorAll('#inputs-row .tile'))
		];
	};

	const findPosition = (el) => {
		const rows = tilesByRow();
		for (let r = 0; r < rows.length; r++) {
			const c = rows[r].indexOf(el);
			if (c !== -1) return {rows, r, c};
		}
		return null;
	};

	const focusTile = (el) => {
		if (!el) return;
		el.focus();
		dbg('focus: ' + (el.dataset.appId || 'none') + '  rows=' + tilesByRow().length);
	};

	const moveFocus = (dx, dy) => {
		const active = document.activeElement;
		const pos = findPosition(active);
		if (!pos) {
			// No tile focused yet — focus the first one in the first row.
			const rows = tilesByRow();
			const first = rows[0] && rows[0][0];
			focusTile(first);
			return;
		}
		const {rows, r, c} = pos;
		let nr = r + dy;
		let nc = c + dx;
		if (nr < 0) nr = 0;
		if (nr >= rows.length) nr = rows.length - 1;
		const nextRow = rows[nr];
		if (!nextRow || nextRow.length === 0) return;
		if (nc < 0) nc = 0;
		if (nc >= nextRow.length) nc = nextRow.length - 1;
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
				ev.preventDefault();
				if (document.activeElement && document.activeElement.classList.contains('tile')) {
					document.activeElement.click();
				}
				break;
			default:
				// webOS Back is 461 — do nothing (default browser Back may close app).
				break;
		}
	};

	// ---- Boot
	const boot = () => {
		renderRow('apps-row', APPS, 'app');
		renderRow('inputs-row', INPUTS, 'input');
		tickClock();
		setInterval(tickClock, 15000);
		document.addEventListener('keydown', onKey);

		// Focus the first app tile shortly after mount — gives layout time
		// to settle so .focus() scrolls the tile into view predictably.
		setTimeout(() => {
			const first = document.querySelector('#apps-row .tile');
			if (first) focusTile(first);
			else dbg('no tiles rendered');
		}, 150);

		dbg('ready · ' + APPS.length + ' apps · ' + INPUTS.length + ' inputs');
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
