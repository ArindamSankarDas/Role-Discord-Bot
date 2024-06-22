class BaseAsyncError extends Error {
  constructor(name, description) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.description = description;

    Error.captureStackTrace(this);
  }
}

class ChannelAsyncError extends BaseAsyncError {
  constructor(name, description, channelName) {
    super(name, description);

    this.channelName = channelName;
  }
}

module.exports = { BaseAsyncError, ChannelAsyncError };
