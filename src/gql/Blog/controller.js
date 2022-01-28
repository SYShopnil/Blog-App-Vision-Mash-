const blogCreator = require('../../../utils/controller/Blog/createBlogStruct')
const blogIdGenerator = require('../../../utils/idGenerator')
const blogSlugGenerator = require('../../../utils/slugGenerator')
const authorizationGql = require('../../../utils/autorization')
const {singleImageUploader:imageUploader} = require('../../../utils/singleFileUploader')
const {acceptedProfilePictureExtensions:validExtension} = require('../../../assert/doc/global')
const {uploadCoverPicture, uploadBlogTittleImage: uploadBlogTittlePicture} = require('../../../utils/uploadDefaultPicture')

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
                if (blogId) { //if it's available then it will update blog 
                }else { // it wil  create new blog and store it in draft
                    const blogId = blogIdGenerator ("BLG") //generate a new blog id
                    const key = (keyWord != undefined)  && keyWord.join ("_")
                    const sub  = (subCategory != undefined)  && subCategory.join ("_")
                    const titleSlug = title.split(" ").join ("_")
                    const blogSlug = blogSlugGenerator (titleSlug,key, sub) //generate the blog slug
                    const url = `${process.env.BLOG_SINGLE_PAGE_URL}${blogSlug}`
                    let coverPicUrl  = ""
                    let titlePicUrl = ""
                    //upload blog cover picture
                    if (coverPicBase64) { //if cover image available then it will happen
                        const {
                            fileAddStatus,
                            fileUrl,
                            extensionValidation
                        } = imageUploader ({coverPicBase64:base64,coverPicSize: size},validExtension, blogId)     
                        if (fileAddStatus) {
                            coverPicUrl = fileUrl
                        }
                    }else {
                        const {
                            fileAddStatus,
                            fileUrl
                        } = await uploadCoverPicture (blogId)
                        if (fileAddStatus) {
                            coverPicUrl = fileUrl
                            console.log({fileUrl});
                        }
                    }

                    //upload blog title picture
                    if (titlePicBase64) { //if cover image available then it will happen
                        const {
                            fileAddStatus,
                            fileUrl,
                            extensionValidation
                        } = imageUploader ({titlePicBase64:base64,titlePicSize: size},validExtension, blogId)     
                        if (fileAddStatus) {
                            titlePicUrl = fileUrl
                        }
                    }else {
                        const {
                            fileAddStatus,
                            fileUrl
                        } = await uploadBlogTittlePicture (blogId)
                        if (fileAddStatus) {
                            titlePicUrl = fileUrl
                        }
                    }
                    const createBlogStructure = blogCreator ( //create the constructor of blog schema
                        title,
                        mainCategory,
                        subCategory,
                        keyWord,
                        content,
                        owner,
                        blogId,
                        url,
                        blogSlug,
                        coverPicUrl,
                        titlePicUrl,
                        action
                    ) //create the structure
                    console.log(createBlogStructure);
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
    saveNewOrExistBlogController
}