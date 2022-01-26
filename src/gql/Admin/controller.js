const Admin = require('../../model/admin')
const User = require('../../model/user')
const createAdminValidation = require('../../../validation/admin/createAdmin')
const bcrypt = require ("bcrypt")
const idGenerator = require ("../../../utils/idGenerator") 
const checkUniqueUserId = require ("../../../utils/checkIdUnique") 
const slugGenerator = require ("../../../utils/slugGenerator") 
const createUser = require ("../../../utils/controller/createUser")

//create a new admin
const createNewAdmin = async ({input}, req) => {
    try {
        const {firstName, lastName, email, password, contactNumber} = input //get all input data 
        const {error} = createAdminValidation.validate (input)
        if (error) { //if there have some error then it will show status code 406 with joi validation error message
            return {
                message: error.message,
                status: 406
            }
        }
        
        const findExistingUser = await User.findOne ({email}) //check that is there have any user exist or not
        if (!findExistingUser) { //if there have no user with this email then it will execute
            const hashedPassword = await bcrypt.hash (password, 10)
            if (hashedPassword) { //if password hashing successfully done then it will execute
                const userId = idGenerator ("ADM") //create a new admin id 
                const {unique: isUniqueId, userId:checkedId} = await checkUniqueUserId (userId, "admin")
                if (isUniqueId) {
                    const userId = checkedId //store the new user id  
                    const slug = slugGenerator (firstName, userId, lastName) //generate a unique slug name of a admin user
                    const struct = { //create the structure for create a new admin
                        slug,
                        personalInfo : {
                            firstName,
                            lastName,
                            email,
                            contactNumber
                        },
                        password: hashedPassword,
                        userId
                    }
                    const createAdminInstance = new Admin (struct) //create a new instance of admin 
                    const saveAdmin = await  createAdminInstance.save() //save the admin 
                    if (saveAdmin) { //if admin info save then it will execute 
                        const {userId, personalInfo: {email}, userType} = saveAdmin
                        const {saveUser} = await createUser (userType, userId, email)
                        if (saveUser) { //if save user successfully then it will executed
                            return {
                                message: 'Admin successfully created',
                                status: 201,
                                data: saveAdmin
                            }
                        }else {
                            return {
                                message: "User creation failed",
                                status: 406
                            }
                        }
                    }else {
                        return {
                            message: "Admin Creation Failed",
                            status: 406
                        }
                    }
                    
                }else {
                    return {
                        message: "Admin Id is not unique",
                        status: 406
                    }
                }
                
            }else {
                return {
                    message: "Password Hashing problem",
                    status: 406
                }
            }
        }else {
            return {
                message: "Email is exist please try with another email",
                status: 406
            }
        }
    }catch (err) {
        console.log(err);
        
        return {
            message: err.message,
            status : 406
        }
    }
}

//export part
module.exports = {
    createNewAdmin
}


