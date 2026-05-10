import prisma from '../utils/prisma.js';
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

  const donation = await prisma.donation.create({
    data: {
      donorName: donor.name,
      donorEmail: donor.email,
      donorPhone: donor.phone || null,
      amount: parseFloat(amount),
      currency: currency || 'ETB',
      purpose,
      category,
      notes,
      paymentMethod: 'online_payment',
      paymentStatus: 'pending',
      ...(req.user?.id && { createdById: req.user.id })
    }
  });

  const paymentResult = await chapaService.initializePayment({
    _id: donation.id,
    donor: { name: donation.donorName, email: donation.donorEmail, phone: donation.donorPhone },
    amount: donation.amount,
    currency: donation.currency,
    purpose: donation.purpose,
    category: donation.category
  });

  res.json({
    success: true,
    message: 'Payment initialized successfully',
    data: {
      donationId: donation.id,
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

  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new AppError('Donation not found', 404);

  res.json({
    success: true,
    data: {
      donationId: donation.id,
      paymentStatus: donation.paymentStatus,
      transactionId: donation.transactionId,
      amount: donation.amount,
      currency: donation.currency
    }
  });
});