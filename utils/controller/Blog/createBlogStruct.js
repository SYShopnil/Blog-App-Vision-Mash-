const blogCreator = (
    title, 
    mainCategory,
    subCategory,
    keyWord,
    content,
    owner,
    blogId,
    url,
    blogSlug,
    coverPicUrl,
    titlePicUrl,
    action
    
) => {
    let struct = {}
    if (title) { //if title exist then it will happen
        struct = {
            ...struct,
            "contentDetails.title": title
        }
    }
    if (mainCategory) { //if main category exist
        struct = {
            ...struct,
            "contentDetails.mainCategory": mainCategory
        }
    }
    if (subCategory) { //if subCategory  exist
        struct = {
            ...struct,
            "contentDetails.subCategory": subCategory
        }
    }
    if (keyWord) { //if keyword exist
        struct = {
            ...struct,
            "contentDetails.keyword": keyWord
        }
    }
    if (action == "save") { //if action is save
        struct = {
            ...struct,
            "contentDetails.content.draft": content
        }
    }else if (action == "publish") { //if action is publish
        struct = {
            ...struct,
            "contentDetails.content.draft": content,
            "contentDetails.content.published": content,
            "isPublished": true
        }
    }
    if (content) { //if content exist
        struct = {
            ...struct,
            "contentDetails.content": content
        }
    }
    if (blogId) { //if blogId exist
        struct = {
            ...struct,
            "blogId": blogId
        }
    }
    if (url) { //if url exist
        struct = {
            ...struct,
            "url": url
        }
    }
    if (blogSlug) {//if blog slug exist
        struct = {
            ...struct,
            "slug": blogSlug
        }
    }
    if (coverPicUrl) {//if coverPicUrl exist
        struct = {
            ...struct,
            "contentDetails.coverPic": coverPicUrl
        }
    }
    if (titlePicUrl) {//if titlePicUrl exist
        struct = {
            ...struct,
            "contentDetails.titlePic": titlePicUrl
        }
    }
    if (owner) {//if owner exist
        struct = {
            ...struct,
            "owner": owner
        }
    }
    return struct
}
module.exports = blogCreator