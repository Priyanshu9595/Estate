const Groq = require('groq-sdk');
const User = require('../models/User');
const Property = require('../models/Property');
const Unit = require('../models/Unit');
const Lease = require('../models/Lease');
const Rent = require('../models/Rent');
const Maintenance = require('../models/Maintenance');

let groq;

const handleChat = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'GROQ_API_KEY not found in server environment' });
    }
    if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const userRole = req.user.role;
    let contextData = {};

    if (userRole === 'User') {
      const lease = await Lease.findOne({ user_id: req.user._id, status: 'Active' })
        .populate('property_id')
        .populate('unit_id')
        .lean();
      const maintenance = await Maintenance.find({ user_id: req.user._id }).lean();
      contextData = {
        role: 'User (Tenant)',
        profile: { name: req.user.name, email: req.user.email },
        activeLease: lease,
        maintenanceRequests: maintenance
      };
    } else if (userRole === 'Admin') {
      const properties = await Property.find({ assigned_admin_id: req.user._id }).lean();
      const propIds = properties.map(p => p._id);
      const units = await Unit.find({ property_id: { $in: propIds } }).lean();
      const leases = await Lease.find({ property_id: { $in: propIds } }).populate('user_id', 'name email phone').lean();
      const maintenance = await Maintenance.find({ property_id: { $in: propIds } }).lean();
      contextData = {
        role: 'Admin',
        profile: { name: req.user.name, email: req.user.email },
        assignedProperties: properties,
        units,
        leases,
        maintenanceRequests: maintenance
      };
    } else if (userRole === 'Owner') {
      const properties = await Property.find().lean();
      const units = await Unit.find().lean();
      const leases = await Lease.find().populate('user_id', 'name email phone').lean();
      const maintenance = await Maintenance.find().lean();
      const admins = await User.find({ role: 'Admin' }, 'name email phone').lean();
      contextData = {
        role: 'Owner',
        profile: { name: req.user.name, email: req.user.email },
        allProperties: properties,
        allUnits: units,
        allLeases: leases,
        allMaintenanceRequests: maintenance,
        allAdmins: admins
      };
    }

    const systemPrompt = `You are a smart, helpful AI assistant for EstateFlow (a property management app). 
The user interacting with you is logged in as: ${contextData.role}.
Here is their specific database context in JSON format:
${JSON.stringify(contextData)}

STRICT RULES:
1. ONLY answer questions using the provided context. If the user asks about properties, users, or data NOT in this context, politely say you don't have access or they don't have permission.
2. If the user is a 'User', DO NOT provide admin or owner level details (like total revenue, other tenants' info).
3. If the user is an 'Admin', do not provide information about properties they are not assigned to.
4. Keep your responses concise, well-formatted, and professional. Use markdown if helpful.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant', 
    });

    res.json({ reply: chatCompletion.choices[0]?.message?.content || "No response" });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Failed to process chat request' });
  }
};

module.exports = { handleChat };
