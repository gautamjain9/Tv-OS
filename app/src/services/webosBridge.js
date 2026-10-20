/**
 * Thin shim over the webOS LS2 bus. Falls back to logging in the browser
 * (dev) so we can run the launcher outside the TV.
 *
 * We call the bus through @enact/webos/LS2Request, which talks to the
 * runtime's native WebOSServiceBridge/PalmServiceBridge. We do NOT rely on
 * `window.webOS.service` — that global only exists when the separate
 * webOSTV.js library is loaded, which an Enact build does not include.
 *
 * Kept as ONE call site that we can mock, log, and eventually swap for a
 * root-only variant (L2) that uses privileged services.
 */
import LS2Request from '@enact/webos/LS2Request';

const TIMEOUT_MS = 5000;

const hasBridge = () =>
	typeof window !== 'undefined' &&
	(typeof window.WebOSServiceBridge === 'function' || typeof window.PalmServiceBridge === 'function');

const call = (service, method, parameters) =>
	new Promise((resolve, reject) => {
		if (!hasBridge()) {
			// eslint-disable-next-line no-console
			console.info(`[webosBridge] (dev) ${service}/${method}`, parameters);
			return resolve();
		}
		new LS2Request().send({
			service,
			method,
			parameters,
			timeout: TIMEOUT_MS,
			onSuccess: resolve,
			onFailure: reject,
			onTimeout: reject
		});
	});

/**
 * Launch another app by its webOS ID.
 * @param {string} appId  e.g. 'youtube.leanback.v4', 'netflix', 'com.webos.app.hdmi1'
 * @returns {Promise<Object>}
 */
export const launchApp = (appId) =>
	call('luna://com.webos.applicationManager', 'launch', {id: appId});

/**
 * Open a specific Settings target (picture / sound / network / …).
 * Verified on older webOS; needs re-check on webOS 22.
 */
export const openSettings = (target) =>
	call('luna://com.webos.applicationManager', 'launch', {id: 'com.palm.app.settings', params: {target}});
