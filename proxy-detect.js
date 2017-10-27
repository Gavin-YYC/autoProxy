const child = require('child_process');
const exec = child.exec;

function getProxyAutoDiscovery () {
    return new Promise((resolve, reject) => {
        exec('networksetup -getproxyautodiscovery "Wi-Fi"', (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            if (stdout.toLowerCase().indexOf('on') >= 0) {
                resolve({
                    state: 'on'
                });
            } else {
                resolve({
                    state: 'off'
                });
            }
        });
    })
}

function setProxyAutoDiscovery (state) {
    return new Promise((resolve, reject) => {
        exec('networksetup -setproxyautodiscovery "Wi-Fi" ' + state, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout);
        })
    });
}

function getAutoProxy () {
    return new Promise((resolve, reject) => {
        exec('networksetup -getautoproxyurl "Wi-Fi"', (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            if (stdout.indexOf("URL") >= 0 && stdout.indexOf("Enabled") >= 0) {
                let arr = stdout.split('URL:')
                                .join('')
                                .split('Enabled:')
                                .map(item => item.trim());
                arr[1] = arr[1].toLowerCase() === 'yes' ? 'on' : 'off';
                resolve({
                    url: arr[0],
                    state: arr[1]
                });
            } else {
                resolve(stderr);
            }
        });
    });
}

module.exports = {
    getProxyAutoDiscovery: getProxyAutoDiscovery,
    setProxyAutoDiscovery: setProxyAutoDiscovery,
    getAutoProxy: getAutoProxy
}
