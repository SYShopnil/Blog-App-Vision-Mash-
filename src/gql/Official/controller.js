const Official = require('../../model/official')
const authorizationGql = require('../../../utils/autorization')
const schemaValidation = require('../../../validation/official/createOfiicialSchema')
const {
    uploadCompanyLogo
} = require('../../../utils/uploadDefaultPicture')
const {
    singleImageUploader: companyLogoUploader
} = require('../../../utils/singleFileUploader')
const {
    acceptedProfilePictureExtensions: logoExtensionsValidation
} = require('../../../assert/doc/global')

//create a new official schema 
const createNewOfficialSchemaController = async ({data}, req) => {
    try {
        console.log(`first`)
        // const {isAuth} = req  //get the is auth status from api auth middleware
        // if (isAuth) { //if this is  a auth user then it will happen 
        //     const {user: loggedInUser} = req
        //     const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
        //     if (isAuthorized) { //if user is not authorized then it will happen
        //         const checkIfOfficialSchemaAvailable = await Official.find ({});
        //         if (checkIfOfficialSchemaAvailable) { //if official schema found then it will response back from here
        //             return {
        //                 message: "Official schema available you can not create multiple official",
        //                 status : 406
        //             }
        //         }else  {
        //             const {error} = schemaValidation.validate (data) //validate the input data
        //             if (error) { //if data validation error then it will happen 
        //                 return {
        //                     message: error.message,
        //                     status: 403
        //                 }
        //             }
        //             const {
        //                 email,
        //                 companyName,
        //                 logo: inputLogo,
        //                 phone,
        //                 address,
        //                 availableSocialMedia, //it  will be an array object
        //                 availableMainCategory,  //it  will be an array object
        //                 availableSubCategory, //it  will be an array object
        //             } = data //get the data from frontend 
        //             const schema = {
        //                 companyName,
        //                 availableOption: {
        //                     mainCategory: availableMainCategory,
        //                     subCategory: availableSubCategory,
        //                     socialMedia: availableSocialMedia,

        //                 },
        //                 contactInfo: {
        //                     email,
        //                     phone,
        //                     address
        //                 }
        //             } //official schema structure

        //             if (logBase64) { //if user give a logo for upload then it will happen 
        //                 const {
        //                     fileAddStatus,
        //                     extensionValidation,
        //                     fileUrl
        //                 } = companyLogoUploader (inputLogo, logoExtensionsValidation, "LOGO")
        //                 if (fileAddStatus) { //if logo has successfully uploaded then it will happen
        //                     if (extensionValidation) { //if extensionValidation complete
        //                         schema.logo = fileUrl; //store the logo url into schema object as a property name logo
        //                     }else {
        //                         return {
        //                             message: `Only ${logoExtensionsValidation.join(",") } are accepted`,
        //                             status: 406
        //                         }
        //                     }
        //                 }else {
        //                     return {
        //                         message: "Logo upload failed",
        //                         status: 406
        //                     }
        //                 }
        //             }else {
        //                 const {
        //                     fileAddStatus,
        //                     fileUrl
        //                 } = await uploadCompanyLogo ("LOGO"); //upload the default logo for company
        //                 if (fileAddStatus) { //if logo upload then it will happen
        //                     schema.logo = fileUrl; //store the logo url into schema object as a property name logo
        //                 }else {
        //                     return {
        //                         message: "Default logo upload failed",
        //                         status: 406
        //                     }
        //                 }
        //             }

        //             const createOfficialSchemaInstance = new Official (schema) //create a new instance of official schema
        //             const saveOfficialSchema = await createOfficialSchemaInstance.save ();
        //             if (saveOfficialSchema) { //if official schema successfully save then it will execute
        //                 return {
        //                     message: "Official data created successfully",
        //                     status: 201,
        //                     data: saveOfficialSchema
        //                 }
        //             }else {
        //                 return {
        //                     message: "Official data creation failed",
        //                     status: 406
        //                 }
        //             }
        //         }
        //     }else {
        //         return {
        //             message:  "Permission denied",
        //             status: 401
        //         }
        //     }
        // }else {
        //     return {
        //         message: "Unauthorized user",
        //         status: 401
        //     }
        // }
    }catch (err) {
        console.log(err);
        return {
            message: err.message,
            status: 406
        }
    }
}

module.exports = {
    createNewOfficialSchemaController
}