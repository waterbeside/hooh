/**
 * configuration file
 */

import redis from './redis'
import ormconfig from './orm'
import schedules from './schedules'


export default {
    // ormconfig, 
    // redis, // If redis is configured, reids are automatically connected
    // port: 8080, // The program will start on this port, You can also set it in the arguments to the hooh.start() method or in the HOOH_APP_PORT variable of the .env file. Priority: hooh.start() params > config file > .env file
    lockedErrorCode: -1, // Error code returned when locked, valid after Redis is enabled
    useAutoRouter: true,  // Whether to use automatic routing
    schedules // cron schedules setting
}