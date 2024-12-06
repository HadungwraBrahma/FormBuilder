import { Response } from "../models/Response.js";
import { Form } from "../models/Form.js";
import asyncHandler from "express-async-handler";

export const submitFormResponse = asyncHandler(async (req, res) => {
  const { formId, responses } = req.body;

  const form = await Form.findById(formId);
  if (!form) {
    res.status(404);
    throw new Error("Form not found");
  }

  const response = await Response.create({
    formId,
    responses,
  });

  res.status(201).json(response);
});

/* All the controllers bellow are currently not in use due to time constraints
as it has not yet been integrated into the frontend. ^_^ */
export const getResponsesByFormId = asyncHandler(async (req, res) => {
  const responses = await Response.find({ formId: req.params.formId }).sort({
    submittedAt: -1,
  });

  res.json(responses);
});

export const getResponseById = asyncHandler(async (req, res) => {
  const response = await Response.findById(req.params.id);

  if (!response) {
    res.status(404);
    throw new Error("Response not found");
  }

  res.json(response);
});
