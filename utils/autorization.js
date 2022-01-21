const authorizationMiddleware = async (loggedInUser, ...acceptedUserType) => {
    try {
        const acceptedUser = acceptedUserType //store it as a array those who can access this api
        const requestUser = loggedInUser//get this from authentication middleware
        const {userType} = requestUser //get the user type from the user
        const isAuthorizedUser = acceptedUser.find(user => user == userType) //check that is this user type is available or not user
        if(isAuthorizedUser) {
            return {
                isAuthorized: true
            }
        }else {
            return {
                isAuthorized: false
            }
        }
    }catch (err) {
        console.log(err);
        return {
            isAuthorized: false
        }
    }
}

module.exports = authorizationMiddleware
