import { Router, type IRouter } from "express";
import { solveProblemImage } from "../lib/ai";

const router: IRouter = Router();

const MAX_IMAGE_CHARS = 8_000_000; // ~6MB decoded; guards the AI call.
const ALLOWED = /^data:image\/(png|jpe?g|webp|heic|heif);base64,/i;

router.post("/snap/solve", async (req, res): Promise<void> => {
  const body = (req.body ?? {}) as { image?: unknown; note?: unknown };
  const image = typeof body.image === "string" ? body.image : "";
  if (!ALLOWED.test(image)) {
    res.status(400).json({ error: "Please upload a valid image (PNG or JPEG)." });
    return;
  }
  if (image.length > MAX_IMAGE_CHARS) {
    res.status(413).json({ error: "Image is too large. Try a smaller photo." });
    return;
  }
  const note = typeof body.note === "string" ? body.note.slice(0, 500) : undefined;

  try {
    const result = await solveProblemImage({ imageDataUrl: image, note });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Snap-a-problem solve failed");
    res
      .status(500)
      .json({ error: "Couldn't read the problem. Please try again." });
  }
});

export default router;
