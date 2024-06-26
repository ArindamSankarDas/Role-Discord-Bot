class BaseError extends Error {
  constructor(name, description) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.description = description;

    Error.captureStackTrace(this);
  }
}

class ChannelError extends BaseError {
  constructor(name, description, channelName) {
    super(name, description);

    this.channelName = channelName;
  }
}

class MessageError extends BaseError {
  constructor(
    name,
    description,
    messageId,
    messageContent,
    channelName = undefined
  ) {
    super(name, description);

    this.messageId = messageId;
    this.messageContent = messageContent;

    channelName ? (this.channelName = channelName) : null;
  }
}

class ReactionError extends BaseError {
  constructor(name, description, messageId, channelId, reactionEmoji, userId) {
    super(name, description);

    this.messageId = messageId;
    this.channelId = channelId;
    this.reactionEmoji = reactionEmoji;
    this.userId = userId;
  }
}

module.exports = { BaseError, ChannelError, MessageError, ReactionError };
