const { Events, Client, GatewayIntentBits } = require("discord.js");

const {
  channelAsyncErrorHandler,
  generalAsyncErrorHandler,
} = require("./utility/asyncErrorHandlers");
const { BaseAsyncError } = require("./utility/errorHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/* message creations */

// Welcome the user to the server
client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  const roles = message.member.roles.cache.map((role) =>
    role.name.toLowerCase()
  );

  const regex = /\b(hi|hello)\b/i;

  if (regex.test(message.content)) {
    if (roles.includes("moderator")) return;

    message.channel.send("Welcome to the server " + message.author.username);
  }
});

// Delete all messages from the server
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const roles = message.member.roles.cache.map((role) =>
    role.name.toLowerCase()
  );

  if (message.content === "!delete") {
    if (!roles.includes("moderator")) {
      return message.reply(`You are not authorised to execute this command`);
    }

    message.guild.channels.cache.forEach(
      channelAsyncErrorHandler(async (channel) => {
        if (channel.isTextBased()) {
          let fetched;

          do {
            fetched = await channel.messages.fetch({ limit: 100 });

            for (const msg of fetched.values()) {
              await msg.delete().catch((error) => {
                if (error.code !== 10008) {
                  console.log(
                    `Could not delete message ${msg.id} in ${channel.name}: `
                  );

                  throw new BaseAsyncError(error.name, error.message);
                }
              });
            }
          } while (fetched.size >= 2);

          console.log("All messages deleted.");
        }
      })
    );
  }
});

// Add User role to the new member
client.on(
  Events.GuildMemberAdd,
  generalAsyncErrorHandler(async (member) => {
    const guild = member.guild;

    const role = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === "user"
    );

    if (role) {
      await member.roles.add(role);
      console.log(`Added role ${role.name} to ${member.user.tag}`);
    } else {
      console.log(`Role ${ROLE_NAME} not found.`);
    }
  })
);

// login
client.login(process.env.APP_TOKEN);
