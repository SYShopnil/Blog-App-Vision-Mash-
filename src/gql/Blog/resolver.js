const {
    saveNewOrExistBlogController,
    publishedBlogController
} = require ("./controller")

//resolver
const resolver = {
    saveBlog: saveNewOrExistBlogController,
    publishBlog: publishedBlogController
}

module.exports = resolver