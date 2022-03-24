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
    makeViewForBlogController,
    getMainCategoryWiseSubCategoryController,
    getIndividualBLogController,
    testController

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
    countViewers: makeViewForBlogController,
    getSubCategory: getMainCategoryWiseSubCategoryController,
    getIndividualBlog: getIndividualBLogController,
    test: testController
}

module.exports = resolver