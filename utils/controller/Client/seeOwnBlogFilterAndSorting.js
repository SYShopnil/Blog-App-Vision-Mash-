
//sort blog data by latest, a-z, z-a, viewers
const sortingHandler = (sortBy) => {
    const sortData = sortBy.toLowerCase();
    let struct = {}
    if (sortData == "latest") { //if sort by latest 
        struct = {
            "publishedTime": -1  //it will sort the blog data by descending order
        }
    }else if (sortData == "a-z") { //it will sort the blog data by title name in  ascending order
        struct = {
            "contentDetails.title": 1
        }
    }else if (sortData == "z-a") { //it will sort the blog data by title name in  descending order
        struct = {
            "contentDetails.title": -1
        }
    }else if (sortBy == "viewers") { //it will sort the blog data by viewer  in  descending order
        struct = {
            "viewerDetails.totalView": -1
        }
    }
    return struct
}

//create a blog data query by published or not
const blogQueryStructure = (searchBy) => {
    const queryBy = searchBy.toLowerCase() //store the query by value  
    let struct = {
        "isDelete": false,
        "isActive": true
    }
    if (queryBy == "published") {
        struct = {
            ...struct,
            "isPublished": true
        }
    }else if (queryBy == "draft") {
        struct = {
            ...struct,
            "isPublished": false
        }
    }
    return struct
}

module.exports = {
    sortingHandler,
    blogQueryStructure
}