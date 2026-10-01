import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
  args: {
    email: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    // Check if user is already on the waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      return {
        alreadyJoined: true,
        message: "You're already on the waitlist!",
      };
    }

    const id = await ctx.db.insert("waitlist", {
      email,
      createdAt: Date.now(),
      source: args.source ?? "web_landing",
    });

    return {
      alreadyJoined: false,
      message: "Successfully joined the waitlist!",
      id,
    };
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("waitlist").collect();
    return entries.length;
  },
});
