'use strict';
const _ = require('lodash');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    driverFindSchedule: async(ctx) =>{
        console.log("Driver Find Schedule", ctx.query);
        const schedDetails = await strapi.services['driver-availability'].find(ctx.query);
        const entity = _.first(schedDetails) || null;

        let entry;
        var driverList =[];
        const driversDB = await strapi.services.driver.find();
        for (let i in driversDB){
            console.log("Each Driver ID", driversDB[i]._id);
            var comp = {
                driver:driversDB[i]._id
            }
            driverList.push(comp);
        }
        console.log("List Added: ", driverList);
        if(!entity){
            const createDriverSchedule = await strapi.services['driver-availability'].create(ctx.query);
            console.log("Create: ", createDriverSchedule);
            entry = await strapi.services['driver-availability'].update({id: createDriverSchedule},{schedule:driverList});
            console.log("Entry create: ", entry);
        }else{
            entry = schedDetails;
        }
        console.log("Entry: ", entry);
        return entry;
    }
};
