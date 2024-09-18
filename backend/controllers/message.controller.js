import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { recieverId } = req.params;
    const senderId = req.user.userId;
    const { message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recieverId],
      });
    }

    const newMessage = await Message.create({ senderId, recieverId, message });
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    // implement socket io for real time data transfer
    return res
      .status(200)
      .json(new ApiResponse(true, "Message sent", newMessage));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { recieverId } = req.params;
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, recieverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json(new ApiResponse(true, "", { messages: [] }));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "message fetched", conversation?.messages));
  } catch (error) {
    next(error);
  }
};
