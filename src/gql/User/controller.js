const User = require ('../../model/user')
const Admin = require ('../../model/admin')
const Client = require ('../../model/client')
const authorizationGql = require ('../../../utils/autorization')
const {singleImageUploader: uploadPicture } = require ('../../../utils/singleFileUploader')
const {
    acceptedProfilePictureExtensions: acceptedExtension
} = require ('../../../assert/doc/global')
const fileDeleteHandler = require ('../../../utils/fileDeleteHandler')

//update or upload user profile image 
const updateProfileImageController = async ({input}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req //get the logged in user
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client", "admin") //get the authorization status 
            let userId
            if (isAuthorized) { //if user is not authorized then it will happen
                const {userType, slug} = loggedInUser //get the user type 
                let existDbImagePath //it will store the existing database image path for profile and cover
                const {
                    base64,
                    size,
                    uploadType
                } = input
                if (userType == "admin") { //if user type is admin then it will happen but now it will not functionable 
                    return {
                        message: "This controller is inComplete for admin",
                        status: 205
                    }
                } else if (userType == "client") { //if user type is client then it will happen  
                    if (input.uploadType) { //check that is upload picture type is provided or not 
                        if (uploadType == "profile")existDbImagePath = loggedInUser.personalInfo.profilePicture; // user want to upload profile picture then it will happen
                        if (uploadType == "cover") existDbImagePath = loggedInUser.personalInfo.coverPicture // user want to upload cover picture then it will happen
                        userId = loggedInUser.clientId //store the client id of the user 
                    }else {
                        return {
                            message: "Upload Type Required",
                            status: 205
                        }
                    }
                }
                //demo http://localhost:3030/CL848331642719884292.png
                let existDataBaseImageName = (existDbImagePath.split ("/"))
                existDataBaseImageName = existDataBaseImageName[existDataBaseImageName.length - 1 ] //get the exist database image name from the url 
                const {
                    extensionValidation,
                    fileAddStatus,
                    fileUrl
                } = uploadPicture ({base64, size}, acceptedExtension, userId) //upload the new profile or cover picture  
                if (fileAddStatus) { // if file upload successfully done then it will execute
                    if (extensionValidation) { //if extension validation done 
                        const deleteFile = await fileDeleteHandler (existDataBaseImageName) //delete the existing file from server 
                        if (deleteFile) { //if exist image is delete from database then it will happen
                            const newImage = fileUrl //store the new file url to save it into database 
                            let struct = {
                                $set: {}
                            };
                            if (uploadType == "profile"){
                                struct.$set = {
                                    "personalInfo.profilePicture": newImage //store the new image
                                }
                            }
                            if (uploadType == "cover") {
                                {
                                    struct.$set = {
                                        "personalInfo.coverPicture": newImage //store the new image
                                    }
                                }
                            } 
                            if (userType == "client") { //if user type is client then it will update from client schema 
                                const updatePic = await Client.updateOne ( //update the user profile or cover picture field
                                    {
                                        slug
                                    }, //query
                                    struct, //update
                                    {
                                        multi: true
                                    } //option
                                )
                                if (updatePic.modifiedCount != 0) { //image will successfully updated then it will execute
                                    return {
                                        message: "Image upload successfully",
                                        status:  202
                                    }
                                }else { 
                                    return {
                                        message: "User image update  failed",
                                        status:  304
                                    }
                                }

                            }else if (userType == "admin") { //if user type is admin then it will update from admin schema
                                 return {
                                    message: "This controller is inComplete for admin",
                                    status: 402
                                }
                            }
                        }else { 
                            const mewUploadFileName = (fileUrl.split ("/"))
                            mewUploadFileName = mewUploadFileName[mewUploadFileName.length - 1 ] //get the new create image file name image name from the url  
                            const deleteFile = await fileDeleteHandler (newUploadFileName) //delete the new create image from server
                            if (deleteFile) { 
                                return {
                                    message: "Existing file failed to delete",
                                    status: 205
                                }
                            } else {
                                return {
                                    message: "Something is wrong please try again later",
                                    status: 205
                                }
                            }
                        }
                    }else {
                        return {
                            message: `Only ${acceptedExtension.join (" ")} are accepted`,
                            status: 205
                        }
                    }
                }else {
                    return {
                        message: "Image Upload Failed",
                        status: 205
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
    updateProfileImageController
}

