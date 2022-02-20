const authorizationGql = require('../../../utils/autorization')
const Blog = require('../../model/blog')
const {
    createNewBlogHandler: createNewBlog
} = require('../../../utils/controller/Blog/createNewBlog')
const blogCreateValidation = require('../../../validation/blog/createValidation')
const {updateBlogDuringSaveValidation:blogContentUpdateValidation} = require('../../../validation/blog/updateBlogValidate')
const {singleImageUploader} = require('../../../utils/singleFileUploader')
const {
    acceptedProfilePictureExtensions:acceptExtension
} = require('../../../assert/doc/global')
const imageDelete = require('../../../utils/fileDeleteHandler')
const blogQuery = require('../../../utils/controller/Blog/blogQueryController')
const sortQuery = require('../../../utils/controller/Blog/blogSortingController')
const searchController = require('../../../utils/controller/Blog/blogSearchController')
const {
    blogPagination
} = require('../../../assert/doc/global')
const filterController = require('../../../utils/controller/Blog/blogFilteringController')
const getBlog = require('../../../utils/controller/Blog/getBlog')
const {
    keyWord: {
        CMB,
        CMBV
    }
} = require('../../../assert/doc/global')
const {getIPAddress} = require('../../../utils/deviceConfig')
const {getTodayDate} = require('../../../utils/dateHandler')

//save a new blog or update existing blog and put data into draft section
const saveNewOrExistBlogController = async ({input, blogId}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const action = "save" //this is a save action api
            const {user:loggedInUser} = req
            const {_id: owner} = loggedInUser
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                //check that is it update exist blog or create a new blog
                const {
                    title,
                    mainCategory,
                    subCategory,
                    keyWord,
                    coverPic,
                    titlePic,
                    content
                } = input //get the blog id if it's available then it wil update route 
                let coverPicBase64
                let coverPicSize
                let titlePicBase64
                let titlePicSize
                if (coverPic != undefined) {
                    coverPicBase64 = coverPic.base64
                    coverPicSize = coverPic.titlePicSize
                }
                if (titlePic != undefined){
                    titlePicBase64 = titlePic.base64
                    titlePicSize = titlePic.titlePicSize
                }
                if (blogId) { //if blog id is available then it will update blog
                    const {error:err} = blogContentUpdateValidation.validate ({blogId, content}) //validate the data of exist blog update time 
                    if (err) {
                        return {
                            message: err.message,
                            status: 406
                        }
                    }
                    const saveUpdatedContent = await Blog.updateOne ( //find blog by blog id and update the draft section
                        {
                            blogId,
                            isDelete: false,
                            isActive: true
                        },
                        {
                            $set: {
                                "contentDetails.content.draft": content
                            }
                        },
                        {
                            multi: true
                        }
                    )
                    if (saveUpdatedContent.modifiedCount != 0) { //if blog update failed to update
                        const findBlog = await Blog.findOne ({blogId}) //get the updated blog
                        return {
                            message: "Blog saved successfully",
                            status: "202",
                            blog: findBlog
                        }
                    }else {
                        return {
                            message: "Blog saved failed",
                            status: "406"
                        }
                    }
                }else { // it wil  create new blog and store it in draft
                    const {error:err} = blogCreateValidation.validate (input)
                    if (err) {
                        return {
                            message: err.message,
                            status: 406
                        }
                    }
                    const data = {
                        title,
                        mainCategory,
                        subCategory,
                        keyWord,
                        content,
                        owner,
                        coverPicBase64,
                        coverPicSize,
                        titlePicBase64,
                        titlePicSize,
                        action 
                    } //create the blog structure this data will be sent to database
                    const {
                        isSave,
                        error,
                        newBlog
                    } = await  createNewBlog (data) //create a new blog 
                    if (isSave && !error) {
                        return {
                            message: "Blog saved successfully",
                            blog: newBlog,
                            status: 201
                        }
                    }else {
                        return {
                            message: "Blog is not save",
                            status: 406
                        }
                    }
                } 
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }

}

