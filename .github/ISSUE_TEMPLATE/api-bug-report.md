---
name: 🔧 API Bug Report
about: Report a bug in the API or backend services
title: "[API-BUG] "
labels: ["bug", "api", "backend", "needs-triage"]
assignees: ["lordpluha"]
---

## 🐛 API Bug Description
<!-- Provide a clear and concise description of the API bug -->


## 🔗 Endpoint Information
- **Endpoint**: `[HTTP_METHOD] /api/endpoint`
- **Base URL**: `https://api.spotify-clone.com`
- **API Version**: `v1`

## 📝 Request Details
<!-- Information about the failing request -->

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer [token]
User-Agent: [user-agent]
```

### Request Body
```json
{
  "example": "payload"
}
```

### Request Parameters
- **Query Parameters**: `?param1=value1&param2=value2`
- **Path Parameters**: `userId=123, trackId=456`

## 📤 Expected Response
<!-- What response did you expect? -->

### Expected Status Code
- **Status**: `200 OK`

### Expected Response Body
```json
{
  "expected": "response"
}
```

## 📥 Actual Response
<!-- What response did you actually receive? -->

### Actual Status Code
- **Status**: `500 Internal Server Error`

### Actual Response Body
```json
{
  "error": "actual error response"
}
```

### Response Headers
```http
Content-Type: application/json
X-Request-ID: abc123
X-Response-Time: 1234ms
```

## 🔍 Steps to Reproduce
<!-- Steps to reproduce the API bug -->
1. Authenticate with the API using `[method]`
2. Send `[HTTP_METHOD]` request to `/api/endpoint`
3. Include payload: `[specific payload]`
4. Observe error response

## 🌍 Environment Information
- **Environment**: [Production/Staging/Development]
- **Server Region**: [US-East, EU-West, etc.]
- **Client**: [Web App, Mobile App, Postman, curl]
- **Timestamp**: [When the error occurred]

## 🔐 Authentication
- **Auth Type**: [Bearer Token, API Key, OAuth2]
- **User Role**: [Admin, User, Guest]
- **Scopes**: [read:tracks, write:playlists]
- **Token Valid**: [Yes/No]

## 📊 Error Analysis
<!-- Technical details about the error -->

### Server Logs
```
[timestamp] ERROR: Error message from server logs
Stack trace if available
```

### Database Queries
<!-- If the issue is related to database -->
- **Query Type**: [SELECT, INSERT, UPDATE, DELETE]
- **Table(s) Affected**: [users, tracks, playlists]
- **Query Performance**: [Fast/Slow]

### External Services
<!-- If the issue involves external APIs -->
- **Service Name**: [Spotify API, AWS S3, etc.]
- **Service Status**: [Up/Down/Degraded]
- **Response Time**: [ms]

## 🚨 Error Severity
- [ ] 🚨 Critical - Service down, data loss
- [ ] 🔴 High - Major functionality broken
- [ ] 🟡 Medium - Reduced functionality
- [ ] 🟢 Low - Minor issue, edge case

## 📈 Impact Assessment
- **Affected Users**: [All/Many/Few/One]
- **Affected Features**: [Authentication, Music playback, etc.]
- **Business Impact**: [High/Medium/Low]

## 🔄 Reproducibility
- [ ] Always (100%)
- [ ] Frequently (>75%)
- [ ] Occasionally (25-75%)
- [ ] Rarely (<25%)
- [ ] Cannot reproduce

## 📱 Client Information
<!-- Information about the client making the request -->
- **Platform**: [Web, iOS, Android, Desktop]
- **Version**: [1.2.3]
- **SDK Version**: [If using SDK]

## 🔍 Related Endpoints
<!-- Other endpoints that might be affected -->
- [ ] `GET /api/related-endpoint-1`
- [ ] `POST /api/related-endpoint-2`
- [ ] `PUT /api/related-endpoint-3`

## 🛠️ Debugging Information
<!-- Additional debugging information -->

### Request ID
```
x-request-id: abc-123-def-456
```

### Correlation ID
```
correlation-id: xyz-789
```

### Performance Metrics
- **Response Time**: [ms]
- **Database Query Time**: [ms]
- **External API Calls**: [count and time]

## 🔄 Workaround
<!-- Is there a temporary workaround? -->
- [ ] Retry the request
- [ ] Use alternative endpoint
- [ ] Modify request parameters
- [ ] No workaround available

**Workaround Details:**
<!-- Describe the workaround -->


## 🧪 Testing Information
<!-- How to test the fix -->

### Test Cases
- [ ] Test with valid authentication
- [ ] Test with invalid authentication
- [ ] Test with edge case parameters
- [ ] Test with high load

### Test Data
```json
{
  "testUser": "user123",
  "testTrack": "track456"
}
```

## 📈 Monitoring
<!-- Monitoring and alerting information -->
- **Alert Triggered**: [Yes/No]
- **Monitoring Dashboard**: [Link to dashboard]
- **Log Aggregation**: [Splunk, ELK, etc.]

## 📝 Additional Context
<!-- Any other relevant information -->

### Recent Changes
- **Recent Deployments**: [Date and description]
- **Database Migrations**: [Any recent schema changes]
- **Configuration Changes**: [Environment variables, etc.]

### Similar Issues
- **Related Tickets**: #123, #456
- **Historical Issues**: [Link to similar past issues]
