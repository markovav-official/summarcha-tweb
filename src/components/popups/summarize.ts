/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import PopupPeer from './peer';
import {LangPackKey} from '../../lib/langPack';
import {RadioFormFromValues} from '../row';
import PopupElement from './index';
import SummarizeResult from './summarizeResult';

const messagesAmount: {value: string | number, langPackKey: LangPackKey, checked?: boolean}[] = [{
  value: 25,
  langPackKey: '25 messages',
  checked: true
}, {
  value: 50,
  langPackKey: '50 messages'
}, {
  value: 100,
  langPackKey: '100 messages'
}, {
  value: -1,
  langPackKey: 'Unread messages'
}];

export default class Summarize extends PopupPeer {
  constructor(peerId: PeerId, threadId?: number) {
    super('popup-mute', {
      peerId,
      titleLangKey: 'Summarize',
      buttons: [{
        langKey: 'Summarize',
        callback: () => {
          PopupElement.createPopup(SummarizeResult, amount, peerId, threadId);
        }
      }],
      body: true
    });

    let amount: number;
    const radioForm = RadioFormFromValues(messagesAmount, (value) => {
      amount = +value;
    });

    this.body.append(radioForm);

    this.show();
  }
}

