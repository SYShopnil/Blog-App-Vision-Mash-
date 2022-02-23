const {buildSchema} = require("graphql")

const officialSchema = `
    type SelectSocialMediaSchema {
        siteName: String
        link: String
    }
    type ControllerSchema {
        navbarSelectCategory : [String]
        selectSocialMedia: [SelectSocialMediaSchema]  
    }
    type MainCategoryOfAvailableOptionSchema {
        name: String
        color : String
    }
    type SubCategorySchemaOfAvailableOption {
        siteName: String
        logo: String
    }
    type AvailableOptionSchema {
        mainCategory: [MainCategoryOfAvailableOptionSchema]
        subCategory: [SubCategorySchemaOfAvailableOption]
    }
    type ContactInfoSchema {
        email: String
        phone: String
        address: String
    }
    type Official {
        logo: String
        controller: ControllerSchema
        availableOption : AvailableOptionSchema
        contactInfo: ContactInfoSchema
        companyName: String
    }
`

const inputSchema = `
    input LogoInput {
        base64: String!
        size: Int!
    }
    input availableSocialMediaInput {
        socialMedia: String!
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
        availableSubCategory: [String!]!
    }
`

const responseSchema = `
    type createOfficialSchemaResponse {
        message: String!
        status: Int!
        data: Official
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
            getALl : String!
        }
        type Mutation {
            createOfficialData (data: createOfficialInput) : createOfficialSchemaResponse
        }
    `
)

module.exports = mainSchema