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

module.exports = {
    saveNewOrExistBlogController,
    publishedBlogController,
    previewBlogByBlogIdController,
    deleteBlogBySlugController,
    updateBlogBySlugController,
    updateBlogTitlePictureOrCover
}

