import { expect } from '@loopback/testlab';
import { WebsocketApplication } from '../../websocket.application';
import { getNewFactory } from '../fixtures/application';
import { Socket } from 'socket.io';
import { DummySocket } from '../fixtures/dummy-socket';
import { WebsocketControllerFactory } from '../../websocket-controller-factory';
import { WebsocketBindings } from '../../keys';

export class SequenceTestController {
  responseSuccess({ oneParam }: { oneParam: string }) {
    return { text: `yes you are the first params: ${oneParam}` };
  }
  responseError({ badParam }: { badParam: string }) {
    throw new Error(`this is a badParam: ${badParam}`);
  }
}

describe('WebsocketSequence', () => {
  let app: WebsocketApplication;
  let factory: WebsocketControllerFactory;
  const dummySocket = new DummySocket();

  const callMethod = async (methdName: string, args: unknown) => {
    const callback = factory.getCallback(methdName);
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callback(args, resolve);
    });
  };

  describe('with a default providers values', () => {
    before(async () => {
      app = new WebsocketApplication();
      app.websocketServer.controller(SequenceTestController);
      factory = getNewFactory(app, SequenceTestController);
      await factory.createController((dummySocket as Object) as Socket);
    });

    it('callback response with success', async () => {
      const text = 'this is first param';
      const response = await callMethod('responseSuccess', {
        oneParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.be.eql({
        result: { text: `yes you are the first params: ${text}` },
      });
    });

    it('callback response with error handling', async () => {
      const text = 'this is another param';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await callMethod('responseError', {
        badParam: text,
      });
      expect(!!response).to.be.true();
      expect(!!response.error).to.be.true();
      expect(response.error).to.have.containEql({
        message: `this is a badParam: ${text}`,
      });
    });
  });

  describe('with a distinct providers values', () => {
    before(async () => {
      app = new WebsocketApplication();
      app.websocketServer.controller(SequenceTestController);
      factory = getNewFactory(app, SequenceTestController);
      await factory.createController((dummySocket as Object) as Socket);

      app
        .bind(WebsocketBindings.INVOKE_METHOD)
        .to(async (methodName: string, args: unknown[]) => {
          if (methodName === 'responseSuccess') {
            return {
              invoqueMethod: 'customInvoqueMethod',
              methodName,
              args,
            };
          }
          throw new Error('Bad method name');
        });

      app
        .bind(WebsocketBindings.SEND_METHOD)
        .to(async (done: Function, result: unknown) => {
          done({ myBody: result });
        });

      app
        .bind(WebsocketBindings.REJECT_METHOD)
        .to(async (done: Function, error: Error) => {
          done({ myAppErrorMessage: error.message });
        });
    });

    it('callback response with success', async () => {
      const text = 'this is first param';
      const response = await callMethod('responseSuccess', {
        oneParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.be.eql({
        myBody: {
          invoqueMethod: 'customInvoqueMethod',
          methodName: 'responseSuccess',
          args: [{ oneParam: text }],
        },
      });
    });

    it('callback response with error handling', async () => {
      const text = 'this is another param';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await callMethod('responseError', {
        badParam: text,
      });
      expect(!!response).to.be.true();
      expect(response).to.have.containEql({
        myAppErrorMessage: `Bad method name`,
      });
    });
  });
});