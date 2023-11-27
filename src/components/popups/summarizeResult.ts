import PopupPeer from './peer';

export default class SummarizeResult extends PopupPeer {
  constructor(amount: number, peerId: PeerId, threadId?: number) {
    super('popup-summarize', {
      peerId,
      description: true,
      titleLangKey: 'Summarize',
      buttons: []
    });

    async function getHistory(self: SummarizeResult): Promise<void> {
      const history = await self.managers.appMessagesManager.getHistory({
        limit: amount < 0 ? 100 : amount,
        peerId: peerId,
        threadId: threadId,
        recursion: true
      });
      const preprocessedHistory = [];
      for(const id of history.history) {
        const message: any = await self.managers.appMessagesManager.getMessageById(id);
        const user: any = await self.managers.appPeersManager.getPeer(message.fromId);
        if(!message.message) {
          continue;
        }
        if(amount < 0 && !message.pFlags.unread) {
          continue;
        }
        preprocessedHistory.push({
          username: user.first_name + (user.last_name ? (' ' + user.last_name) : ''),
          text: message.message,
          user_id: message.fromId
        });
      }

      if(preprocessedHistory.length === 0) {
        self.description.innerText = 'No messages to summarize';
        return;
      }

      const r = await fetch('https://summarizer.markovav.ru/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preprocessedHistory.reverse())
      });
      const data = await r.json();
      self.description.innerText = data.content;
    }

    getHistory(this).then();

    this.description.innerText = 'Loading...';

    this.show();
  }
}
