const Blog = require('../../../src/model/blog')
const {singleImageUploader:imageUploader} = require('../../../utils/singleFileUploader')
const {acceptedProfilePictureExtensions:validExtension} = require('../../../assert/doc/global')
const {uploadCoverPicture, uploadBlogTittleImage: uploadBlogTittlePicture} = require('../../../utils/uploadDefaultPicture')
const blogCreator = require('../../../utils/controller/Blog/createBlogStruct')
const blogIdGenerator = require('../../../utils/idGenerator')
const blogSlugGenerator = require('../../../utils/slugGenerator')
const Client = require('../../../src/model/client')

// this controller will save a fully new blog 
const saveNewBlog = async (structure) => {
    try {
        const createNewBlog = new Blog (structure) //create the instance 
        const saveBlog = await createNewBlog.save () //save the new blog
        if (saveBlog) {
            return {
                isSave: true,
                newBlog: saveBlog
            }
        }else {
            return {
                isSave: false,
                newBlog: null
            }
        }
    } catch (err) {
        return {
            isSave: false,
            error : err.message
        }
    }
}

//this controller will execute the blog creation process it will create blog during save or publish both time just you need to give the action name "publish" or "save"
const createNewBlogHandler = async ({
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
}) => {
    const blogId = blogIdGenerator ("BLG") //generate a new blog id
    const newKeyWord = keyWord.map (val => {
        return val.replace(/\s+/g, '').trim() || val.replace(/\s+/g, ' ').trim()
        
    }) //remove all space
    const key = (keyWord != undefined)  && newKeyWord.join ("_") //it will separate all keyword by a underscore (__)
    const sub  = (subCategory != undefined)  && subCategory.join ("_") //it will separate all sub category by a underscore (__)
    const titleSlug = title.split(" ").join ("_") //it will separate all title by a underscore (__)
    const blogSlug = blogSlugGenerator (titleSlug,key, sub) //generate the blog slug by title, keyword and sub category
    const url = `${process.env.BLOG_SINGLE_PAGE_URL}${blogSlug}` //this will create a url of blog's front end 
    let coverPicUrl  = "" //this will be the cover picture url
    let titlePicUrl = ""  //this will be the title picture url
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
            // console.log({fileUrl});
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
        newKeyWord,
        content,
        owner,
        blogId,
        url,
        blogSlug,
        coverPicUrl,
        titlePicUrl,
        action
    ) //create the structure
    const {isSave, newBlog, error} = await saveNewBlog (createBlogStructure) //create a new blog 
    if (isSave) {
        const  {_id: newBlogUniqueId} = newBlog
        const updateClient = await Client.updateOne (
            {
                _id: owner
            }, //query
            {
                $push: {
                    "officialInfo.blogInfo.allBlog": newBlogUniqueId
                }
            }, //update
            {multi: true}
        )
        if (updateClient.modifiedCount != 0) { //store the blog id into owner schema
            return {
                isSave,
                newBlog,
                error
            }
        }else {
            return {
                isSave,
                newBlog,
                error: "Client update failed"
            }
        }
    }
    
                    
} 


module.exports = {
    saveNewBlog,
    createNewBlogHandler
};