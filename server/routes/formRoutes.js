import express from "express";
import {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm,
} from "../controllers/formController.js";
import upload from "../config/multer.js";

const router = express.Router();
router.post("/", upload.fields([{ name: "questionImages" }]), createForm);
router.get("/:id", getFormById);

/* The APIs below are currently not in use due to time constraints
as it has not yet been integrated into the frontend. ^_^ */
router.put("/:id", upload.fields([{ name: "questionImages" }]), updateForm);
router.delete("/:id", deleteForm);
router.get("/", getAllForms);

export default router;
