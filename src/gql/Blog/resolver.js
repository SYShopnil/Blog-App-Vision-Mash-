const {
    saveNewOrExistBlogController,
    publishedBlogController,
    previewBlogByBlogIdController,
    deleteBlogBySlugController,
    updateBlogBySlugController,
    updateBlogTitlePictureOrCover,
    getBlogsController,
    getTwoTopCurrentMonthBlogController,
    markFeaturedController,
    makeViewForBlogController

} = require ("./controller")

//resolver
const resolver = {
    saveBlog: saveNewOrExistBlogController,
    publishBlog: publishedBlogController,
    previewBlog: previewBlogByBlogIdController,
    deleteBlog: deleteBlogBySlugController,
    updateBlogImage: updateBlogTitlePictureOrCover,
    updateBlog: updateBlogBySlugController,
    blogs: getBlogsController,
    getTopMonthBlog: getTwoTopCurrentMonthBlogController,
    setIsFetcherBlog: markFeaturedController,
    countViewers: makeViewForBlogController
}

module.exports = resolver