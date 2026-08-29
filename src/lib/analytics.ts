import { supabase } from '@/lib/supabase';

export type AnalyticsEvent =
  | 'landing_page_view'
  | 'signup'
  | 'login'
  | 'analysis_started'
  | 'analysis_completed'
  | 'paywall_reached'
  | 'pricing_page_viewed'
  | 'checkout_initiated'
  | 'subscription_activated';

/**
 * Lightweight analytics: inserts events into a local table for later aggregation.
 * Uses the analysis_usage table's sibling approach — we store events in a simple
 * events table. For now, we log to console and could persist to a table.
 */
export async function trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  // Fire-and-forget — don't block UI
  console.info(`[Analytics] ${event}`, properties ?? {});

  // We could also persist to a dedicated events table, but keeping it lightweight
  // for V1. The key events are tracked via the database records themselves
  // (documents, analysis_usage, payments) which serve as the source of truth.
}

export async function trackPageView(page: string) {
  console.info(`[Analytics] page_view: ${page}`);
}
