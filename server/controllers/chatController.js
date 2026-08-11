import Groq from "groq-sdk";
import Conversation from "../models/Conversation.js";

const getGroqClient = () => {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

const systemPrompt = `
You are TREKMATE, a helpful travel and trekking assistant.

Give clear, practical and concise answers about:
- Trek planning and preparation
- Destinations and best travel seasons
- Packing, fitness and safety
- Budgets and suggested itineraries
- Responsible and eco-friendly travel

Reply in the same language style as the user, including Hindi,
English or Hinglish.

Never claim to have live information unless it was supplied to you.
For weather, route closures, permits, prices or emergency conditions,
tell the user to verify the latest information from official sources.
Do not replace professional medical or emergency advice.
`;

export const getChatHistory = async (
  req,
  res
) => {
  try {
    const conversation =
      await Conversation.findOne({
        user: req.user._id,
      }).lean();

    return res.status(200).json({
      success: true,
      messages: conversation?.messages || [],
    });
  } catch (error) {
    console.error(
      `Fetch chat history failed: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load chat history",
    });
  }
};

export const clearChatHistory = async (
  req,
  res
) => {
  try {
    await Conversation.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $set: {
          messages: [],
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error(
      `Clear chat history failed: ${error.message}`
    );

    return res.status(500).json({
      success: false,
      message: "Unable to clear chat history",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A message is required",
      });
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length > 4000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long",
      });
    }

    const conversation =
      await Conversation.findOne({
        user: req.user._id,
      }).lean();

    const safeHistory = (
      conversation?.messages || []
    )
      .slice(-10)
      .filter(
        (item) =>
          ["user", "assistant"].includes(
            item.role
          ) &&
          typeof item.content === "string"
      )
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 4000),
      }));

    const groq = getGroqClient();

    const completion =
      await groq.chat.completions.create({
        model:
          process.env.GROQ_MODEL ||
          "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...safeHistory,
          {
            role: "user",
            content: cleanMessage,
          },
        ],

        temperature: 0.5,
        max_completion_tokens: 800,
      });

    const reply =
      completion.choices[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        success: false,
        message:
          "The AI did not return a response",
      });
    }

    const now = new Date();

    await Conversation.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $setOnInsert: {
          user: req.user._id,
        },

        $push: {
          messages: {
            $each: [
              {
                role: "user",
                content: cleanMessage,
                createdAt: now,
              },
              {
                role: "assistant",
                content: reply,
                createdAt: now,
              },
            ],

            // Latest 40 messages database mein rakhenge
            $slice: -40,
          },
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error(
      `Groq request failed: ${error.message}`
    );

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI rate limit reached. Please try again shortly.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to get an AI response right now",
    });
  }
};