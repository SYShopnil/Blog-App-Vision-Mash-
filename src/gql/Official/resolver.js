const {
    createNewOfficialSchemaController
} = require('./controller')

const resolver = {
    createOfficialData: createNewOfficialSchemaController
}

module.exports = resolver