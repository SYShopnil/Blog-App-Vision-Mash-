const {monthName} = require ("../../../assert/doc/global")

const activityTracker = (data) => {
    const publishedTimes = data  //get all publish time 
    const tracking = [] //here all tracing result will be store 
    let totalBlog = 0
    monthName.map (({month, no:defaultMonthSerial}) => { //this is come from default month list for keep the tracking running
        let blogCount = 0
        publishedTimes.map (({publishedTime:time}) => { //here this is come from data base publishedTime data
            const elementMonth = new Date (time).getMonth() + 1
            if (defaultMonthSerial == elementMonth) {
                blogCount ++
                totalBlog++
            }
        })
        tracking.push ({
            month, 
            no: defaultMonthSerial,
            blogCount: blogCount
        })
    })
    return {
        tracking,
        totalBlog
    }
}


//export part 
module.exports = activityTracker