import express from "express";
import {
  submitFormResponse,
  getResponsesByFormId,
  getResponseById,
} from "../controllers/responseController.js";

const router = express.Router();

router.post("/", submitFormResponse);

/* The APIs below are currently not in use due to time constraints
as it has not yet been integrated into the frontend. ^_^ */
router.get("/form/:formId", getResponsesByFormId);
router.get("/:id", getResponseById);

export default router;