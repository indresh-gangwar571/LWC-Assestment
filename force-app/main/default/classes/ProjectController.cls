public with sharing class ProjectController {
    @AuraEnabled(cacheable=true)
    public static List<Project__c> getProjects() {
        try {
            return [SELECT Id, Name, Status__c, Owner__c, Start_Date__c, End_Date__c, Description__c FROM Project__c WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving projects: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Project__c> getProjectforEdit(String pId) {
        try {
            Id prId= Id.valueOf(pId);
            return [SELECT Id, Name, Status__c, Owner__c, Start_Date__c, End_Date__c, Description__c FROM Project__c WHERE Id =:prId WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving projects: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Project__c createProject(Project__c project) {
        try {
            if(!Project__c.SObjectType.getDescribe().isCreateable()){
                return null;
            }
            insert project;
            return project;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating project: ' + e.getMessage());
        }
    }

    public static final String PROJECT_NAME_REQUIRED_MSG = 'Project Name can not be blank';
    @AuraEnabled
    public static Project__c updateProject(Project__c project) {
        if (String.isBlank(project.Name)) {
            throw new AuraHandledException(PROJECT_NAME_REQUIRED_MSG);
        }   
        try {
            if(!Project__c.SObjectType.getDescribe().isUpdateable()){
                return null;
            }
            update project;
            return project;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating project: ' + e.getMessage());
        }
    }
}