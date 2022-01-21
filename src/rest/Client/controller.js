const Blog = require('../../model/blog')


//incomplete
const seeOnlyHisActivityByYear = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear()  //get the query year
        const dayOne =  new Date(year, 0, 2); // the month is 0-indexed
        const currentDay = new Date() 
        const {user: {
            _id:ownerId
        }} = req //get the loggedInUser user slug  data object

        const findAllBlog = await Blog.find (
            {
                $and : [
                    {
                        "owner": ownerId
                    },
                    {
                        "publishedTime": {
                            $gte : dayOne
                        }
                    },
                    {
                        "publishedTime": {
                            $lte : currentDay
                        }
                    },
                ]
            }
        )
        console.log(findAllBlog);
        
        
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