import {
    base
} from '../../../utils/base.js'
class more extends base {
    constructor() {
        super();
    };

    cancalBindFood(param, callback) {
        let that = this;
        let allParams = {
            url: "unbindAndOpenOne",
            type: "POST",
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        };
        this.request(allParams);
    }

    openAllCab(param, callback) {
        let that = this;
        let allParams = {
            url: "openAll",
            type: "POST",
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        };
        this.request(allParams);
    }

    hotOrCancerHot(param, callback) {
        let that = this;
        let allParams = {
            url: "heatOrColdAll",
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
    more
}