const electron = require('electron');
const config = require('./config');
const proxy = require('./proxy-detect');

const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;

const $body = document.querySelector('body');
const $trayBtn = $body.querySelector('#put-in-tray');
const $startBtn = $body.querySelector('.start-btn');
const $setting = $body.querySelector('.setting');
const $proxy = $setting.querySelector('.proxy-url');

const APP = remote.app;
let trayOn = false;
let systemProxy = {
    autoProxy: false,
    proxyAutoDiscovery: false
}


const removeTray = () => {
    ipcRenderer.send("remove-tray");
}

const putInTray = () => {
    ipcRenderer.send("put-in-tray");
}

const handleSetProxy = () => {
    proxy.setProxyAutoDiscovery('on');
    proxy.setAutoProxy('on', config.proxu_url);
}

const handleRemoveProxy = () => {
    proxy.setProxyAutoDiscovery('off');
    proxy.setAutoProxy('off', '');
}

const checkSystemProxy = () => {
    let power = Object.keys(systemProxy).every(name => {
        return systemProxy[name];
    });
    if (power) {
        $trayBtn.checked = true;
        handleValueChange();
    }
}

const handleValueChange = () => {
    trayOn = !trayOn;
    if (trayOn) {
        $body.classList.add('blue');
        putInTray();
        handleSetProxy();
    } else {
        $body.classList.remove('blue');
        removeTray();
        handleRemoveProxy();
    }
    $proxy.disabled = trayOn;
}

const bindEvent = () => {
    $trayBtn.addEventListener('change', handleValueChange, false);

    ipcRenderer.on('tray-removed', () => {
        removeTray();
        trayOn = false;
    });

    ipcRenderer.on('win-close', () => {
        if (!trayOn) {
            ipcRenderer.send('win-close');
        } else {
            ipcRenderer.send('win-show');
        }
    });

    ipcRenderer.on('proxy-good', (sender, payload) => {
        systemProxy[payload.name] = true;
        checkSystemProxy();
    });
}

const init = () => {
    $proxy.value = config.proxu_url;
    bindEvent();
}

init();
