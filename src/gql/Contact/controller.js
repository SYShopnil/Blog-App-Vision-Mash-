const newContactValidation = require('../../../validation/contact/newContact')
const Contact = require('../../model/contact')
const contactIDGenerator = require('../../../utils/idGenerator')
const {
    contactGetAllHandler,
    sortOrdering
} = require('../../../assert/doc/global')
const authorizationGql = require('../../../utils/autorization')
const replyToEmail = require('../../../utils/sentMail')
const Official = require('../../model/official')

//create a new contact 
const createNewContactController = async ({input}, req) => {
    const {error} = newContactValidation.validate (input) //validate the contact input
    if (error) { //if contact input validation failed then it will happen and show the error message
        return {
            message: error.message,
            status: 406
        }
    }
    const contactId = contactIDGenerator ("CNT")
    const createNewContact = new Contact ({...input, contactId}) //create a new instance of the new contact
    const saveNewContact = await createNewContact.save () //save the new contact 
    if (saveNewContact) { // if save successfully
        return {
            message: "Message sent successfully. Please wait for response",
            status: 201,
            contact: saveNewContact
        }
    }else {
        return {
            message: "Message sent failed",
            status: "403"
        }
    }
}

//get all contact 
const getAllContact = async ({input}, req) => {
    console.log(`first`)
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const {queryBy, sortBy} = input // get the data from input object 
                const query = {};
                const sort = {}; 
                queryBy == contactGetAllHandler.read && (query["isRead"] = true) //if user want to get all read message
                queryBy == contactGetAllHandler.unread && (query["isRead"] = false) //if user want to get all unread message
                sortBy == contactGetAllHandler.descByDate && (sort["createdAt"] = sortOrdering.desc)  //data is sorted by in descending order by created date of the message 
                sortBy == contactGetAllHandler.ascByDate && (sort["createdAt"] = sortOrdering.asc)  //data is sorted by in ascending order by created date of the message 
                sortBy == contactGetAllHandler.ascByEmail && (sort["email"] = sortOrdering.asc)  //data is sorted by in ascending order by sended email of the message 
                sortBy == contactGetAllHandler.descByEmail && (sort["email"] = sortOrdering.desc)  //data is sorted by in descending order by sended email of the message 
                const getAllContact = await Contact.find (query).sort (sort);
                // console.log(getAllContact)
                if (getAllContact.length != 0) { //if new contact info available then it will happen
                    return {
                        message: `${getAllContact.length} ${getAllContact.length > 1 ?"contacts" : "contact"} found`,
                        status: 202,
                        contact: getAllContact
                    }
                }else {
                    return {
                        message: "No contact found",
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

//get individual contact by contactId 
const getIndividualContact = async ({contactId}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const getContact = await Contact.findOne ({ //search contact by contact id
                    contactId
                })
                if (getContact) { //if contact found then it will happen
                    return {
                        message: "Contact found",
                        status: 202,
                        contact: getContact
                    }
                }else {
                    return {
                        message: "Contact not found",
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

//sent a reply to the sender 
const sentReplyToSender = async ({contactId, reply}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "admin") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const findContact = await Contact.findOne ({contactId, isRead: false}).select (`
                    subject
                    email
                    subject
                `)
                if (findContact) {
                    const {
                        email: senderEmail,
                        subject: senderSubject
                    } = findContact //get data from contact info
                    const companyDetails = await Official.find ().select ("contactInfo.email")
                    const {contactInfo: {email: companyEmail}} = companyDetails[0]
                    const subjectOfReply = `Reply of ${senderSubject}`
                    const {responseStatus:isSend} = await replyToEmail (companyEmail, senderEmail, reply, subjectOfReply)
                    if (isSend) {//if reply message has been sent then it will happen
                        const makeRead = await Contact.updateOne (
                            {
                                contactId,
                                isRead: false
                            },
                            {
                                $set: {
                                    isRead: true
                                }
                            }
                        )
                        if (makeRead.modifiedCount != 0) { 
                            return {
                                message: "Reply has been successfully send",
                                status: 202
                            }
                        }else {
                            return {
                                message: "Message sent but contact status is currently unread",
                                status: 403
                            }
                        }
                    }else {
                        return {
                            message: "Reply send failed",
                            status: 403
                        }
                    }
                }else {
                    return {
                        message: "Contact not available please check in read section",
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

//export part 
module.exports = {
    createNewContactController,
    getAllContact,
    getIndividualContact,
    sentReplyToSender
}


