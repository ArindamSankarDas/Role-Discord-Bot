// Custom error object module
const { logError } = require("./errorLogger");
const {
  ChannelError,
  BaseError,
  MessageError,
  ReactionError,
} = require("./errorObject");

// Handles channel operation errors
const channelHandler = (asyncCallback) => (channel) =>
  asyncCallback(channel).catch(async (error) => {
    await logError(error.name, error);

    throw new ChannelError(error.name, error.message, channel.name);
  });

// Handles message operation errors
const messageHandler = (asyncCallback) => (message) =>
  asyncCallback(message).catch(async (error) => {
    await logError(error.name, error);

    throw new MessageError(
      error.name,
      error.message,
      message.id,
      message.content
    );
  });

// Handles reactions operation errors
const reactionHandler = (asyncCallback) => (reaction, user) => {
  asyncCallback(reaction, user).catch(async (error) => {
    await logError(error.name, error);

    throw new ReactionError(
      error.name,
      error.message,
      reaction.message.id,
      reaction.message.channelId,
      reaction.emoji.name,
      user.id
    );
  });
};

// Handles general/common operation errors
const generalHandler = (asyncCallback) => (member) => {
  asyncCallback(member).catch(async (error) => {
    await logError(error.name, error);

    throw new BaseError(error.name, error.message);
  });
};

module.exports = {
  channelHandler,
  generalHandler,
  messageHandler,
  reactionHandler,
};
