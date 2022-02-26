const commentValidation = require('../../../validation/comment/createNewComment')
const Comment = require('../../model/comment')
const commentIdGenerator = require('../../../utils/idGenerator')
const authorizationGql = require('../../../utils/autorization')

//create a new comment 
const createCommentController = async ({input}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                const {error} = commentValidation.validate ({
                    content: input.content,
                    blog: input.blog
                }) //validate the comment input
                if (error) {
                    console.log(error)
                    return {
                        message: error.message,
                        status: 406
                    }
                }
                const {
                    content,
                    blog,
                    parent
                } = input
                const owner = loggedInUser._id; //get the owner id
                const commentId = commentIdGenerator ("CMNT") //creat a  new comment id
                const struct = {
                    content,
                    blog,
                    commentId,
                    owner
                }
                if (parent) { //if comment has parent then it will happen
                    const findParent = await Comment.findOne ({
                        commentId: parent,
                        isDelete: false
                    }).select ("-_id commentId")
                    struct.parent = findParent.commentId; //store the parent id here
                }
                //create the new instance of comment 
                const createNewComment = new  Comment (struct) //create a new instance
                const saveComment = await createNewComment.save(); //save the new comment instance
                if (saveComment) { //if comment has been created successfully
                    return {
                        message: "Comment successfully published",
                        status: 201
                    }
                }else {
                    return {
                        message: "Comment published failed",
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

//update comment by comment id 
const updateCommentByCommentId = async ({commentId, content}, req) => {
    try {
        const {isAuth} = req  //get the is auth status from api auth middleware
        if (isAuth) { //if this is  a auth user then it will happen 
            const {user: loggedInUser} = req
            const {isAuthorized} = await  authorizationGql (loggedInUser, "client") //get the authorization status 
            if (isAuthorized) { //if user is not authorized then it will happen
                if (commentId) { //if comment id provided then it will happen
                    const updateComment = await Comment.updateOne (
                        {
                            commentId,
                            isDelete: false
                        },
                        {
                            $set: {
                                content
                            }
                        },
                        {
                            multi: true
                        }
                    )
                    if (updateComment.modifiedCount != 0) { //if comment has been updated then it will happen
                        return {
                            message: "Comment has been modified",
                            status: 202
                        }
                    }else {
                        return {
                            message: "Comment update failed",
                            status: 403
                        }
                    }
                }else {
                    return {
                        message: "Comment Id Required",
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
    createCommentController,
    updateCommentByCommentId
}

