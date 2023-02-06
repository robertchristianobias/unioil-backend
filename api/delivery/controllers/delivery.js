'use strict';
const { default: createStrapi } = require('strapi');
const { sanitizeEntity } = require('strapi-utils');
const order = require('../../order/controllers/order');
var randomize = require('randomatic');
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    
    create: async(ctx) =>{
        const deliveries = ctx.request.body;
        var data = {};
        var orders = [];
        var data = {
            orders: deliveries.orders,
            tripDetails: deliveries.tripDetails,
            vehicle: deliveries.vehicle,
            status: deliveries.status
        }
        var randomVar="";
        const det= await strapi.services.delivery.create(data);
        console.log("DELIVERY  DETAILS: ", det.tripDetails[0]);
        for(let i in det.tripDetails){
            console.log("DET  DETAILS: ", det.tripDetails[0]);
            console.log("Trip Details Count: ", i);
            const customerDetails = await strapi.services.customer.findOne({_id: det.tripDetails[i].order.customer}, []);
            if(deliveries.vehicle !== null){
                if(i<1){
                    randomVar = "TSS"+randomize('0', 10);
                }
                await strapi.services.order.update({id: det.tripDetails[i].order.id}, {shipmentId: randomVar})
            }
            det.tripDetails[i].customer={
                customerName1: customerDetails.customerName1,
                street: customerDetails.street,
                city: customerDetails.city
            }
            var order ={
                status: det.tripDetails[i].status,
                id: det.tripDetails[i]._id,
                productDetails: det.tripDetails[i].productDetails,
                shipmentId: randomVar,
                customer:{
                    customerName1: customerDetails.customerName1,
                    customerCode: customerDetails.customerCode,
                    contactNo1:customerDetails.contactNo1,
                    street: customerDetails.street,
                    city: customerDetails.city,
                    destinationRef: customerDetails.zone
                    
                }
            }; 
            orders.push(order);
        }
        var deliveryDetails = {
            id: det.id,
            shipmentId: randomVar,
            orders: orders,
            vehicle:det.vehicle,
            status: det.status,
            tripDetails: det.tripDetails
            
        }
        return deliveryDetails;
    },
    
    find: async(ctx) =>{
        var dets = [];
        const deliveries = await strapi.services.delivery.find();
        
        for(let i in deliveries){
            for(let j in deliveries[i].tripDetails){     
                const customerDetails = await strapi.services.customer.findOne({_id: deliveries[i].tripDetails[j].order.customer}, []);
                if(typeof customerDetails.customerName1 !=='undefined' ){
                    deliveries[i].tripDetails[j].customerDetails ={
                            customerName1: customerDetails.customerName1,
                            customerCode: customerDetails.customerCode,
                            contactNo1:customerDetails.contactNo1, //TODO add contact detail1, 
                            street: customerDetails.street,
                            city: customerDetails.city,
                            destinationRef: customerDetails.zone
                    };  
            }
        }
        if(typeof deliveries[i].vehicle !=='undefined' ){
            if(typeof deliveries[i].vehicle.contractor !=='undefined' ){
                const contractorDetails = await strapi.services.contractor.findOne({_id: deliveries[i].vehicle.contractor}, []);
                deliveries[i].vehicle.contractorDetails={
                    contractorCode: contractorDetails.contractorCode,
                    contractorName:contractorDetails.displayName //TODO add contact detail1, 
            }

           }else{
            console.log("Contractor Details not available"); 
           }
        }
        
            var deliveryDetails = {
                status: deliveries[i].status,
                id: deliveries[i].id,
                // orders: deliveries[i].orders,
                vehicle:deliveries[i].vehicle,
                tripDetails: deliveries[i].tripDetails,
                driver:deliveries[i].driver,
                etaChange: deliveries[i].etaChange, // TODO: Add string value person node
                remarks:deliveries[i].remarks
            } 
            dets.push(deliveryDetails);
        }
        
        return dets;
    },

    update: async(ctx) => {
        const details = ctx.request.body;
        const { id } = ctx.params;
        const deliveryDetail = await strapi.services.delivery.findOne({id: id});
        if(details.tripDetails !== null ){
            for(let i in details.tripDetails){
                console.log("TRIP Details: ", deliveryDetail);
                console.log("TRIP Count: ", deliveryDetail.tripDetails.length);
                if(typeof deliveryDetail.vehicle !== null && deliveryDetail.tripDetails.length>1)
                {
                    var shipId = deliveryDetail.tripDetails[i].order.shipmentId;
                    if(shipId !== null){
                        console.log("TRIP Copy ShipID: ");
                        await strapi.services.order.update({id: details.tripDetails[i].order}, {shipmentId: shipId})
                    }else{
                        console.log("TRIP RandomVar: ");
                        var randomVar = "TSS"+randomize('0', 10);
                        await strapi.services.order.update({id: details.tripDetails[i].order}, {shipmentId: randomVar});
                    }
                }else if(typeof details.vehicle === 'undefined' && deliveryDetail.vehicle === null){
                    
                        console.log("TRIP TSS number remove ");
                        await strapi.services.order.update({id: details.tripDetails[i].order}, {shipmentId: ""})
                    
                }
                else if(details.vehicle !== null){
                    console.log("TRIP Randomize TSS ");
                    var randomVar = "TSS"+randomize('0', 10);
                    await strapi.services.order.update({id: details.tripDetails[i].order}, {shipmentId: randomVar});
                }
               
            }
        }
        const det =  await strapi.services.delivery.update({id: id}, ctx.request.body);
        for(let i in det.tripDetails){
            console.log("DET  DETAILS: ", det.tripDetails[0]);
            console.log("Trip Details Count: ", i);
            const customerDetails = await strapi.services.customer.findOne({_id: det.tripDetails[i].order.customer}, []);
            det.tripDetails[i].customer={
                customerName1: customerDetails.customerName1,
                street: customerDetails.street,
                city: customerDetails.city
            }
        }
        return det;
    },
    assignProductCompartment: async(ctx) =>{
        const details = ctx.request.body;
        const { id } = ctx.params;
        console.log("ID: ", id);
        const deliveryDetail = await strapi.services.delivery.findOne({id: id});
        var totalVolume = 0;
        var percentCap = 0;
        var orderProducts = [];
        var orderVolumeList = [];
        var orderIdList = [];
        var productNameList = [];
        var vehicleVolumeList = deliveryDetail.vehicle.comparmentCapacity;
        var mocaList = [];
        console.log("Vehicle compartment: ", vehicleVolumeList);

        for (let j in deliveryDetail.tripDetails){
            //console.log("Order: ", deliveryDetail.tripDetails[j].order);
            const orderDet = deliveryDetail.tripDetails[j].order; 
            for (let k in orderDet.productDetails){
                console.log("Product Volume: ", orderDet.productDetails[k].volume);
                orderVolumeList.push(Number(orderDet.productDetails[k].volume));
                orderIdList.push(deliveryDetail.tripDetails[j].order._id); // or just _id
                productNameList.push(orderDet.productDetails[k].productCode);
                totalVolume+=Number(orderDet.productDetails[k].volume);
                console.log("Product VolumeList: ", orderVolumeList);
                console.log("Product OrderIdList: ", orderIdList);
                console.log("Product Name List: ", productNameList);
            }
        }
        
        for (let i in vehicleVolumeList){
            console.log("Each Compartment: ", vehicleVolumeList[i]);
            console.log("Each Order Volume: ", orderVolumeList);
            var comp ={
                vehicleVolumeCap: vehicleVolumeList[i]
            }
            if(vehicleVolumeList[i]==orderVolumeList){
                comp ={
                    vehicleVolumeCap: vehicleVolumeList[i],
                    order: orderIdList[0],
                    productShortDescription: productNameList[0],
                    orderVolume: orderVolumeList[0]
                }
                console.log("Same volume");
                orderVolumeList.shift();
                orderIdList.shift();
                productNameList.shift();
                console.log("Product volume list after: ", orderVolumeList);
            }
            mocaList.push(comp);
        }

       
        console.log("ORDER LIST: ", orderProducts);
        const vehicle = await strapi.services.vehicle.findOne({_id: details.vehicle});
        console.log("Vehicle: ", vehicle.comparmentCapacity);
        console.log("Total total: ", totalVolume);
        console.log("Dead Freight: ", vehicle.deadFreightVol);
        percentCap = (totalVolume/Number(vehicle.deadFreightVol))*100; // total truck capacity vehicle
        console.log("Percent: ", percentCap);
        const compartment = vehicle.comparmentCapacity;
        let intersection = compartment.filter(x => orderProducts.includes(x));
        let excludedProduct = compartment.filter(x => !orderProducts.includes(x));
        let availableCompartment =orderProducts.filter(x => !compartment.includes(x));
        const data = {
            totalOrderVolume: totalVolume,
            deadFreightVol: vehicle.deadFreightVol,
            percentCapacity: percentCap,
            orderProducts: orderProducts,
            compartmentCapacity: vehicle.comparmentCapacity,
            hold: intersection,
            availableCompartment: excludedProduct,
            excludedProduct: availableCompartment
        }
        //return data;
        var moca = {
            compartmentDetails: mocaList
        }
        await strapi.services.delivery.update({id: id}, moca);
        return moca;
    },
    manuallyAssignToCompartment: async(ctx) =>{
        const details = ctx.request.body;
        const { id } = ctx.params;
        const deliveryDetail = await strapi.services.delivery.findOne({id: id});
        console.log("Delivery Detail Vehicle Compartment : ", deliveryDetail.vehicle.comparmentCapacity);
        for(let i in deliveryDetail.vehicle.comparmentCapacity){
            console.log("Length compartment: ", details.compartmentDetails.length);
            console.log("Delivery Detail Vehicle Compartment : ", deliveryDetail.vehicle.comparmentCapacity[i]);
            if(i < details.compartmentDetails.length){
                console.log("Each compartment: ", (typeof details.compartmentDetails[i].order !== "undefined") ? details.compartmentDetails[i].order:'');
            }
            if(i < details.compartmentDetails.length){
                details.compartmentDetails[i]={
                    order: (typeof details.compartmentDetails[i].order !== "undefined") ? details.compartmentDetails[i].order:null,
                    productShortDescription: (typeof details.compartmentDetails[i].productShortDescription !== "undefined") ? details.compartmentDetails[i].productShortDescription:'',
                    orderVolume: (typeof details.compartmentDetails[i].volume !== "undefined") ? Number(details.compartmentDetails[i].volume):0,
                    drop: (typeof details.compartmentDetails[i].drop !== "undefined") ? Number(details.compartmentDetails[i].drop):0,
                    vehicleVolumeCap: Number(deliveryDetail.vehicle.comparmentCapacity[i])
                }
            }else{
                details.compartmentDetails[i]={
                    vehicleVolumeCap: Number(deliveryDetail.vehicle.comparmentCapacity[i])
                }
            }
        }
        console.log("Details: ", details);
        const det =  await strapi.services.delivery.update({id: id}, details);
        return det.compartmentDetails;
    }
};
