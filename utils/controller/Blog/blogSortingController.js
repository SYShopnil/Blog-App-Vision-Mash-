const {
    blogQueryInput:query,
    blogSortingOption: sortedBy,
    sortOrdering: ordering
} = require ("../../../assert/doc/global")

const blogSortingController = (queryField, sortBy ,structure) => {
    const queryBy = queryField
    const struct = structure
    if (queryBy == query.recent) { //if blog query by recent blog 
        struct["publishedTime"] = ordering.desc //ordering in descending order
    }
    if (queryBy == query.topMonth) { //if blog query by top of this month blog 
        struct["viewersDetails.totalView"] = ordering.desc //ordering in descending order
    }
    if (queryBy == query.topView) { //if blog query by top blog view
        struct["viewersDetails.totalView"] = ordering.desc //ordering in descending order
    }
    if (sortBy == sortedBy.latest) { //if blog is sorted by latest then it will happen
        struct ["publishedTime"] = ordering.desc //ordering in descending order
    }
    if (sortBy == sortedBy.A_Z) { //if blog is sorted by A to Z means By title name in Ascending order then it will happen
        struct ["contentDetails.title"] = ordering.asc //ordering in ascending order
    }
    if (sortBy == sortedBy.Z_A) { //if blog is sorted by Z to A means By title name in Descending order then it will happen
        struct ["contentDetails.title"] = ordering.desc //ordering in ascending order
    }
    if (sortBy == sortedBy.view) { //if blog is sorted by view descending order then it will happen
        struct ["viewersDetails.totalView"] = ordering.desc //ordering in descending order
    }
}

module.exports = blogSortingController