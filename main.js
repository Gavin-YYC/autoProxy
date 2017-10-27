const path = require('path');
const electron = require('electron');
const url = require('url');
const proxy = require('./proxy-detect');
const config = require('./config');

const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

let tray = null;
let win = null;
let webContent = null;

ipcMain.on('put-in-tray', function (event) {
    const iconName = process.platform === 'win32' ? 'windows-icon.png' : config.tray_icon_path;
    const iconPath = path.join(__dirname, iconName);
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "显示界面",
            click: () => {
                console.log("show");
            }
        }, {
            label: "退出",
            click: () => {
                appExit();
            }
        }
    ]);
    tray.setToolTip('正在享受代理服务...');
    tray.setContextMenu(contextMenu);
});

ipcMain.on('remove-tray', function () {
    tray.destroy();
}).on('win-close', function () {
    appExit();
}).on('win-show', function () {
    app.hide();
});

function appExit () {
    app.exit();
}

function createWindow () {
    win = new BrowserWindow({
        width: config.win_width,
        height: config.win_height,
        maximizable: config.win_maximizable,
        fullscreen: config.win_fullscreen,
        fullscreenable: config.win_fullscreenable,
        show: false
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    webContent = win.webContents;

    bindWinEvent();
}

function checkProxyState () {
    const getProxyAutoDiscovery = proxy.getProxyAutoDiscovery();
    const getAutoProxy = proxy.getAutoProxy();

    getProxyAutoDiscovery.then(data => {
        if (data.state === 'on') {
            webContent.send('proxy-good', {
                name: 'proxyAutoDiscovery'
            });
        }
    });

    getAutoProxy.then(data => {
        if (data.state === 'on') {
            webContent.send('proxy-good', {
                name: 'autoProxy',
                url: data.url
            });
        }
    });
}

function bindWinEvent () {
    win.on('ready-to-show', function () {
        win.show();
        checkProxyState();
    });

    win.on('close', function (event) {
        webContent.send('win-close');
        event.preventDefault();
    });
}

function windowActive () {
    if (win === null) {
        createWindow();
    }
}

app.on('ready', createWindow);
app.on('activate', windowActive);
