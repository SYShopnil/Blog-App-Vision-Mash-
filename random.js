try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                
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