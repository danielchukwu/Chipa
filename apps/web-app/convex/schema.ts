import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),
    createdAt: v.optional(v.number()),
    source: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
