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
     * Get start of day in configured timezone (returned as UTC Date)
     * @param date Optional date, defaults to now
     */
    getStartOfDay: (date?: Date | string): Date => {
        const timezone = DateHelper.getTimezone()
        const d = date ? new Date(date) : new Date()

        // Get the date string in the target timezone (e.g., "11/24/2025")
        const dateStr = d.toLocaleDateString('en-US', { timeZone: timezone })

        // Create a new date from that string, assuming it's midnight in that timezone
        // We need to construct it carefully to get the UTC timestamp that corresponds to midnight in target TZ

        // 1. Parse parts
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).formatToParts(d)

        const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')

        // 2. Create a date object that represents this local time
        // We want to find the UTC time T such that T in Timezone is YYYY-MM-DD 00:00:00

        // Simplest way without libraries:
        // Create a date at UTC midnight
        const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))

        // Now shift it. 
        // Actually, a better approach without moment-timezone is tricky for exact offsets.
        // However, since we are storing in Mongo (UTC), we usually want the query range to be:
        // Start: YYYY-MM-DD 00:00:00 (Target TZ) -> Converted to UTC
        // End:   YYYY-MM-DD 23:59:59 (Target TZ) -> Converted to UTC

        // Let's use the trick of creating a string with offset if possible, but native JS doesn't give offset easily for arbitrary TZ.
        // Alternative: Use the fact that we can parse a string with specific timezone if we format it right? No.

        // Let's try to find the offset.
        // The "toLocaleString" gives us the wall clock time in the target timezone.
        // If we want to find the UTC timestamp for "2025-11-24 00:00:00 Target_Timezone":

        // We can iterate/binary search or use a library. 
        // BUT, since we don't have a library, maybe we can just use the wall clock time for the query if we store local time?
        // The user said: "so that our app store the timezone correctly"
        // Usually this means storing UTC but querying with correct ranges.

        // Let's use a robust native solution:
        // 1. Get the wall clock components for the target timezone.
        // 2. Construct a string "YYYY-MM-DDTHH:mm:ss"
        // 3. We need to convert this Wall Clock Time + Timezone -> UTC.

        // Actually, there is a hack. 
        // new Date("2025-11-24T00:00:00+05:00") works if we know the offset.
        // We can get the offset using Intl.DateTimeFormat with timeZoneName: 'longOffset' or 'shortOffset'.

        const offsetPart = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset'
        }).formatToParts(d).find(p => p.type === 'timeZoneName')?.value;

        // offsetPart is like "GMT+5" or "GMT-05:00"
        // We need to parse "GMT+5" -> "+05:00"

        const offset = offsetPart?.replace('GMT', '') || '+00:00';

        // Pad single digit hours if needed (e.g. +5 -> +05:00)
        // This is getting complicated.

        // Let's stick to a simpler approximation or ask to install a library if this is too fragile.
        // But wait, the user wants to "store the timezone correctly".
        // If they mean storing the string with timezone, that's one thing.
        // If they mean storing UTC but the *value* corresponds to the correct local time...

        // "the issue we are facing is in POST "/appointments" Api .. so we wanna do it exactly in the timezone we are so that we dont get date issues"

        // If I send 2025-11-24T10:00:00 from frontend, and backend assumes UTC, it might be wrong.
        // If backend knows it's Asia/Karachi, it should treat it as 10:00 PKT -> 05:00 UTC.

        // Let's try to use the 'date-fns-tz' or 'moment-timezone' if I can... but I can't.
        // I will implement a basic offset extractor.

        const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // We need to construct a date object that, when printed in that timezone, is 00:00:00.
        // Let's just return the date string for now if the caller handles it, but the caller needs a Date object for Mongo query.

        // Let's use the offset extraction method, it's the most reliable native way.
        const longOffset = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'longOffset'
        }).format(d).split('GMT')[1]; // e.g., "+05:00" or "-05:00"

        // Construct ISO string with offset
        const dateWithOffset = `${isoDate}T00:00:00${longOffset}`;
        return new Date(dateWithOffset);
    },

    /**
     * Get end of day in configured timezone (returned as UTC Date)
     */
    getEndOfDay: (date?: Date | string): Date => {
        const start = DateHelper.getStartOfDay(date)
        const end = new Date(start)
        end.setUTCDate(end.getUTCDate() + 1)
        end.setUTCMilliseconds(-1)
        return end
    }
}
