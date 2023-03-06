const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const catchAsyncError = require("../utils/catchAsyncError");
const createNewError = require("../utils/createNewError");
const stripe = require("stripe")(process.env.STRIPE_SECRETKEY);
const factory = require("../Controller/handleFactory");

exports.createSession = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // success_url: `${req.protocol}://${req.get("host")}/myBooking/?tour=${
      //   req.params.tourID
      // }&user=${req.user.id}&price=${tour.price}`,
      success_url: `${req.protocol}://${req.get("host")}/myBooking`,
      cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourID,
    });

    //   res.redirect(303, session.url);

    res.status(200).json({
      status: "success",
      url: session.url,
    });
  } catch (error) {
    console.log(error);
  }
});

// exports.createBookingCheckout = catchAsyncError(async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split("?")[0]);
// });

const createBooking = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.amount_total / 100;

  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res) => {
  const signature = req.headers["stripe-signature"];

  console.log("Entered1");
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    console.log("Entered2");
    createBooking(event.data.object);
  }

  res.status(200).json({ received: true });
};

exports.bookNewTour = factory.createOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
