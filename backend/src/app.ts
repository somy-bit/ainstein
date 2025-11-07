import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import partnerRoutes from './routes/partner.routes';
import leadRoutes from './routes/lead.routes';
import postRoutes from './routes/post.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import userRoutes from './routes/user.routes';
import aiRoutes from './routes/ai.routes';
import subscriptionRoutes from './routes/subscription.routes';
import subscriptionManagementRoutes from './routes/subscriptionRoutes';
import platformRoutes from './routes/platform.routes';
import planTemplateRoutes from './routes/planTemplate.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

app.use(cors());

// Webhook routes MUST come before express.json() middleware
app.use('/api/v1/webhooks', webhookRoutes);

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/knowledge', knowledgeRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/subscription', subscriptionManagementRoutes);
app.use('/api/v1/platform', platformRoutes);
app.use('/api/v1/plan-templates', planTemplateRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'PRM Backend operational' });
});

export default app;