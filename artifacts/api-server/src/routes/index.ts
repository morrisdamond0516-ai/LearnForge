import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import subjectsRouter from "./subjects";
import documentsRouter from "./documents";
import quizzesRouter from "./quizzes";
import attemptsRouter from "./attempts";
import learnRouter from "./learn";
import careerRouter from "./career";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(subjectsRouter);
router.use(documentsRouter);
router.use(quizzesRouter);
router.use(attemptsRouter);
router.use(learnRouter);
router.use(careerRouter);
router.use(dashboardRouter);

export default router;
