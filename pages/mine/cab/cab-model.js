 import {
     base
 } from '../../../utils/base.js'
 class cab extends base {
     constructor() {
         super();
     };

     getDeviceNumByUserCode(param, callback) {
         let that = this;
         let allParams = {
             url: "getDeviceNumByUserCode",
             type: "get",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     }

     sendTemplate(param, callback) {
         let that = this;
         let allParams = {
             url: "takeUserGetFood",
             type: "post",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     };

     getGrids(param, callback) {
         let that = this;
         let allParams = {
             url: "selectCabinetNumByDeviceNum",
             type: "get",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     };

     openCab(param, callback) {
         let that = this;
         let allParams = {
             url: "saveFoodAndOpenCabinet",
             type: "POST",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     };

     cancalHot(param, callback) {
         let that = this;
         let allParams = {
             url: "cancelHeatOne ",
             type: "POST",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     };

     addHot(param, callback) {
         let that = this;
         let allParams = {
             url: "heatOne ",
             type: "POST",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     };

     actionOpenCab(param, callback) {
         let that = this;
         let allParams = {
             url: "openOne",
             type: "POST",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     };

     bindFood(param, callback) {
         let that = this;
         let allParams = {
             url: "saveCabinetMobile",
             type: "POST",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     }

     takeMeal(param, callback) {
         let that = this;
         let allParams = {
             url: "deliveryGetFood",
             type: "POST",
             data: param,
             sCallback: function(data) {
                 callback && callback(data);
             },
             eCallback: function() {}
         };
         this.request(allParams);
     }



 }
 export {
     cab
 }