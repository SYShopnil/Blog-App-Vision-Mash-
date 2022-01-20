const User = require ("../../src/model/user")

const createUser = async (userType, id, email) => {
    const createInstance =  new User ({userType, userId:id, email})
    const saveUser = await createInstance.save()
    if (saveUser) {
        return {
            saveUser: true
        }
    }else {
        return {
            saveUser: false
        }
    }

}

module.exports = createUser