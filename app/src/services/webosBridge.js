/**
 * Thin shim over the webOS LS2 bus. Falls back to logging in the browser
 * (dev) so we can run the launcher outside the TV.
 *
 * Why not use @enact/webos directly: we want ONE call site that we can
 * mock, log, and eventually swap for a root-only variant (L2) that uses
 * privileged services.
 */
const hasWebOS = () =>
	typeof window !== 'undefined' &&
	typeof window.webOS !== 'undefined' &&
	typeof window.webOS.service !== 'undefined';

/**
 * Launch another app by its webOS ID.
 * @param {string} appId  e.g. 'youtube.leanback.v4', 'netflix', 'com.webos.app.hdmi1'
 * @returns {Promise<void>}
 */
export const launchApp = (appId) =>
	new Promise((resolve, reject) => {
		if (!hasWebOS()) {
			// eslint-disable-next-line no-console
			console.info(`[webosBridge] (dev) launchApp(${appId})`);
			return resolve();
		}
		window.webOS.service.request('luna://com.webos.applicationManager', {
			method: 'launch',
			parameters: {id: appId},
			onSuccess: () => resolve(),
			onFailure: (err) => reject(err)
		});
	});

/**
 * Open a specific Settings target (picture / sound / network / …).
 * Verified on older webOS; needs re-check on webOS 22.
 */
export const openSettings = (target) =>
	new Promise((resolve, reject) => {
		if (!hasWebOS()) {
			// eslint-disable-next-line no-console
			console.info(`[webosBridge] (dev) openSettings(${target})`);
			return resolve();
		}
		window.webOS.service.request('luna://com.webos.applicationManager', {
			method: 'launch',
			parameters: {id: 'com.palm.app.settings', params: {target}},
			onSuccess: () => resolve(),
			onFailure: (err) => reject(err)
		});
	});
