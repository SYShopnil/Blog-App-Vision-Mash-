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

const {
    officialInfoGetQuery
} = require('../../../assert/doc/global')


//create a new official schema 
const createNewOfficialSchemaController = async ({data}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const checkIfOfficialSchemaAvailable = await Official.find ({});
                if (checkIfOfficialSchemaAvailable.length != 0) { //if official schema found then it will response back from here
                    return {
                        message: "Official schema available you can not create multiple official",
                        status : 406
                    }
                }else  {
                    const {error} = schemaValidation.validate (data) //validate the input data
                    if (error) { //if data validation error then it will happen 
                        return {
                            message: error.message,
                            status: 403
                        }
                    }
                    const {
                        email,
                        companyName,
                        logo: inputLogo,
                        phone,
                        address,
                        availableSocialMedia, //it  will be an array object
                        availableMainCategory,  //it  will be an array object
                        availableSubCategory, //it  will be an array object
                    } = data //get the data from frontend 
                    const schema = {
                        companyName,
                        availableOption: {
                            mainCategory: availableMainCategory,
                            subCategory: availableSubCategory,
                            socialMedia: availableSocialMedia,

                        },
                        contactInfo: {
                            email,
                            phone,
                            address
                        }
                    } //official schema structure
                    if (inputLogo) { //if user give a logo for upload then it will happen 
                        const {
                            fileAddStatus,
                            extensionValidation,
                            fileUrl
                        } = companyLogoUploader (inputLogo, logoExtensionsValidation, "LOGO")
                        if (fileAddStatus) { //if logo has successfully uploaded then it will happen
                            if (extensionValidation) { //if extensionValidation complete
                                schema.logo = fileUrl; //store the logo url into schema object as a property name logo
                            }else {
                                return {
                                    message: `Only ${logoExtensionsValidation.join(",") } format are accepted`,
                                    status: 406
                                }
                            }
                        }else {
                            return {
                                message: "Logo upload failed",
                                status: 406
                            }
                        }
                    }else {
                        const {
                            fileAddStatus,
                            fileUrl
                        } = await uploadCompanyLogo ("LOGO"); //upload the default logo for company
                        if (fileAddStatus) { //if logo upload then it will happen
                            schema.logo = fileUrl; //store the logo url into schema object as a property name logo
                        }else {
                            return {
                                message: "Logo upload failed",
                                status: 406
                            }
                        }
                    }

                    const createOfficialSchemaInstance = new Official (schema) //create a new instance of official schema
                    const saveOfficialSchema = await createOfficialSchemaInstance.save ();
                    if (saveOfficialSchema) { //if official schema successfully save then it will execute
                        return {
                            message: "Official data created successfully",
                            status: 201,
                            data: saveOfficialSchema
                        }
                    }else {
                        return {
                            message: "Official data creation failed",
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

//Add available mainCategory with color or available sub category  
    //with this api => 
        // user can add multiple main category
        // user can add multiple sub category
        // user can update main category default color by using the main category name 
const addMainCategoryOrSubCategoryController = async ({data}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const {mainCategory, subCategory} = data
                let queryFiled ; //selected query field type example => (mainCategory or subCategory)
                if (mainCategory) { //if main category have passed from body
                    queryFiled = mainCategory
                }
                if (subCategory) {  //if main category have passed from body
                    queryFiled = subCategory
                }
                const findOfficialSchema = await Official.find ({}); //it will give the exising findOfficialSchema
                if (findOfficialSchema.length != 0) {
                    const {_id: officialSchemaID} = findOfficialSchema[0]
                    const operation = queryFiled.map (data => {
                        let query = {
                            _id: officialSchemaID
                        };//initial query structure
                        const updateQuery = {
                            $push: {}
                        }; //initial query update  structure
                        if (mainCategory) { //if user want to main category then it will happen 
                            const mainCategoryOfExistingOfficialSchema = findOfficialSchema[0].availableOption.mainCategory
                            const isFind = mainCategoryOfExistingOfficialSchema.find (category => category.name == data.name)
                            if (!isFind) { //if main category items is not found then it will happen
                                updateQuery.$push = { //if user want to add a new main category with default color then it will paly role 
                                    ...updateQuery.$push,
                                    "availableOption.mainCategory": data
                                }
                            }else {
                                query = { //if user want to update main category color then this query  will happen 
                                    ...query,
                                    "availableOption.mainCategory": {
                                        $elemMatch: {
                                            name: data.name
                                        }
                                    }
                                }
                                updateQuery.$set = { //if user want to update main category color then this update operation will happen 
                                    "availableOption.mainCategory.$.color": data.color
                                }
                            }
                        }
                        if (subCategory) { //if user want to sub category then it will happen
                            updateQuery.$push = { //if user want to add a subcategory then it will play role
                                ...updateQuery.$push,
                                "availableOption.subCategory": data
                            }
                        }
                        return {
                            updateOne: {
                                filter: query , //by this query it will did their query
                                update: updateQuery //in this format it will update the data
                            }
                        }
                    })
                    const isUpdate = await Official.bulkWrite (operation) //update multiple filed of  main category and sub category
                    if (isUpdate.nModified) { //if all operation done well then it will happen
                        return {
                            message: "successful operation done",
                            status: 202
                        }
                    }else {
                        return {
                            message: "failed operation",
                            status: 406
                        }
                    }
                }else {
                    return {
                        message: "No official info found",
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

//add contact social media for contact with official 
const addContactSocialMediaOfOfficial = async ({socialMedia}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const findOfficialSchema = await Official.find ({}); //it will give the existing findOfficialSchema
                if (findOfficialSchema.length != 0) { //if official schema found then it will happen
                    const {_id: officialSchemaID} = findOfficialSchema[0]
                    const queryFiled =  socialMedia
                    const operation = queryFiled.map (data => {
                        let query = {
                            _id: officialSchemaID
                        };//initial query structure
                        const updateQuery = {
                            $push: {}
                        }; //initial query update  structure
                        const mainCategoryOfExistingOfficialSchema = findOfficialSchema[0].controller.selectSocialMedia //get all existing social media
                        const isFind = mainCategoryOfExistingOfficialSchema.find (socialMedia => socialMedia.siteName == data.siteName)
                        if (!isFind) { //if social media  items is not found then it will happen
                            updateQuery.$push = { //if user want to add a new social media link then it will paly role 
                                ...updateQuery.$push,
                                "controller.selectSocialMedia": data
                            }
                        }else {
                            query = { //if user want to update new social media link this query  will happen 
                                ...query,
                                "controller.selectSocialMedia": {
                                    $elemMatch: {
                                        siteName: data.siteName
                                    }
                                }
                            }
                            updateQuery.$set = { //if user want to update existing social media link update operation will happen 
                                "controller.selectSocialMedia.$.link": data.link
                            }
                        }
                        return {
                            updateOne: {
                                filter: query , //by this query it will did their query
                                update: updateQuery //in this format it will update the data
                            }
                        }
                    })
                    const isUpdate = await Official.bulkWrite (operation) //update multiple filed of  main category and sub category
                    if (isUpdate.nModified) { //if all operation done well then it will happen
                        return {
                            message: "successful operation done",
                            status: 202
                        }
                    }else {
                        return {
                            message: "failed operation",
                            status: 406
                        }
                    }
                }else {
                    return {
                        message: "No official info found",
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

//add navbar category or update navbar category 
const addNavbarCategoryOrUpdateNavbarCategory = async ({categories}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const findOfficialSchema = await Official.find ({}); //it will give the existing findOfficialSchema
                if (findOfficialSchema.length != 0) { //if official schema found then it will happen
                    const {_id: officialSchemaID} = findOfficialSchema[0]
                    const queryFiled =  categories
                    const isUpdate = await Official.updateOne( //it will update or create new categories of navbar
                        {
                            _id: officialSchemaID
                        }, //query
                        {
                            "controller.navbarSelectCategory": categories
                        }, //update
                        {
                            multi: true
                        }, //option
                    )
                    if (isUpdate.modifiedCount != 0) { //if all operation done well then it will happen
                        return {
                            message: "successful operation done",
                            status: 202
                        }
                    }else {
                        return {
                            message: "failed operation",
                            status: 406
                        }
                    }
                }else {
                    return {
                        message: "No official info found",
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


//get all official info 
const getAllOfficialInfoController  = async ({queryBy}, req) => {
    try {
        if (true) { 
            // const {user: loggedInUser} = req
            let selectItemStructure = `
                logo
                companyName
                controller
                availableOption
                contactInfo
                
            `; //create the initial structure for query 
            if (queryBy == officialInfoGetQuery.giveALlSocialMedia ) { //if user want to get all available socialMedia
                selectItemStructure = `
                    availableOption.socialMedia
                `
            }
            if (queryBy == officialInfoGetQuery.giveAllMainCategory ) { //if user want to get all main categories
                selectItemStructure = `availableOption.mainCategory`
            }
            if (queryBy == officialInfoGetQuery.giveAllSubCategory ) { //if user want to get all available subCategory
                selectItemStructure = `
                    availableOption.subCategory
                `
            }
            selectItemStructure = selectItemStructure.replace(/\s+/g, ' ').trim()
            const findALlData = await Official.find ({}).select (selectItemStructure) //find official schema 
            if (findALlData.length != 0) { //if official info found then it will happen
                return {
                    message: "Info found",
                    status: 202,
                    info:  findALlData[0]
                }
            }else {
                return {
                    message: 'Official info not found',
                    status: 404
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

//upload or update company logo
const uploadOrUpdateCompanyLogoController = async ({logo}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const {fileAddStatus, fileUrl, extensionValidation} = await companyLogoUploader (logo, logoExtensionsValidation) //upload image
                if (fileAddStatus) { //if logo upload successfully
                    const findOfficial = await Official.find ({}) //get the official info 
                    const updateOfficialSchema = await Official.updateOne ( //update the logo 
                        {
                            _id: findOfficial[0]._id
                        },
                        {
                            $set: {
                                logo: fileUrl
                            }
                        }
                    )
                    if (updateOfficialSchema.modifiedCount != 0) { //if logo uploaded successfully
                        return {
                            message: "Logo uploaded successfully",
                            status: 202
                        }
                    } else {
                        return {
                            message: "Logo update failed",
                            status: 406
                        }
                    }
                } else {
                    return {
                        message: "Logo upload failed",
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

const testing = async({input}, req) => {
    console.log (input);
    return {
        message: "Success"
    }
}
module.exports = {
    createNewOfficialSchemaController,
    addMainCategoryOrSubCategoryController,
    addContactSocialMediaOfOfficial,
    addNavbarCategoryOrUpdateNavbarCategory,
    getAllOfficialInfoController,
    uploadOrUpdateCompanyLogoController,
    testing
}


