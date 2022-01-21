const { createNewClientController
    ,deleteClientBySlugController} = require('./controller')

const resolver = {
    createClient : createNewClientController,
    deleteClient: deleteClientBySlugController
}

module.exports = resolver