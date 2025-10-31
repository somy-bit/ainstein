import { AppDataSource } from '../config/databse';
import { PartnerPerformance } from '../models/PartnerPerformance';
import { LeadStatusHistory } from '../models/LeadStatusHistory';
import { Lead } from '../models/Lead';

export class PartnerPerformanceService {
  
  static async calculateScore(partnerId: string, leadId: string, oldStatus?: string, newStatus?: string): Promise<number> {
    let points = 0;
    
    if (!newStatus) return points;

    const leadRepo = AppDataSource.getRepository(Lead);
    const lead = await leadRepo.findOne({ where: { id: leadId } });
    
    if (!lead) return points;

    // Status hierarchy: New(0) -> Contacted(1) -> Qualified(2) -> Converted(3), Lost(-1)
    const getStatusLevel = (status: string): number => {
      switch (status) {
        case 'New': return 0;
        case 'Contacted': return 1;
        case 'Qualified': return 2;
        case 'Converted': return 3;
        case 'Lost': return -1;
        default: return 0;
      }
    };

    // Check if lead was assigned today (first day bonus)
    const assignedDate = new Date(lead.createdDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // First day action bonus
    if (daysDiff === 0 && oldStatus === 'New') {
      points += 1;
    }

    // Calculate points based on status progression
    if (oldStatus && newStatus) {
      const oldLevel = getStatusLevel(oldStatus);
      const newLevel = getStatusLevel(newStatus);
      
      if (newStatus === 'Lost') {
        points -= 5; // Most negative point for lost
      } else if (newLevel > oldLevel) {
        // Moving up the hierarchy - positive points
        const progression = newLevel - oldLevel;
        points += progression * 2; // 2 points per level up
      } else if (newLevel < oldLevel && oldLevel !== -1) {
        // Moving down the hierarchy - negative points
        const regression = oldLevel - newLevel;
        points -= regression * 2; // -2 points per level down
      }
    } else if (!oldStatus && newStatus !== 'Lost') {
      // Initial assignment - give points based on starting level
      points += getStatusLevel(newStatus);
    }
    
    // Check for stalled leads (more than 7 days without status change)
    if (oldStatus === 'New' && daysDiff > 7) {
      points -= 3;
    }
    
    return points;
  }

  static async updatePartnerPerformance(partnerId: string, leadId: string, oldStatus?: string, newStatus?: string): Promise<void> {
    const performanceRepo = AppDataSource.getRepository(PartnerPerformance);
    
    // Get or create performance record
    let performance = await performanceRepo.findOne({ where: { partnerId } });
    
    if (!performance) {
      performance = performanceRepo.create({
        partnerId,
        score: 0,
        leadsAssigned: 0,
        leadsContacted: 0,
        leadsQualified: 0,
        leadsConverted: 0,
        leadsLost: 0,
        leadsStalled: 0
      });
    }

    // Calculate points for this status change
    const points = await this.calculateScore(partnerId, leadId, oldStatus, newStatus);
    console.log(`Performance update for partner ${partnerId}: +${points} points (${oldStatus} -> ${newStatus})`);
    
    performance.score += points;

    // Update counters - track lead assignment when it's first assigned to partner
    if (oldStatus === undefined) {
      performance.leadsAssigned += 1;
      console.log(`Lead assigned to partner ${partnerId}. Total assigned: ${performance.leadsAssigned}`);
    }

    if (newStatus) {
      switch (newStatus) {
        case 'Contacted':
          performance.leadsContacted += 1;
          break;
        case 'Qualified':
          performance.leadsQualified += 1;
          break;
        case 'Converted':
          performance.leadsConverted += 1;
          break;
        case 'Lost':
          performance.leadsLost += 1;
          break;
      }
    }

    // Check for stalled leads
    const leadRepo = AppDataSource.getRepository(Lead);
    const lead = await leadRepo.findOne({ where: { id: leadId } });
    
    if (lead) {
      const assignedDate = new Date(lead.createdDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (oldStatus === 'New' && daysDiff > 7) {
        performance.leadsStalled += 1;
      }
    }

    performance.updatedAt = new Date();
    await performanceRepo.save(performance);
    
    console.log(`Performance saved for partner ${partnerId}:`, {
      score: performance.score,
      leadsAssigned: performance.leadsAssigned,
      leadsConverted: performance.leadsConverted
    });
  }

  static async getPartnerPerformance(partnerId: string): Promise<PartnerPerformance | null> {
    const performanceRepo = AppDataSource.getRepository(PartnerPerformance);
    return await performanceRepo.findOne({ where: { partnerId } });
  }

  static async calculatePerformanceScore(partnerId: string): Promise<number> {
    const performance = await this.getPartnerPerformance(partnerId);
    
    console.log(`Calculating performance for partner ${partnerId}:`, performance);
    
    if (!performance || performance.leadsAssigned === 0) {
      console.log(`No performance data or no leads assigned for partner ${partnerId}`);
      return 0;
    }
    
    // Calculate average points per lead
    const averagePointsPerLead = performance.score / performance.leadsAssigned;
    
    // Use sigmoid function: 100 / (1 + e^(-0.4 * (avgPoints - 3)))
    // Adjusted for new scoring system where 3 points per lead = 50%
    const sigmoid = 100 / (1 + Math.exp(-0.4 * (averagePointsPerLead - 3)));
    const percentageScore = Math.round(sigmoid);
    
    console.log(`Performance calculation for partner ${partnerId}:`, {
      totalScore: performance.score,
      leadsAssigned: performance.leadsAssigned,
      averagePointsPerLead: averagePointsPerLead.toFixed(2),
      sigmoidValue: sigmoid.toFixed(2),
      finalPercentage: percentageScore
    });
    
    return percentageScore;
  }
}
