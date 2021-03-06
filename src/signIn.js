/**
 * Goes to Amazon Sign In page and tries to sign in with given credentials
 * @param {Puppeteer.Page} page
 * @param {string} username
 * @param {string} password
 * @param {number} pageNumber
 * @param {boolean} twoFactorAuth
 * @param {boolean} rememberMe
 * @returns {Promise<void>}
 */
module.exports = async function(
	page,
	username,
	password,
	pageNumber,
	twoFactorAuth,
	rememberMe
) {
	const returnUrl = encodeURIComponent(
		'https://www.amazon.com/ga/giveaways?pageId=' + pageNumber
	);
	await page.goto(
		'https://www.amazon.com/ap/signin?_encoding=UTF8&ignoreAuthState=1&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=' +
			returnUrl +
			'&switch_account='
	);

	try {
		await page.waitForSelector('#ap_email', {
			timeout: 1000
		});
		await page.click('#ap_email');
		await page.type('#ap_email', username);
	} catch (error) {
		console.log('No email field');
	}

	await page.waitForSelector('#ap_password');
	await page.click('#ap_password');
	await page.type('#ap_password', password);

	if (rememberMe) {
		try {
			await page.waitForSelector('[name=rememberMe]', {
				timeout: 1000
			});
			await page.click('[name=rememberMe]');
		} catch (error) {
			// couldn't click rememberMe, no big deal
		}
	}

	const signInPromise = page.waitForNavigation();
	await page.waitForSelector('#signInSubmit');
	await page.click('#signInSubmit');
	await signInPromise;

	if (twoFactorAuth) {
		try {
			await page.waitForSelector('#auth-mfa-otpcode', {
				timeout: 1000
			});
			if (rememberMe) {
				await page.waitForSelector('#auth-mfa-remember-device', {
					timeout: 1000
				});
				await page.click('#auth-mfa-remember-device');
			}
			console.log('Waiting for two factor authentication...');
			const twoFactorAuthPromise = page.waitForNavigation({ timeout: 0 });
			await twoFactorAuthPromise;
		} catch (error) {
			//couldn't click remember device, no big deal
		}
	}
};
