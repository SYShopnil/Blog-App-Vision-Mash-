const fs = require('fs');
const clientCreateInputValidation = require('../../../validation/client/createClient');
const idGenerator = require('../../../utils/idGenerator')
const IsUniqueId = require('../../../utils/checkIdUnique')
const {acceptedProfilePictureExtensions:acceptedExtensionsPic} = require('../../../assert/doc/global')
const Client = require('../../model/client')
const User = require('../../model/user')
const {profilePicUploader,
    coverPictureUploader} = require('../../../utils/controller/Client/profileAndCoverPicUplaod')
const bcrypt = require('bcrypt')
const slugGenerator = require('../../../utils/slugGenerator')
const newUser = require('../../../utils/controller/createUser')
const authorizationGql = require('../../../utils/autorization')

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

module.exports = {
    createNewClientController,
    deleteClientBySlugController
}

