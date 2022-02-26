const {buildSchema} = require('graphql')

//blog schema
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
        totalView: Int!
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
        viewersDetails:  ViewerDetails
        publishedTime: String
    }
`

//client schema
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
//comment schema 
const CommentSchema = `
    type Comment {
        _id: ID
        content: String!
        commentId: String
        parent: Comment 
        isDelete: Boolean
        owner: Client
        blog: Blog
        createdAt: String
        updatedAt: String
    }
`
const inputOfCommentSchema = `
    input publishCommentInput {
        content: String!
        blog: String!
        parent : String
    } 
`
const responseCommentSchema = `
    type publishCommentResponse {
        message: String!
        status: Int!
    }
    type commentModifiedResponse {
        message: String! 
        status: Int!
    }
`

const common = `
    ${BlogSchema}
    ${CommentSchema}
    ${clientSchema}
    ${inputOfCommentSchema}
    ${responseCommentSchema}
`

const mainSchema = buildSchema (`
    ${common}
    type Query {
        getAll : Comment
    }
    type Mutation {
        publishComment (input: publishCommentInput): publishCommentResponse
        modifiedComment (commentId: String! content: String!): commentModifiedResponse
    }
`)

module.exports = mainSchema


