import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import PROJECT_STATUS_CHANNEL from '@salesforce/messageChannel/ProjectStatus__c';

export default class ProjectPublisher extends LightningElement {
    @track status = 'Planned'; // Default project status selected by the user

    @wire(MessageContext)
    messageContext;
    optionStatus =[
                    { label: 'Planned', value: 'Planned' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Completed', value: 'Completed' }
                ];

    handleChange(event) {
        this.status = event.target.value; // Update status with selected value
    }

    publishStatus() {
        const message = {
            status: this.status // Message payload
        };
        publish(this.messageContext, PROJECT_STATUS_CHANNEL, message);
        console.log('Project status published:', message);
    }
}