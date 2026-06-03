const User = require('../models/User');
const LessonBooking = require('../models/LessonBooking');
const ServiceRequest = require('../models/ServiceRequest');
const Instrument = require('../models/Instrument');

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ role: { $in: ['tutor', 'specialist'] }, isApproved: false });

    const bookings = await LessonBooking.find({ paymentStatus: 'completed' });
    const requests = await ServiceRequest.find({ status: 'completed' });
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.price || 0), 0) +
                         requests.reduce((sum, r) => sum + (r.serviceFee || 0), 0);

    const totalOrders = await LessonBooking.countDocuments();
    const pendingOrders = await LessonBooking.countDocuments({ paymentStatus: 'pending' });

    const totalInstruments = await Instrument.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usersToday = await User.countDocuments({ createdAt: { $gte: today } });

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const ordersThisWeek = await LessonBooking.countDocuments({ createdAt: { $gte: weekAgo } });

    const avgOrderValue = totalOrders > 0 ? Math.round(totalEarnings / totalOrders) : 0;

    const pendingUsers = await User.find({ role: { $in: ['tutor', 'specialist'] }, isApproved: false }).limit(5);
    const recentOrders = await LessonBooking.find().populate('student', 'name email').sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: {
        totalUsers,
        pendingApprovals,
        totalEarnings,
        totalOrders,
        pendingOrders,
        totalInstruments,
        usersToday,
        ordersThisWeek,
        avgOrderValue,
      },
      pendingApprovals: pendingUsers,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { isApproved: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await LessonBooking.find()
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    const completedCount = await LessonBooking.countDocuments({ paymentStatus: 'completed' });
    const pendingCount = await LessonBooking.countDocuments({ paymentStatus: 'pending' });
    const failedCount = await LessonBooking.countDocuments({ paymentStatus: { $in: ['failed', 'refunded'] } });

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'completed')
      .reduce((sum, o) => sum + (o.price || 0), 0);

    res.json({
      orders,
      stats: {
        totalRevenue,
        completedCount,
        pendingCount,
        failedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refundOrder = async (req, res) => {
  try {
    const order = await LessonBooking.findByIdAndUpdate(
      req.params.orderId,
      { paymentStatus: 'refunded' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const order = await LessonBooking.findByIdAndUpdate(
      req.params.orderId,
      { paymentStatus: 'completed' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInstruments = async (req, res) => {
  try {
    const instruments = await Instrument.find().sort({ createdAt: -1 });
    res.json({ instruments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addInstrument = async (req, res) => {
  try {
    const { name, category, description, rentalPrice, salePrice, rentalQuantity, saleQuantity } = req.body;
    const instrument = new Instrument({
      name,
      category,
      description,
      rentalPrice,
      salePrice,
      rentalQuantity,
      saleQuantity,
    });
    await instrument.save();
    res.status(201).json({ instrument });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInstrument = async (req, res) => {
  try {
    const instrument = await Instrument.findByIdAndDelete(req.params.instrumentId);
    if (!instrument) return res.status(404).json({ error: 'Instrument not found' });
    res.json({ message: 'Instrument deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
