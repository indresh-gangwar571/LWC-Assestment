import { LightningElement, api, track, wire } from 'lwc';
import createProject from '@salesforce/apex/ProjectController.createProject';
import updateProject from '@salesforce/apex/ProjectController.updateProject';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import PROJECT_STATUS_CHANNEL from '@salesforce/messageChannel/ProjectStatus__c';
import getProject from '@salesforce/apex/ProjectController.getProjectforEdit';

export default class ProjectForm extends LightningElement {
    @api projectId; // Project record passed from parent for editing
    @track formData = {}; // Holds form data
    @track formDatatemp = {}; // Holds form data
    @wire(MessageContext)
    messageContext;

    @api
    getProjectDetails(prId) { 
        try {
            this.projectId = prId;
            getProject({ pId: this.projectId })
            .then(result => {
                const record = Array.isArray(result) ? (result.length > 0 ? result[0] : null) : result;
                if (record) {
                    this.formData = { ...record };
                } else {
                    this.formData = {};
                    this.showToast('Info', 'No project found for the provided Id.', 'info');
                }
            })
            .catch(error => {
                let message = 'Unknown error';
                if (error && error.body && error.body.message) {
                    message = error.body.message;
                } else if (error && error.message) {
                    message = error.message;
                }
                console.error('Error fetching project:', error);
                this.showToast('Error', `Error fetching project: ${message}`, 'error');
            });
        } catch (err) {
            const message = err && err.message ? err.message : 'Unknown error';
            console.error('Unexpected error in getProjectDetails:', err);
            this.showToast('Error', `Unexpected error: ${message}`, 'error');
        }
    }

    optionsStatus = [
        { label: 'Planned', value: 'Planned' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' }
    ];

    handleFieldChange(event) {
        const name = event.target.name;
        const value = event.detail && event.detail.value !== undefined ? event.detail.value : event.target.value;

        const updated = { ...this.formData, [name]: value };
        this.formData = updated;
        this.formDatatemp = updated;

        console.log('Field changed:', name, '=>', value, 'current formData.Status__c:', this.formData.Status__c);
    }

    handleSave() {
        // Determine whether to create or update a project based on the presence of formData.Id
        if (this.formData.Id) {
            updateProject({ project: this.formData })
                .then(() => {
                    this.dispatchEvent(
                        new CustomEvent('saveproject', {
                            detail: { projectId: this.formData.Id }
                        })
                    );
                    this.showToast('Success', 'Project updated successfully!', 'success');
                    this.publishStatus();
                })
                .catch((error) => {
                    this.handleApexError(error, 'Error updating the project.');
                });
        } else {
            createProject({ project: this.formData })
                .then((result) => {
                    this.dispatchEvent(
                        new CustomEvent('saveproject', {
                            detail: { projectId: result.Id }
                        })
                    );
                    this.showToast('Success', 'Project created successfully!', 'success');
                    this.publishStatus();
                })
                .catch((error) => {
                    this.handleApexError(error, 'Error creating the project.');
                });
        }
        this.formData = {};
    }

    handleApexError(error, defaultMessage) {
        let errorMessage = defaultMessage;
        
        if (error && error.body && error.body.message) {
            errorMessage = error.body.message;
        } else if (error && error.message) {
            errorMessage = error.message;
        }
        this.showToast('Error', errorMessage, 'error');
    }

    handleCancel() {
        this.formData = {};
    }

    getErrorMessage(error) {
        if (error && error.body && error.body.message) {
            return error.body.message;
        }
        if (error && error.message) {
            return error.message;
        }
        return 'Unknown error';
    }

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toastEvent);
    }

    /**
     * Publish the current status to the LMS channel.
     */
    publishStatus() {
        const statusValue = this.formDatatemp ? this.formDatatemp.Status__c : null;

        if (typeof statusValue === 'string' && statusValue.length > 0) {
            publish(this.messageContext, PROJECT_STATUS_CHANNEL, { status: statusValue });
            console.log('Project status published:', statusValue);
        } else {
            console.warn('publishStatus called but Status__c is missing or empty on formData. formData keys:', Object.keys(this.formDatatemp || {}));
        }
        this.formDatatemp = {};
    }
}