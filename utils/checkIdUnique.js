const Admin = require('../src/model/admin')
const Client = require ("../src/model/client")
const idGenerator = require('./idGenerator')

async function checkIdAvailableOrNot (id, userType) {
    if (userType == "admin") {   //for admin
        const isAvailable = await Admin.findOne ({userId: id}) //check that is there have any admin available with this user id or not the
        if (isAvailable) {
            const newId = idGenerator ("ADM") //create new id
            checkIdAvailableOrNot(newId, "admin") //again check that is there have any others user id available or not
        }else {
            return {
                unique: true,
                userId : id
            }
        }
    }else if (userType == "client") { //for client
        const isAvailable = await Client.findOne ({clientId: id}) //check that is there have any client available with this user id or not the
        if (isAvailable) {
            const newId = idGenerator ("CL") //create new id
            checkIdAvailableOrNot(newId, "client") //again check that is there have any others client id available or not
        }else {
            return {
                unique: true,
                userId : id
            }
        }
    }
} 

module.exports = checkIdAvailableOrNot