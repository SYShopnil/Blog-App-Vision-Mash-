const blogFilterController = (filterBy,struct) => {
    if (filterBy) {
        if (filterBy.subCategory) { //if user filtered by subCategory then it will be filtered
            struct.$and.push (
                {
                    "contentDetails.subCategory": {
                        $in: filterBy.subCategory
                    }
                }
            )
        }
        if (filterBy.publishedYear) { //if user filtered by subCategory then it will be filtered
            const {
                publishedYear
            } = filterBy
            let startYear = new Date(publishedYear, 0, 01); // the month is 0-indexed
            let endYear = new Date(publishedYear, 11, 31, 23,59,59); // the month is 0-indexed
            struct.$and.push (
                {
                    "publishedTime": {
                        $gte: startYear,
                        $lte: endYear
                    }
                }
            )
        }
    }
}

module.exports = blogFilterController