import {
  Application,
  BindingScope,
  Component,
  CoreBindings,
  inject,
  ProviderMap,
} from '@loopback/core';
import { WebsocketBindings } from './keys';
import { WebSocketServer } from './websocket.server';
import { DefaultWebsocketSequence } from './websocket.sequence';
import { WebsocketInvokeMethodProvider } from './providers/invoke-method.provider';
import { WebsocketSendProvider } from './providers/send-method.provider';
import { WebsocketRejectProvider } from './providers/reject-method.provider';

export class WebsocketComponent implements Component {
  providers: ProviderMap = {
    [WebsocketBindings.INVOKE_METHOD.key]: WebsocketInvokeMethodProvider,
    [WebsocketBindings.SEND_METHOD.key]: WebsocketSendProvider,
    [WebsocketBindings.REJECT_METHOD.key]: WebsocketRejectProvider,
  };

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app
      .bind(WebsocketBindings.WEBSOCKET_SERVER_CLASS)
      .toClass(WebSocketServer)
      .inScope(BindingScope.SINGLETON);

    app.bind(WebsocketBindings.REQUEST_LISTENER).to(() => {});

    app.bind(WebsocketBindings.SEQUENCE).toClass(DefaultWebsocketSequence);
  }
}
