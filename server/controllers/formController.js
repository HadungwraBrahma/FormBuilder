import { Form } from "../models/Form.js";
import asyncHandler from "express-async-handler";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

export const createForm = asyncHandler(async (req, res) => {
  const { title } = req.body;
  let questions;
  try {
    questions = JSON.parse(req.body.questions);
  } catch (error) {
    res.status(400);
    throw new Error("Invalid questions format");
  }

  const processedQuestions = await Promise.all(
    questions.map(async (question) => {
      const questionImageFile = req.files?.questionImages?.find((file) =>
        file.originalname.includes(question.type)
      );

      if (questionImageFile) {
        try {
          const cloudinaryResult = await uploadToCloudinary(questionImageFile);

          return {
            ...question,
            content: {
              ...question.content,
              imageUrl: cloudinaryResult.secure_url,
              imagePublicId: cloudinaryResult.public_id,
            },
          };
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return question;
        }
      }
      return question;
    })
  );

  const form = await Form.create({
    title,
    questions: processedQuestions,
  });

  res.status(201).json(form);
});

export const getFormById = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    res.status(404);
    throw new Error("Form not found");
  }
  res.json(form);
});

/* All the controllers bellow are currently not in use due to time constraints
as it has not yet been integrated into the frontend. ^_^ */
export const updateForm = asyncHandler(async (req, res) => {
  const { title } = req.body;
  let questions;

  try {
    questions = JSON.parse(req.body.questions);
  } catch (error) {
    res.status(400);
    throw new Error("Invalid questions format");
  }

  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error("Form not found");
  }

  const processedQuestions = await Promise.all(
    questions.map(async (question) => {
      const questionImageFile = req.files?.find(
        (file) => file.originalname === `question_${question.type}_image`
      );

      if (questionImageFile) {
        try {
          const existingQuestion = form.questions.find(
            (q) => q.type === question.type
          );

          if (existingQuestion?.content?.imagePublicId) {
            await deleteFromCloudinary(existingQuestion.content.imagePublicId);
          }

          const cloudinaryResult = await uploadToCloudinary(questionImageFile);

          return {
            ...question,
            content: {
              ...question.content,
              imageUrl: cloudinaryResult.secure_url,
              imagePublicId: cloudinaryResult.public_id,
            },
          };
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return question;
        }
      }
      return question;
    })
  );

  if (req.files?.headerImage) {
    if (form.headerImage) {
      await deleteFromCloudinary(form.headerImage);
    }
    const cloudinaryResult = await uploadToCloudinary(req.files.headerImage[0]);
    form.headerImage = cloudinaryResult.secure_url;
  }

  form.title = title;
  form.questions = processedQuestions;

  const updatedForm = await form.save();
  res.json(updatedForm);
});

export const getAllForms = asyncHandler(async (req, res) => {
  const forms = await Form.find().sort({ createdAt: -1 });
  res.json(forms);
});

export const deleteForm = asyncHandler(async (req, res) => {
  const form = await Form.findById(req.params.id);

  if (!form) {
    res.status(404);
    throw new Error("Form not found");
  }

  if (form.headerImage) {
    await deleteFromCloudinary(form.headerImage);
  }

  if (form.questions) {
    await Promise.all(
      form.questions
        .filter((q) => q.content?.imagePublicId)
        .map((q) => deleteFromCloudinary(q.content.imagePublicId))
    );
  }

  await form.remove();
  res.json({ message: "Form removed" });
});
