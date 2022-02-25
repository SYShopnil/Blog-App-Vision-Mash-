const acceptedProfilePictureExtensions = ["jpg", "png", "jpeg"]

const monthName = [
    {
        month: "jan",
        no: 1
    },
    {
        month: "feb",
        no: 2
    },
    {
        month: "mar",
        no: 3
    },
    {
        month: "apr",
        no: 4
    },
    {
        month: "may",
        no: 5
    },
    {
        month: "jun",
        no: 6
    },
    {
        month: "jul",
        no: 7
    },
    {
        month: "aug",
        no: 8
    },
    {
        month: "sep",
        no: 9
    },
    {
        month: "oct",
        no: 10
    },
    {
        month: "nov",
        no: 11
    },
    {
        month: "dec",
        no: 12
    },
]
const verificationsOtpDigit = 4

//blog query option
const blogQueryInput = {
    recent: "recent",
    topMonth: "topMonth",
    popular: "mostRead",
    featured: "featured",
    category: "mainCategory",
    topView: "mostRead"
}

//regex of blog search 
const blogSearchRegex = (input) => {
    const str = `${input}`
    const regex = new RegExp (str, 'gi')
    return regex;
}

//blog sorting option 
const blogSortingOption = {
    latest : "latest",
    A_Z: "A_Z", //sort 	By title name in Ascending order
    Z_A: "Z_A", //sort 	By title name in Descending order
    view: "view" //sort by total view in Descending order
}

//blog pagination options
const blogPagination = {
    defaultDataLimit : 5,
    defaultPageNo: 1
}
//sorting ordering 
const sortOrdering = {
    desc : -1,
    asc : 1
}

const keyWord  = {
    CMB : "currentMonth", //it will show the current month blog 
    CMBV: "currentMonthByView" //it will query blog by current month by viewer
}

const officialInfoGetQuery = {
    giveAllMainCategory : "mainCategory",
    giveAllSubCategory : "subCategory",
    giveALlSocialMedia : "socialMedia"
}
module.exports = {
    acceptedProfilePictureExtensions,
    monthName,
    verificationsOtpDigit,
    blogQueryInput,
    blogSearchRegex,
    blogPagination,
    blogSortingOption,
    sortOrdering,
    keyWord,
    officialInfoGetQuery
}
