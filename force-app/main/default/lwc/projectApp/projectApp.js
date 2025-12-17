import { LightningElement, track } from 'lwc';

export default class ProjectApp extends LightningElement {
    selectedProjectId;
    selectedProject;

    @track showProjectList = true;
    @track showProjectFormSection = false;
    @track showProjectDetail = false;
    // showProjectForm = false;
    /**
     * Lifecycle hook: constructor()
     * Executes when the component is initialized.
     */
    constructor() {
        super();
        console.log('Constructor: Initializing ProjectApp component');
    }

    /**
     * Lifecycle hook: connectedCallback()
     * Executes when the component is inserted into the DOM.
     */
    connectedCallback() {
        console.log('connectedCallback: ProjectApp component added to DOM');
    }

    /**
     * Lifecycle hook: renderedCallback()
     * Executes when the component is rendered in the DOM.
     */
    renderedCallback() {
        console.log('renderedCallback: ProjectApp component rendered');
        
    }

    /**
     * Lifecycle hook: disconnectedCallback()
     * Executes when the component is removed from the DOM.
     */
    disconnectedCallback() {
        console.log('disconnectedCallback: ProjectApp component removed from DOM');
    }

    /**
     * Lifecycle hook: errorCallback()
     * Executes if an error occurs in any child component.
     */
    errorCallback(error, stack) {
        console.error('errorCallback: ', error, stack);
    }

    handleCreateNewProject() {
    
        this.selectedProjectId = null;

        this.showProjectList = false;
        this.showProjectFormSection = true;
        this.showProjectDetail = false;

    }


    handleProjectSelect(event) {
        this.selectedProjectId = event.detail.projectId;
        this.showProjectList = true;
        this.showProjectFormSection = false;
        this.showProjectDetail = true;
        console.log('Selected Project Id:', this.selectedProjectId);
    }

    handleProjectSave(event) {
        const savedId = event && event.detail ? event.detail.projectId : null;
        if (savedId) {
            this.selectedProjectId = savedId;
        }
        this.showProjectList = true;
        this.showProjectFormSection = false;
        this.showProjectDetail = true;
        
        requestAnimationFrame(() => {
            const formCmp = this.template.querySelector('c-project-list');
            if (formCmp && typeof formCmp.getProjectDetails === 'function') {
                formCmp.refreshProjectList();
            } else {
                // Retry once in case of slow render
                setTimeout(() => {
                    const listCmp = this.template.querySelector('c-project-list');
                    if (listCmp && typeof listCmp.refreshProjectList === 'function') {
                        listCmp.refreshProjectList();
                    }else {
                        console.error('c-project-form not found or method missing when handling edit.');
                    }
                }, 0);
            }
        });
        console.log('Project saved! Refreshing the project list...');
        
        if (this.selectedProjectId) {
            requestAnimationFrame(() => {
                const formCmp = this.template.querySelector('c-project-details');
                if (formCmp && typeof formCmp.getProjectDetails === 'function') {
                    formCmp.refreshProjectList();
                } else {
                    // Retry once in case of slow render
                    setTimeout(() => {
                        const listCmp = this.template.querySelector('c-project-details');
                        if (listCmp && typeof listCmp.refreshProjectList === 'function') {
                            listCmp.refreshProjectList();
                        }else {
                            console.error('c-project-form not found or method missing when handling edit.');
                        }
                    }, 0);
                }
            });
        }
    }

    
    handleEdit(event) {
        this.selectedProject = event.detail.project;
        const projectId = typeof this.selectedProject === 'object' ? this.selectedProject?.Id : this.selectedProject;

        if (!projectId) {
            console.error('Invalid project identifier received in handleEdit:', this.selectedProject);
            return;
        }

        this.showProjectList = false;
        this.showProjectFormSection = true;
        this.showProjectDetail = false;

        requestAnimationFrame(() => {
            const formCmp = this.template.querySelector('c-project-form');
            if (formCmp && typeof formCmp.getProjectDetails === 'function') {
                formCmp.getProjectDetails(projectId);
            } else {
                // Retry once in case of slow render
                setTimeout(() => {
                    const retryForm = this.template.querySelector('c-project-form');
                    if (retryForm && typeof retryForm.getProjectDetails === 'function') {
                        retryForm.getProjectDetails(projectId);
                    } else {
                        console.error('c-project-form not found or method missing when handling edit.');
                    }
                }, 0);
            }

            const formSection = this.template.querySelector('[data-id="projectFormSection"]');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        console.log('Selected Project Id for edit:', projectId);
    }
}