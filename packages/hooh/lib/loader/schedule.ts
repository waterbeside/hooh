import { loadController } from './controller'
import hooh, { App, ScheduleConfigItem } from '../hooh'
import schedule from 'node-schedule'

interface Jobs {
  [props:string]: schedule.Job
}

interface LoadScheduleReturn {
  jobs: Jobs
  run: () => void
}

export function loadSchedule(app: App): LoadScheduleReturn {
  const ctrLoader = loadController(hooh.options.APP_SCHEDULE_PATH as string)
  const schedules = hooh.config<ScheduleConfigItem[]>('schedules') || []
  console.log(schedules)
  const jobs: Jobs = {}
  return {
    jobs,
    run: () => {
      for (const scheduleItem of schedules) {
        if (!scheduleItem?.enable) {
          continue
        }
        const controller = scheduleItem.handle
        const controllerSplit = controller.split('.')
        if (controllerSplit.length < 2) {
          continue
        }
        const controllerName = controllerSplit.slice(0, -1).join('.')
        const controllerMethod = controllerSplit[controllerSplit.length - 1]
        const controllerClass = ctrLoader.getClass(controllerName)
        const option = {
          app
        }
        const controllerInstance = new controllerClass(option)
        if (controllerInstance && controllerInstance[controllerMethod]) {
          if(scheduleItem?.immediate) {
            controllerInstance[controllerMethod](option)
          }
          jobs[scheduleItem.handle] = schedule.scheduleJob(scheduleItem.cron, () => {
            controllerInstance[controllerMethod](option)
          })
        } else {
          continue
        }        
      }

    }
  }
}