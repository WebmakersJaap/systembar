'use strict'

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path'
import { format as formatUrl } from 'url'

const ConfigStore = require('electron-store');
const electron = require('electron');

const isDevelopment = process.env.NODE_ENV !== 'production'
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

let mainApp = {
	tray: null,
	config: null,
	menuArr: [],
	isQuitting: false,
	isAlreadyRunning: false,
	moduleNames: ['volume','music','disk','uptime','network','cpu','memory','keyboard','gulden'], //'search','battery','trash',
	modules: [],
	init: function() {
		this.isAlreadyRunning = app.makeSingleInstance(this.onAppSingleInstance.bind(this));
		if (this.isAlreadyRunning) app.quit();

		/*let mainScreen = screen.getPrimaryDisplay();
		let lbw = Math.round(mainScreen.size.width);
		let lbh = Math.round(mainScreen.size.height);
		this.config = new ConfigStore({defaults: {
			lastWindowState: {x:0, y:0, width: lbw, height: lbh},
		}, name: app.getName()});*/

		this.createMainWindow();
		this.createTray();

		app.on('window-all-closed', this.onAppWindowAllClosed.bind(this));
		app.on('activate', this.onAppActivate.bind(this));
		app.on('before-quit', this.onAppBeforeQuit.bind(this));

		this.show();
		app.setLoginItemSettings({openAtLogin:true});
	},
	createMainWindow: function() {
		//const lws = this.config.get('lastWindowState');

		let mainScreen = electron.screen.getPrimaryDisplay();
		let lbw = Math.round(mainScreen.size.width);
		let lbh = Math.round(mainScreen.size.height);
		//let lbx = Math.round( (mainScreen.size.width - lbw) / 2);
		this.mainWindow = new BrowserWindow({
			frame:false,
			skipTaskbar: true,
			transparent: true,
			title: app.getName(),
			icon: path.join(__static, 'icontray.png'),
			x: 0, y: 0, width: lbw, height: lbh,
			minWidth: lbw, maxWidth: lbw,
			minHeight: lbh, maxHeight: lbh,
			icon: path.join(__static, 'icontray.png'),
			alwaysOnTop: true,
			autoHideMenuBar: true,
			webPreferences: {
				backgroundThrottling: false
			}
		});

		//if (isDevelopment) this.mainWindow.webContents.openDevTools();
		//if (isDevelopment) this.mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
		//else {
			this.mainWindow.loadURL(formatUrl({pathname: path.join(__static, 'index.html'), protocol: 'file', slashes: true}));
		//}
		this.mainWindow.setMenu(null);

		this.mainWindow.on('close', this.onWindowClose.bind(this)); // close to tray
		this.mainWindow.on('minimize', this.onWindowMinimize.bind(this)); //minimize to tray
		this.mainWindow.on('focus', this.onWindowFocus.bind(this));
		this.mainWindow.on('closed', this.onWindowClosed.bind(this));
		this.mainWindow.webContents.on('dom-ready', this.onWindowDomReady.bind(this));
		/*this.mainWindow.webContents.on('devtools-opened', function() {
			this.mainWindow.focus();
			setImmediate(function() { this.mainWindow.focus() }.bind(this));
		}.bind(this));*/
		this.mainWindow.webContents.on('new-window', function(e, url, frameName, disposition, options) {
			e.preventDefault();
			shell.openExternal(url);
		}.bind(this));

		mainWindow = this.mainWindow; // store global reference
	},
	createTray: function() {
		if (process.platform === 'darwin' || this.tray) return;
		this.menuArr = [
			{label: 'Hide '+app.getName(), click: function() { this.hideWin(); }.bind(this)},
			{type: 'separator'},
			{role: 'quit'}
		];
		const iconPath = path.join(__static, 'icontray.png');
		let contextMenu = electron.Menu.buildFromTemplate(this.menuArr);
		this.tray = new electron.Tray(iconPath);
		this.tray.setToolTip(app.getName());
		this.tray.setContextMenu(contextMenu);
		this.tray.on('click', this.toggleWin.bind(this));
	},
	toggleWin: function() {
		if (this.mainWindow.isVisible()) this.hide();
		else this.show();
	},
	show: function() {
		if (this.mainWindow.isMinimized()) this.restore();
		this.mainWindow.show();
		this.menuArr.shift();
		this.menuArr.unshift({label: 'Hide '+app.getName(), click: function() { this.hide(); }.bind(this) });
		let contextMenu = electron.Menu.buildFromTemplate(this.menuArr);
		this.tray.setContextMenu(contextMenu);
	},
	hide: function() {
		this.mainWindow.hide();
		this.menuArr.shift();
		this.menuArr.unshift({label: 'Show '+app.getName(), click: function() { this.show(); }.bind(this) });
		let contextMenu = electron.Menu.buildFromTemplate(this.menuArr);
		this.tray.setContextMenu(contextMenu);
	},
	restore: function() {
		this.mainWindow.restore();
	},
	onWindowClose: function(e) { // close to tray?
		/*e.preventDefault();
		this.mainWindow.blur();
		this.hide();*/
		//this.config.set('lastWindowState', this.mainWindow.getBounds());
	},
	onWindowMinimize: function(e) { // minimize to tray
   		e.preventDefault();
    	this.mainWindow.hide();
	},
	onWindowClosed: function(e) {
		this.mainWindow = null;
	},
	onWindowFocus: function(e) {
		this.mainWindow.flashFrame(false);
	},
	onWindowDomReady: function(e) {
		setTimeout(function() { this.initModules(); }.bind(this), 200);
	},
	send: function(key,data) {
		if(!!this.mainWindow) this.mainWindow.webContents.send(key,data);
	},
	receive: function(key, data) {
		for(var i in this.modules) {
			if(this.modules[i]['name'] == key && typeof this.modules[i]['module'].receive != 'undefined') this.modules[i]['module'].receive(data);
		}
	},
	tick: function() {
		for(var i in this.modules) {
			if(typeof this.modules[i]['module'].tick != 'undefined') this.modules[i]['module'].tick(this.tickNr);
		}
		this.tickNr++;
	},
	initModules: function() {
		for(var i in this.moduleNames) {
			var SBModule = require('./modules/'+this.moduleNames[i]);
			this.modules[i] = {'name':this.moduleNames[i], 'module': new SBModule(this)};
			this.modules[i]['module'].start();
		}
		ipcMain.on('module:change', function(e, arg) { this.receive(arg.key, arg.data); }.bind(this));

		// Start updating...
		this.tickNr = 0;
		if(!!this.tickInt) clearInterval(this.tickInt);
		this.tickInt = setInterval(function() { this.tick(); }.bind(this), 1000);
		this.tick();
	},
	onAppSingleInstance: function(e) {
		if (mainWindow) {
			if (mainWindow.isMinimized()) this.restore();
			this.show();
		}
	},
	onAppWindowAllClosed: function(e) { // Quit when all windows are closed.
		// On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') app.quit()
	},
	onAppActivate: function(e) {
	    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
	    if (mainWindow === null) this.createMainWindow();
	    this.show();
	},
	onAppBeforeQuit: function(e) {
		this.isQuitting = true;
	}
}
app.on('ready', function() {
	mainApp.init();
});
