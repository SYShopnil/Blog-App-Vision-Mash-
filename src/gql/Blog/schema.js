const {buildSchema} = require('graphql')

const inputField = `
    input inputImage {
        base64: String
        size: Int
    }
    input InputSaveNewBlog {
        title: String
        mainCategory: String
        subCategory: [String]
        keyWord: [String]
        coverPic: inputImage
        titlePic: inputImage
        content: String
    }
    input InputBlogUpdate {
        subCategory: [String]
        mainCategory: String
        keyWord: [String]
    }
    input filterByInput {
        publishedYear: String
        subCategory: [String]
    }

`
const BlogSchema = `
    type ViewDetails {
        view: Int 
        month: String 
        year: String 
    }
    type TrackDetails {
        ipAddress: String 
        visitTime: String 
    }
    type ViewerDetails {
        details: [ViewDetails]
        userTrack: [TrackDetails]
    }
    type Content {
        published: String 
        draft: String 
    }
    type ContentDetails {
        title: String 
        mainCategory: String 
        subCategory : [String]
        keyWord: [String]
        coverPic: String 
        titlePic: String
        content: Content
    }
    type Blog {
        id: ID
        slug: String 
        isPublished: Boolean 
        isFeatured: Boolean 
        url : String 
        blogId: String 
        isDelete: Boolean 
        isActive: Boolean 
        owner: Client
        contentDetails: ContentDetails
        viewerDetails:  ViewerDetails
        publishedTime: String
    }
`

const clientSchema = `
    type PersonalInfo {
        firstName: String
        lastName: String
        email: String 
        contactNumber : String 
        profilePicture : String 
        coverPicture: String 
        gender: String 
        bio: String
    }
    type BlogInfo {
        totalBlog: Int 
        allBlog: [Blog]
    }
    type OfficialInfo {
        blogInfo: BlogInfo
    }
    type SocialMedia {
        name: String 
        link: String
    }
    type OthersInfo {
        isDelete: Boolean
        socialMedia: [SocialMedia]
    }
    type Client {
        id: ID
        personalInfo : PersonalInfo
        password: String 
        clientId: String
        slug: String 
        officialInfo: OfficialInfo
        othersInfo: OthersInfo
    }
`

const ResponseSchema = `
    type createBlogResponse {
        message: String!
        blog: Blog
        status: Int!
    }
    type publishBlogResponse {
        message: String!
        blog: Blog
        status: Int!
    }
    type previewBlogResponse {
        message: String!
        blog: Blog
        status: Int!
    }
    type deleteBlogResponse {
        message: String!
        status: Int!
    }
    type updateBlogResponse {
        message: String!
        status: Int!
    }
    type updateBlogImage {
        message: String!
        status: Int!
    }
    type getBlogsResponse {
        message: String!
        status: Int!  
        subCategory: [String]
        keyWord: [String]
        totalPage: Int
        totalBlog: Int
    }
`
const CommonSchema = `
    ${clientSchema}
    ${BlogSchema}
    ${inputField}
    ${ResponseSchema}
`

const mainSchema = buildSchema (
    `  
        ${CommonSchema}
        type Query {
            blogs (queryBy: String, queryInput: String search: String, filterBy: filterByInput sortBy: String dataLimit: String pageNo: Int): getBlogsResponse
        }
        type Mutation {
            saveBlog (input: InputSaveNewBlog, blogId: String ) :  createBlogResponse
            publishBlog (input: InputSaveNewBlog, blogId: String): publishBlogResponse
            previewBlog(blogId: String!) : previewBlogResponse
            deleteBlog (slug: String!) : deleteBlogResponse
            updateBlog (input: InputBlogUpdate slug: String!) : updateBlogResponse
            updateBlogImage (input: inputImage  slug:String! type:String!): updateBlogImage
        }
    `
)

module.exports = mainSchema

