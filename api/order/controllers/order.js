'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
var randomize = require('randomatic');

module.exports = {
    uploadOrders: async(ctx) =>{
        const bulkOrder = ctx.request.body;
        var data = {};
        let orders = [];
        //let deliveryDetails = {};
        let shippingDetails = {};
        let checkOrder = {};
        var message = '';
        //try{
            for(let i in bulkOrder){
                for (let j in bulkOrder[i].productDetails){               
                    const product= await strapi.services.product.findSapCode(bulkOrder[i].productDetails[j].productCode);
                    bulkOrder[i].productDetails[j].product = {
                        id: product.id,
                        productCode: product.productCode,
                        productDescription: product.productDescription,
                        shortDescription: product.shortDescription,
                        sapLineItem: product.sapLineItem,
                        volume: bulkOrder[i].productDetails[j].volume,
                        remarks: bulkOrder[i].productDetails[j].remarks
                    }
                }
                shippingDetails = await strapi.services.plant.findOne({plantCode: bulkOrder[i].shippingPoint}, []);
                //deliveryDetails = await strapi.services.delivery.findOne({deliveryId: bulkOrder[i].deliveryId});
                //if(deliveryDetails === null){
                //    deliveryDetails = await strapi.services.delivery.create({deliveryId: bulkOrder[i].deliveryId})
                //}
                var customerSapId = await strapi.services.customer.findOne({customerCode: bulkOrder[i].customerCode}, []);
                if(customerSapId === null){
                    customerSapId = await strapi.services.customer.create({customerCode: bulkOrder[i].customerCode});
                }
                checkOrder = await strapi.services.order.findOne({orderId: bulkOrder[i].orderId}, []);
                    //var randomVar = "TSS"+randomize('0', 10);  
                    
                    data = {
                        orderId: bulkOrder[i].orderId,
                        deliveryNo: bulkOrder[i].deliveryId,
                        deliveryId: bulkOrder[i].deliveryId,
                        //shipmentId: randomVar,
                        //delivery: deliveryDetails.id ,
                        shippingPoint: bulkOrder[i].shippingPoint,
                        plantName: shippingDetails.plantName,
                        plantAddress: shippingDetails.address1,
                        customer: customerSapId,
                        productDetails: bulkOrder[i].productDetails,
                        remarks: bulkOrder[i].remarks,
                        addRemarks: bulkOrder[i].addRemarks,
                        date: bulkOrder[i].date,
                        status:"open"
                    }
                if (typeof data.customer.created_by !== 'undefined'){
                    delete data.customer.created_by;
                }
                if (typeof data.customer.updated_by !== 'undefined'){
                    delete data.customer.updated_by;
                }
                if (typeof data.customer.createdAt !== 'undefined'){
                    delete data.customer.createdAt;
                }
                if (typeof data.customer.updatedAt !== 'undefined'){
                    delete data.customer.updatedAt;
                }
                if (typeof data.customer.__v !== 'undefined'){
                    delete data.customer.__v;
                }
                if(checkOrder ){
                    data.message= "Duplicate";
                }
                if(checkOrder === null){
                    
                    const orderResult= await strapi.services.order.create(data);
                    data.id = orderResult.id;
                    data.message= "";
                }
                
                orders.push(data);
                
            }
            
            return orders;
        /*
        }catch(error){
            var err = {error: error.message};
            return err;
        }
        */

    },

    previewOrders: async(ctx) =>{
        const bulkOrder = ctx.request.body;
        var data = {};
        let orders = [];
        
        let shippingDetails = {};
        let checkOrder = {};
        var message = '';
        for(let i in bulkOrder){
            for (let j in bulkOrder[i].productDetails){               
                const product= await strapi.services.product.findSapCode(bulkOrder[i].productDetails[j].productCode);
                bulkOrder[i].productDetails[j].product = {
                    id: product.id,
                    productCode: product.productCode,
                    productDescription: product.productDescription,
                    shortDescription: product.shortDescription,
                    sapLineItem: product.sapLineItem,
                    volume: bulkOrder[i].productDetails[j].volume,
                    remarks: bulkOrder[i].productDetails[j].remarks
                }
            }
            checkOrder = await strapi.services.order.findOne({orderId: bulkOrder[i].orderId}, []);
            shippingDetails = await strapi.services.plant.findOne({plantCode: bulkOrder[i].shippingPoint}, []);
            var customerSapId = await strapi.services.customer.findOne({customerCode: bulkOrder[i].customerCode}, []);
            if(checkOrder ){
                message= "Duplicate";
            }
            if(checkOrder === null){
                message= "";
            }
            if(customerSapId === null){
                customerSapId = await strapi.services.customer.create({customerCode: bulkOrder[i].customerCode});
            }
            data = {
                orderId: bulkOrder[i].orderId,
                message: message,
                deliveryNo: bulkOrder[i].deliveryId,
                shippingPoint: bulkOrder[i].shippingPoint,
                plantName: shippingDetails.plantName,
                plantAddress: shippingDetails.address1,
                customer: customerSapId,
                productDetails: bulkOrder[i].productDetails,
                remarks: bulkOrder[i].remarks,
                addRemarks: bulkOrder[i].addRemarks,
                date: bulkOrder[i].date,
                status:"open"
            }

            if (typeof data.customer.created_by !== 'undefined'){
                delete data.customer.created_by;
            }
            if (typeof data.customer.updated_by !== 'undefined'){
                delete data.customer.updated_by;
            }
            if (typeof data.customer.createdAt !== 'undefined'){
                delete data.customer.createdAt;
            }
            if (typeof data.customer.updatedAt !== 'undefined'){
                delete data.customer.updatedAt;
            }
            if (typeof data.customer.__v !== 'undefined'){
                delete data.customer.__v;
            }
                 
            //const orderResult= await strapi.services.order.create(data);
            //data.id = orderResult.id;
            orders.push(data);       
        }
               
    
        return orders;
    },
    
    create: async(ctx) =>{
        const thisOrder = ctx.request.body;
        var data = {};
        var products =[];
        let order = [];

        for(let i in thisOrder.productDetails){
            const product= await strapi.services.product.findSapCode(thisOrder.productDetails[i].productCode);
            console.log("Product Result:", product);
            var productData = {
                id: product._id,
                productCode: product.productCode,
                productDescription: product.productDescription,
                shortDescription: product.shortDescription,
                volume: thisOrder.productDetails[i].volume,
                remarks: thisOrder.productDetails[i].remarks
            }
            products.push(productData);
        }

        if(thisOrder.customer._id)
        {
        const customerSapId = await strapi.services.customer.findOne({_id: thisOrder.customer._id}, []);
            
            data = {
               
                orderId: thisOrder.orderId,
                customer: customerSapId,
                productDetails: products,
                remarks: thisOrder.remarks,
                date: thisOrder.date,
                status:"open"
            }
            order = await strapi.services.order.create(data); 
        }
        if(thisOrder.customerCode)
        {
            const customerSapId = await strapi.services.customer.findOne({customerCode: thisOrder.customerCode}, []);
            data = {
               
                orderId: thisOrder.orderId,
                customer: customerSapId,
                productDetails: products,
                remarks: thisOrder.remarks,
                date: thisOrder.date,
                status:"open"
            }
            order = await strapi.services.order.create(data); 
        }

        return order;   
    },
    
    getstatus: async(ctx) =>{
        
        const { id } = ctx.params;
        
        const orderIdDetail = await strapi.services.order.findOne({id: id}, []);
        const orderStatus =`{"orderStatus": "${orderIdDetail.status}"}`;
        return orderStatus;  
    },  
};
