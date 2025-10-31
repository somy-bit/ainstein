import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ENV } from './environment';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Partner } from '../models/Partner';
import { Lead } from '../models/Lead';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { MarketingEvent } from '../models/MarketingEvent';
import { KnowledgeFile } from '../models/KnowledgeFile';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { ReferralProgramConfig } from '../models/ReferralProgramConfig';
import { PlanTemplate } from '../models/PlanTemplate';
import { PartnerPerformance } from '../models/PartnerPerformance';
import { LeadStatusHistory } from '../models/LeadStatusHistory';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [
    User, 
    Organization, 
    Partner, 
    Lead, 
    Post, 
    Comment, 
    MarketingEvent, 
    KnowledgeFile, 
    SubscriptionPlan, 
    ReferralProgramConfig,
    PlanTemplate,
    PartnerPerformance,
    LeadStatusHistory
  ],
  subscribers: [],
  migrations: [],
});
