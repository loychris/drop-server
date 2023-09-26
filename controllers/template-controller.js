const { Storage } = require('@google-cloud/storage');
const path = require('path');

const HttpError = require("../models/http-error");
const { Meme } = require("../models/template-schema");
const { User } = require("../models/user-schema");
const { Template } = require("../models/template-schema");


const createTemplate = async (req, res, next) => {
  const { title, tags, meme } = req.body;
  const creatorId = req.userData.userId;
  const timestamp = Date.now();
  const createdTemplate = new Template({
    title,
    creator: creatorId,
    created_at: timestamp,
    updated_at: timestamp,
    tags,
    meme, 
  });
  try{
    await createdTemplate.save();
  }catch(err){
    return next(new HttpError("Creating template failed, please try again", 500));
  }
  const transformedTemplate = prepareTemplate(template);
  res.status(201).json({template: transformedTemplate});
}; 

const getTemplateById = async (req, res, next) => {
  const templateId = req.params.id;
  let template;
  try{
    template = await Template.findById(templateId);
  }catch(err){
    return next(new HttpError("Could not find template", 500));
  }
  if(!template){
    return next(new HttpError("Could not find template", 404));
  }
  const transformedTemplate = prepareTemplate(template);
  res.json({template: transformedTemplate});
}

const updateTemplate = async (req, res, next) => {
  const templateId = req.params.id;
  const { title, tags, meme } = req.body;
  let template;
  try{
    template = await Template.findById(templateId);
  }catch(err){
    return next(new HttpError("Could not find template", 500));
  }
  if(!template){
    return next(new HttpError("Could not find template", 404));
  }
  template.title = title || template.title;
  template.tags = tags || template.tags;
  template.meme = meme || template.meme;

  try{
    await template.save();
  }catch(err){
    return next(new HttpError("Could not update template", 500));
  }
  const transformedTemplate = prepareTemplate(template);
  res.json({template: transformedTemplate});
}

const deleteTemplate = async (req, res, next) => {
  const templateId = req.params.id;
  let template;

}


module.exports = {
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate
}