const { ChannelAsyncError } = require("./errorHandler");

exports.channelAsyncErrorHandler = (asyncCallback) => (channel) =>
  asyncCallback(channel).catch((error) => {
    throw new ChannelAsyncError(error.name, error.message, channel.name);
  });

exports.generalAsyncErrorHandler = (asyncCallback) => (member) => {
  asyncCallback(member).catch((error) => {
    console.error(`Error occured here: ${error}`);
  });
};
