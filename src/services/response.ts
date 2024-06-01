import { Response as ExpressResponse } from 'express'

interface ResponseData {
  message: string
  data?: object | null
}

export default class Response {
  /** Send a success response
   *
   * @param {ExpressResponse} res - Express response object
   * @param {number} status - Status code
   * @param {string} message - Message
   * @param {object} [data] - Data to send
   * @returns {ExpressResponse} - Response object
   */
  static send(
    res: ExpressResponse,
    status: number,
    message: string,
    data?: object
  ): ExpressResponse {
    const responseData: ResponseData = {
      message,
      data: data || null,
    }
    return res.status(status).json(responseData)
  }
}
