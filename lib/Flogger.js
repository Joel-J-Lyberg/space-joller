define('Flogger', [], function () {

  class Logger {
    constructor(logName) {
      this.logName = logName
      this.findMe = function (logName) {
        return logName === this.logName
      }.bind(this)
    }
    debug() {
      if (Flogger.FLOGGER_LEVEL < FLOGGER_LEVEL_DEBUG) {
        return
      }
      if (Flogger.FLOGGER_LOG_EXPLICIT &&
          !Flogger.FLOGGER_LOG_EXPLICIT.find(this.findMe)) {
        return
      }
      const args = this.getArrArgs(arguments)
      args.unshift(`font-weight: bold;`)
      args.unshift(`%c${this.logName}:`)
      console.debug.apply(console, args)
    }
    log() {
      if (Flogger.FLOGGER_LEVEL < FLOGGER_LEVEL_LOG) {
        return
      }
      if (Flogger.FLOGGER_LOG_EXPLICIT &&
          !Flogger.FLOGGER_LOG_EXPLICIT.find(this.findMe)) {
        return
      }
      const args = this.getArrArgs(arguments)
      args.unshift(`font-weight: bold;`)
      args.unshift(`%c${this.logName}:`)
      console.log.apply(console, args)
    }
    error() {
      if (Flogger.FLOGGER_LEVEL < FLOGGER_LEVEL_ERROR) {
        return
      }
      if (Flogger.FLOGGER_LOG_EXPLICIT &&
          !Flogger.FLOGGER_LOG_EXPLICIT.find(this.findMe)) {
        return
      }
      const args = this.getArrArgs(arguments)
      args.unshift(`font-weight: bold;`)
      args.unshift(`%c${this.logName}:`)
      console.error.apply(console, args)
    }
    getArrArgs(args) {
      return Array.prototype.slice.call(args)
    }
  }

  const FLOGGER_LEVEL_NONE = 0
  const FLOGGER_LEVEL_ERROR = 1
  const FLOGGER_LEVEL_WARNING = 2
  const FLOGGER_LEVEL_LOG = 3
  const FLOGGER_LEVEL_DEBUG = 4

  const Flogger = {
    Logger: Logger,
    FLOGGER_LEVEL: FLOGGER_LEVEL_NONE,
    FLOGGER_LEVEL_NONE: FLOGGER_LEVEL_NONE,
    FLOGGER_LEVEL_ERROR: FLOGGER_LEVEL_ERROR,
    FLOGGER_LEVEL_WARNING: FLOGGER_LEVEL_WARNING,
    FLOGGER_LEVEL_LOG: FLOGGER_LEVEL_LOG,
    FLOGGER_LEVEL_DEBUG: FLOGGER_LEVEL_DEBUG,
    FLOGGER_LOG_EXPLICIT: null, // Array with logNames, will only output the specified logs
  }

  return Flogger
})
