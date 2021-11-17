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
  const jobs: Jobs = {}
  const appInstance = Number(process.env.NODE_APP_INSTANCE || 0)
  return {
    jobs,
    run: () => {
      for (const scheduleItem of schedules) {
        if (!scheduleItem?.enable) {
          continue
        }
        // TODO: 判定在哪个线程中执行，防止PM2多线程下重复执行
        const scheduleAppInstance = scheduleItem?.appInstance || 0
        if (Array.isArray(scheduleAppInstance) && scheduleAppInstance.length > 0 && !scheduleAppInstance.includes(appInstance)) {
          continue
        } else if (typeof scheduleAppInstance === 'number' && scheduleAppInstance !== appInstance) {
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