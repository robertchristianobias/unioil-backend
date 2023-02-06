'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    findSapCode: async (ctx) => {
        const { productCode } = ctx.params.productCode;
        console.log("Product Code: ", productCode);
        const product = await strapi.services.product.findOne({productCode: productCode});
        const productId =product._id;
        return productId;  
    }
};
