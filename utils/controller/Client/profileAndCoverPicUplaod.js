const {singleImageUploader: profileImageUploader} = require('../../../utils/singleFileUploader')
const {acceptedProfilePictureExtensions:acceptedExtensionsProfilePic} = require('../../../assert/doc/global')
const {uploadProfilePicture,
    uploadCoverPicture} = require('../../../utils/uploadDefaultPicture')



//upload user profile picture    
const profilePicUploader = async (file, clientId, gender) => {
    let isProfileImageUpload = false //profile picture upload statue 
    let imageUrl   //profile picture url  
    let isExtensionValidate   //profile extenstion validation
    //  upload the profile image
    if (file.base64) { //check if profile picture is available then it will happen
        const {fileAddStatus, fileUrl, extensionValidation } = profileImageUploader (file, acceptedExtensionsProfilePic, clientId) //upload the form input profile picture
            isProfileImageUpload = fileAddStatus
            imageUrl = fileUrl
            isExtensionValidate = extensionValidation
    }else {
        const {fileAddStatus, fileUrl } = await  uploadProfilePicture (gender, clientId)
            if ( fileAddStatus) { //upload the default profile image
                imageUrl = fileUrl
                isProfileImageUpload = fileAddStatus
                isExtensionValidate = true
            }else {
                imageUrl = ""
                isProfileImageUpload = false
                isExtensionValidate = true
            }
    }
    return {
        imageUrl,
        isProfileImageUpload,
        isExtensionValidate
    }
}

//upload user cover picture 
const coverPictureUploader  = async (file,clientId) => {
    let isCoverImageUpload = false //profile picture upload statue 
    let coverImageUrl   //profile picture url  
    let isExtensionValidateCoverPic   //profile extenstion validation

    //upload Cover Image 
    if (file.base64) { //check if cover picture is available then it will happen 
        const {fileAddStatus, fileUrl, extensionValidation } = profileImageUploader (file, acceptedExtensionsProfilePic, clientId) //upload the form input profile picture
        isCoverImageUpload = fileAddStatus
        coverImageUrl = fileUrl
        isExtensionValidateCoverPic = extensionValidation
    }else {
        const {fileAddStatus, fileUrl } = await  uploadCoverPicture (clientId, "user")
        if ( fileAddStatus) { //upload the default cover image
            coverImageUrl = fileUrl
            isCoverImageUpload = fileAddStatus
            isExtensionValidateCoverPic = true
        }else {
            coverImageUrl = ""
            isCoverImageUpload = false
            isExtensionValidateCoverPic = true
        }
    }
    return {
        isCoverImageUpload,
        coverImageUrl,
        isExtensionValidateCoverPic
    }
}


module.exports = {
    profilePicUploader,
    coverPictureUploader
}