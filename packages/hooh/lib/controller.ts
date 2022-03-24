import BaseLogic, {ILogicOption, ILogicRes} from './logic'

export {ILogicOption, ILogicRes}

class Controller extends BaseLogic {
  apiReturn(code: number, msg = '', data: any = null, extra: any = null) {
    return this.ctx.apiReturn(code, msg, data, extra)
  }
}

export default Controller