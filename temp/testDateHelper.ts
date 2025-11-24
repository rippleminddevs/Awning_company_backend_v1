import { DateHelper } from '../src/common/utils/dateHelper';

console.log('Timezone:', DateHelper.getTimezone());

const now = DateHelper.getNow();
console.log('Now (in TZ):', now.toISOString());

const startOfDay = DateHelper.getStartOfDay();
console.log('Start of Day (UTC timestamp for 00:00 TZ):', startOfDay.toISOString());

const endOfDay = DateHelper.getEndOfDay();
console.log('End of Day (UTC timestamp for 23:59 TZ):', endOfDay.toISOString());

// Test with specific date
const testDate = '2025-11-24';
const startOfTest = DateHelper.getStartOfDay(testDate);
console.log(`Start of ${testDate}:`, startOfTest.toISOString());
