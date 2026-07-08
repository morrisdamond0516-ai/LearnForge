import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import healthRouter from "./health";
import storageRouter from "./storage";
import subjectsRouter from "./subjects";
import documentsRouter from "./documents";
import quizzesRouter from "./quizzes";
import attemptsRouter from "./attempts";
import learnRouter from "./learn";
import careerRouter from "./career";
import curriculumRouter from "./curriculum";
import examsRouter from "./exams";
import gamificationRouter from "./gamification";
import tutorRouter from "./tutor";
import flashcardsRouter from "./flashcards";
import snapRouter from "./snap";
import dashboardRouter from "./dashboard";
import explainRouter from "./explain";
import roleplayRouter from "./roleplay";
import meRouter from "./me";
import stripeRouter from "./stripe";
import schoolRouter from "./school";
import accessCodesRouter from "./access-codes";
import paypalRouter from "./paypal";
import { analyticsPublicRouter, analyticsRouter } from "./analytics";
import { newsletterPublicRouter } from "./newsletter";
import { ownerOutreachRouter } from "./owner-outreach";

const router: IRouter = Router();

// Public routes (no auth).
router.use(healthRouter);
// Storage self-guards its protected endpoints (upload + private objects);
// public objects stay open.
router.use(storageRouter);
// Visitor tracking must accept anonymous (signed-out) traffic, so it lives in
// the public section. It optionally tags the Clerk user id when a session
// exists; the owner-only stats reader is mounted behind auth below.
router.use(analyticsPublicRouter);
router.use(newsletterPublicRouter);

// Everything below requires an authenticated user.
router.use(requireAuth);
router.use(subjectsRouter);
router.use(documentsRouter);
router.use(quizzesRouter);
router.use(attemptsRouter);
router.use(learnRouter);
router.use(careerRouter);
router.use(curriculumRouter);
router.use(examsRouter);
router.use(gamificationRouter);
router.use(tutorRouter);
router.use(flashcardsRouter);
router.use(snapRouter);
router.use(dashboardRouter);
router.use(explainRouter);
router.use(roleplayRouter);
router.use(meRouter);
router.use(stripeRouter);
router.use(schoolRouter);
router.use(accessCodesRouter);
router.use(paypalRouter);
router.use(analyticsRouter);
router.use(ownerOutreachRouter);

export default router;
