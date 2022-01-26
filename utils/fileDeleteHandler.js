const fs = require('fs');

const fileDeleteHandler = async (fileName) => {
    const filePath = `${__dirname}/../public/${fileName}` 
    const deleteFile = new Promise (resolve => {
        fs.unlink (filePath, (err) => {
            if (err) {
                resolve (err)
            }
            resolve (true)
        })
    })
    const isDelete = await deleteFile
    return isDelete
}

module.exports = fileDeleteHandler