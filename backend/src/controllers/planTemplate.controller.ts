import { Request, Response } from 'express';
import { AppDataSource } from '../config/databse';
import { PlanTemplate } from '../models/PlanTemplate';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const getPlanTemplates = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(PlanTemplate);
    const templates = await repo.find({ where: { isActive: true } });
    res.json(templates);
  } catch (error) {
    console.error('Get plan templates failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const createPlanTemplate = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(PlanTemplate);
    const template = repo.create(req.body);
    const saved = await repo.save(template);
    res.json(saved);
  } catch (error) {
    console.error('Create plan template failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const updatePlanTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(PlanTemplate);
    await repo.update(id, { ...req.body, updatedAt: new Date() });
    const updated = await repo.findOne({ where: { id } });
    res.json(updated);
  } catch (error) {
    console.error('Update plan template failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};

export const deletePlanTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(PlanTemplate);
    await repo.update(id, { isActive: false });
    res.json({ message: 'Plan template deleted successfully' });
  } catch (error) {
    console.error('Delete plan template failed:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.DATABASE_ERROR));
  }
};
