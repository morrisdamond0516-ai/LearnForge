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
import dashboardRouter from "./dashboard";
import explainRouter from "./explain";
import roleplayRouter from "./roleplay";
import stripeRouter from "./stripe";
import accessCodesRouter from "./access-codes";
import paypalRouter from "./paypal";

const router: IRouter = Router();

// Public routes (no auth).
router.use(healthRouter);
// Storage self-guards its protected endpoints (upload + private objects);
// public objects stay open.
router.use(storageRouter);

// Everything below requires an authenticated user.
router.use(requireAuth);
router.use(subjectsRouter);
router.use(documentsRouter);
router.use(quizzesRouter);
router.use(attemptsRouter);
router.use(learnRouter);
router.use(careerRouter);
router.use(curriculumRouter);
router.use(dashboardRouter);
router.use(explainRouter);
router.use(roleplayRouter);
router.use(stripeRouter);
router.use(accessCodesRouter);
router.use(paypalRouter);

export default router;
