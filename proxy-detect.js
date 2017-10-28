const exec = require('child_process').exec;
const CMD_PRE = 'networksetup';
const CMD_NETWORK = "Wi-Fi";
const CMD_LIST = {
    getautoproxyurl: "getautoproxyurl",
    setautoproxyurl: "setautoproxyurl",
    setautoproxystate: "setautoproxystate",
    getproxyautodiscovery: "getproxyautodiscovery",
    setproxyautodiscovery: "setproxyautodiscovery"
};

const makeCmd = (name, value) => {
    return new Promise((resolve, reject) => {
        let cmd = '';
        if (typeof value === 'undefined') {
            cmd = `${CMD_PRE} -${CMD_LIST[name]} ${CMD_NETWORK}`;
        } else {
            cmd = `${CMD_PRE} -${CMD_LIST[name]} ${CMD_NETWORK} ${value}`;
        }
        resolve(cmd);
    });
}

const run = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            resolve(stdout.toString());
        })
    });
}

const getState = (isOn) => isOn ? 'on' : 'off';

/**
 * getProxyAutoDiscovery
 *
 * mac系统返回值为：
 * Auto Proxy Discovery: Off
 * @return {Object} 返回一个对象
 * @return {Object.state} 当前状态，'on' or 'off'
 */
exports.getProxyAutoDiscovery = () => {
    return new Promise((resolve, reject) => {
        makeCmd('getproxyautodiscovery')
            .then(run)
            .then(res => {
                let isOn = res.toLowerCase().indexOf('on') >= 0;
                resolve({state: getState(isOn)});
            });
    });
}

/**
 * setProxyAutoDiscovery
 *
 * 设置：『自动发现代理』状态
 * @param {String} state 状态 'on' or 'off'
 */
exports.setProxyAutoDiscovery = (state) => {
    return new Promise((resolve, reject) => {
        makeCmd('setproxyautodiscovery', state)
            .then(run)
            .then(resolve, reject);
    });
}

/**
 * getAutoProxy
 *
 * mac系统返回值为：
 * URL: (null)
 * Enabled: No
 * @return {Object} 返回一个对象
 * @return {Object.state} 状态，'on' or 'off'
 * @return {Object.url} pac地址
 */
exports.getAutoProxy = () => {
    return new Promise((resolve, reject) => {
        makeCmd('getautoproxyurl')
            .then(run)
            .then(res => {
                let isOk = res.indexOf("URL") >= 0 && res.indexOf("Enabled") >= 0;
                if (!isOk) {
                    reject('data error.');
                } else {
                    let sourceArr = res.split('URL:').join('').split('Enabled:');
                    let arr = sourceArr.map(item => item.trim());
                    let isOn = arr[1].toLowerCase() === 'yes';
                    resolve({
                        url: arr[0],
                        state: getState(isOn)
                    })
                }
        })
    })
}

/**
 * setAutoProxy
 *
 * 设置：『自动代理配置』
 * @param {String} state 状态，'on' or 'off'
 * @param {String} url pac地址
 */
exports.setAutoProxy = (state, url) => {
    const p = new Promise((resolve, reject) => {
        makeCmd('setautoproxystate', state)
            .then(run)
            .then(resolve, reject);
    });
    p.then(() => {
        return new Promise((resolve, reject) => {
            makeCmd('setautoproxyurl', url)
                .then(run)
                .then(resolve, reject)
        })
    });
}
