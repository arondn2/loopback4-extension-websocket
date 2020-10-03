import { expect } from '@loopback/testlab';
import { Application } from '@loopback/core';
import { WebsocketServer } from '../../websocketServer';
import { WebsocketBindings } from '../../keys';
import { WebsocketComponent } from '../../websocket.component';
import { Server, Namespace } from 'socket.io';
import { DummyController } from '../fixtures/controllers/Dummy.controller';
import {
  SAMPLE_CONTROLER_ROUTE,
  SampleController,
} from '../fixtures/controllers/Sample.controller';

describe('WebsocketServer', () => {
  let io: Server;
  let app: Application, websocketServer: WebsocketServer;

  before(() => {
    app = new Application();
    app.component(WebsocketComponent);
    websocketServer = new WebsocketServer(app);
    io = app.getSync(WebsocketBindings.IO);
  });

  it('app bind io Server instance', async () => {
    expect(io).to.be.not.null();
    // TODO: Check is a Server instance
    expect(io).to.be.a.instanceOf(Object);
  });

  it('must return io instance when registry without string route', () => {
    const nsp = websocketServer.controller(DummyController);
    expect(nsp).to.be.equal(io);
    // TODO: Check is a Namespace instance
    expect(nsp).to.be.a.instanceOf(Object);
  });

  it('must return a nsp when a string route is specific it', () => {
    const stringNamespace = '/route/to/connect';
    const nsp = websocketServer.controller(
      DummyController,
      stringNamespace
    ) as Namespace;
    expect(nsp.name).to.be.equal(stringNamespace);
  });

  it('must return a nsp when a regex route is specific it', () => {
    const regexNamespace = /\/regexnamespace/;
    const nsp = websocketServer.controller(
      DummyController,
      regexNamespace
    ) as Namespace;
    // TODO: Check namespace regex
    expect(!!nsp.name).to.be.true();
  });

  it('must regsitry bind with the nsp when a name option is specific it', () => {
    const optionsName = 'customName';
    const nsp = websocketServer.controller(DummyController, {
      name: optionsName,
    }) as Namespace;
    const bindedNsp = app.getSync(
      WebsocketBindings.getNamespaceKeyForName(optionsName)
    );
    expect(bindedNsp).to.be.equal(nsp);
  });

  it('must return a nsp when a controller setup with ws.controller decorator', () => {
    const nsp = websocketServer.controller(SampleController) as Namespace;
    expect(nsp.name).to.be.equal(SAMPLE_CONTROLER_ROUTE);
  });
});
