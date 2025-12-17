import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PROJECT_STATUS_CHANNEL from '@salesforce/messageChannel/ProjectStatus__c';

export default class ProjectStatusBar extends LightningElement {
    status; // Holds the current status of the project

    get badgeClass() {
        switch (this.status) {
            case 'Planned':
                return 'badge-planned';
            case 'In Progress':
                return 'badge-in-progress';
            case 'Completed':
                return 'badge-completed';
            default:
                return '';
        }
    }

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToProjectStatus();
    }

    subscribeToProjectStatus() {
        subscribe(this.messageContext, PROJECT_STATUS_CHANNEL, (message) => {
            this.status = message.status; // Update the status property with the message received
            console.log('Status received from LMS:', this.status);
        });
    }
}