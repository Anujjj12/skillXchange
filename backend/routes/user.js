const express = require("express");
const User = require("../models/User");
const Message = require('../models/Message');
const authMiddleware = require("../middleware/authMiddleware");
const ConnectionRequest = require("../models/ConnectionRequest");
const Subscription = require("../models/Subscription");
const Notification = require("../models/Notification");
const router = express.Router();

router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user._id);
    if (!loggedInUser)
      return res.status(404).json({ message: "User not found" });

    const allUsers = await User.find({ _id: { $ne: req.user._id } }).select();

    const suggestions = allUsers.filter(
      (user) =>
        user.skillsHave.some((skill) =>
          loggedInUser.skillsWant.includes(skill)
        ) &&
        user.skillsWant.some((skill) => 
            loggedInUser.skillsHave.includes(skill)
        )
    );

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/connect/request", async (req, res) => {
  const { senderId, receiverId } = req.body;
  
  try{

    const sender = await User.findById(senderId);
    const activeSubscriptionPlan = await Subscription.findOne({userId: senderId, status: "active"});

    if(sender.freeConnectionLeft <= 0 && !activeSubscriptionPlan){
      return res.status(403).json({ message: "Free tier used. Purchase a plan to continue"});
    }

    const existingUser = await ConnectionRequest.findOne({
      senderId,
      receiverId,
      status : "pending",
    })
    if(existingUser){
      return res.status(400).json({message : "Connection request already sent"})
    }

    const newRequest = new ConnectionRequest({ senderId, receiverId });
    await newRequest.save();
    
    res.status(200).json({ message: "Connection request sent" });

  }catch(e){
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
})

router.post("/connect/accept", async (req, res) => {
  const { senderId, receiverId } = req.body;
  
  try{

    const request = await ConnectionRequest.findOne({ senderId, receiverId, status : "pending" });
    if(!request) return res.status(404).json({message : "Request not found"});

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if(!sender || !receiver){
      return res.status(404).json({ message: "User not found" });
    }

    const senderSubscription = await Subscription.findOne({
      userId: senderId,
      status: "active",
    });

    const receiverSubscription = await Subscription.findOne({
      userId: receiverId,
      status: "active",
    });

    if (
      (!senderSubscription && sender.freeConnectionLeft <= 0) ||
      (!receiverSubscription && receiver.freeConnectionLeft <= 0)
    ) {
      return res
        .status(403)
        .json({ message: "One or both users have no connections left" });
    }

    if(
      (senderSubscription && senderSubscription.connectionsLeft <= 0) || 
      (receiverSubscription && receiverSubscription.connectionsLeft <= 0)
    ){
      return res
        .status(403)
        .json({ message: "One or both users have reached their limit" });
    }

    if (!senderSubscription) {
      sender.freeConnectionLeft -= 1;
      console.log(sender.freeConnectionLeft)
      await sender.save();
    } else {
      senderSubscription.connectionsLeft -= 1;
      await senderSubscription.save();
    }

    if (!receiverSubscription) {
      receiver.freeConnectionLeft -= 1;
      await receiver.save();
    } else {
      receiverSubscription.connectionsLeft -= 1;
      await receiverSubscription.save();
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json({ message: "Connection request accepted" });

  }catch(e){
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
})

router.post("/connect/reject", async (req, res) => {
  const { senderId, receiverId } = req.body;
  
  try{
    const request = await ConnectionRequest.findOne({ senderId, receiverId, status : "pending" });
    if(!request) return res.status(404).json({message : "Request not found"});

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Connection request rejected" });

  }catch(e){
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
})

router.get("/request/status", async (req, res) => {
  const { senderId, receiverId } = req.query;

  try{
    let request = await ConnectionRequest.findOne({ senderId, receiverId });
    if(!request){
      request = await ConnectionRequest.findOne({ senderId: receiverId, receiverId: senderId });
    }

    if(!request) return res.status(404).json({message : "Request not found"});

    if (request.status === "pending") {
      if (request.senderId.toString() === senderId) {
        return res.status(200).json({ status: "pending" }); // Sender sees "Request Sent"
      } else {
        return res.status(200).json({ status: "received" }); // Receiver sees "Accept/Reject"
      }
    }
    
    return res.status(200).json({status : request.status});
  }catch(e){
    console.log("Error in fetching request status", e);
    res.status(500).json({ message: "Error in fetching request status" });
  }
})

router.post("/notifications", async(req, res) => {
  const { senderId, receiverId, senderName, senderEmail, message } = req.body;

  try{
    const newNotification = new Notification({
      senderId,
      receiverId,
      senderName,
      senderEmail,
      message,
    })
    await newNotification.save();
    res.status(201).json({success: true, message : "Notificaation Sent"});
  }
  catch(error){
    res.status(500).json({ error : "Error in sending notification" });
  }
})

router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try{
    const notifications = await Notification.find({ receiverId: userId, isSeen: false }).sort({ createdAt : -1 });

    res.status(200).json({ success: true, notifications });
  }
  catch(error){
    res.status(500).json({ error : "Error in fetching notifications"});
  }
})

router.post('/notifications/read/', async (req, res) => {
  const { notificationId } = req.body;

  try{
    if(!notificationId){
      return res.status(400).json({ error: "Notification ID is required" });
    }
  
    await Notification.findByIdAndUpdate(notificationId, { isSeen : true });
    res.status(200).json({ success: true, message: "Notification marked as read!" });

  }
  catch(error){
    res.status(500).json({ error : "Error in marking notification as read" })
  }
})

router.get('/search/:userId/:skill', async (req, res) => {
  const { userId, skill } = req.params;

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userHasSkills = currentUser.skillsHave || [];

    const matches = await User.find({
      _id: { $ne: userId }, 
      skillsHave: { $in: [skill] },
      skillsWant: { $in: userHasSkills },
    });

    res.status(200).json(matches);
  } catch (err) {
    console.error("Error matching users:", err);
    res.status(500).json({ error: "Server error during matching" });
  }
});

router.get('/skills/unique/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userSkills = currentUser.skillsWant || [];

    res.status(200).json(userSkills);
  } catch (err) {
    console.error("Error fetching unique skills:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/getusers", authMiddleware, async (req, res) => {
    try {
        const loggedInUserId = req.userId; 
        
        const users = await User.find(
            { _id: { $ne: loggedInUserId } },
            "name email skillsHave skillsWant"
        );

        const unreadSenders = await Message.distinct("sender", {
            receiver: loggedInUserId,
            isRead: false
        });

        const unreadSendersSet = new Set(unreadSenders.map(id => id.toString()));

        const usersWithUnreadFlags = users.map(user => ({
            ...user.toObject(),
            hasUnreadMessages: unreadSendersSet.has(user._id.toString())
        }));

        res.status(200).json(usersWithUnreadFlags);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
