const Comment = require('../../model/comment')


//get all comment by blog id 
const getAllCommentController = async (req, res) => {
    try {
        const {id: blogId} = req.params //get data from body
        if (blogId) { //if blog slug is available then it will happen
            const getAllCommentOfThatBlog = await Comment.find ( //get all comment of provided blogs
                {
                    isDelete: false,
                    blog: blogId 
                }
            ).populate ({
                path: "owner",
                select: `
                    personalInfo
                `
            }).sort ("createdAt").populate ({
                path: "blog",
                select: `contentDetails`
            })
            if (getAllCommentOfThatBlog.length != 0) { //if comment found then it will happen
                const allComment = JSON.parse (JSON.stringify (getAllCommentOfThatBlog)) //store all comment here and
                const getAllComment = allComment.filter (comment => !comment.parent) //get all parent comments
                function storeComment (parent) {
                    parent.map (parentComment => {
                        const child = []
                        allComment.map (comment => {
                            if (comment.parent == parentComment.commentId) {
                                child.push (comment) //store the child comment 
                            }
                        })
                        if (child.length != 0) {
                            parentComment.child = child;
                            storeComment(child)
                        }else {
                            parentComment.child = [];
                        }
                        // console.log({parent, child})
                    })
                }
                storeComment (getAllComment) 
                res.status(202).json ({
                    message: `${getAllComment.length} ${getAllComment.length > 1 ? "comments" : "comment"} found`,
                    comment: getAllComment,
                    status: 202
                })
                
            }else {
                res.json ({
                    message: "No comment found",
                    status: 404
                })
            }
        }else {
            res.json ({
                message: 'Blog id required',
                status: 404
            })
        }
    }catch (err) {
        res.json ({
            message: err.message,
            status: 406
        })
    }
}

module.exports = {
    getAllCommentController
}