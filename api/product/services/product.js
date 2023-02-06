'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    findSapCode: async (ctx) => {
        console.log("Product Code: ", ctx);
        var data = {};
        const product = await strapi.services.product.findOne({productCode: ctx});      
        if(product){
            data = {
                id: product._id,
                productCode: product.productCode,
                productDescription: product.productDescription,
                shortDescription: product.shortDescription
            };
        }
        else{
            data = {
                id: "",
                productCode: ctx,
                productDescription: "Doesn't exist in current product. Double check product code "+ ctx,
                shortDescription: ""
            }
        }
        
        return data;  
        
    }

};
