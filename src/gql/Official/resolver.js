const {
    createNewOfficialSchemaController,
    addMainCategoryOrSubCategoryController,
    addContactSocialMediaOfOfficial,
    addNavbarCategoryOrUpdateNavbarCategory,
    getAllOfficialInfoController,
    uploadOrUpdateCompanyLogoController
} = require('./controller')

const resolver = {
    createOfficialData: createNewOfficialSchemaController,
    addMainOrSubCategory: addMainCategoryOrSubCategoryController,
    addOrUpdateContactSocialMedia : addContactSocialMediaOfOfficial,
    addNavbarCategory: addNavbarCategoryOrUpdateNavbarCategory,
    getOfficialInfo: getAllOfficialInfoController,
    uploadLogo: uploadOrUpdateCompanyLogoController
}

module.exports = resolver