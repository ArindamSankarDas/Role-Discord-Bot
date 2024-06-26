// discord.js Lib
const {
  Events,
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
} = require("discord.js");

// Async Error Handler
const asyncErrorHandler = require("./utility/asyncErrorHandlers");

// Custom Error constructors
const { MessageError } = require("./utility/errorObject");

// Roles availabe in the server
const serverRoles = {
  "💚": "Beginner",
  "🧡": "Intermediate",
  "❤️": "Advanced",
  moderator: "Moderator",
  user: "User",
};

// All the channel Ids available in the server
const channelsId = {
  welcomeChannel: "1254789776008282142",
  generalChannel: "1244578775203844130",
};

// New client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Logs info when the client gets signed in
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

/* message creations */
// Delete all messages from the server
client.on(
  Events.MessageCreate,
  asyncErrorHandler.generalHandler(async (message) => {
    if (message.author.bot) return;

    if (message.channelId === welcomeChannel) return;

    const roles = message.member.roles.cache.map((role) => role.name);

    if (message.content === "!delete") {
      if (!roles.includes(serverRoles.moderator)) {
        return message.reply(`You are not authorised to execute this command`);
      }

      message.guild.channels.cache.forEach(
        asyncErrorHandler.channelHandler(async (channel) => {
          if (channel.isTextBased()) {
            let fetched;

            do {
              fetched = await channel.messages.fetch({ limit: 100 });

              for (const msg of fetched.values()) {
                await msg.delete().catch((error) => {
                  if (error.code !== 10008) {
                    throw new MessageError(
                      error.name,
                      error.message,
                      msg.id,
                      msg.content,
                      channel.name
                    );
                  }
                });
              }
            } while (fetched.size >= 2);

            console.log("All messages deleted.");
          }
        })
      );
    }
  })
);

/* User joins the server */
// Add User role to the new member who joins the server
client.on(
  Events.GuildMemberAdd,
  asyncErrorHandler.generalHandler(async (member) => {
    const guild = member.guild;

    const role = guild.roles.cache.find(
      (role) => role.name === serverRoles.user
    );

    if (role) {
      await member.roles.add(role);
      console.log(`Added role ${role.name} to ${member.user.tag}`);
    } else {
      console.log(`Role ${ROLE_NAME} not found.`);
    }
  })
);

// Create an embeded message with role selection
client.on(
  Events.MessageCreate,
  asyncErrorHandler.messageHandler(async (message) => {
    if (message.channelId !== channelsId.welcomeChannel) return;

    if (message.content === "!setupRoles") {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Choose Your Roles!").setDescription(`
        💚 - Beginner
        🧡 - Intermediate
        ❤️ - Advanced

        *(ps: you can select more than one role, but avoid doing so)*
      `);

      const roleMessage = await message.channel.send({ embeds: [embed] });
      await roleMessage.react("💚");
      await roleMessage.react("🧡");
      await roleMessage.react("❤️");
    }
  })
);

// Add reactions to add roles to the Members on clicking
client.on(
  Events.MessageReactionAdd,
  asyncErrorHandler.reactionHandler(async (reaction, user) => {
    if (user.bot) return;

    if (reaction.message.channelId !== channelsId.welcomeChannel) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        return;
      }
    }

    const roleId = serverRoles[reaction.emoji.name];

    if (!roleId) return;

    const guild = reaction.message.guild;
    const role = guild.roles.cache.find((r) => r.name === roleId);

    if (!role) return;

    const member = await guild.members.fetch(user.id);

    await member.roles.add(role);
  })
);

// Remove reactions to remove roles from the Members on clicking
client.on(
  Events.MessageReactionRemove,
  asyncErrorHandler.reactionHandler(async (reaction, user) => {
    if (user.bot) return;

    if (reaction.message.channel.id !== channelsId.welcomeChannel) return;

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("Something went wrong when fetching the message:", error);
        return;
      }
    }

    const roleId = serverRoles[reaction.emoji.name];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const role = guild.roles.cache.find((r) => r.name === roleId);

    if (!role) return;

    const member = await guild.members.fetch(user.id);
    await member.roles.remove(role);
  })
);

// login
client.login(process.env.APP_TOKEN);
