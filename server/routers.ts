import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { submitContactForm, getExchangeLinks, updateExchangeLink, getFaqs, getCryptoNews, getExchangeFeatureCategories, getExchangeFeatureSupport, getExchangeAllFeatures } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        platform: z.string().min(1, "请选择联系平台"),
        accountName: z.string().min(1, "请填写账号名称"),
        exchangeUid: z.string().optional().default(""),
        exchangeUsername: z.string().optional().default(""),
        message: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        await submitContactForm({
          platform: input.platform,
          accountName: input.accountName,
          exchangeUid: input.exchangeUid || null,
          exchangeUsername: input.exchangeUsername || null,
          message: input.message || null,
        });
        return { success: true } as const;
      }),
  }),

  exchanges: router({
    list: publicProcedure.query(async () => getExchangeLinks()),
    update: protectedProcedure
      .input(z.object({
        slug: z.string().min(1),
        referralLink: z.string().url("请输入有效的 URL").optional(),
        inviteCode: z.string().optional(),
        rebateRate: z.string().optional(),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: '仅管理员可修改返佣链接' });
        const { slug, ...data } = input;
        await updateExchangeLink(slug, data);
        return { success: true } as const;
      }),
  }),

  /** FAQ (新手问答) — supports optional search query */
  faq: router({
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ input }) => getFaqs(input.search)),
  }),

  /** Exchange Feature Guide — 交易所扫盲指南 */
  exchangeGuide: router({
    categories: publicProcedure.query(async () => getExchangeFeatureCategories()),
    featureSupport: publicProcedure
      .input(z.object({ featureSlug: z.string().min(1) }))
      .query(async ({ input }) => getExchangeFeatureSupport(input.featureSlug)),
    exchangeFeatures: publicProcedure
      .input(z.object({ exchangeSlug: z.string().min(1) }))
      .query(async ({ input }) => getExchangeAllFeatures(input.exchangeSlug)),
  }),

  /** Crypto news timeline */
  news: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).optional().default(20) }))
      .query(async ({ input }) => getCryptoNews(input.limit)),
  }),
});

export type AppRouter = typeof appRouter;
