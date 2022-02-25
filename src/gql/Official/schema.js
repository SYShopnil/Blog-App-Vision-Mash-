const {buildSchema} = require("graphql")

const officialSchema = `
    type SelectSocialMediaSchema {
        _id: ID
        siteName: String
        link: String
    }
    type ControllerSchema {
        navbarSelectCategory : [String]
        selectSocialMedia: [SelectSocialMediaSchema]  
    }
    type MainCategoryOfAvailableOptionSchema {
        _id: ID
        name: String
        color : String
    }
    type socialMediaAvailableOptionSchema {
        _id: ID
        siteName: String
        logo: String
    }
    type AvailableOptionSchema {
        mainCategory: [MainCategoryOfAvailableOptionSchema]
        subCategory: [String]
        socialMedia: [socialMediaAvailableOptionSchema]
    }
    type ContactInfoSchema {
        email: String
        phone: String
        address: String
    }
    type Official {
        _id: ID
        logo: String
        controller: ControllerSchema
        availableOption : AvailableOptionSchema
        contactInfo: ContactInfoSchema
        companyName: String
    }
`

const inputSchema = `
    input LogoInput {
        base64: String
        size: Int
    }
    input availableSocialMediaInput {
        siteName: String!
        logo:String!
    }
    input availableMainCategoryInput {
        name: String!
        color:String!
    }
    input createOfficialInput {
        email: String!
        companyName: String!
        logo: LogoInput
        phone: String!
        address: String!
        availableSocialMedia: [availableSocialMediaInput]!
        availableMainCategory: [availableMainCategoryInput]!
        availableSubCategory: [String]!
    }

    input addMainCategoryInput {
        name: String!
        color:String!
    }
    input addMainOrSubCategoryInput {
        mainCategory: [addMainCategoryInput],
        subCategory : [String!]
    }
    input socialMediaInput {
        siteName: String!
        link: String!
    }
    input logoInput {
        base64: String!
        size: Int!
    }
`

const responseSchema = `
    type createOfficialSchemaResponse {
        message: String!
        status: Int!
        data: Official
    }
    type addMainOrSubCategoryResponse {
        message: String!
        status: Int!
    }
    type socialMediaResponse {
        message: String!
        status: Int!
    }
    type addNavbarCategoryResponse {
        message: String!
        status: Int!
    }
    type getOfficialInfoResponse {
        message: String!
        status: Int!
        info : Official
    }
    type uploadLogoResponse {
        message: String!
        status: Int!
    }
`

const common = `
    ${officialSchema}
    ${inputSchema}
    ${responseSchema}
`

const mainSchema = buildSchema (
    `
        ${common}
        type Query {
            getOfficialInfo (queryBy: String) : getOfficialInfoResponse
        }
        type Mutation {
            createOfficialData (data: createOfficialInput) : createOfficialSchemaResponse
            addMainOrSubCategory (data: addMainOrSubCategoryInput ) : addMainOrSubCategoryResponse
            addOrUpdateContactSocialMedia (socialMedia: [socialMediaInput]): socialMediaResponse,
            addNavbarCategory (categories: [String!]): addNavbarCategoryResponse
            uploadLogo (logo: logoInput!) : uploadLogoResponse
        }
    `
)

module.exports = mainSchema
