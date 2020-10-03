import { expect } from '@loopback/testlab';
import { Socket } from 'socket.io';

import { WebsocketApplication } from '../../websocket.application';
import { getNewFactory } from '../fixtures/application';
import { WebsocketControllerFactory } from '../../websocket-controller-factory';
import { WebsocketBindings } from '../../keys';
import { DummySocket } from '../fixtures/dummy-socket';
import { WithSubscriberMethodsController } from '../fixtures/controllers/WithSubscriberMethods.controller';

describe('WebsocketControllerFactory', () => {
  let app: WebsocketApplication;

  before(async () => {
    app = new WebsocketApplication();
  });

  it('must instance a ws controller factory', () => {
    expect(!!getNewFactory(app)).to.be.true();
  });

  describe('after create WebsocketControllerFactory instance', () => {
    let factory: WebsocketControllerFactory;
    let createdController: unknown;
    const dummySocket = new DummySocket();

    before(async () => {
      factory = getNewFactory(app);
      createdController = await factory.createController(
        (dummySocket as Object) as Socket
      );
    });

    it('.create must return a instance of controller for a socket connection', () => {
      expect(createdController).to.be.a.instanceOf(
        WithSubscriberMethodsController
      );
    });

    it('must bind socket', () => {
      const socket = factory.getSync(WebsocketBindings.SOCKET);
      expect(socket).to.be.equal(dummySocket);
    });

    it('must bind controller constructor', () => {
      const controllerConstructor = factory.getSync(
        WebsocketBindings.CONTROLLER_CONSTRUCTOR
      );
      expect(controllerConstructor).to.be.equal(
        WithSubscriberMethodsController
      );
    });

    it('must bind controller instance', () => {
      const controllerInstance = factory.getSync(
        WebsocketBindings.CONTROLLER_INSTANCE
      );
      expect(controllerInstance).to.be.equal(createdController);
    });

    it('get decorated methods for @ws.connect()', () => {
      const methodsForConnection = factory.getDecoratedMethodsForConnect();
      expect(methodsForConnection).to.be.containEql({
        onConnectOne: true,
        onConnectTwo: true,
      });
    });

    it('get decorated methods for @ws.subscription() by string and by regex', () => {
      const methodsResult = factory.getDecorateSubscribeMethodsByEventName();
      expect(methodsResult).to.be.containEql({
        firstEventName1: {
          matcher: 'firstEventName1',
          methodNames: ['firstMethod', 'topMethods'],
        },
        firstEventName2: {
          matcher: 'firstEventName2',
          methodNames: ['firstMethod', 'topMethods'],
        },
        secondEventName: {
          matcher: 'secondEventName',
          methodNames: ['secondMethod', 'topMethods'],
        },
        thirdEventName: {
          matcher: 'thirdEventName',
          methodNames: ['thirdMethod', 'topMethods'],
        },
        '/^otherSecondEventName$/': {
          matcher: /^otherSecondEventName$/,
          methodNames: ['secondMethod', 'topMethods'],
        },
        '/^fourthEventName$/': {
          matcher: /^fourthEventName$/,
          methodNames: ['fourthMethod1', 'fourthMethod2'],
        },
        '/^fifthEventName$/': {
          matcher: /^fifthEventName$/,
          methodNames: ['fifthMethod'],
        },
        disconnect: {
          matcher: 'disconnect',
          methodNames: ['onDisconnect'],
        },
      });
    });
  });
});
