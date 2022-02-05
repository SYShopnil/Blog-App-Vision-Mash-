const {
    blogQueryInput:query
} = require ("../../../assert/doc/global")

const queryMainController = async (queryField, structure, queryInput) => {
    const queryBy = queryField;     
    if (queryBy) { //if user dont put any input query type;
        if (queryBy == query.topMonth) { //if user query by top of this month then it will happen
            const today = new Date ()
            // const todayDate = today.toISOString();
            const currentMonth = today.getMonth() + 1  ;
            const currentYear = today.getFullYear() ;
            // console.log(currentMonth);
            // const startOfTheYear = new Date (currentYear, currentMonth, 01, 00, 00, 00)
            structure.$and.push (
                {
                    "viewersDetails.details.month": currentMonth,
                    "viewersDetails.details.year": currentYear,
                    "viewersDetails.details.view": {
                        $gt: 0
                    },
                }
            )
        }
        if (queryBy == query.featured) { //query by all featured blog
            structure.$and.push (
                {
                    "isFeatured": true
                }
            )
        }  
        if (queryBy == query.category) { //query by all categories that time we should have the query input
            structure.$and.push (
                {
                    "contentDetails.mainCategory": queryInput
                }
            )
        } 
    }else {
        return {
            isDone: true
        }
    }
}


module.exports = queryMainController