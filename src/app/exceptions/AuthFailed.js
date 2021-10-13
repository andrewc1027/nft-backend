/**
 * @extends Error
 */
class AuthFailed extends Error {
  /**
   * @param  {String} message
   */
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = 401;
    this.printMsg = 'Invalid Credentials!';
  }
  /**
   * Custom action when error happen
   */
  handle() {
    // console.log('Use custom action here..');
  }
}

module.exports = AuthFailed;
