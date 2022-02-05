const {
    saveNewOrExistBlogController,
    publishedBlogController,
    previewBlogByBlogIdController,
    deleteBlogBySlugController,
    updateBlogBySlugController,
    updateBlogTitlePictureOrCover,
    getBlogsController

} = require ("./controller")

//resolver
const resolver = {
    saveBlog: saveNewOrExistBlogController,
    publishBlog: publishedBlogController,
    previewBlog: previewBlogByBlogIdController,
    deleteBlog: deleteBlogBySlugController,
    updateBlogImage: updateBlogTitlePictureOrCover,
    updateBlog: updateBlogBySlugController,
    blogs: getBlogsController
}

module.exports = resolver