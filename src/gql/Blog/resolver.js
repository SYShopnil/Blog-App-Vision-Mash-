const {
    saveNewOrExistBlogController,
    publishedBlogController,
    previewBlogByBlogIdController,
    deleteBlogBySlugController,
    updateBlogBySlugController,
    updateBlogTitlePictureOrCover
} = require ("./controller")

//resolver
const resolver = {
    saveBlog: saveNewOrExistBlogController,
    publishBlog: publishedBlogController,
    previewBlog: previewBlogByBlogIdController,
    deleteBlog: deleteBlogBySlugController,
    updateBlogImage: updateBlogTitlePictureOrCover
}

module.exports = resolver