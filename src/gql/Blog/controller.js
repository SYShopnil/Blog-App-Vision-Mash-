const authorizationGql = require('../../../utils/autorization')
const Blog = require('../../model/blog')
const {
    createNewBlogHandler: createNewBlog
} = require('../../../utils/controller/Blog/createNewBlog')
const blogCreateValidation = require('../../../validation/blog/createValidation')
const {updateBlogDuringSaveValidation:blogContentUpdateValidation} = require('../../../validation/blog/updateBlogValidate')

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


module.exports = {
    saveNewOrExistBlogController,
    publishedBlogController
}