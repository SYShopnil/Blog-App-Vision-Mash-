const getIPAddress = async () => { 
    const http = require('http');
    const options = {
    host: 'www.google.com',
    };
    const request = http.get(options);
    request.end();
    const sentIPAsPromise = new Promise (resolve => {
            request.once('response', (res) => {
            let ip = request.socket.localAddress
            let port = request.socket.localPort
            resolve ({ip,port})
        })
    })
    const ipAddressClient = await sentIPAsPromise;
    return {
        ipAddress: ipAddressClient.ip,
        port: ipAddressClient.port
    }
}

module.exports = {
    getIPAddress
}