const {
    createNewOfficialSchemaController,
    addMainCategoryOrSubCategoryController,
    addContactSocialMediaOfOfficial,
    addNavbarCategoryOrUpdateNavbarCategory,
    getAllOfficialInfoController,
    uploadOrUpdateCompanyLogoController,
    testing
} = require('./controller')

const resolver = {
    createOfficialData: createNewOfficialSchemaController,
    addMainOrSubCategory: addMainCategoryOrSubCategoryController,
    addOrUpdateContactSocialMedia : addContactSocialMediaOfOfficial,
    addNavbarCategory: addNavbarCategoryOrUpdateNavbarCategory,
    getOfficialInfo: getAllOfficialInfoController,
    uploadLogo: uploadOrUpdateCompanyLogoController,
    test: testing
}

module.exports = resolver