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
`
const mainSchema = buildSchema (`
    ${clientSchema}
    ${inputField}
    type ResponseOfCreateAdmin {
        message: String
        data: Client
        status: Int
    }
    type Query {
        createClient : ResponseOfCreateAdmin
    }
    type Mutation {
        createClient (input: createClientInput) : ResponseOfCreateAdmin
    }
`)

module.exports = mainSchema