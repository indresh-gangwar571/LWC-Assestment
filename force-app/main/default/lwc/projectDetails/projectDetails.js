import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Import Project__c fields for display
import NAME_FIELD from '@salesforce/schema/Project__c.Name';
import STATUS_FIELD from '@salesforce/schema/Project__c.Status__c';
import OWNER_NAME_FIELD from '@salesforce/schema/Project__c.Owner__r.Name';
import START_DATE_FIELD from '@salesforce/schema/Project__c.Start_Date__c';
import END_DATE_FIELD from '@salesforce/schema/Project__c.End_Date__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Project__c.Description__c';
import { refreshApex } from '@salesforce/apex';

export default class ProjectDetails extends LightningElement {
    @api projectId; // ID of the selected project passed from the parent component

    // Fields to query using Lightning Data Service
    fields = [NAME_FIELD, STATUS_FIELD, OWNER_NAME_FIELD, START_DATE_FIELD, END_DATE_FIELD, DESCRIPTION_FIELD];

    // Wire adapter to fetch record details
    @wire(getRecord, { recordId: '$projectId', fields: '$fields' })
    project;

    /**
     * Refresh project list. This can be called from the parent component.
     */
    @api
    refreshProjectList() {
        if (this.project) {
            refreshApex(this.project)
                .then(() => {
                    console.log('Project list refreshed successfully via refreshApex');
                })
                .catch((error) => {
                    this.error = error;
                    console.error('Error refreshing project list:', error);
                });
        }
    }

    /**
     * Get specific fields from the record data.
     */
    get name() {
        return getFieldValue(this.project.data, NAME_FIELD);
    }

    get status() {
        return getFieldValue(this.project.data, STATUS_FIELD);
    }

    get owner() {
        return getFieldValue(this.project.data, OWNER_NAME_FIELD);
    }

    get startDate() {
        return getFieldValue(this.project.data, START_DATE_FIELD);
    }

    get endDate() {
        return getFieldValue(this.project.data, END_DATE_FIELD);
    }

    get description() {
        return getFieldValue(this.project.data, DESCRIPTION_FIELD);
    }

    /**
     * Conditional rendering if no `projectId` is provided.
     */
    get hasProjectId() {
        return this.projectId !== undefined;
    }

    get badgeClass() {
        if (this.status === 'Planned') return 'badge badge-planned';
        if (this.status === 'In Progress') return 'badge badge-in-progress';
        if (this.status === 'Completed') return 'badge badge-completed';
        return 'badge';
    }

    handleEdit(event){
        this.dispatchEvent(new CustomEvent('editproject', {
            detail: { project: this.projectId }
        }));
    }
}