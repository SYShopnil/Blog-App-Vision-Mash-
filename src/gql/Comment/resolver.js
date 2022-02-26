const {
    createCommentController,
    updateCommentByCommentId
} = require ("./controller")

const resolver = {
    publishComment : createCommentController,
    modifiedComment: updateCommentByCommentId
}

module.exports = resolver