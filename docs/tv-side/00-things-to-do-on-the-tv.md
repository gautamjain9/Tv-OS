# Things to do ON THE TV (not on the laptop)

Order matters. Do them in this order.

## 1. Disable auto-update IMMEDIATELY (protect the root window)

Why: LG is actively patching the exploits we need. If this TV auto-updates past
7.5.8-28, the root path may die forever on this hardware.

Steps (menu names vary slightly on Hub builds — look for the equivalent):
1. Press ⚙️ Settings (gear) on remote → **All Settings**
2. **General → About This TV** (or **Support**)
3. **Auto Update** — turn **OFF**
4. Back to General → **System → Additional Settings** (or similar) → look for
   **"Software Update"** → make sure auto-update is OFF there too.
5. If there is a **"Check for Updates"** button — **do not press it.**

**Report back:** did you find the auto-update toggle? What exact menu path?

## 2. Verify current firmware (one more time, exactly as shown)

Settings → All Settings → General → **About This TV**
- Software version: should read **7.5.8-28** (what you reported)
- If it reads anything different now, STOP and tell me.

## 3. Enable Developer Mode fully (you already installed the app)

In the Developer Mode app on the TV:
1. Login with a developer account from LG — https://webostv.developer.lge.com (free sign-up)
2. **Dev Mode Status: ON**
3. **Key Server: ON**
4. Note down the IP address shown on the TV screen (something like 192.168.x.x)
5. Note the passphrase shown — case sensitive, exact characters.

**Report back:** the IP address of the TV on your network.

## 4. Make sure TV and laptop are on the same WiFi network

Both must be on the same local network for the laptop to reach the TV.

## 5. (Decision needed before Phase 2) About uninstalling Developer Mode

- **If you want to try rooting later (L2):** you will have to uninstall Developer Mode
  before the root attempt. Do not uninstall yet — we need it for L1 first.
- **After L1 is working:** we will decide whether to uninstall and proceed to L2.
