Controller naming - привязка к REST API {get|post|delete|put|options}Entity
Service naming - привязка к бизнес сущностям - {find(many)|get(one)|delete|update|create}Entity

Service - работа с базой, без проверок, тоесть это entrypoint для работы с сущностями бд
Controller - работа с данными клиента, проверка, использование логики, взаимодейтсвие с сервисами