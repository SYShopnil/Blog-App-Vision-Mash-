const {
    blogSearchRegex
} = require('../../../assert/doc/global')


const blogSearchController = (searchInput, struct) => {
    let regex 
    if (searchInput) {
        regex = blogSearchRegex (searchInput) //create the regex for the search
        // console.log(regex);
        struct.$and.push (
            {
                $or: [
                    {
                        "contentDetails.mainCategory": regex
                    },
                    {
                        "contentDetails.subCategory": {
                            $in: [regex]
                        }
                    },
                    {
                        "contentDetails.keyword": {
                            $in: [regex]
                        }
                    },
                    {
                        "contentDetails.title": regex
                    }
                ]
            }
        )
    }
}

module.exports = blogSearchController;