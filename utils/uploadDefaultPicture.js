const fs = require('fs');
const serverUrl = process.env.DATA_URL || `http://localhost:3030`

const uploadProfilePicture = async (sex, userID) => {
    let base64
    if (sex.toLowerCase() == "male") {
        base64 = fs.readFileSync (`${__dirname}/../assert/defaultMaleProfile.png`, "base64") //it will convert local default image to base64 format
    }else  if (sex.toLowerCase() == "female") {
        base64 = fs.readFileSync (`${__dirname}/../assert/defaultFemaleProfile.png`, "base64") //it will convert local default image to base64 format
    }else  if (sex.toLowerCase() == "female") {
    }else {
        base64 = fs.readFileSync (`${__dirname}/../assert/defaultFemaleProfile.png`, "base64") //it will convert local default image to base64 format
    }
    if (base64) {
        const {fileAddStatus, fileUrl} = await  uploadImage(base64, userID) //this will upload local server image into server
        return {
            fileAddStatus,
            fileUrl
        }
    }
}

const uploadCoverPicture = async (userID) => {
    let base64 = fs.readFileSync (`${__dirname}/../assert/defaultCoverPic.jpg`, "base64") //it will convert local default image to base64 format
    if (base64) {
        const {fileAddStatus, fileUrl} = await  uploadImage(base64, userID) //this will upload local server image into server
        return {
            fileAddStatus,
            fileUrl
        }
    }
}

//it will upload any base 64 file  in the server 
const uploadImage = async (base64, name) => {
    const myBase64Data = base64
    const dataExtension = "png"
    const fileName = `${name}${+new Date()}.${dataExtension}`
    const saveDirectory = `${__dirname}/../public/${fileName}`
    const upload = new Promise (resolve => {
        fs.writeFile( saveDirectory , myBase64Data, {encoding: "base64"}, (err) => { //this will upload file into public folder
            if(err) {
                console.log(err);
                resolve ({
                    fileAddStatus : false, 
                    fileUrl : ""
                })
            }else{
                const dataUrl = `${serverUrl}/${fileName}`
                console.log("File added successfully");
                resolve ({
                    fileAddStatus : true, 
                    fileUrl : dataUrl
                })
            }
        }) //save the data into public folder
    })
    const {fileAddStatus, fileUrl} = await upload
    return {
        fileUrl,
        fileAddStatus
    }
}

module.exports = {
    uploadProfilePicture,
    uploadCoverPicture
}