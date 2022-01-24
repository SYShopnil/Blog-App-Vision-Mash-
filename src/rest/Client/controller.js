const Blog = require('../../model/blog')
const activityTracker = require('../../../utils/controller/Client/activityHandler')
const {monthName} = require ("../../../assert/doc/global")
//incomplete
const seeOnlyHisActivityByYear = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear()  //get the query year
        const dayOne =  new Date(year, 0, 2); // the month is 0-indexed
        const lastDay = new Date(year, 11, 31); // the month is 0-indexed

        const {user: {
            _id:ownerId
        }} = req //get the loggedInUser user slug  data object
        const findAllBlog = await Blog.find ( //get all logged in users blog by year
            {
                $and : [
                    {
                        "isPublished": true,
                        "owner": ownerId,
                    },
                    {
                        "publishedTime": {
                            $lte : lastDay
                        }
                    },
                    {
                         "publishedTime": {
                            $gte : dayOne,
                        }
                    }
                ]
            }
        ).select ("publishedTime")
        if (findAllBlog.length != 0) { //if blog has found then it will execute
            const countOfBlog = activityTracker (findAllBlog) //get the count of blog
            if (countOfBlog.length != 0) {
                res.status(202).json ({
                    message: `${countOfBlog.length} blogs has been found`, 
                    data: countOfBlog
                })
            }else {
                 res.json ({
                    message: `Somethings went wrong`
                })
            }
        }else {
            const countOfBlog = monthName.map (({month, no}) => {
                return {
                    month,
                    no,
                    blogCount: 0
                }
            })
            res.status(202).json ({
                message: `No blogs has been found`, 
                data: countOfBlog
            })
            
        }
        
        
    }catch(err) {
        console.log(err);
        res.json ({
            message: err.message
        })
    }
}

module.exports = {
    seeOnlyHisActivityByYear
}

