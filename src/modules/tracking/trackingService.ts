import { BaseService } from '../../common/core/baseService'
import { SaleModel } from '../sale/saleModel'
import { AppointmentModel } from '../appointment/appointmentModel'
import { QuoteModel } from '../quote/quoteModel'
import { UserModel } from '../user/userModel'
import { TrackingDashboardParams, TrackingDashboardResponse } from './trackingInterface'
import moment from 'moment'
import mongoose from 'mongoose'

export class TrackingService extends BaseService<any> {
  private appointmentModel: AppointmentModel
  private quoteModel: QuoteModel
  private userModel: UserModel

  constructor() {
    super(SaleModel.getInstance()) // Using SaleModel as base, can be changed if needed
    this.appointmentModel = AppointmentModel.getInstance()
    this.quoteModel = QuoteModel.getInstance()
    this.userModel = UserModel.getInstance()
  }

  // Helper to format date
  private getDateFormat(period: string): string {
    switch (period) {
      case 'weekly':
        return '%Y-%U'
      case 'monthly':
        return '%Y-%m'
      case 'yearly':
        return '%Y'
      default:
        return '%Y-%m-%d'
    }
  }

  // Helper to get sales analytics
  private async getSalesAnalytics(startDate: Date, endDate: Date, groupBy: string) {
    const format = this.getDateFormat(groupBy)
    const match: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      'paymentStructure.grandTotal': { $exists: true },
      paymentStatus: { $in: ['paid', 'partially paid'] },
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
              },
            },
          ],
          as: 'appointment',
        },
      },
      { $unwind: '$appointment' },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          value: { $sum: '$paymentStructure.grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          value: 1,
          count: 1,
          _id: 0,
        },
      },
    ])

    return (result || []).map(item => ({
      ...item,
      label: this.getLabelForDate(item.date, groupBy),
    }))
  }

  // Helper to get order stats
  private async getOrderStats(startDate: Date, endDate: Date, groupBy: string) {
    const format = this.getDateFormat(groupBy)
    const match: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['Quoted', 'Confirmed', 'Sold'] },
    }

    const result = await this.appointmentModel.getMongooseModel()?.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ])

    return (result || []).map(item => ({
      ...item,
      label: this.getLabelForDate(item.date, groupBy),
    }))
  }

  // Helper to get start date based on period
  private getStartDate(period: string, periodOffset: number = 1): Date {
    const now = new Date()
    const date = new Date(now)

    switch (period) {
      case 'daily':
        date.setDate(now.getDate() - 1 * periodOffset)
        break
      case 'weekly':
        date.setDate(now.getDate() - 7 * periodOffset)
        break
      case 'monthly':
        date.setMonth(now.getMonth() - 1 * periodOffset)
        break
      case 'yearly':
        date.setFullYear(now.getFullYear() - 1 * periodOffset)
        break
      default:
        date.setMonth(now.getMonth() - 1 * periodOffset)
    }

    date.setHours(0, 0, 0, 0)
    return date
  }

  // Helper to label the date
  private getLabelForDate(date: string, groupBy: string): string {
    switch (groupBy) {
      case 'daily':
        return moment(date, 'YYYY-MM-DD').format('DD MMM')
      case 'weekly':
        return `Week ${moment(date, 'YYYY-WW').week()} (${moment(date, 'YYYY-WW').format('MMM')})`
      case 'monthly':
        return moment(date, 'YYYY-MM').format('MMM')
      case 'yearly':
        return moment(date, 'YYYY').format('YYYY')
      default:
        return date
    }
  }

  public getTrackingDashboard = async (
    params: TrackingDashboardParams
  ): Promise<TrackingDashboardResponse> => {
    const now = new Date()
    const {
      sortCounts = 'monthly',
      sortSalesAnalytics = 'monthly',
      sortOrderStats = 'monthly',
    } = params

    // Get start dates for each section
    const countsStartDate = this.getStartDate(sortCounts)
    const salesAnalyticsStartDate = this.getStartDate(sortSalesAnalytics)
    const orderStatsStartDate = this.getStartDate(sortOrderStats)

    const [totalCustomers, totalUsers, totalSalesResult, salesAnalytics, orderStats] =
      await Promise.all([
        // Total Customers (from appointments)
        this.appointmentModel.count({
          createdAt: { $gte: countsStartDate, $lte: now },
        }),

        // Total Users (replacing newLeads)
        this.userModel.count({}),

        // Total Sales (from quotes)
        this.quoteModel.getMongooseModel()?.aggregate([
          {
            $lookup: {
              from: 'appointments',
              localField: 'appointmentId',
              foreignField: '_id',
              as: 'appointment',
            },
          },
          { $unwind: '$appointment' },
          {
            $match: {
              'appointment.status': 'Sold',
              'appointment.createdAt': { $gte: countsStartDate, $lte: now },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$paymentStructure.grandTotal' },
            },
          },
        ]),

        // Get sales analytics
        this.getSalesAnalytics(salesAnalyticsStartDate, now, sortSalesAnalytics),

        // Get order stats
        this.getOrderStats(orderStatsStartDate, now, sortOrderStats),
      ])

    const totalSales = totalSalesResult?.[0]?.total || 0

    return {
      analytics: {
        totalCustomers: totalCustomers || 0,
        totalUsers: totalUsers || 0, // Changed from newLeads to totalUsers
        totalSales: totalSales,
        salesAnalytics: salesAnalytics || [],
        orderStats: orderStats || [],
      },
    }
  }
}
