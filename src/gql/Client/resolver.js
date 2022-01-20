const { createNewClientController} = require('./controller')
const resolver = {
    createClient : createNewClientController
}

module.exports = resolver