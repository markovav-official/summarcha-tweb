import { SliderSuperTab } from "../../slider"
import InputField from "../../inputField";
import EditPeer from "../../editPeer";
import { SettingSection } from "../../sidebarLeft";
import Row from "../../row";
import CheckboxField from "../../checkboxField";
import Button from "../../button";
import { attachClickEvent, toggleDisability } from "../../../helpers/dom";
import appUsersManager from "../../../lib/appManagers/appUsersManager";
import appNotificationsManager from "../../../lib/appManagers/appNotificationsManager";
import PeerTitle from "../../peerTitle";
import appMessagesManager from "../../../lib/appManagers/appMessagesManager";
import rootScope from "../../../lib/rootScope";
import appPeersManager from "../../../lib/appManagers/appPeersManager";
import PopupPeer from "../../popups/peer";
import { addCancelButton } from "../../popups";

export default class AppEditContactTab extends SliderSuperTab {
  private nameInputField: InputField;
  private lastNameInputField: InputField;
  private editPeer: EditPeer;
  public peerId: number;

  protected init() {
    this.container.classList.add('edit-peer-container', 'edit-contact-container');
    this.title.innerHTML = 'Edit';

    {
      const section = new SettingSection({noDelimiter: true});
      const inputFields: InputField[] = [];

      const inputWrapper = document.createElement('div');
      inputWrapper.classList.add('input-wrapper');
  
      this.nameInputField = new InputField({
        label: 'Name',
        name: 'contact-name',
        maxLength: 70
      });
      this.lastNameInputField = new InputField({
        label: 'Last Name',
        name: 'contact-lastname',
        maxLength: 70
      });
      
      const user = appUsersManager.getUser(this.peerId);

      this.nameInputField.setOriginalValue(user.first_name);
      this.lastNameInputField.setOriginalValue(user.last_name);

      inputWrapper.append(this.nameInputField.container, this.lastNameInputField.container);
      
      inputFields.push(this.nameInputField, this.lastNameInputField);

      this.editPeer = new EditPeer({
        peerId: this.peerId,
        inputFields,
        listenerSetter: this.listenerSetter,
        doNotEditAvatar: true
      });
      this.content.append(this.editPeer.nextBtn);

      const div = document.createElement('div');
      div.classList.add('avatar-edit');
      div.append(this.editPeer.avatarElem);

      const notificationsCheckboxField = new CheckboxField({
        text: 'Notifications'
      });

      notificationsCheckboxField.input.addEventListener('change', (e) => {
        if(!e.isTrusted) {
          return;
        }

        appMessagesManager.mutePeer(this.peerId);
      });

      this.listenerSetter.add(rootScope, 'notify_settings', (update) => {
        if(update.peer._ !== 'notifyPeer') return;
        const peerId = appPeersManager.getPeerId(update.peer.peer);
        if(this.peerId === peerId) {
          const enabled = !appNotificationsManager.isMuted(update.notify_settings);
          if(enabled !== notificationsCheckboxField.value) {
            notificationsCheckboxField.value = enabled;
          }
        }
      });

      const notificationsRow = new Row({
        checkboxField: notificationsCheckboxField
      });

      const enabled = !appNotificationsManager.isPeerLocalMuted(this.peerId, false);
      notificationsCheckboxField.value = enabled;

      const profileNameDiv = document.createElement('div');
      profileNameDiv.classList.add('profile-name');
      profileNameDiv.append(new PeerTitle({
        peerId: this.peerId
      }).element);
      //profileNameDiv.innerHTML = 'Karen Stanford';

      const profileSubtitleDiv = document.createElement('div');
      profileSubtitleDiv.classList.add('profile-subtitle');
      profileSubtitleDiv.innerHTML = 'original name';

      section.content.append(div, profileNameDiv, profileSubtitleDiv, inputWrapper, notificationsRow.container);

      this.scrollable.append(section.container);

      attachClickEvent(this.editPeer.nextBtn, () => {
        this.editPeer.nextBtn.disabled = true;

        appUsersManager.addContact(this.peerId, this.nameInputField.value, this.lastNameInputField.value, appUsersManager.getUser(this.peerId).phone)
        .finally(() => {
          this.editPeer.nextBtn.removeAttribute('disabled');
          this.close();
        });
      }, {listenerSetter: this.listenerSetter});
    }

    {
      const section = new SettingSection({
        
      });

      const btnDelete = Button('btn-primary btn-transparent danger', {icon: 'delete', text: 'Delete Contact'});

      attachClickEvent(btnDelete, () => {
        new PopupPeer('popup-delete-contact', {
          peerId: this.peerId,
          title: 'Delete Contact?',
          description: `Are you sure you want to delete <b>${appPeersManager.getPeerTitle(this.peerId)}</b> from your contact list?`,
          buttons: addCancelButton([{
            text: 'DELETE',
            callback: () => {
              toggleDisability([btnDelete], true);

              appUsersManager.deleteContacts([this.peerId]).then(() => {
                this.close();
              }, () => {
                toggleDisability([btnDelete], false);
              });
            },
            isDanger: true
          }])
        }).show();
      }, {listenerSetter: this.listenerSetter});

      section.content.append(btnDelete);

      this.scrollable.append(section.container);
    }
  }
}