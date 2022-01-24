const { createNewClientController
    ,deleteClientBySlugController,
    updateClientBySLug:updateClientBySLugController,
    canSeeOnlyHisBlogController} = require('./controller')

const resolver = {
    createClient : createNewClientController,
    deleteClient: deleteClientBySlugController,
    updateClient: updateClientBySLugController,
    seeOwnBlog: canSeeOnlyHisBlogController
}

module.exports = resolver