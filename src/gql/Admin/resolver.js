const {createNewAdmin} = require('./controller')

const resolver = {
    createAdmin: createNewAdmin
}

module.exports = resolver