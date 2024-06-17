const http = require("node:http");

const { Events, Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  if (message.content === "hello" || "hi") {
    message.channel.send("Welcome to the server " + message.author.username);
  }
});

client
  .login(process.env.APP_TOKEN)
  .then(() => {
    client.once(Events.ClientReady, (readyClient) => {
      console.log(`Ready! Logged in as ${readyClient.user.tag}`);

      http.createServer().listen(3500, () => {
        console.log("Server has started running on port 3500");
      });
    });
  })
  .catch((err) => {
    console.error(err);
  });
