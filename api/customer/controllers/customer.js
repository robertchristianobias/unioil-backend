'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    findSapCode: async (ctx) => {
        console.log("CTX: ", ctx.params.customerCode);
        const { customerCode } = ctx.params.customerCode;
        
        const customer = await strapi.services.customer.findOne({customerCode: customerCode}, []);
        const customerId =customer._id;
        return customerId;  
    }
}; 