import Donation from '../models/Donation.js';
import chapaService from '../services/chapaService.js';
import { asyncHandler } from '../middleware/errorsHandler.js';
import { AppError } from '../middleware/errorsHandler.js';

export const initializePayment = asyncHandler(async (req, res) => {
  const { donor, amount, currency, purpose, category, notes } = req.body;

  if (!donor?.name || !donor?.email || !amount || !purpose || !category) {
    throw new AppError('Missing required fields', 400);
  }

  if (amount < 0.01) {
    throw new AppError('Amount must be at least 0.01', 400);
  }

  const donation = await Donation.create({
    donor: {
      name: donor.name,
      email: donor.email,
      phone: donor.phone || null,
      userId: req.user?._id
    },
    amount: parseFloat(amount),
    currency: currency || 'ETB',
    purpose,
    category,
    notes,
    paymentMethod: 'online_payment',
    paymentStatus: 'pending',
    createdBy: req.user?._id
  });

  const paymentResult = await chapaService.initializePayment(donation);

  res.json({
    success: true,
    message: 'Payment initialized successfully',
    data: {
      donationId: donation._id,
      checkoutUrl: paymentResult.checkoutUrl,
      transactionRef: paymentResult.transactionRef
    }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const verification = await chapaService.verifyPayment(transactionId);

  res.json({ success: true, data: verification.data });
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { donationId } = req.params;

  const donation = await Donation.findById(donationId);
  if (!donation) throw new AppError('Donation not found', 404);

  res.json({
    success: true,
    data: {
      donationId: donation._id,
      paymentStatus: donation.paymentStatus,
      transactionId: donation.transactionId,
      amount: donation.amount,
      currency: donation.currency
    }
  });
});