const message = { _id: String, message: String, name: String };
const newMessage = {
  _id: String,
  message: String,
  messageType: String || Number,
  createdOn: Date,
  lastModified: Date,
  from: {_id:String, name:String},
  channel:{_id:String},
  isDeleted: Boolean,
  DeletedOn: Date, 
};
// unique id, created on, modified on/updated on, deleted(boolean)