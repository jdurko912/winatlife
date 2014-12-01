'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
  name: { type: String, lowercase:  true, required: true, unique:  true },
  parent_name:  { type: String, lowercase:  true },
  attrs: [
    {
      name:  { type: String, required: true },
      points:  { type:  Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Event', EventSchema);