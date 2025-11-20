import express from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";

const router = express.Router();

// GET /api/campaigns → list all campaigns
router.get("/", async (req, res) => {
  try {
    const { status, city } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    if (city) {
      query.city = new RegExp(city, 'i'); // Case insensitive search
    }

    const campaigns = await Campaign.find(query).select('title description date location organizer email phone city targetDonors registeredDonors status bloodGroupsNeeded participants createdAt').sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/campaigns/:id → get single campaign
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/campaigns → create new campaign
router.post("/", async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      location, 
      organizer, 
      email, 
      phone, 
      city, 
      targetDonors, 
      bloodGroupsNeeded 
    } = req.body;

    if (!title || !description || !date || !location || !organizer || !email || !city) {
      return res.status(400).json({ 
        message: "Please provide all required fields: title, description, date, location, organizer, email, city" 
      });
    }

    const newCampaign = new Campaign({
      title,
      description,
      date: new Date(date),
      location,
      organizer,
      email,
      phone: phone || "",
      city,
      targetDonors: targetDonors || 50,
      registeredDonors: 0,
      status: "upcoming",
      bloodGroupsNeeded: bloodGroupsNeeded || ["All"]
    });

    const savedCampaign = await newCampaign.save();
    res.status(201).json({ 
      message: "Campaign created successfully!", 
      campaign: savedCampaign 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/campaigns/:id → update campaign
router.put("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({ 
      message: "Campaign updated successfully", 
      campaign 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/campaigns/:id → delete campaign
router.delete("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/campaigns/:id/join → join a campaign
router.post("/:id/join", async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required. Please login to join campaigns." });
    }

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Check if campaign is still accepting registrations
    if (campaign.status === "completed" || campaign.status === "cancelled") {
      return res.status(400).json({ 
        message: `Cannot join campaign. Campaign is ${campaign.status}.` 
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Convert userId to ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Initialize participants array if it doesn't exist
    if (!campaign.participants) {
      campaign.participants = [];
    }
    
    // Check if user is already registered (compare as strings)
    const isAlreadyJoined = campaign.participants.some(p => {
      const participantId = p._id ? p._id.toString() : p.toString();
      return participantId === userObjectId.toString();
    });
    
    if (isAlreadyJoined) {
      return res.status(400).json({ 
        message: "You are already registered for this campaign" 
      });
    }

    // Add user to participants and increment registeredDonors
    campaign.participants.push(userObjectId);
    campaign.registeredDonors = campaign.participants.length;

    await campaign.save();

    res.json({ 
      message: "Successfully joined the campaign! 🎉",
      campaign: {
        _id: campaign._id,
        title: campaign.title,
        registeredDonors: campaign.registeredDonors,
        targetDonors: campaign.targetDonors
      }
    });
  } catch (error) {
    console.error("Error joining campaign:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/campaigns/:id/participants → get campaign participants (optional)
router.get("/:id/participants", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('participants', 'name email bloodGroup city');
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({
      participants: campaign.participants || [],
      registeredDonors: campaign.registeredDonors || 0,
      targetDonors: campaign.targetDonors
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;