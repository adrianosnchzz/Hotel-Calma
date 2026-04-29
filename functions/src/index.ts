import * as functions from "firebase-functions";
import cors from "cors";
import Stripe from "stripe";


const corsHandler = cors({ origin: true });

const stripe = new Stripe('sk_test_51TKEzvLMUXgJ5ntRNiQTjhMdeEDixQmES3sd8CgStzqA0gIwBQKAmqcGMK0163UtntzsHS8LtgJx3sWnMZgoNxh400ywaEL97O', {
  apiVersion: "2023-10-16" as any,
});

export const crearIntentoPago = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { amount } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "eur",
      });

      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
});