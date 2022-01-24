const fs = require('fs');
const clientCreateInputValidation = require('../../../validation/client/createClient');
const idGenerator = require('../../../utils/idGenerator')
const IsUniqueId = require('../../../utils/checkIdUnique')
const {acceptedProfilePictureExtensions:acceptedExtensionsPic} = require('../../../assert/doc/global')
const Client = require('../../model/client')
const User = require('../../model/user')
const Blog = require('../../model/blog')
const {profilePicUploader,
    coverPictureUploader} = require('../../../utils/controller/Client/profileAndCoverPicUplaod')
const bcrypt = require('bcrypt')
const slugGenerator = require('../../../utils/slugGenerator')
const newUser = require('../../../utils/controller/createUser')
const authorizationGql = require('../../../utils/autorization');
const res = require('express/lib/response');
const {
    sortingHandler,
    blogQueryStructure
} = require('../../../utils/controller/Client/seeOwnBlogFilterAndSorting')
//create a new client
const createNewClientController = async ({input}, req) => {
    try {
        const {
            firstName,
            lastName,
            email,
            contactNumber,
            gender,
            district,
            division,
            country,
            socialMedia,
            profilePicture,
            coverPicture,
            password,
            retypePassword
        } = input
        const inputValidation = { //validation data part with joi
            firstName,
            lastName,
            email,
            contactNumber,
            gender,
            district,
            division,
            country,
            socialMedia,
            password,
            retypePassword
        }
        const {error} = clientCreateInputValidation.validate (inputValidation) //validate the input part 
        if (error) { //if validation error found then it will happen
            return {
                message: error.message,
                status: 406
            }
        }

        //check email exist or not 
        const isAvailableEmail = await User.findOne ({"email" :email }) //check that is there have any user available with this email or not 
        if (isAvailableEmail) {
            return {
                message: "Email is exist please try with another email",
                status: 406
            }
        }else {
            //generate client id 
            const newClientID = idGenerator ("CL")
            const {unique, userId:uniqueClientId} = await IsUniqueId (newClientID, "client")
            if (unique) {
                const clientId = uniqueClientId //store the client id 
                //upload profile image
                let {imageUrl,
                    isExtensionValidate,
                    isProfileImageUpload} = await profilePicUploader (profilePicture,clientId, gender ) //upload the profile picture 
                
                //upload cover image
                let {coverImageUrl,
                    isCoverImageUpload,
                    isExtensionValidateCoverPic} = await coverPictureUploader (coverPicture,clientId)

                if (isProfileImageUpload) { //check that is profile image is uploaded or not or not 
                    if (isCoverImageUpload) { //check that is cover image is uploaded or not or not 
                        if (isExtensionValidateCoverPic && isExtensionValidate ){ //check extension validation
                            const profilePicture = imageUrl
                            const coverPicture = coverImageUrl
                            const hashedPassword = await bcrypt.hash (password, 10)
                            if (hashedPassword) { //if password is successfully hashed then it will execute
                                const slug = slugGenerator (firstName, clientId, lastName) //generate a new slug of client
                                const schemaStruct = { //create the client schema instance design
                                    personalInfo: {
                                        firstName,
                                        lastName,
                                        email,
                                        contactNumber,
                                        profilePicture,
                                        coverPicture,
                                        gender,
                                        address: {
                                            district,
                                            division,
                                            country
                                        }
                                    },
                                    password: hashedPassword,
                                    clientId,
                                    slug,
                                    othersInfo: {
                                        socialMedia
                                    }
                                }
                                const createNewClient = new Client (schemaStruct) //create a new instance of client 
                                const saveClient = await createNewClient.save() //save new Client 
                                if (saveClient) { //if the client is successfully save then it will execute
                                    const {personalInfo: {email}, clientId} = saveClient //store the new client data 
                                    const {saveUser} = await newUser ("client", clientId, email) //creat a new user
                                    if (saveUser) { //if the user is successfully save then it will execute
                                        return {
                                            message: "Client successfully created",
                                            data: saveClient,
                                            status: 201
                                        }
                                    }else {
                                        return {
                                            message: "User Creation Failed",
                                            status: 406
                                        }
                                    }
                                }else {
                                    return {
                                        message: "Client Creation Failed",
                                        status: 406
                                    }
                                }
                            }else {
                                return {
                                    message: "Password Hashing Problem",
                                    status: 406
                                }
                            }
                            
                        }else {
                            return {
                                message: `Only ${acceptedExtensionsPic.reduce ((initial, reducer) => {return `${initial + " " + reducer}`}, "")} are allowed`,
                                status: 406
                            }
                        }
                    }else {
                        return {
                            message: "Cover picture upload failed",
                            status: 406
                        }
                    }
                }else {
                    return {
                        message: "Profile image upload failed",
                        status: 406
                    }
                }
            }else {
                return {
                    message: "Client id is not unique",
                    status : 406
                }
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

//delete a single client by slug
const deleteClientBySlugController = async ({slug}, req) => {
    try {
        const {isAuth, user} = req //check tht is it authenticate user or not 
        if (isAuth) {
            const {isAuthorized} = await  authorizationGql (user, "admin", "client")
            if (isAuthorized) {
                const deleteClient = await Client.updateOne ( //delete client temporary by edit the is delete field of client
                    {
                        slug
                    }, //query 
                    {
                        $set : {
                            "othersInfo.isDelete": true
                        }
                    }, //update
                    {multi: true} //option
                )
                if (deleteClient.modifiedCount != 0 ) {
                    return {
                        message: "Client has been successfully deleted",
                        status: 202
                    }
                }else {
                    return {
                        message: "Client delete failed",
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

//update client by slug 
const updateClientBySLug = async ({slug:queySlug, data:updateData}, req) => {
    try {
        if (queySlug) {
            const {isAuth} = req //check is it a authenticate route or not 
            if (isAuth) {
                const {user: loggedInUser} = req //get the loggedInUser 
                const  {isAuthorized} = await authorizationGql (loggedInUser, "admin", "client"); //check the route restriction 
                if (isAuthorized) { //if route is not denied to access then it will execute
                    const {
                        firstName,
                        lastName,
                        contactNumber,
                        district,
                        division,
                        country,
                        socialMedia,
                        bio
                    } = updateData
                    const findClient = await Client.findOne(
                        {
                            "slug": queySlug,
                            "isDelete": false, 
                            "isActive": true
                        }
                    ).select (
                        `   personalInfo.firstName   
                            personalInfo.lastName   
                            personalInfo.contactNumber   
                            personalInfo.contactNumber   
                            personalInfo.address   
                            personalInfo.bio   
                            othersInfo.socialMedia
                        `
                    ) //if client found then it will give a object to us  

                    const  {
                        personalInfo: {
                            firstName:existFirstName,
                            lastName: existLastName,
                            contactNumber: existContactNumber,
                            bio: existBio,
                            address: {
                                district: existDistrict,
                                division: existDivision,
                                country: existCountry
                            }
                        },
                        othersInfo: {
                            socialMedia: existSocialMedia
                        }
                    } = findClient //find the exist database data

                    const updateCLients = await Client.updateOne ( //update data base on data
                        {
                            "slug": queySlug,
                            "isDelete": false, 
                            "isActive": true
                        }, //query
                        {
                            $set : {
                                "personalInfo.firstName": firstName || existFirstName,                         
                                "personalInfo.lastName": lastName || existLastName,                         
                                "personalInfo.contactNumber": contactNumber || existContactNumber,                         
                                "personalInfo.address.district": district || existDistrict,                         
                                "personalInfo.address.division": division || existDivision,                         
                                "personalInfo.bio": bio || existBio,                         
                                "personalInfo.address.country": country || existCountry,                        
                                "othersInfo.socialMedia.country": socialMedia || existSocialMedia                         
                            }
                        }, //update 
                        {
                            multi: true
                        } //option
                    )
                    if (updateCLients.modifiedCount != 0 ) { //if update successfully then it will happen 
                        return {
                            message: "Client updated successfully",
                            status: 202
                        }
                    }else {
                        return {
                            message: "Client update failed",
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
        }else {
            return {
                message: "Slug required",
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


//client can see only his draft or published blog  
const canSeeOnlyHisBlogController = async ({input},req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const {
                    sortBy,
                    pageNo,
                    limit,
                    searchFor
                } = input
                const page = pageNo || 1 
                const dataLimit = limit || 5 
                let totalPage
                //filter of sorting by latest, a-z , z-a, viewers
                let sortStructure = {} // here sort data structure will be store
                if (sortBy) {
                    sortStructure = sortingHandler (sortBy)
                }

                const query = blogQueryStructure (searchFor) //it will create the structure of query 
                const findBlog = await Blog.find (
                    {
                        ...query
                    }
                )
                if (findBlog) {
                    const totalData = findBlog.length //get all found data 
                    const skipData = (page * dataLimit) - dataLimit
                    totalPage = Math.ceil (totalData / dataLimit) //get how many page we need  
                    const findFinalData = await Blog.find (
                        {
                            ...query
                        }
                    )
                    .sort (sortStructure)
                    .limit (dataLimit)
                    .skip (skipData)

                    if (findFinalData) { //if blog found then it will happen
                        return {
                            message : `${findFinalData.length} blog found`,
                            status : 202,
                            blogs:  findFinalData,
                            totalPage: totalPage
                        }
                    }else {
                        return {
                            message: "Blog not found",
                            status: 404
                        }
                    }
                }else {
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

module.exports = {
    createNewClientController,
    deleteClientBySlugController,
    updateClientBySLug,
    canSeeOnlyHisBlogController
}

