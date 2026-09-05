---
name: 🔧 API Bug Report
about: Report a bug in the NestJS API or backend services
title: "[API] "
labels: ["bug", "api", "needs-triage"]
assignees: []
---

## 🐛 Bug Description
<!-- Clear and concise description of the bug -->


## 🔗 Endpoint Information
- **Endpoint**: `[GET/POST/PUT/DELETE] /api/v1/endpoint`
- **Module**: [auth | users | tracks | albums | artists | playlists | files]
- **Environment**: [Development | Staging | Production]

## 📝 Request Details

### cURL Command
```bash
curl -X GET 'http://localhost:3001/api/v1/tracks/123' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

### Request Body (if applicable)
```json
{
  "title": "Song Title",
  "artistId": "uuid"
}
```

## ✅ Expected Behavior
```json
{
  "id": "uuid",
  "title": "Song Title",
  "artistId": "uuid"
}
```
**Status Code**: `200 OK`

## ❌ Actual Behavior
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Error details"
}
```
**Status Code**: `500 Internal Server Error`
**Response Time**: `1234ms`

## 🔍 Steps to Reproduce
1. Start development environment: `pnpm dev`
2. Authenticate via `/api/v1/auth/login`
3. Send request to `/api/v1/[endpoint]`
4. Observe error response

**Reproduction Rate**: [Always | Sometimes | Rarely] - [percentage]%

## 🌍 Environment
- **Node.js**: `v22.x.x` (run `node -v`)
- **pnpm**: `10.27.0` (run `pnpm -v`)
- **PostgreSQL**: `16.x` (run `docker ps`)
- **Redis**: `7.x`
- **OS**: [Windows | macOS | Linux]
- **Docker**: [Yes | No]

## 🔐 Authentication
- **Auth Type**: JWT Bearer Token
- **User Role**: [Admin | User]
- **Token Expired**: [Yes | No]
- **Authenticated**: [Yes | No]

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
- **Service Name**: [AWS S3, SMTP provider, etc.]
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
