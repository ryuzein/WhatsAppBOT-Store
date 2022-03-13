import { Message } from 'whatsapp-web.js';
import { messageDispatcher } from '../utils/MessageDispatcher';
import { OrderMessageHandler } from './OrderMessageHandler';
import { AnyMessageHandler } from './AnyMessageHandler';
import { ConfirmDataStatusHandler } from './ConfirmDataStatusHandler';
import { OrderAddressHandler } from './OrderAddressHandler';
import { OrderDeliveryDataHandler } from './OrderDeliveryDataHandler';
import { OrderPaymentHandler } from './OrderPaymentHandler';
import { OrderProductionStatusHandler } from './OrderProductionStatusHandler';
import { CreatedOrderStatusHandler } from './CreatedOrderStatusHandler';
import { OrderTaxaDeliveryHandler } from './OrderTaxaDeliveryHandler';
import { OrderPaymentRequired } from './OrderPaymentRequired';
import { OrderFinishedStatusHandler } from './OrderFinishedStatusHandler';

import { FinishOrderCommandHandler } from './commands/FinishOrderCommandHandler';
import { DoubtCommandHandler } from './commands/DoubtCommandHandler';
import { AboutBotCommandHandler } from './commands/AboutBotCommandHandler';
import { CarTutorialCommandHandler } from './commands/CarTutorialCommandHandler';
import { InfoOrderCommandHandler } from './commands/InfoOrderCommandHandler';
import { CancelOrderCommandHandler } from './commands/CancelOrderCommandHandler';
import { HelpCommandHandler } from './commands/HelpCommandHandler';
import { DoneAtendimentoHandler } from './commands/DoneAtendimentoHandler';
import { NotifyOrderHandler } from './commands/NotifyOrderCommandHandler';
import { UpdateOrderStatus } from './commands/UpdateOrderStatus';

export const MessageHandler = async (message: Message): Promise<void> => {
  console.log(message);

  let dispatchName = '';
  if (!message.fromMe) {
    // handlers by commands
    await messageDispatcher.register('ok', FinishOrderCommandHandler);
    await messageDispatcher.register('duvidas', DoubtCommandHandler);
    await messageDispatcher.register('bot', AboutBotCommandHandler);
    await messageDispatcher.register('car', CarTutorialCommandHandler);
    await messageDispatcher.register('ver', InfoOrderCommandHandler);
    await messageDispatcher.register('cancelar', CancelOrderCommandHandler);
    await messageDispatcher.register('ajuda', HelpCommandHandler);
    await messageDispatcher.register('encerrar', DoneAtendimentoHandler);
    await messageDispatcher.register('entrega', NotifyOrderHandler);
    await messageDispatcher.register('atualizar', UpdateOrderStatus);

    // handlers by messages types
    await messageDispatcher.register('order', OrderMessageHandler);
    await messageDispatcher.register('chat', AnyMessageHandler);

    // handlers by order status
    await messageDispatcher.register('created', CreatedOrderStatusHandler);
    await messageDispatcher.register(
      'confirma-dados',
      ConfirmDataStatusHandler,
    );
    await messageDispatcher.register('endereco-dados', OrderAddressHandler);
    await messageDispatcher.register('taxa-entrega', OrderTaxaDeliveryHandler);
    await messageDispatcher.register('entrega-dados', OrderDeliveryDataHandler);
    await messageDispatcher.register('pagamento-dados', OrderPaymentHandler);
    await messageDispatcher.register('pix-pendente', OrderPaymentRequired);
    await messageDispatcher.register('producao', OrderProductionStatusHandler);
    await messageDispatcher.register('finalizado', OrderFinishedStatusHandler);

    const isOrder = message.type == 'order';

    if (
      (await OrderMessageHandler.CheckExistsOrderToUser(message)) &&
      !isOrder
    ) {
      const order_status = await OrderMessageHandler.getStatusOrder(message);

      dispatchName = !message.body.startsWith('#')
        ? order_status
        : message.body.slice(1);
    } else {
      dispatchName = !message.body.startsWith('#')
        ? message.type
        : message.body.slice(1);
    }
  }

  return messageDispatcher.dispatch(dispatchName, message);
};