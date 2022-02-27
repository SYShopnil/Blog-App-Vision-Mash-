const {
    createNewContactController,
    getAllContact,
    getIndividualContact,
    sentReplyToSender
} = require ("./controller")

const resolver = {
    createNewContact: createNewContactController,
    showAllContact: getAllContact,
    showIndividualContact : getIndividualContact,
    sendReply: sentReplyToSender
}

module.exports = resolver