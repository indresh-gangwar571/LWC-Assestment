import { LightningElement, wire, api, track } from 'lwc';
import getProjects from '@salesforce/apex/ProjectController.getProjects';
import { refreshApex } from '@salesforce/apex';

export default class ProjectList extends LightningElement {
    @track projects = [];
    error;
    wiredProjectsResult;

    @wire(getProjects)
    wiredProjects(result) {
        this.wiredProjectsResult = result;
        const { data, error } = result;
        if (data) {
            this.projects = data;
            this.error = undefined;
            console.log('Projects successfully fetched:', this.projects);
        } else if (error) {
            this.error = error;
            this.projects = undefined;
            console.error('Error fetching projects:', this.error);
        }
    }

    handleProjectSelect(event) {
        const selectedProjectId = event.currentTarget.dataset.id; // Get project Id from data-id attribute.
        this.dispatchEvent(
            new CustomEvent('projectselected', {
                detail: { projectId: selectedProjectId }
            })
        );
        console.log('Project selected with ID:', selectedProjectId);
    }

    @api
    refreshProjectList() {
        if (this.wiredProjectsResult) {
            refreshApex(this.wiredProjectsResult)
                .then(() => {
                    console.log('Project list refreshed successfully via refreshApex');
                })
                .catch((error) => {
                    this.error = error;
                    console.error('Error refreshing project list:', error);
                });
        }
    }
}