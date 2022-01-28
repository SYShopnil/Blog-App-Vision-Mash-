const {
    saveNewOrExistBlogController
} = require ("./controller")

//resolver
const resolver = {
    saveBlog: saveNewOrExistBlogController
}

module.exports = resolver