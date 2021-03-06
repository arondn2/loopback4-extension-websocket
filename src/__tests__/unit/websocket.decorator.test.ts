import { expect } from '@loopback/testlab';
import { invokeMethod } from '@loopback/context';
import { Namespace, Server, Socket } from 'socket.io';
import { WebsocketApplication } from '../../websocket.application';
import { WebsocketControllerFactory } from '../../websocket-controller-factory';
import { DummySocket } from '../fixtures/dummy-socket';
import { getNewFactory } from '../fixtures/application';
import { WebsocketBindings } from '../../keys';
import {
  DECORATOR_TEST_CONTROLER_NSP,
  DecoratorTestController,
} from '../fixtures/ws-controllers';

describe('Websocket decorators', () => {
  let app: WebsocketApplication;
  let factory: WebsocketControllerFactory;
  let createdController: unknown;
  let controller: DecoratorTestController;
  let appIo: Server;
  const dummySocket = new DummySocket();

  before(async () => {
    app = new WebsocketApplication();
    app.websocketServer.route(DecoratorTestController);
    factory = getNewFactory(
      app,
      DecoratorTestController,
      (dummySocket as Object) as Socket
    );
    createdController = await factory.create();
    controller = createdController as DecoratorTestController;
    appIo = await app.get(WebsocketBindings.IO);
  });

  it('@ws.socket must inject the socket connection', async () => {
    const socket: Socket = await invokeMethod(
      controller,
      'methodMustReturnSocket',
      factory.connCtx
    );
    expect(socket).to.be.equal(dummySocket);
  });

  it('@ws.io must inject SocketIO instance', async () => {
    const io: Server = await invokeMethod(
      controller,
      'methodMustReturnIoInstance',
      factory.connCtx
    );
    expect(io).to.be.equal(appIo);
  });

  it('@ws.namespace must inject a namespace instance', async () => {
    const expectedNsp = appIo.of(DECORATOR_TEST_CONTROLER_NSP);
    const nsp: Namespace = await invokeMethod(
      controller,
      'methodMustReturnNamespace',
      factory.connCtx
    );
    expect(nsp).to.be.equal(expectedNsp);
  });
});
