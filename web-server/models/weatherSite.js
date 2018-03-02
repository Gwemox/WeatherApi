'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BaseModel = require(__dirname + '/baseModel.js');

class WeatherSite extends BaseModel {
  constructor() {
    super();
    this.setFields({
        siteId: Number,
        openweathermap: Schema.Types.Mixed
    });
  }
}
// export the class
module.exports = WeatherSite;
