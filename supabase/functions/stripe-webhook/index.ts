// Supabase Edge Function: stripe-webhook
// Auto-publishes a Ski Free 2 banner ad when a Stripe checkout completes.
//
// Flow: Stripe Payment Link checkout → checkout.session.completed webhook →
// signature verified here → buyer's custom-field answers (tagline, business
// name, link URL) inserted into the public.ads table → the ad is live on the
// next page load and expires automatically after 7 days (ends_at default).
//
// Required secret (Edge Functions → Secrets): STRIPE_WEBHOOK_SECRET
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// Deploy with "Verify JWT" turned OFF — Stripe cannot send a Supabase token.

import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe('sk_unused_for_verification_only');
const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!sig || !secret) {
    return new Response('missing signature or secret', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, sig, secret, undefined, cryptoProvider
    );
  } catch (_err) {
    return new Response('signature verification failed', { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('ignored', { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== 'paid') {
    return new Response('not paid', { status: 200 });
  }

  // Pull the buyer's answers from the checkout custom fields.
  // Matched by label so the exact field keys in Stripe don't matter.
  let tagline = '', business = '', url = '';
  for (const f of session.custom_fields ?? []) {
    const label = (f.label?.custom ?? f.key ?? '').toLowerCase();
    const value = f.text?.value ?? '';
    if (label.includes('tagline')) tagline = value;
    else if (label.includes('business') || label.includes('name')) business = value;
    else if (label.includes('url') || label.includes('link') || label.includes('website')) url = value;
  }

  // Clean up to satisfy the ads table's constraints
  tagline = (tagline || 'A mysterious sponsor').slice(0, 120).trim();
  business = (business || '').slice(0, 30).trim();
  url = (url || '').trim();
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (!/^https?:\/\/[^\s]+\.[^\s]+/.test(url)) url = 'https://skifree2.com';

  // $10+ = premium (larger top banner); anything less = basic (bottom banner)
  const tier = (session.amount_total ?? 0) >= 1000 ? 'premium' : 'basic';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const { error } = await supabase.from('ads').insert({ tagline, business, url, tier });
  if (error) {
    return new Response(`insert failed: ${error.message}`, { status: 500 });
  }

  return new Response('ad published', { status: 200 });
});
