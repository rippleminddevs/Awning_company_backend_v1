import { BaseService } from '../../common/core/baseService'
import { SaleModel } from './saleModel'
import { CurrentOrder, DashboardAnalytics, DashboardAnalyticsResponse, GetCurrentOrdersParams, Sale, SalesOverview, SalesReportParams, SalesReportResponse } from './saleInterface'
import { AppointmentModel } from '../appointment/appointmentModel'
import { QuoteModel } from '../quote/quoteModel'
import { OrderModel } from '../order/orderModel'
import { UserService } from '../user/userService'
import moment from 'moment'
import { GetSalesPersonsParams, UserResponse } from '../user/userInterface'
import { PaginatedResponse } from '../../common/interfaces/globalInterfaces'
import mongoose from 'mongoose'
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class SaleService extends BaseService<Sale> {
  private appointmentModel: AppointmentModel
  private quoteModel: QuoteModel
  private orderModel: OrderModel
  private userService: UserService
  
  constructor() {
    super(SaleModel.getInstance())
    this.appointmentModel = AppointmentModel.getInstance()
    this.quoteModel = QuoteModel.getInstance()
    this.orderModel = OrderModel.getInstance()
    this.userService = new UserService()
  }
  
  // Helper to format date
  private getDateFormat(period: string): string {
    switch (period) {
      case 'weekly':
        return '%Y-%U';
      case 'monthly':
        return '%Y-%m';
      case 'yearly':
        return '%Y';    
      default: 
        return '%Y-%m-%d'; 
    }
  }

  // Helper to get sales analytics
  private async getSalesAnalytics(
    startDate: Date,
    endDate: Date,
    groupBy: string,
    salesPersonId?: string
  ) {
    const format = this.getDateFormat(groupBy);
    const match: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      'paymentStructure.grandTotal': { $exists: true },
      paymentStatus: { $in: ['paid', 'partially paid'] }
    };
  
    // Add salesperson filter to the lookup
    const lookupMatch: any = {};
    if (salesPersonId) {
      lookupMatch['createdBy'] = new mongoose.Types.ObjectId(salesPersonId);
    }
  
    const result = await this.quoteModel.getMongooseModel()?.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'appointments',
          let: { appointmentId: '$appointmentId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$appointmentId'] },
                ...(salesPersonId ? { createdBy: new mongoose.Types.ObjectId(salesPersonId) } : {})
              }
            }
          ],
          as: 'appointment'
        }
      },
      { $unwind: '$appointment' },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          value: { $sum: '$paymentStructure.grandTotal' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          value: 1,
          count: 1,
          _id: 0
        }
      }
    ]);
  
    return (result || []).map(item => ({
      ...item,
      label: this.getLabelForDate(item.date, groupBy)
    }));
  }
  
  // Helper to get order stats
  private async getOrderStats(
    startDate: Date,
    endDate: Date,
    groupBy: string,
    salesPersonId?: string
  ) {
    const format = this.getDateFormat(groupBy);
    const match: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['Quoted', 'Confirmed', 'Sold'] } 
    };
  
    if (salesPersonId) {
      match['staff'] = new mongoose.Types.ObjectId(salesPersonId);
    }
  
    const result = await this.appointmentModel.getMongooseModel()?.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
  
    return (result || []).map(item => ({
      ...item,
      label: this.getLabelForDate(item.date, groupBy)
    }));
  }

  // Helper to get counts
  private async getCounts(startDate: Date, endDate: Date) {
    // Get appointments in the date range
    const appointments = await this.appointmentModel.getMongooseModel()?.find({
      $or: [{ status: 'Sold' }, { status: 'Scheduled' }],
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();
  
    if (!appointments || appointments.length === 0) {
      return {
        revenue: 0,
        soldItem: 0,
        newOrders: 0
      };
    }
  
    const appointmentIds = appointments.map(appt => appt._id);
  
    // Get quotes for sold appointments
    const quotes = await this.quoteModel.getMongooseModel()?.find({
      appointmentId: { $in: appointmentIds }
    }).lean();
  
    const quoteMap = new Map();
    quotes?.forEach(quote => {
      quoteMap.set(quote.appointmentId.toString(), quote);
    });
  
    const soldAppointments = appointments.filter(appt => appt.status === 'Sold');
    const scheduledAppointments = appointments.filter(appt => appt.status === 'Scheduled');
  
    // Calculate total revenue
    let totalRevenue = 0;
    for (const appt of soldAppointments) {
      const quote = quoteMap.get(appt._id.toString());
      if (quote?.paymentStructure?.grandTotal) {
        totalRevenue += Number(quote.paymentStructure.grandTotal) || 0;
      }
    }
  
    const soldItemsCount = soldAppointments.filter(appt =>
      quoteMap.has(appt._id.toString())
    ).length;
  
    return {
      revenue: parseFloat(totalRevenue.toFixed(2)),
      soldItem: soldItemsCount,
      newOrders: scheduledAppointments.length
    };
  }
  
  // Helper to get start date based on period
  private getStartDate(period: string, periodOffset: number = 1): Date {
    const now = new Date();
    const date = new Date(now);
    
    switch (period) {
      case 'daily':
        date.setDate(now.getDate() - (1 * periodOffset));
        break;
      case 'weekly':
        date.setDate(now.getDate() - (7 * periodOffset));
        break;
      case 'monthly':
        date.setMonth(now.getMonth() - (1 * periodOffset));
        break;
      case 'yearly':
        date.setFullYear(now.getFullYear() - (1 * periodOffset));
        break;
      default:
        date.setMonth(now.getMonth() - (1 * periodOffset));
    }
    
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Helper to label the date
  private getLabelForDate(date: string, groupBy: string): string {
    switch (groupBy) {
      case 'daily':
        return moment(date, 'YYYY-MM-DD').format('DD MMM'); 
      case 'weekly':
        return `Week ${moment(date, 'YYYY-WW').week()} (${moment(date, 'YYYY-WW').format('MMM')})`; 
      case 'monthly':
        return moment(date, 'YYYY-MM').format('MMM');
      case 'yearly':
        return moment(date, 'YYYY').format('YYYY');
      default:
        return date;
    }
  }

  // Get sales overview
  public getSalesOverview = async (params: SalesOverview): Promise<Sale> => {
    const now = new Date();
    
    // Get start dates for current and previous periods
    const sortPeriod = params.sortCounts || 'monthly';
    const currentStartDate = this.getStartDate(sortPeriod);
    const previousStartDate = this.getStartDate(sortPeriod, 2); 
    
    const salesAnalyticsStartDate = this.getStartDate(params.sortSalesAnalytics || 'monthly');
    const orderStatsStartDate = this.getStartDate(params.sortOrderStats || 'monthly');
    
    // Get current period counts
    const currentCounts = await this.getCounts(currentStartDate, now);
    
    // Get previous period counts for comparison
    const previousCounts = await this.getCounts(previousStartDate, currentStartDate);
    
    // Calculate percentage changes and direction
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) {
        const change = current > 0 ? 100 : 0;
        return { change, isUp: current > 0 };
      }
      const change = parseFloat((((current - previous) / previous) * 100).toFixed(2));
      return { change, isUp: current >= previous };
    };
    
    // Create counts array with change information
    const counts = [
      {
        revenue: currentCounts.revenue,
        ...calculateChange(currentCounts.revenue, previousCounts.revenue)
      },
      {
        soldItems: currentCounts.soldItem,
        ...calculateChange(currentCounts.soldItem, previousCounts.soldItem)
      },
      {
        newOrders: currentCounts.newOrders,
        ...calculateChange(currentCounts.newOrders, previousCounts.newOrders)
      }
    ];
    
    // Get sales analytics with its own date range
    const salesAnalytics = await this.getSalesAnalytics(
      salesAnalyticsStartDate,
      now,
      params.sortSalesAnalytics || 'monthly'
    );
    
    // Get order stats with its own date range
    const orderStats = await this.getOrderStats(
      orderStatsStartDate,
      now,
      params.sortOrderStats || 'monthly'
    );
    
    return {
      counts,
      salesAnalytics,
      orderStats
    };
  }
  
  // Get sales representatives
  public getSalesRepresentatives = async (params: GetSalesPersonsParams): Promise<UserResponse[] | PaginatedResponse<UserResponse>> => {
    const users = await this.userService.getSalesPersons(params);
    return users;
  }

  // Get current orders
  public getCurrentOrders = async (params: GetCurrentOrdersParams): Promise<CurrentOrder[] | PaginatedResponse<CurrentOrder>> => {
    const paginate = params.paginate === true || String(params.paginate) === 'true';
    const page = params.page ? Number(params.page) : 1;
    const perPage = params.perPage ? Number(params.perPage) : 10;
    const { search } = params;    const skip = (page - 1) * perPage;
  
    // Build the match stage
    const matchStage: any = {
      status: { $in: ['Quoted', 'Confirmed'] }
    };
  
    // Add search condition if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      matchStage.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { businessName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { 'staff.name': searchRegex }
      ];
    }
  
    // Build the aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'quotes',
          localField: '_id',
          foreignField: 'appointmentId',
          as: 'quote'
        }
      },
      { $unwind: { path: '$quote', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'staff',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          customerName: {
            $cond: {
              if: { $eq: ['$customerType', 'business'] },
              then: '$businessName',
              else: { $concat: ['$firstName', ' ', '$lastName'] }
            }
          },
          staffName: { $ifNull: ['$staff.name', 'Unassigned'] },
          address: {
            $concat: [
              '$address1',
              { $cond: ['$address2', { $concat: [', ', '$address2'] }, ''] },
              ', ',
              '$city',
              ', ',
              '$zipCode'
            ]
          },
          invoiceNumber: {
            $substr: [
              { $toString: "$quote._id" },
              { $subtract: [{ $strLenCP: { $toString: "$quote._id" } }, 6] },
              6
            ]
          },
          phoneNumber: 1,
          email: 1,
          quoteId: '$quote._id',
          InvoiceAmount: '$quote.paymentStructure.grandTotal',
          date: 1,
          paymentStatus: '$quote.paymentStatus',
          status: 1
        }
      }
    ];
  
    if (paginate) {
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: 'total' });
      const countResult = await this.appointmentModel.getMongooseModel()?.aggregate(countPipeline);
      const totalCount = countResult?.[0]?.total || 0;
      const totalPages = Math.ceil(totalCount / perPage);
  
      pipeline.push(
        { $skip: skip },
        { $limit: perPage }
      );
  
      const result = await this.appointmentModel.getMongooseModel()?.aggregate(pipeline);
  
      return {
        result: result || [],
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    }
  
    //not paginated
    const result = await this.appointmentModel.getMongooseModel()?.aggregate(pipeline);
    return result || [];
  };

  // Get representative sales report
  public getSalesReport = async (params: SalesReportParams, salePersonId: string): Promise<SalesReportResponse> => {
    const { 
      sortCounts = 'monthly', 
      sortSalesAnalytics = 'monthly', 
      sortOrderStats = 'monthly',
      page = 1,
      perPage = 10
    } = params;
  
    // Convert page and perPage to numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
    const perPageNum = typeof perPage === 'string' ? parseInt(perPage, 10) : Number(perPage) || 10;
    
    const now = new Date();
  
    // Get date ranges for current period
    const countsStartDate = this.getStartDate(sortCounts);
    const salesAnalyticsStartDate = this.getStartDate(sortSalesAnalytics);
    const orderStatsStartDate = this.getStartDate(sortOrderStats);
    const previousCountsStartDate = this.getStartDate(sortCounts, 2); // For previous period comparison
  
    // Get all data in parallel
    const [
      // Current period data
      salesCount,
      quotationsCount,
      ordersCount,
      quotedAmountResult,
      soldAmountResult,
      salesAnalytics,
      orderStats,
      tableData,
      // Previous period data
      previousSalesCount,
      previousQuotationsCount,
      previousOrdersCount,
      previousQuotedAmountResult,
      previousSoldAmountResult
    ] = await Promise.all([
      // Current period queries
      // Total Sales (Sold appointments)
      this.appointmentModel.count({ 
        staff: salePersonId, 
        status: 'Sold',
        createdAt: { $gte: countsStartDate, $lte: now }
      }),
      
      // Total Quotations
      this.appointmentModel.count({ 
        staff: salePersonId, 
        status: 'Quoted',
        createdAt: { $gte: countsStartDate, $lte: now }
      }),
      
      // New Orders (Confirmed appointments)
      this.appointmentModel.count({ 
        staff: salePersonId, 
        status: 'Confirmed',
        createdAt: { $gte: countsStartDate, $lte: now }
      }),
  
      // Calculate quoted amount
      this.quoteModel.getMongooseModel()?.aggregate([
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment'
          }
        },
        { $unwind: '$appointment' },
        {
          $match: {
            'appointment.staff': salePersonId,
            'appointment.status': 'Quoted',
            'appointment.createdAt': { $gte: countsStartDate, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentStructure.grandTotal' }
          }
        }
      ]),
  
      // Calculate sold amount
      this.quoteModel.getMongooseModel()?.aggregate([
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment'
          }
        },
        { $unwind: '$appointment' },
        {
          $match: {
            'appointment.staff': salePersonId,
            'appointment.status': 'Sold',
            'appointment.createdAt': { $gte: countsStartDate, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentStructure.grandTotal' }
          }
        }
      ]),
  
      // Get sales analytics
      this.getSalesAnalytics(salesAnalyticsStartDate, now, sortSalesAnalytics, salePersonId),
      
      // Get order stats
      this.getOrderStats(orderStatsStartDate, now, sortOrderStats, salePersonId),
  
      // Get table data
      this.getSalesReportTableData(salePersonId, pageNum, perPageNum),
  
      // Previous period queries
      // Previous Total Sales
      this.appointmentModel.count({ 
        staff: salePersonId, 
        status: 'Sold',
        createdAt: { $gte: previousCountsStartDate, $lt: countsStartDate }
      }),
      
      // Previous Total Quotations
      this.appointmentModel.count({ 
        staff: salePersonId, 
        status: 'Quoted',
        createdAt: { $gte: previousCountsStartDate, $lt: countsStartDate }
      }),
      
      // Previous New Orders
      this.appointmentModel.count({ 
        staff: salePersonId, 
        status: 'Confirmed',
        createdAt: { $gte: previousCountsStartDate, $lt: countsStartDate }
      }),
  
      // Previous Quoted Amount
      this.quoteModel.getMongooseModel()?.aggregate([
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment'
          }
        },
        { $unwind: '$appointment' },
        {
          $match: {
            'appointment.staff': salePersonId,
            'appointment.status': 'Quoted',
            'appointment.createdAt': { $gte: previousCountsStartDate, $lt: countsStartDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentStructure.grandTotal' }
          }
        }
      ]),
  
      // Previous Sold Amount
      this.quoteModel.getMongooseModel()?.aggregate([
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment'
          }
        },
        { $unwind: '$appointment' },
        {
          $match: {
            'appointment.staff': salePersonId,
            'appointment.status': 'Sold',
            'appointment.createdAt': { $gte: previousCountsStartDate, $lt: countsStartDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentStructure.grandTotal' }
          }
        }
      ])
    ]);
  
    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) {
        const change = current > 0 ? 100 : 0;
        return { change, isUp: current > 0 };
      }
      const change = parseFloat((((current - previous) / previous) * 100).toFixed(2));
      return { change, isUp: current >= previous };
    };
  
    // Create counts array with change information
    const counts = [
      {
        sales: salesCount || 0,
        ...calculateChange(salesCount || 0, previousSalesCount || 0)
      },
      {
        quotations: quotationsCount || 0,
        ...calculateChange(quotationsCount || 0, previousQuotationsCount || 0)
      },
      {
        orders: ordersCount || 0,
        ...calculateChange(ordersCount || 0, previousOrdersCount || 0)
      }
    ];
  
    // Get sales person details
    const staff = await this.userService.getUserById(salePersonId);
  
    return {
      staffDetails: staff || null,
      analytics: {
        counts,
        salesAnalytics: salesAnalytics || [],
        orderStats: orderStats || [],
      },
        ...(tableData || { result: [], pagination: { 
        page: pageNum,
        perPage: perPageNum,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }})
    };
  };

  // Helper to get table sales data for representative
  private async getSalesReportTableData(salePersonId: string, page: number = 1, perPage: number = 10) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
    const perPageNum = typeof perPage === 'string' ? parseInt(perPage, 10) : Number(perPage) || 10;
    const skip = (pageNum - 1) * perPageNum;
    
    // Get the table data with counts and amounts
    const [tableData, totalCount] = await Promise.all([
      this.appointmentModel.getMongooseModel()?.aggregate([
        {
          $match: {
            staff: new mongoose.Types.ObjectId(salePersonId),
            status: { $in: ['Followed Up', 'Quoted', 'Sold', 'Confirmed', 'Scheduled'] }
          }
        },
        {
          $lookup: {
            from: 'quotes',
            localField: '_id',
            foreignField: 'appointmentId',
            as: 'quote'
          }
        },
        { $unwind: { path: '$quote', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            date: { $first: '$createdAt' },
            visits: {
              $sum: {
                $cond: [
                  {
                    $not: [
                      { $in: ['$status', ['Scheduled', 'Quoted', 'Sold', 'Confirmed', 'Followed Up']] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            followUp: {
              $sum: { $cond: [{ $eq: ['$status', 'Followed Up'] }, 1, 0] }
            },
            quotes: {
              $sum: { $cond: [{ $eq: ['$status', 'Quoted'] }, 1, 0] }
            },
            orders: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Sold', 'Confirmed']] },
                  1,
                  0
                ]
              }
            },
            quotedAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'Quoted'] },
                  { $ifNull: ['$quote.paymentStructure.grandTotal', 0] },
                  0
                ]
              }
            },
            soldAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'Sold'] },
                  { $ifNull: ['$quote.paymentStructure.grandTotal', 0] },
                  0
                ]
              }
            }
          }
        },
        { $sort: { date: -1 } },
        { $skip: skip },
        { $limit: perPage },
        {
          $project: {
            _id: 0,
            date: '$_id',
            visits: 1,
            followUp: 1,
            quotes: 1,
            orders: 1,
            quotedAmount: { $round: [{ $ifNull: ['$quotedAmount', 0] }, 2] },
            soldAmount: { $round: [{ $ifNull: ['$soldAmount', 0] }, 2] }
          }
        }
      ]),
      this.appointmentModel.getMongooseModel()?.countDocuments({
        staff: salePersonId,
        status: { $in: ['Followed Up', 'Quoted', 'Sold', 'Confirmed', 'Scheduled'] }
      })
    ]);
  
    return {
      tableData,
      pagination: {
        page: pageNum,
        perPage: perPageNum,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / perPageNum),
        hasNextPage: pageNum < Math.ceil((totalCount || 0) / perPageNum),
        hasPrevPage: pageNum > 1
      }
    };
  }

  // Download report of staff
  public downloadSalesReport = async (salePersonId: string, params: any): Promise<ExcelJS.Buffer> => {
    const tableData = await this.getSalesReportTableData(
      salePersonId,
      params.page || 1,
      params.perPage || 2000 
    );
  
    // Get staff details
    const staff = await this.userService.getUserById(salePersonId);
    
    if (!staff) {
      throw new Error('Staff member not found');
    }
  
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
  
    // Define the headers
    const headers = [
      'Staff Name',
      'Staff Email',
      'Date',
      'Visits',
      'Follow Up',
      'Quotes Generated',
      'Orders Generated',
      'Quoted Amount',
      'Sold Amount'
    ];
  
    // Add headers to the worksheet with bold formatting
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
  
    // Add data rows
    tableData.tableData!.forEach((row: any) => {
      worksheet.addRow([
        staff.name,
        staff.email,
        row.date,
        row.visits || 0,
        row.followUp || 0,
        row.quotes || 0,
        row.orders || 0,
        row.quotedAmount || 0,
        row.soldAmount || 0
      ]);
    });
  
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      const lengths = column.values?.map(v => v ? v.toString().length : 0) || [];
      const maxLength = Math.max(...lengths, 10);
      column.width = Math.min(maxLength + 2, 30);
    });
  
    // Generate the Excel file in memory
    return workbook.xlsx.writeBuffer();
  };

  // Dashboard Analytics
  public getDashboardAnalytics = async (params: DashboardAnalytics): Promise<DashboardAnalyticsResponse> => {
    const now = new Date();
    const { sortCounts = 'monthly', sortSalesAnalytics = 'monthly', sortOrderStats = 'monthly' } = params;
    
    // Get start dates for each section
    const countsStartDate = this.getStartDate(sortCounts);
    const salesAnalyticsStartDate = this.getStartDate(sortSalesAnalytics);
    const orderStatsStartDate = this.getStartDate(sortOrderStats);
  
    const [
      totalCustomers,
      newLeads,
      totalSalesResult,
      salesAnalytics,
      orderStats
    ] = await Promise.all([
      // Total Customers 
      this.appointmentModel.count({
        createdAt: { $gte: countsStartDate, $lte: now }
      }),
  
      // New Leads 
      this.appointmentModel.count({
        status: 'Scheduled',
        createdAt: { $gte: countsStartDate, $lte: now }
      }),
  
      // Total Sales 
      this.quoteModel.getMongooseModel()?.aggregate([
        {
          $lookup: {
            from: 'appointments',
            localField: 'appointmentId',
            foreignField: '_id',
            as: 'appointment'
          }
        },
        { $unwind: '$appointment' },
        {
          $match: {
            'appointment.status': 'Sold',
            'appointment.createdAt': { $gte: countsStartDate, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$paymentStructure.grandTotal' }
          }
        }
      ]),
  
      // Get sales analytics
      this.getSalesAnalytics(salesAnalyticsStartDate, now, sortSalesAnalytics),
  
      // Get order stats
      this.getOrderStats(orderStatsStartDate, now, sortOrderStats)
    ]);
  
    const totalSales = totalSalesResult?.[0]?.total || 0;
  
    return {
      analytics: {
        totalCustomers: totalCustomers || 0,
        newLeads: newLeads || 0,
        totalSales: totalSales,
        salesAnalytics: salesAnalytics || [],
        orderStats: orderStats || []
      }
    };
  }
}