Controller naming - bound to REST API {get|post|delete|put|options}Entity
Service naming - bound to business entities - {find(many)|get(one)|delete|update|create}Entity

Service - works with the database, without validations, i.e. this is the entrypoint for working with DB entities
Controller - works with client data, validation, business logic, interaction with services
