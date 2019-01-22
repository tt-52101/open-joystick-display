const FS = require('fs');
const OJD = window.OJD;

/*
	ThemeController
	Handles the rendering the current joystick theme into view.
*/
class ThemeController {

	constructor(rootController) {
		this.rootId = '#ojd-theme';
		this.contentsId = '#ojd-theme-contents';
		this.rootController = rootController;
		this.themes = rootController.themes;
		this.profiles = rootController.profiles;

		this.currentTheme = false;
		this.currentThemeStyleId=false;
	}

	/*
	 * render()
	 * @return NULL
	 * General renderer, gets the current profile theme and loads it into the canvas.
	 */	
	render() {

		const themeId = this.profiles.getCurrentProfileTheme();
		const themeStyleId = this.profiles.getCurrentProfileThemeStyle();

		if (this.currentTheme!==false) {
			if (this.currentTheme===themeId && this.currentThemeStyleId===themeStyleId) {
				return; // Don't re-render.
			}
		}

		const theme = this.themes.getTheme(themeId, themeStyleId);
		if (!theme) {
			let id = this.themes.getDefault();
			this.profiles.setProfileTheme(id);
			this.profiles.setProfileThemeStyle(0);
			this.rootController.reloadProfile();
			return;
		}

		// Prevent needless rerenders.
		this.currentTheme=themeId;
		this.currentThemeStyleId=themeStyleId;

		// Append CSS
		$('#ojd-theme-stylesheet-style').remove();
		$('#ojd-theme-stylesheet').remove();
		$('head').append(`<link id="ojd-theme-stylesheet" rel="stylesheet" href="${theme.directory}/theme.css" type="text/css" />`);

		// Style of Theme
		if (theme.styles && theme.styles.length > 0 && theme.styles[themeStyleId]) {
			const style = theme.styles[themeStyleId];
			$('head').append(`<link id="ojd-theme-stylesheet-style" rel="stylesheet" href="${theme.directory}/theme-${style.id}.css" type="text/css" />`);
		}

		// Add Theme
		$(this.contentsId).html(theme.html);

		// Parse SVG Objects
		let svg = "";
		const $svgElements = $(`${this.contentsId} *[ojd-svg]`);
		for(const $e of $svgElements) {
			try {
				const file = FS.openSync($($e).attr('ojd-svg'), 'r');
				svg = FS.readFileSync(file, 'UTF-8');
				$($e).html(svg);
				FS.closeSync(file);
			} catch {
				console.error('Cannot read SVG file from element.');
			}
		}

	}

	/*
	 * renderInitial()
	 * @return NULL
	 * Initial render called by rootController
	 */	
	renderInitial() {
		this.render();
	}
}


module.exports.ThemeController = ThemeController;
