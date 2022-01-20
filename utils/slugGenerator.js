function slugGenerator (...content) {
    let element = content //store the parameter array in to a local variable 
    let slug = ""
    element.map (val => {
        slug += val + "_"
    })
    slug+= Date.now()
    return slug
}

module.exports = slugGenerator