//published a full new blog or existed draft blog 
const publishedBlogController = async ({input, blogId}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {_id: owner} = loggedInUser //get the logged in user unique id as a blog owner
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                if (!blogId) { //if blog id is available then the blog is already save so we just need to publish it
                    const {error:err} = blogCreateValidation.validate (input)
                    if (err) {
                        return {
                            message: err.message,
                            status: 406
                        }
                    }
                    const {
                        title,
                        mainCategory,
                        subCategory,
                        keyWord,
                        coverPic,
                        titlePic,
                        content
                    } = input 
                    let coverPicBase64
                    let coverPicSize
                    let titlePicBase64
                    let titlePicSize
                    if (coverPic != undefined) {
                        coverPicBase64 = coverPic.base64
                        coverPicSize = coverPic.titlePicSize
                    }
                    if (titlePic != undefined){
                        titlePicBase64 = titlePic.base64
                        titlePicSize = titlePic.titlePicSize
                    }
                    const data = {
                        title,
                        mainCategory,
                        subCategory,
                        keyWord,
                        content,
                        owner,
                        coverPicBase64,
                        coverPicSize,
                        titlePicBase64,
                        titlePicSize,
                        action: "publish"
                    }
                    const {
                        isSave,
                        newBlog,
                        error
                    } = await createNewBlog (data) //it will create a new blog  and give a response
                    if (isSave && !error) { //if blog successfully published and save then it will happen
                        return {
                            message: "Blog published successfully ",
                            status: 202,
                            blog: newBlog
                        }
                    }else {
                        return {
                            message: "Blog published failed",
                            status: 406
                        }
                    }
                }else { //if blog is exist already then we just need to get the draft content and update in published field
                    const findBlog = await Blog.findOne ( // find blog and get the draft content
                        {
                            blogId,
                            isDelete: false,
                            isActive: true
                        }
                    ).select ("contentDetails.content.draft") //only get the drat field of respective blog 
                    if (findBlog) { //if blog has been found then it will happen
                        const {draft} = findBlog.contentDetails.content //get the draft content
                        const updateBlogInfo = await Blog.updateOne (
                            {
                                blogId,
                                isDelete: false,
                                isActive: true
                            }, //query 
                            {
                                $set : {
                                    "contentDetails.content.published": draft,
                                    "isPublished": true,
                                    "publishedTime": Date.now ()
                                }
                            }, //update
                            {multi: true} 
                        ) //update the published field of respective blog 
                        if (updateBlogInfo.modifiedCount != 0 ) { //if blog update successfully done then it will happen
                            const findBlog = await Blog.findOne ( // find blog and get the draft content
                                {
                                    blogId,
                                    isDelete: false,
                                    isActive: true
                                }
                            ) //get latest blog data after edit the published field
                            return {
                                message: "Blog published successfully",
                                status: 202,
                                blog: findBlog
                            }
                        }else { //if blog update failed
                            return {
                                message: "Blog published failed",
                                status: 202
                            }
                        }
                    }else {
                        return {
                            message: "Blog not found",
                            status: 404
                        }
                    }
                }
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//preview blog by blog id 
const previewBlogByBlogIdController = async ({blogId}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {_id: owner} = loggedInUser
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const findBlog = await Blog.findOne (
                    {
                        isDelete: false,
                        isActive: true ,
                        blogId,
                        owner
                    }
                )
                if (findBlog) { //if blog found then
                    return {
                        message: "Blog found",
                        blog: findBlog,
                        status: 202
                    }
                }else { //if user is not authorized
                    return {
                        message: "Blog not found",
                        status: 404
                    }
                }
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//delete a blog by slug
const deleteBlogBySlugController = async ({slug}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client", "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const findBlogAndUpdate = await Blog.updateOne ( //update blog and update the isDelete and isActive field
                    {
                        slug,
                        isDelete: false,
                        isActive: true
                    }, //query
                    {
                        $set : {
                            isDelete: true,
                            isActive: false
                        }
                    }, //update
                )
                if (findBlogAndUpdate.modifiedCount != 0 ) {
                    return {
                        message : "Blog deleted successfully",
                        status: 202
                    }
                }else {
                    return {
                        message : "Blog delete failed",
                        status: 406
                    }
                }
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//update blog  by slug 
const updateBlogBySlugController = async ({input,slug}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const {
                    subCategory,
                    mainCategory,
                    keyWord
                } = input
                let finalSubCategory
                let finalMainCategory
                let finalKeyWord

                const findBlog = await Blog.findOne ({slug, isDelete: false,
                isActive: true}).select (
                    `
                        contentDetails.subCategory
                        contentDetails.keyword
                        contentDetails.mainCategory
                    `
                )
                if (findBlog) { //find the respected blog
                    finalSubCategory = findBlog.contentDetails.subCategory
                    finalMainCategory = findBlog.contentDetails.mainCategory
                    finalKeyWord = findBlog.contentDetails.keyword
                }else {
                    return {
                        message: "Blog not found",
                        status: 404
                    }
                }
                if (subCategory) finalSubCategory = subCategory
                if (mainCategory) finalMainCategory = mainCategory
                if (keyWord) finalKeyWord = keyWord
                const updateBlog = await Blog.updateOne (
                    {
                        slug,
                        isDelete: false,
                        isActive: true
                    }, //query
                    {
                        $set: {
                           "contentDetails.subCategory": finalSubCategory,
                            "contentDetails.keyword": finalKeyWord,
                            "contentDetails.mainCategory": finalMainCategory
                        }
                    }, //update
                    {multi: true}
                )
                if (updateBlog.modifiedCount != 0) { //blog update successful
                    return {
                        message: "Blog updated successfully",
                        status: 202
                    }
                }else {
                    return {
                        message: "Blog update failed",
                        status: 406
                    }
                }
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//update blog's cover picture or title picture 
const updateBlogTitlePictureOrCover = async ({input, type, slug}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const findBlog = await Blog.findOne ({isDelete: false, isActive: true, slug}).select (
                    `
                        contentDetails.coverPic
                        contentDetails.titlePic
                        blogId
                    `
                )
                if (type == "cover") { //if user want to update cover pic
                    const existCoverPic = findBlog.contentDetails.coverPic
                    let existDataBaseImageName = (existCoverPic.split ("/"))
                    existDataBaseImageName = existDataBaseImageName[existDataBaseImageName.length - 1 ] //get the exist database image name from the url 
                    const deleteExistingOne = await imageDelete (existDataBaseImageName) //delete the existing file 
                    if (deleteExistingOne) {
                        const {
                            fileAddStatus,
                            fileUrl,
                            extensionValidation
                        } = singleImageUploader (input, acceptExtension, findBlog.blogId) //upload the new image of blog cover
                        if (fileAddStatus) { //if cover picture successfully uploaded
                            if (extensionValidation) { //if extension is validated
                                const updateCover = await Blog.updateOne (
                                    {
                                        isDelete: false, isActive: true, slug
                                    }, //query 
                                    {
                                        $set: {
                                            "contentDetails.coverPic": fileUrl
                                        }
                                    }, //update
                                    {multi: true}
                                )
                                if (updateCover.modifiedCount != 0 ) { //if cover image successfully updaed it will execute
                                    return {
                                        message: "Cover image successfully updated",
                                        status: 202
                                    }
                                }else {
                                    return {
                                        message: "Cover image update failed",
                                        status: 406
                                    }
                                }
                            }else {
                                return {
                                    status: 406,
                                    message: "Only allow jpg png and jpeg format"
                                }
                            }
                        }else {
                            return {
                                status: 406,
                                message: "Cover picture upload failed"
                            }
                        }
                    }else {
                        return {
                            message: "Previous image delete failed",
                            status: 406
                        }
                    }
                }else if (type == "title") {  //if user want to update title pic
                    const existTitlePic = findBlog.contentDetails.titlePic
                    let existDataBaseImageName = (existTitlePic.split ("/"))
                    existDataBaseImageName = existDataBaseImageName[existDataBaseImageName.length - 1 ] //get the exist database image name from the url 
                    const deleteExistingOne = await imageDelete (existDataBaseImageName) //delete the existing file 
                    if (deleteExistingOne) { //if previous image has deleted successfully
                        const {
                            fileAddStatus,
                            fileUrl,
                            extensionValidation
                        } = singleImageUploader (input, acceptExtension, blogId) //upload the new image of blog title image
                        if (fileAddStatus) { //if cover picture successfully uploaded
                            if (extensionValidation) { //if extension is validated
                                const updateCover = await Blog.updateOne ( //update the new uploaded title image url into database
                                    {
                                        isDelete: false, isActive: true, slug
                                    }, //query 
                                    {
                                        $set: {
                                            "contentDetails.titlePic": fileUrl
                                        }
                                    }, //update
                                    {multi: true}
                                )
                                if (updateCover.modifiedCount != 0 ) { //if cover image successfully updaed it will execute
                                    return {
                                        message: "Blog title image successfully updated",
                                        status: 202
                                    }
                                }else {
                                    return {
                                        message: "Blog title image update failed",
                                        status: 406
                                    }
                                }
                            }else {
                                return {
                                    status: 406,
                                    message: "Only allow jpg png and jpeg format"
                                }
                            }
                        }else {
                            return {
                                status: 406,
                                message: "Blog title picture upload failed"
                            }
                        }
                    }else {
                        return {
                            message: "Previous image delete failed",
                            status: 406
                        }
                    }
                }
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//get blog by filtering and many things
const getBlogsController = async ({
    queryBy, 
    queryInput, 
    sortBy, 
    search, 
    filterBy, 
    dataLimit,
    pageNo:inputPageNo
}, req) => {
    try {
        const query = { //default query structure
            $and: [
                {
                    isPublished: true,
                    isActive: true,
                    isDelete: false
                }
            ]
        }
        let sort = {} //default sort structure
        blogQuery (queryBy, query, queryInput); //this will create the blog query structure
        sortQuery (queryBy, sortBy, sort)  //this will create the sort  structure
        searchController (search, query) //this will create the search  structure
        filterController (filterBy, query) //this will create the filter query structure
        const countAllBlog = await Blog.find (query).sort (sort)
        const totalData = countAllBlog.length //get all blog count 
        const limitData = dataLimit ? dataLimit : blogPagination.defaultDataLimit //if data limit has given from body then that will be apply otherwise global default data limit will b apply
        const pageNo = inputPageNo ? inputPageNo : blogPagination.defaultPageNo //if page number has given from body then that will be apply otherwise global default page number will b apply
        const skipData = (pageNo * limitData) - limitData //this amount of data will be skip 
        const totalPage = Math.ceil (totalData / limitData) //total this amount of page we need
        const findBlog = await Blog.find (query).sort (sort).limit (limitData).skip (skipData).populate (
            {
                path: "owner",
                select: `
                    personalInfo
                    clientId
                    clientId
                    othersInfo.socialMedia
                `
            }
        ) //this will give all expected data from the database to us.

        if (findBlog.length != 0) { //if blog found then it will happen
            const foundBlog = JSON.parse (JSON.stringify(findBlog)) //deep copy the found data
            let subCategory = [];
            let keyword = [];
            foundBlog.map (blog => {
                const {
                    contentDetails: {
                        subCategory:sub,
                        keyword: key
                    }
                } = blog //get all keyword from every blogs;
                subCategory.push (
                    ...sub
                )
                keyword.push (
                    ...key
                )
            })
            subCategory = [...new Set (subCategory)] //tale only the unique sub category
            keyword = [...new Set (keyword)] //tale only the unique key word 
            return {
                message: `${findBlog.length} ${findBlog.length > 1 ? "blogs" : "blog"} found`,
                status: 202,
                subCategory,
                blogs: findBlog,
                keyWord: keyword,
                totalPage,
                totalBlog: totalData
            }
        }else {
            return {
                message: "No blog found",
                status: 404
            }
        }
        
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//get top two blog current month blogs
const getTwoTopCurrentMonthBlogController = async ({input}, req)  => {
    try {
        const currentMonth = new Date ().getMonth();
        // console.log(currentMonth)
        const getAllBlog = await getBlog (CMBV); //get all current month published blog;  month will be count from  0 - 11
        if (getAllBlog.length != 0) {
            // const sortCategory = getAllBlog.sort ((a,b) => a.viewersDetails. -  b.viewersDetails.totalView)
            const sortBlogByViewers = getAllBlog.sort ( (first, second) => { //it will sort blogs by this month viewers
                const firstOrder = first.viewersDetails.details.filter (viewDetails => viewDetails.month == currentMonth)
                const secondOrder = second.viewersDetails.details.filter (viewDetails => viewDetails.month == currentMonth)
                return secondOrder[0].view - firstOrder[0].view;
            })
            const allCategory = []; //it will store all category of blogs
            sortBlogByViewers.map (blog => { // it will set the blog  category in all Category array
                allCategory.push (blog.contentDetails.mainCategory);
            })
            const getTopTwoCategory = [...new Set (allCategory)].filter ((category, ind) => ind < 2 ) //get the top two blog category of the month
            const topTwoCategoryBlog = []; //this will store two top categories of the blog of the month
            getTopTwoCategory.map (category => {  //this will store the top two categories
                const blog = sortBlogByViewers.find (blog => blog.contentDetails.mainCategory == category);
                topTwoCategoryBlog.push (blog);
            })
            return {
                message: "Blog found",
                status : 202,
                blog: topTwoCategoryBlog,
                category : getTopTwoCategory
            }
            
        }else {
            return {
                message: "No blog found",
                status: 404
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}   

//mark blog as a featured one 
const markFeaturedController = async ({slugs}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const operation = slugs.map (s => { //update multiple data in a single query
                    return {
                        updateOne : {
                            filter : {
                                slug: s,
                                isPublished: true,
                                isDelete: false, 
                                isActive: true
                            },
                            update: {
                                $set : {
                                    isFeatured: true
                                }
                            },
                            option : {
                                multi : true
                            }
                        }
                    }
                })
                const updateResultOfBLog = await Blog.bulkWrite (operation) //this will update multiple data in a single query
                if (updateResultOfBLog.result.nModified != 0) { //if update is successfully done then it will happen
                    return {
                        message: "Blog has successfully featured",
                        status: 202
                    }
                }else {
                    return {
                        message: "Blog featured failed",
                        status: 304
                    }
                }
            }else {
                return {
                    message:  "Permission denied",
                    status: 401
                }
            }
        }else {
            return {
                message: "Unauthorized user",
                status: 401
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//count a new view for a blog 
const makeViewForBlogController = async ({slug},req) => {
    try {
        const {ipAddress:currentDeviceIp} = await getIPAddress(); //get the current device Ip address
        if (currentDeviceIp) { //check that is ip address is exist or not
            let isLoggedInUser = false;
            let userData;
            let isLoggedInUserBLog = false;
            let isAlreadyViewed = false;
            const {isAuth} = req
            if (isAuth) { //if is Auth then there should have a user 
                isLoggedInUser = true;
                userData = req.user;
            }
            //check that is it logged in user's own blog or not
            if (isLoggedInUser) { //if user is logged in then it will execute
                const findBlog = await Blog.findOne ( //query blog by logged in user id and provided slug
                    {
                        slug,
                        owner: userData._id
                    }
                )
                if (findBlog !== {}) { //if query blog is logged in user blog then it will happen 
                    isLoggedInUserBLog = true
                }
            }

            const {
                start: startTime,
                end: endTime
            } = getTodayDate() //get the today start time and end time 

            // check that is it already viewed or not 
            const checkViewedOrNot = await Blog.findOne (
                {
                    $and : [
                        {
                            slug
                        },
                        {
                            "viewersDetails.userTrack.ipAddress": currentDeviceIp
                        },
                        {
                            "viewersDetails.userTrack.visitTime": {
                                $gte: startTime,
                                $lte: endTime
                            }
                        }
                    ]
                }
            )
            if (!!checkViewedOrNot) { //if is it already viewed then it will execute
                isAlreadyViewed = true;
            }

            //if viewer visit own blog then
            if (!isLoggedInUserBLog) { 
                //check requested ip address already visit it today or not 
                if (!isAlreadyViewed) { //if user is not already viewed this blog then it will execute
                    const update = { //update query part
                        $inc: {
                            "viewersDetails.totalView": 1
                        },
                        $addToSet : {
                            "viewersDetails.userTrack": {
                                ipAddress: currentDeviceIp,
                                visitTime: Date.now()
                            }
                        }
                    }
                    let query = {
                        slug,
                        isDelete: false, 
                        isActive: true
                    }
                    //check that is there have any view of this month or not 
                    const checkMonthlyView = await Blog.findOne ( //check that is there have already monthly view or not 
                        {
                            slug,
                            isDelete: false, 
                            isActive: true,
                            "viewersDetails.details.month": new Date().getMonth(),
                            "viewersDetails.details.year": new Date().getFullYear(),
                            "viewersDetails.details.view": {
                                $gt: 0
                            }
                        }
                    ).select ("viewersDetails.details")
                    
                    if (checkMonthlyView) { //if monthly view exist then it will execute
                        const {viewersDetails: {details}} = checkMonthlyView;
                        details.map (monthlyDetails => {
                            if (monthlyDetails.month == new Date().getMonth() && monthlyDetails.year == new Date().getFullYear()) { //if some one already visit this blog in the running month 
                                query = {
                                    ...query,
                                    "viewersDetails.details": {
                                        $elemMatch:{
                                            month : monthlyDetails.month,
                                            year:  monthlyDetails.year
                                        }
                                    }
                                }
                                update.$inc = {
                                    "viewersDetails.totalView": 1,
                                    "viewersDetails.details.$.view": 1 
                                }
                            }
                        }) 
                    }else { //if no one view in this month then it will execute
                        update.$addToSet = {
                            ...update.$addToSet,
                            "viewersDetails.details": {
                                view: 1 ,
                                month : new Date().getMonth() , 
                                year: new Date().getFullYear()
                            }
                        }
                    }
                    // console.log(query)
                    // console.log(update)

                    //original query with update 
                    const countView = await Blog.updateOne (
                        query, //query 
                        update, //update 
                        {multi: true} //option
                    )
                    if (countView.modifiedCount != 0) { //if blog data is updated then it will happen 
                        return {
                            message: "View count!!",
                            status : 202
                        }
                    } else {
                        return {
                            message: "View count failed",
                            status : 406
                        }
                    }
                }else {
                    return {
                        message: "Viewer count failed due to limit exceeded",
                        status: 403
                    }
                }
            }else {
                return {
                    message: "View count failed due to own blog",
                    status: 403
                }
            }

        }else {
            return {
                message: "IP Address required",
                status: 404
            }
        }
    }catch (err) {
        return {
            message: err.message,
            status: 406
        }
    }
}

//get all available subCategory of blog if user query by blog main category
const getMainCategoryWiseSubCategoryController = async ({category},req) => {
    try {
        const findBlogByCategory = await Blog.find ( //find all blog by main category
            {
                "contentDetails.mainCategory": category,
                "isActive": true,
                "isDelete": false,
                "isPublished": true
            }
        )
        let storeAllSubCategory = [];
        
        findBlogByCategory.map (blog => {
            blog.contentDetails.subCategory.map (sub => {
                storeAllSubCategory.push (sub)
            })
        })
        storeAllSubCategory = [...new Set ([...storeAllSubCategory])];
        if (storeAllSubCategory.length != 0 ) { //if subCategory found then it will execute
            return {
                message: "Subcategory found!!",
                status: 202,
                subCategory: storeAllSubCategory
            }
        }else {
            return {
                message: "No subcategory found!!",
                status: 404
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

//get individual blog by blog slug with related blog 
const getIndividualBLogController = async ({slug}, req) => {
    try {
        const getBlogBySlug = await Blog.findOne ( //get blog by slug condition is blog need to published one 
            {
                slug,
                isActive: true,
                isDelete: false,
                isPublished: true
            }
        )
        if (getBlogBySlug) { //if blog found then it will happen
            const {
                contentDetails: {
                    subCategory,
                    keyword,
                    mainCategory
                }
            }= getBlogBySlug //get data from found blog
            const findRelatedBLog = await Blog.find ( //find all blog by main category, sub category and keyword
                {
                    $and: [
                        {
                            isActive: true,
                            isDelete: false,
                            isPublished: true,
                            slug: {
                                $ne: slug
                            } //this query for skip the main blog from related blog
                        },
                        {
                            $or : [
                                {
                                    "contentDetails.subCategory": {
                                        $in: subCategory
                                    } //query by subCategory
                                },
                                {
                                    "contentDetails.keyword": {
                                        $in: keyword
                                    } //query by keyword
                                },
                                {
                                    "contentDetails.mainCategory": mainCategory //query by main category
                                }
                            ]
                        }
                    ]
                }
            ).sort (
                {
                    "contentDetails.title": -1
                } //sort by title in descending order
            )
            if (findRelatedBLog.length != 0) { //if related product found then it will execute
                return {
                    message: "Blog found",
                    status: 202,
                    blog: getBlogBySlug,
                    relatedBlog: findRelatedBLog
                }
            }else {
                return {
                    message: "Blog found",
                    status: 202,
                    blog: getBlogBySlug,
                }
            }
        }else {
            return {
                message: "Blog not found",
                status: 404
            }
        }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

module.exports = {
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
    getIndividualBLogController
}

