const Blog = require('../../../src/model/blog')
const {
    currentMonthDateLimit: getCurrentMonthLimit
} = require('../../dateHandler')
const {
    keyWord: {
        CMB,
        CMBV
    }
} = require('../../../assert/doc/global')

const getBlog = async (type = "all") =>  {
    let query = {
        "isPublished": true,
        "isDelete": false,
        "isActive": true
    };
    let select = ""
    if (type == CMB) { //if user want to get all current month blog 
        const {
            firstDay,
            lastDay
        } = getCurrentMonthLimit ()
        query["publishedTime"] = {
            $gte: firstDay,
            $lte: lastDay
        }
    }
    if (type == CMBV) { //if user want to get all current month blog by viewer 
        query = {
            ...query,
            "viewersDetails.details" : {
                $elemMatch : {
                    month: new Date ().getMonth(), //month will start from 0 - 11
                    year: new Date ().getFullYear()
                }
            }
        }
        select = `
            -updatedAt
        `
    }
    const getBlog = await Blog.find (query).select (select) //get all blog by category
    // console.log(getBlog)
    return getBlog
}

module.exports = getBlog

// select = `
//            contentDetails
//            viewersDetails
//            slug
//            blogId
//            url,
           
//         `