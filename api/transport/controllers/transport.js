'use strict';
const _ = require('lodash');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    findSchedule: async(ctx) =>{
        console.log("In findSchedule", ctx.query);
        const schedDetails = await strapi.services.transport.find(ctx.query);
        const entity = _.first(schedDetails) || null;

        let entry;
        var vehicleList = [];
        const vehiclesDB = await strapi.services.vehicle.find();
        for (let i in vehiclesDB){
            console.log("Each Vehicle ID: ", vehiclesDB[i]._id);
            var comp = {
                vehicle:vehiclesDB[i]._id,
                availability:"available"
            }
            vehicleList.push(comp);
        }
        console.log("LIST ADDED: ", vehicleList);
        if(!entity){
            const createTransport = await strapi.services.transport.create(ctx.query);
            console.log("Create: ", createTransport);  
            entry = await strapi.services.transport.update({id: createTransport._id},{vehicle:vehicleList});
            console.log("Entry create: ", entry); 
        }else{
            entry = schedDetails;
        }
        console.log("Entry: ", entry);
        
        
        return entry;
    }
};
