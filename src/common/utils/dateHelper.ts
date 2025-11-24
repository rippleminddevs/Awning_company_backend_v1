import { config } from '../../services/configService'

export const DateHelper = {
    /**
     * Get the configured timezone
     */
    getTimezone: (): string => {
        // @ts-ignore - config types might not be updated yet
        return config.app.timezone || 'UTC'
    },

    /**
     * Get current date in configured timezone
     */
    getNow: (): Date => {
        const timezone = DateHelper.getTimezone()
        const now = new Date()
        // Create a date string in the target timezone
        const targetTimeStr = now.toLocaleString('en-US', { timeZone: timezone })
        return new Date(targetTimeStr)
    },

    /**
     * Extract timezone offset in minutes from a date in a specific timezone
     * @param date The date to check
     * @param timezone The timezone to use
     * @returns Offset in minutes (e.g., +300 for UTC+5)
     */
    getTimezoneOffset: (date: Date, timezone: string): number => {
        // Get UTC time
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
        // Get time in target timezone
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
        // Calculate difference in minutes
        return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60)
    },

    /**
     * Get start of day in configured timezone (returned as UTC Date)
     * @param date Optional date string (YYYY-MM-DD) or Date object, defaults to now
     */
    getStartOfDay: (date?: Date | string): Date => {
        const timezone = DateHelper.getTimezone()
        const d = date ? new Date(date) : new Date()

        // Get the date components in the target timezone
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).formatToParts(d)

        const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')

        // Create a temporary date at midnight in the target timezone
        // We'll use a reference date to get the offset
        const refDate = new Date(Date.UTC(year, month, day, 12, 0, 0, 0)) // noon UTC as reference

        // Get the timezone offset in minutes for this specific date
        // (important for DST changes)
        const offsetMinutes = DateHelper.getTimezoneOffset(refDate, timezone)

        // Create midnight in target timezone by subtracting the offset from UTC midnight
        // If timezone is UTC+5, midnight there is 19:00 previous day in UTC
        // So we need: UTC time = local time - offset
        const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        utcMidnight.setUTCMinutes(utcMidnight.getUTCMinutes() - offsetMinutes)

        return utcMidnight
    },

    /**
     * Get end of day in configured timezone (returned as UTC Date)
     * This returns 23:59:59.999 in the target timezone
     */
    getEndOfDay: (date?: Date | string): Date => {
        const start = DateHelper.getStartOfDay(date)
        // Add one full day (24 hours) to get to the next day's start, then subtract 1ms
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
        return end
    }
}
