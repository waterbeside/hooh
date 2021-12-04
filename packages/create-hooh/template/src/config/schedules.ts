import { ScheduleConfigItem } from 'hooh'

/**
 * 
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
 */

const schedules:ScheduleConfigItem[] = [
  {
    enable: false, // 是否启用
    cron: '*/10 * * * * *', // 执行时间
    handle: 'testCron.index',  // 执行的方法
    immediate: false // 是否立即执行
  }
]
export default schedules 