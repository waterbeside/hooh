import BaseLogic, {ILogicOption, ILogicRes} from './logic'

export {ILogicOption, ILogicRes}

class Controller extends BaseLogic {
  apiReturn(code: number, msg = '', data: any = null,) {
    return this.ctx.apiReturn(code, msg, data)
  }
}

export default Controller