import AnalyticsEvent from '../models/AnalyticsEvent.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Team from '../models/Team.js';
import Contact from '../models/Contact.js';
import Content from '../models/Content.js';
import Media from '../models/Media.js';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Track analytics event
  async trackEvent(eventType, userId = null, metadata = {}, sessionData = {}) {
    try {
      const analyticsEvent = new AnalyticsEvent({
        eventType,
        userId,
        metadata,
        sessionId: sessionData.sessionId,
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
        location: sessionData.location,
        device: sessionData.device,
        performance: sessionData.performance,
        properties: sessionData.properties
      });

      await analyticsEvent.save();
      
      // Clear relevant cache
      this.clearCache(eventType);
      
      return analyticsEvent;
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Get user analytics
  async getUserAnalytics(timeRange = '30d', filters = {}) {
    const cacheKey = `user_analytics_${timeRange}_${JSON.stringify(filters)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const startDate = this.getStartDate(timeRange);
    
    try {
      // User registration trends
      const registrationTrends = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // User activity metrics
      const activityMetrics = await AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            eventType: { $in: ['user_login', 'event_attended', 'content_viewed'] },
            ...filters
          }
        },
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" }
          }
        }
      ]);

      // Demographics
      const demographics = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Year of study distribution
      const yearDistribution = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: "$yearOfStudy",
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const result = {
        registrationTrends,
        activityMetrics,
        demographics,
        yearDistribution,
        summary: {
          totalUsers: await User.countDocuments({ createdAt: { $gte: startDate }, ...filters }),
          activeUsers: await this.getActiveUsersCount(startDate, filters),
          newUsers: await User.countDocuments({ createdAt: { $gte: startDate }, ...filters })
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      throw error;
    }
  }

  // Get event analytics
  async getEventAnalytics(timeRange = '30d', filters = {}) {
    const cacheKey = `event_analytics_${timeRange}_${JSON.stringify(filters)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const startDate = this.getStartDate(timeRange);
    
    try {
      // Event creation trends
      const creationTrends = await Event.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Event attendance metrics
      const attendanceMetrics = await Event.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            totalAttendees: { $sum: { $size: "$attendees" } },
            avgAttendees: { $avg: { $size: "$attendees" } },
            maxAttendees: { $max: { $size: "$attendees" } }
          }
        }
      ]);

      // Popular event categories
      const categoryPopularity = await Event.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalAttendees: { $sum: { $size: "$attendees" } }
          }
        },
        { $sort: { totalAttendees: -1 } }
      ]);

      // Event engagement
      const engagementMetrics = await AnalyticsEvent.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            eventType: { $in: ['event_created', 'event_attended'] },
            ...filters
          }
        },
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        creationTrends,
        attendanceMetrics: attendanceMetrics[0] || {},
        categoryPopularity,
        engagementMetrics,
        summary: {
          totalEvents: await Event.countDocuments({ createdAt: { $gte: startDate }, ...filters }),
          totalAttendees: await this.getTotalEventAttendees(startDate, filters),
          avgEventSize: await this.getAverageEventSize(startDate, filters)
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get event analytics:', error);
      throw error;
    }
  }

  // Get financial analytics
  async getFinancialAnalytics(timeRange = '30d', filters = {}) {
    const cacheKey = `financial_analytics_${timeRange}_${JSON.stringify(filters)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const startDate = this.getStartDate(timeRange);
    
    try {
      // Revenue trends
      const revenueTrends = await this.getRevenueData(startDate, filters);
      
      // Expense analysis
      const expenseAnalysis = await this.getExpenseData(startDate, filters);
      
      // Budget vs actual
      const budgetAnalysis = await this.getBudgetAnalysis(startDate, filters);
      
      // Donation metrics
      const donationMetrics = await this.getDonationMetrics(startDate, filters);

      const result = {
        revenueTrends,
        expenseAnalysis,
        budgetAnalysis,
        donationMetrics,
        summary: {
          totalRevenue: await this.getTotalRevenue(startDate, filters),
          totalExpenses: await this.getTotalExpenses(startDate, filters),
          netIncome: await this.getNetIncome(startDate, filters),
          budgetUtilization: await this.getBudgetUtilization(startDate, filters)
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get financial analytics:', error);
      throw error;
    }
  }

  // Get content analytics
  async getContentAnalytics(timeRange = '30d', filters = {}) {
    const cacheKey = `content_analytics_${timeRange}_${JSON.stringify(filters)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const startDate = this.getStartDate(timeRange);
    
    try {
      // Content creation trends
      const creationTrends = await Content.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Popular content
      const popularContent = await Content.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $project: {
            title: 1,
            category: 1,
            likes: 1,
            views: 1,
            engagement: { $add: ["$likes", "$views"] }
          }
        },
        { $sort: { engagement: -1 } },
        { $limit: 10 }
      ]);

      // Category performance
      const categoryPerformance = await Content.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalLikes: { $sum: "$likes" },
            totalViews: { $sum: "$views" },
            avgEngagement: { $avg: { $add: ["$likes", "$views"] } }
          }
        },
        { $sort: { avgEngagement: -1 } }
      ]);

      const result = {
        creationTrends,
        popularContent,
        categoryPerformance,
        summary: {
          totalContent: await Content.countDocuments({ createdAt: { $gte: startDate }, ...filters }),
          totalViews: await this.getTotalContentViews(startDate, filters),
          totalLikes: await this.getTotalContentLikes(startDate, filters),
          avgEngagement: await this.getAverageContentEngagement(startDate, filters)
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get content analytics:', error);
      throw error;
    }
  }

  // Get team analytics
  async getTeamAnalytics(timeRange = '30d', filters = {}) {
    const cacheKey = `team_analytics_${timeRange}_${JSON.stringify(filters)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const startDate = this.getStartDate(timeRange);
    
    try {
      // Team performance
      const teamPerformance = await Team.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...filters
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members.user',
            foreignField: '_id',
            as: 'memberDetails'
          }
        },
        {
          $project: {
            name: 1,
            memberCount: { $size: "$members" },
            activeMembers: {
              $size: {
                $filter: {
                  input: "$memberDetails",
                  cond: { $gt: ["$$this.lastActive", startDate] }
                }
              }
            },
            avgMemberActivity: { $avg: "$memberDetails.lastActive" }
          }
        },
        { $sort: { memberCount: -1 } }
      ]);

      // Member activity
      const memberActivity = await User.aggregate([
        {
          $match: {
            'teams': { $exists: true, $ne: [] },
            lastActive: { $gte: startDate },
            ...filters
          }
        },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
            avgActivity: { $avg: "$lastActive" }
          }
        }
      ]);

      const result = {
        teamPerformance,
        memberActivity,
        summary: {
          totalTeams: await Team.countDocuments({ createdAt: { $gte: startDate }, ...filters }),
          totalMembers: await this.getTotalTeamMembers(startDate, filters),
          avgTeamSize: await this.getAverageTeamSize(startDate, filters),
          activeTeams: await this.getActiveTeamsCount(startDate, filters)
        }
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to get team analytics:', error);
      throw error;
    }
  }

  // Get comprehensive dashboard data
  async getDashboardData(timeRange = '30d', filters = {}) {
    try {
      const [
        userAnalytics,
        eventAnalytics,
        contentAnalytics,
        teamAnalytics
      ] = await Promise.all([
        this.getUserAnalytics(timeRange, filters),
        this.getEventAnalytics(timeRange, filters),
        this.getContentAnalytics(timeRange, filters),
        this.getTeamAnalytics(timeRange, filters)
      ]);

      return {
        userAnalytics,
        eventAnalytics,
        contentAnalytics,
        teamAnalytics,
        timestamp: new Date(),
        timeRange,
        filters
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportAnalyticsData(timeRange = '30d', format = 'json', filters = {}) {
    try {
      const data = await this.getDashboardData(timeRange, filters);
      
      switch (format.toLowerCase()) {
        case 'csv':
          return this.convertToCSV(data);
        case 'excel':
          return this.convertToExcel(data);
        case 'pdf':
          return this.convertToPDF(data);
        default:
          return data;
      }
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      throw error;
    }
  }

  // Helper methods
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Placeholder methods for financial data (implement based on your models)
  async getRevenueData(startDate, filters) {
    // Implement based on your donation/financial models
    return [];
  }

  async getExpenseData(startDate, filters) {
    // Implement based on your expense models
    return [];
  }

  async getBudgetAnalysis(startDate, filters) {
    // Implement based on your budget models
    return {};
  }

  async getDonationMetrics(startDate, filters) {
    // Implement based on your donation models
    return {};
  }

  // Additional helper methods
  async getActiveUsersCount(startDate, filters) {
    return User.countDocuments({
      lastActive: { $gte: startDate },
      ...filters
    });
  }

  async getTotalEventAttendees(startDate, filters) {
    const result = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$attendees" } }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async getAverageEventSize(startDate, filters) {
    const result = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: { $size: "$attendees" } }
        }
      }
    ]);
    return result[0]?.avg || 0;
  }

  async getTotalContentViews(startDate, filters) {
    const result = await Content.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$views" }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async getTotalContentLikes(startDate, filters) {
    const result = await Content.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$likes" }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async getAverageContentEngagement(startDate, filters) {
    const result = await Content.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: { $add: ["$likes", "$views"] } }
        }
      }
    ]);
    return result[0]?.avg || 0;
  }

  async getTotalTeamMembers(startDate, filters) {
    const result = await Team.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $size: "$members" } }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async getAverageTeamSize(startDate, filters) {
    const result = await Team.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          ...filters
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: { $size: "$members" } }
        }
      }
    ]);
    return result[0]?.avg || 0;
  }

  async getActiveTeamsCount(startDate, filters) {
    return Team.countDocuments({
      'members.lastActive': { $gte: startDate },
      ...filters
    });
  }

  // Data conversion methods
  convertToCSV(data) {
    // Implement CSV conversion
    return 'csv_data';
  }

  convertToExcel(data) {
    // Implement Excel conversion
    return 'excel_data';
  }

  convertToPDF(data) {
    // Implement PDF conversion
    return 'pdf_data';
  }
}

const analyticsService = new AnalyticsService();

export default analyticsService;