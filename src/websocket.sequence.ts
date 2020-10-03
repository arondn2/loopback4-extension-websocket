import { inject } from '@loopback/core';

import {
  WebsocketInvokeMethod,
  WebsocketRejectMethod,
  WebsocketSendMethod,
  WebsocketSequence,
} from './types';
import { WebsocketBindings } from './keys';

export class DefaultWebsocketSequence implements WebsocketSequence {
  constructor(
    @inject(WebsocketBindings.INVOKE_METHOD)
    protected invoke: WebsocketInvokeMethod,
    @inject(WebsocketBindings.SEND_METHOD)
    protected send: WebsocketSendMethod,
    @inject(WebsocketBindings.REJECT_METHOD)
    protected reject: WebsocketRejectMethod
  ) {}

  async handle(methodName: string, args: unknown[], done: Function) {
    try {
      const response = await this.invoke(methodName, args);
      await this.send(done, response);
    } catch (err) {
      await this.reject(done, err);
    }
  }
}
