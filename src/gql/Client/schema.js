const {buildSchema} = require('graphql')


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
    ${BlogSchema}
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

const inputField = `
    input SocialMediaInput {
        name: String
        link: String
    }
    input ProfilePicture {
        base64: String 
        size: Int
    }
    input CoverPicture {
        base64: String 
        size: Int
    }
    input createClientInput {
        firstName: String!
        lastName: String! 
        email: String!
        bio: String
        contactNumber: String! 
        gender: String! 
        district: String! 
        division: String! 
        country: String! 
        socialMedia: [SocialMediaInput]!
        profilePicture: ProfilePicture 
        coverPicture: CoverPicture
        password: String! 
        retypePassword: String!
    }
    input socialMedia {
        name: String
        link: String
    }
    input UpdateData {
        firstName: String
        lastName: String
        contactNumber: String
        district: String
        division: String
        country: String
        socialMedia: [socialMedia]
        bio: String
    }
    input ownBlog {
        sortBy: String,
        pageNo: Int,
        limit: Int,
        searchFor: String
    }
`
const mainSchema = buildSchema (`
    ${clientSchema}
    ${inputField}
    type ResponseOfCreateClient {
        message: String
        data: Client
        status: Int
    }
    type ResponseOfDeleteClient {
        message: String
        status: Int
    }
    type ResponseOfUpdateClient{
        message: String
        status: Int
    }
    type ResponseOfSeeOwnBLog {
        message: String
        status: Int
        blogs: [Blog]
        totalPage: Int
    }
    type Query {
        createClient : ResponseOfCreateClient
    }
    type Mutation {
        createClient (input: createClientInput) : ResponseOfCreateClient
        deleteClient (slug: String!) : ResponseOfDeleteClient
        updateClient (slug: String, data: UpdateData): ResponseOfUpdateClient
        seeOwnBlog (input: ownBlog): ResponseOfSeeOwnBLog
    }
`)

module.exports = mainSchema



